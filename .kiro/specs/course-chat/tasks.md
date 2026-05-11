# Implementation Plan: course-chat

## Overview

Implement a real-time, per-course chat feature using Supabase Realtime (Postgres Changes). The work is split into five sequential groups: database migration, the `useChat` hook, the `CourseChat` component, and integration into the Teacher Classroom and Student Course Details pages.

---

## Tasks

- [x] 1. Database migration — create `course_messages` table
  - [x] 1.1 Write the SQL migration file
    - Create `supabase/migrations/course_messages.sql`
    - Define the `course_messages` table with columns: `id` (UUID PK), `course_id` (FK → `courses.id` ON DELETE CASCADE), `sender_id` (FK → `auth.users.id`), `sender_name` (text NOT NULL), `sender_role` (text NOT NULL, CHECK IN ('Teacher','Student')), `content` (text NOT NULL, CHECK char_length ≤ 2000), `created_at` (timestamptz NOT NULL DEFAULT now())
    - Add composite index `course_messages_course_time_idx` on `(course_id, created_at DESC)`
    - Enable RLS: `ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY`
    - Add `ALTER PUBLICATION supabase_realtime ADD TABLE public.course_messages`
    - Write the SELECT policy "Participants can read course messages": teacher owns course OR student is enrolled
    - Write the INSERT policy "Participants can insert course messages": `auth.uid() = sender_id` AND (teacher owns course OR student is enrolled)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.1, 9.2, 9.3_

- [x] 2. `useChat` hook — real-time state management
  - [x] 2.1 Create `src/hooks/useChat.js` with initial fetch and state
    - Create the file and export `useChat(courseId, currentUser)`
    - Declare state: `messages`, `loading`, `error`, `connectionStatus` ('connected' | 'disconnected' | 'reconnecting'), `lastMessageTimestamp`
    - On mount, fetch the 100 most recent messages for `courseId` ordered by `created_at ASC` using `supabase.from('course_messages').select('*').eq('course_id', courseId).order('created_at', { ascending: true }).limit(100)`
    - Set `loading` true before fetch, false after; set `error` on failure
    - Expose `retryLoad` that re-runs the fetch and clears the error
    - _Requirements: 1.3, 6.2, 6.3, 6.4_

  - [ ]* 2.2 Write property test for message list fetch (Property 2)
    - **Property 2: Message list fetch returns at most 100 messages in ascending order**
    - **Validates: Requirements 1.3, 6.2**
    - Test that for N messages in the DB, `loadMessages` returns `min(N, 100)` rows ordered strictly ascending by `created_at`

  - [x] 2.3 Add Supabase Realtime subscription to `useChat`
    - After the initial fetch, subscribe to `postgres_changes` INSERT events on `course_messages` filtered by `course_id = courseId`; channel name: `course-chat-{courseId}`
    - On `SUBSCRIBED` status: set `connectionStatus` to `'connected'`
    - On `CHANNEL_ERROR` or `CLOSED` status: set `connectionStatus` to `'disconnected'`
    - On INSERT event: append the new message to `messages` (deduplicate by `id`)
    - On unmount: call `supabase.removeChannel(channel)`
    - _Requirements: 1.2, 1.4, 8.1, 8.2, 8.3_

  - [ ]* 2.4 Write property test for message append (Property 3)
    - **Property 3: Incoming message is appended to the end of the list**
    - **Validates: Requirements 1.4**
    - Test that appending a new message to a list of length N produces a list of length N+1 with the new message as the last element; test deduplication (same id twice → length unchanged)

  - [x] 2.5 Add reconnect logic to `useChat`
    - When channel status transitions from `'disconnected'` back to `'SUBSCRIBED'`: set `connectionStatus` to `'connected'`, fetch messages with `created_at > lastMessageTimestamp`, merge into `messages` (deduplicate by `id`)
    - If re-subscription fails (status remains non-`SUBSCRIBED` after retry): set a separate `reconnectError` state
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 2.6 Add `sendMessage` to `useChat`
    - Implement `sendMessage(content)`: insert `{ course_id, sender_id, sender_name, sender_role, content }` via `supabase.from('course_messages').insert(...)`
    - Return `{ success: true }` on success; return `{ success: false, error: message }` on failure (do not throw)
    - Do not append the message locally — rely on the Realtime INSERT event
    - _Requirements: 1.1, 1.6_

  - [ ]* 2.7 Write property test for valid message insert (Property 1)
    - **Property 1: Valid message insert populates all required fields**
    - **Validates: Requirements 1.1**
    - Test that `sendMessage` with a trimmed string of 1–1000 chars produces an insert call with all required fields non-null and matching expected values

- [~] 3. Checkpoint — hook complete
  - Ensure `useChat` exports `{ messages, loading, error, connectionStatus, sendMessage, retryLoad }` correctly. Run any available tests. Ask the user if questions arise.

