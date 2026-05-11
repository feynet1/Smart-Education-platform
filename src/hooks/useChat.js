import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} course_id
 * @property {string} sender_id
 * @property {string} sender_name
 * @property {'Teacher'|'Student'} sender_role
 * @property {string} content
 * @property {string} created_at  — ISO 8601 timestamptz string
 */

/**
 * Custom hook for course chat functionality.
 *
 * @param {string} courseId - The UUID of the course to load messages for
 * @param {{ id: string, name: string, role: 'Teacher'|'Student' }} currentUser - The authenticated user
 * @returns {{
 *   messages: Message[],
 *   loading: boolean,
 *   error: string|null,
 *   connectionStatus: 'connected'|'disconnected'|'reconnecting',
 *   reconnectError: string|null,
 *   sendMessage: () => {},
 *   retryLoad: () => void,
 *   retryConnection: () => void,
 * }}
 */
const useChat = (courseId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [reconnectError, setReconnectError] = useState(null);

  // Track the previous channel status to detect disconnected → subscribed transition
  const prevStatusRef = useRef(null);
  // Hold a ref to the current channel so retryConnection can remove and re-create it
  const channelRef = useRef(null);
  // Keep a ref to lastMessageTimestamp so the subscribe callback always reads the latest value
  const lastMessageTimestampRef = useRef(null);

  // Keep the ref in sync with state
  useEffect(() => {
    lastMessageTimestampRef.current = lastMessageTimestamp;
  }, [lastMessageTimestamp]);

  const fetchMessages = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('course_messages')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data ?? []);

      if (data && data.length > 0) {
        setLastMessageTimestamp(data[data.length - 1].created_at);
      }
    } catch (err) {
      setError(err.message ?? 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  /**
   * Fetch messages missed during a disconnection and merge them into state.
   * Falls back to a full reload if no lastMessageTimestamp is available.
   */
  const fetchMissedMessages = useCallback(async () => {
    if (!courseId) return;

    const timestamp = lastMessageTimestampRef.current;

    if (!timestamp) {
      // No messages loaded yet — do a full reload
      await fetchMessages();
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('course_messages')
        .select('*')
        .eq('course_id', courseId)
        .gt('created_at', timestamp)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = data.filter((m) => !existingIds.has(m.id));
          if (newMessages.length === 0) return prev;
          const merged = [...prev, ...newMessages];
          return merged;
        });
        setLastMessageTimestamp(data[data.length - 1].created_at);
      }

      setReconnectError(null);
    } catch (err) {
      setReconnectError(err.message ?? 'Failed to fetch missed messages after reconnect');
    }
  }, [courseId, fetchMessages]);

  const retryLoad = useCallback(() => {
    setError(null);
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /**
   * Create and subscribe to the Realtime channel.
   * Returns the channel instance so it can be stored in channelRef.
   */
  const createChannel = useCallback(() => {
    if (!courseId) return null;

    const channel = supabase
      .channel(`course-chat-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_messages',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => {
            // Deduplicate by id
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          setLastMessageTimestamp(newMessage.created_at);
        }
      )
      .subscribe((status) => {
        const previousStatus = prevStatusRef.current;

        if (status === 'SUBSCRIBED') {
          // Detect reconnect: previous status was 'disconnected'
          if (previousStatus === 'disconnected') {
            setConnectionStatus('connected');
            fetchMissedMessages();
          } else {
            setConnectionStatus('connected');
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }

        prevStatusRef.current = status === 'SUBSCRIBED'
          ? 'connected'
          : (status === 'CHANNEL_ERROR' || status === 'CLOSED')
            ? 'disconnected'
            : previousStatus;
      });

    return channel;
  }, [courseId, fetchMissedMessages]);

  // Realtime subscription — scoped per courseId
  useEffect(() => {
    if (!courseId) return;

    // Reset previous status tracking when courseId changes
    prevStatusRef.current = null;

    const channel = createChannel();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [courseId, createChannel]);

  /**
   * Manually remove and re-create the channel subscription.
   * Exposed to consumers for the "Retry connection" button.
   */
  const retryConnection = useCallback(() => {
    setReconnectError(null);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Reset previous status so the next SUBSCRIBED event is treated as a fresh connect
    prevStatusRef.current = 'disconnected';
    setConnectionStatus('reconnecting');

    const newChannel = createChannel();
    channelRef.current = newChannel;
  }, [createChannel]);

  /**
   * Insert a new message into course_messages.
   * Throws on failure so the caller's catch block can handle the error.
   * Does NOT append the message locally — relies on the Realtime INSERT event.
   *
   * @param {string} content - The trimmed message text (1–1000 chars)
   * @returns {Promise<void>}
   */
  const sendMessage = useCallback(async (content) => {
    const { error: insertError } = await supabase
      .from('course_messages')
      .insert({
        course_id: courseId,
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        sender_role: currentUser.role,
        content,
      });

    if (insertError) {
      throw insertError;
    }
  }, [courseId, currentUser]);

  return {
    messages,
    loading,
    error,
    connectionStatus,
    reconnectError,
    lastMessageTimestamp,
    sendMessage,
    retryLoad,
    retryConnection,
  };
};

export default useChat;
