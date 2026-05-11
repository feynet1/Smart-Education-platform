import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  TextField,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import useChat from '../../hooks/useChat';
import { formatMessageTime } from './chatUtils';

// ─── MessageBubble ───────────────────────────────────────────────────────────

/**
 * Renders a single chat message bubble.
 *
 * @param {{ message: import('../../hooks/useChat').Message, currentUser: { id: string, name: string, role: string } }} props
 */
function MessageBubble({ message, currentUser }) {
  const isOwn = message.sender_id === currentUser.id;
  const isTeacher = message.sender_role === 'Teacher';

  // Resolve display name with "Unknown" fallback
  const displayName =
    message.sender_name && message.sender_name.trim().length > 0
      ? message.sender_name
      : 'Unknown';

  // Background colour
  let bubbleBg;
  if (isTeacher) {
    bubbleBg = '#fff3e0'; // amber tint for teacher messages
  } else if (isOwn) {
    bubbleBg = 'primary.main';
  } else {
    bubbleBg = 'grey.100';
  }

  const textColor = isOwn && !isTeacher ? 'white' : 'text.primary';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 1,
      }}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && (
        <Avatar
          sx={{ width: 32, height: 32, mr: 1, mt: 2.5, fontSize: '0.75rem', flexShrink: 0 }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        {/* Teacher badge — shown above the bubble */}
        {isTeacher && (
          <Chip
            label="Teacher"
            size="small"
            color="warning"
            sx={{ mb: 0.5, alignSelf: isOwn ? 'flex-end' : 'flex-start' }}
          />
        )}

        {/* Sender name — shown above bubble for incoming messages only */}
        {!isOwn && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, ml: 0.5 }}>
            {displayName}
          </Typography>
        )}

        {/* Bubble */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            bgcolor: bubbleBg,
            color: textColor,
            wordBreak: 'break-word',
          }}
        >
          <Typography variant="body2">{message.content}</Typography>
        </Box>

        {/* Timestamp */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, mx: 0.5 }}>
          {formatMessageTime(message.created_at)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── ChatHeader ──────────────────────────────────────────────────────────────

function ChatHeader({ connectionStatus }) {
  const isConnected = connectionStatus === 'connected';
  const dotColor = isConnected ? '#4caf50' : '#ffc107'; // green or yellow

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
        Class Chat
      </Typography>
      <Box
        title={isConnected ? 'Connected' : 'Disconnected'}
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: dotColor,
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

// ─── MessageList ─────────────────────────────────────────────────────────────

function MessageList({ messages, loading, error, retryLoad, currentUser }) {
  const scrollRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Track whether the user is at the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 60; // px from bottom
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, []);

  // Auto-scroll to bottom when messages change, only if user is at bottom
  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" size="small" onClick={retryLoad} sx={{ alignSelf: 'flex-start' }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      ref={scrollRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: 'auto',
        py: 1,
      }}
    >
      {messages.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            No messages yet. Say hello!
          </Typography>
        </Box>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />
      ))}
    </Box>
  );
}

// ─── MessageInput ─────────────────────────────────────────────────────────────

/**
 * Message composition input with character count, send button, and error handling.
 *
 * @param {{ onSend: (content: string) => Promise<any>, disabled?: boolean }} props
 */
function MessageInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  // Derive send-enabled state
  const trimmedLength = input.trim().length;
  const isSendEnabled = trimmedLength >= 1 && trimmedLength <= 1000 && !sending && !disabled;

  const handleSend = useCallback(async () => {
    if (!isSendEnabled) return;

    setSending(true);
    setSendError(null);

    try {
      await onSend(input.trim());
      setInput('');
    } catch (err) {
      setSendError(err?.message ?? 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [isSendEnabled, onSend, input]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isSendEnabled) {
          handleSend();
        }
      }
    },
    [isSendEnabled, handleSend]
  );

  const isOverLimit = input.length > 1000;

  return (
    <>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message…"
            multiline
            maxRows={4}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
          />
          <Typography
            variant="caption"
            color={isOverLimit ? 'error' : 'text.secondary'}
            sx={{ alignSelf: 'flex-end', lineHeight: 1 }}
          >
            {input.length} / 1000
          </Typography>
        </Box>

        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!isSendEnabled}
          sx={{ mb: 2.5, flexShrink: 0 }}
          aria-label="Send message"
        >
          {sending ? <CircularProgress size={20} /> : <Send />}
        </IconButton>
      </Box>

      <Snackbar
        open={Boolean(sendError)}
        autoHideDuration={4000}
        onClose={() => setSendError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSendError(null)} sx={{ width: '100%' }}>
          {sendError}
        </Alert>
      </Snackbar>
    </>
  );
}

// ─── CourseChat ───────────────────────────────────────────────────────────────

/**
 * Real-time course chat panel.
 *
 * @param {{
 *   courseId: string,
 *   currentUser: { id: string, name: string, role: string },
 *   height?: number|string,
 *   reconnectError?: string|null,
 *   retryConnection?: () => void,
 * }} props
 */
export default function CourseChat({
  courseId,
  currentUser,
  height = 560,
  reconnectError: reconnectErrorProp = null,
  retryConnection: retryConnectionProp = () => {},
}) {
  const {
    messages,
    loading,
    error,
    connectionStatus,
    retryLoad,
    sendMessage,
    reconnectError: reconnectErrorHook,
    retryConnection: retryConnectionHook,
  } = useChat(courseId, currentUser);

  // Prefer values from the hook if available; fall back to props (or safe defaults)
  const reconnectError =
    reconnectErrorHook !== undefined ? reconnectErrorHook : reconnectErrorProp;
  const retryConnection =
    retryConnectionHook !== undefined ? retryConnectionHook : retryConnectionProp;

  const showConnectionBanner =
    connectionStatus === 'disconnected' || connectionStatus === 'reconnecting';

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <ChatHeader connectionStatus={connectionStatus} />

      {/* Non-blocking connection-lost banner */}
      {showConnectionBanner && (
        <Alert severity="warning" sx={{ borderRadius: 0, flexShrink: 0 }}>
          Connection lost — messages may be delayed
        </Alert>
      )}

      {/* Reconnect error banner with retry button */}
      {reconnectError && (
        <Alert
          severity="error"
          sx={{ borderRadius: 0, flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={retryConnection}>
              Retry connection
            </Button>
          }
        >
          {reconnectError}
        </Alert>
      )}

      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        retryLoad={retryLoad}
        currentUser={currentUser}
      />

      <MessageInput onSend={sendMessage} />
    </Paper>
  );
}