- [x] 4. `CourseChat` component — UI
  - [x] 4.1 Create `src/components/CourseChat/CourseChat.jsx` with layout and `MessageBubble`
    - Create the directory `src/components/CourseChat/`
    - Scaffold `CourseChat.jsx` accepting props `courseId`, `currentUser`, `height` (default 560)
    - Call `useChat(courseId, currentUser)` to get `messages`, `loading`, `error`, `connectionStatus`, `sendMessage`, `retryLoad`
    - Implement `ChatHeader`: title "Class Chat" + connection status indicator (green dot when connected, yellow when reconnecting/disconnected)
    - Implement `MessageList`: scrollable `Box` that auto-scrolls to bottom when `messages` changes and the user has not manually scrolled up; show `CircularProgress` while `loading`; show error `Alert` + "Retry" button when `error` is set
    - Implement `MessageBubble` sub-component:
      - Right-aligned when `message.sender_id === currentUser.id`, left-aligned otherwise
      - Distinct background color for Teacher messages vs Student messages
      - "Teacher" badge (MUI `Chip` or `Typography` label) when `sender_role === 'Teacher'`
      - Display `sender_name` or `"Unknown"` fallback when null/empty/whitespace
      - Display formatted timestamp using `formatMessageTime(created_at)` utility
    - Implement `formatMessageTime(isoString)` utility inside the file: today → `"HH:MM AM/PM"`, prior day → `"MMM DD, HH:MM AM/PM"`
    - _Requirements: 1.3, 1.4, 1.5, 4.1, 4.4, 5.1, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 4.2 Write property tests for `MessageBubble` rendering (Properties 7, 8, 9, 10)
    - **Property 7: Teacher messages are rendered with a "Teacher" badge**
    - **Property 8: Sender name is always displayed with "Unknown" fallback**
    - **Property 9: Timestamp formatting is correct for all dates**
    - **Property 10: Message alignment matches sender identity**
    - **Validates: Requirements 4.3, 5.3, 7.1, 7.2, 7.3, 7.4**
    - Use React Testing Library; set up Vitest + jsdom if not already present (`npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`)
    - Add `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.js'] }` to `vite.config.js`

  - [x] 4.3 Implement `MessageInput` sub-component in `CourseChat.jsx`
    - `TextField` (multiline, max rows 4) + character count label `"N / 1000"` + Send `IconButton`
    - Derive `isSendEnabled`: trimmed content length ≥ 1 AND ≤ 1000
    - Disable Send button when `!isSendEnabled`
    - On Enter key (without Shift): call `sendMessage` if enabled
    - On successful send: clear input field
    - On failed send: show inline error `Snackbar`; preserve input text
    - Show inline error when trimmed length > 1000
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.4 Write property tests for `MessageInput` (Properties 4, 5, 6)
    - **Property 4: Send button is disabled for all invalid inputs**
    - **Property 5: Input is cleared after successful send**
    - **Property 6: Character count display matches input length**
    - **Validates: Requirements 2.2, 2.5, 2.6**

  - [x] 4.5 Add connection status banner to `CourseChat`
    - Render a non-blocking yellow `Alert` banner when `connectionStatus === 'disconnected'` or `connectionStatus === 'reconnecting'`: "Connection lost — messages may be delayed"
    - Dismiss the banner when `connectionStatus === 'connected'`
    - When `reconnectError` is set: show inline error + "Retry connection" button that calls a `retryConnection` function (re-subscribe to the channel)
    - _Requirements: 8.3, 8.4, 8.5_

- [~] 5. Checkpoint — component complete
  - Verify `CourseChat` renders without errors when given a valid `courseId` and `currentUser`. Ensure all tests pass. Ask the user if questions arise.

- [x] 6. Integrate `CourseChat` into Teacher Classroom page
  - [x] 6.1 Replace the chat placeholder in `src/pages/teacher/Classroom/index.jsx`
    - Import `CourseChat` from `'../../../components/CourseChat/CourseChat'`
    - Import `useAuth` from `'../../../hooks/useAuth'`
    - Derive `currentUser` from `useAuth()`: `{ id: user.id, name: profile?.name || user.email, role: 'Teacher' }`
    - Replace the entire `<Grid item xs={12} md={8}>` `<Paper>` placeholder block (the "Chat coming soon…" Paper with the disabled TextField and Send button) with `<CourseChat courseId={courseId} currentUser={currentUser} height={560} />`
    - Remove the `message` / `setMessage` local state and the `Send` icon import if no longer used
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Integrate `CourseChat` into Student Course Details page
  - [x] 7.1 Add Chat tab to `src/pages/student/Courses/CourseDetails.jsx`
    - Import `CourseChat` from `'../../../components/CourseChat/CourseChat'`
    - Import `Chat as ChatIcon` from `'@mui/icons-material'`
    - Add a third `<Tab label="Chat" icon={<ChatIcon />} iconPosition="start" />` to the existing `<Tabs>` component
    - Derive `currentUser` from `useAuth()`: `{ id: user.id, name: profile?.name || user.email, role: 'Student' }`
    - Add a new tab panel: `{tab === 2 && <CourseChat courseId={id} currentUser={currentUser} />}`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [~] 8. Final checkpoint — Ensure all tests pass
  - Run the full test suite. Verify the Teacher Classroom page renders `CourseChat` in place of the placeholder. Verify the Student Course Details page shows the "Chat" tab. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- The design document has a Correctness Properties section (Properties 1–10); property tests are included as optional sub-tasks
- `sendMessage` does NOT do optimistic UI — messages appear only when the Realtime INSERT event fires, preventing duplicates
- The `supabase/migrations/course_messages.sql` file must be applied to the Supabase project (via `supabase db push` or the Supabase dashboard SQL editor) before the hook and component will work

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.2", "4.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.4", "4.5"] },
    { "id": 4, "tasks": ["2.6", "2.7"] },
    { "id": 5, "tasks": ["6.1", "7.1"] }
  ]
}
```
