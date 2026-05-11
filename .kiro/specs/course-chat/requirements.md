# Requirements Document

## Introduction

This feature adds real-time, per-course chat to the Smart Education web application. Each course has its own dedicated chat channel where the teacher and enrolled students can exchange messages. The teacher's existing Classroom page (`/teacher/classroom/:id`) already contains a non-functional chat UI placeholder; this feature will make it fully operational. A new chat panel will also be added to the Student Course Details page (`/student/courses/:id`). All real-time delivery is powered by Supabase Realtime (Postgres Changes), and message history is persisted in Supabase.

## Glossary

- **Chat_System**: The overall real-time messaging feature described in this document.
- **Course_Channel**: The isolated chat space associated with a single course, identified by `course_id`.
- **Message**: A text entry sent by a participant, stored in the `course_messages` table with fields `id`, `course_id`, `sender_id`, `sender_name`, `sender_role`, `content`, and `created_at`.
- **Participant**: Any authenticated user (Teacher or Student) who is enrolled in or teaches the course.
- **Teacher**: A user with the role `Teacher` who owns the course.
- **Student**: A user with the role `Student` who is enrolled in the course.
- **Chat_Panel**: The UI component that renders the message list and message input for a Course_Channel.
- **Supabase_Realtime**: The Supabase feature that pushes Postgres row-level changes to subscribed clients over WebSocket.
- **RLS**: Row-Level Security policies on Supabase tables that enforce access control at the database level.

---

## Requirements

### Requirement 1: Send and Receive Messages in Real Time

**User Story:** As a teacher or student, I want to send and receive messages in my course chat in real time, so that I can communicate with everyone in the course without refreshing the page.

#### Acceptance Criteria

1. WHEN an authenticated Participant submits a message whose trimmed content is between 1 and 1000 characters (inclusive) in the Chat_Panel, THE Chat_System SHALL insert the Message into the `course_messages` table with the fields `course_id`, `sender_id`, `sender_name`, `sender_role`, and `created_at`.
2. WHEN a new Message is inserted into `course_messages` for a Course_Channel, THE Chat_System SHALL deliver the Message to all Participants currently viewing that Course_Channel within 2 seconds via Supabase_Realtime.
3. WHEN a Participant opens the Chat_Panel for a course, THE Chat_System SHALL load the 50 most recent Messages for that Course_Channel, ordered by `created_at` ascending.
4. WHEN new Messages arrive via Supabase_Realtime, THE Chat_Panel SHALL append them to the bottom of the message list without requiring a page reload.
5. WHEN the message list is updated with new Messages and the Participant has not manually scrolled above the bottom of the list, THE Chat_Panel SHALL automatically scroll to the most recent Message.
6. IF the database insert for a Message fails, THEN THE Chat_Panel SHALL display an inline error notification and SHALL preserve the draft message text in the input field.

---

### Requirement 2: Message Input and Validation

**User Story:** As a teacher or student, I want the message input to validate my text before sending, so that empty or oversized messages are not submitted.

#### Acceptance Criteria

1. THE Chat_Panel SHALL provide a text input field and a Send button for composing Messages.
2. WHEN the message input field is empty, contains only whitespace, or its trimmed content exceeds 1000 characters, THE Chat_Panel SHALL disable the Send button.
3. WHEN a Participant presses the Enter key in the message input field and the Send button is enabled, THE Chat_System SHALL submit the Message, equivalent to clicking the Send button.
4. IF a Participant attempts to submit a Message whose trimmed content exceeds 1000 characters, THEN THE Chat_Panel SHALL display an inline error indicating the 1000-character limit and SHALL preserve the input text.
5. WHEN a Message is successfully sent, THE Chat_Panel SHALL clear the message input field.
6. THE Chat_Panel SHALL display a live character count (e.g., "42 / 1000") adjacent to the input field, updating as the Participant types.

---

### Requirement 3: Access Control

**User Story:** As a system administrator, I want chat access restricted to course participants only, so that users cannot read or write messages in courses they are not part of.

#### Acceptance Criteria

1. THE Chat_System SHALL restrict read access to Messages for a Course_Channel so that only the Teacher who owns the course and Students who are actively enrolled in that course can retrieve those Messages.
2. THE Chat_System SHALL restrict write access to Messages for a Course_Channel so that only the Teacher who owns the course and Students who are actively enrolled in that course can insert new Messages.
3. IF an unauthenticated user attempts to read Messages for a Course_Channel, THEN THE Chat_System SHALL return an empty result set with no error exposed to the client.
4. IF an unauthenticated user attempts to insert a Message, THEN THE Chat_System SHALL reject the request with an authorization error.
5. IF an authenticated user who is neither the Teacher of the course nor an actively enrolled Student attempts to read Messages for that Course_Channel, THEN THE Chat_System SHALL return an empty result set.
6. IF an authenticated user who is neither the Teacher of the course nor an actively enrolled Student attempts to insert a Message into that Course_Channel, THEN THE Chat_System SHALL reject the request with an authorization error.

---

### Requirement 4: Teacher Chat in Classroom Page

**User Story:** As a teacher, I want to use the chat panel on my Classroom page, so that I can communicate with my students during or outside of a live session.

#### Acceptance Criteria

1. WHEN a Teacher navigates to `/teacher/classroom/:id`, THE Chat_Panel SHALL be rendered in place of the existing "Chat coming soon…" placeholder and SHALL be fully functional (messages load, send, and receive in real time).
2. WHILE a live session is not active for the course, THE Chat_Panel SHALL remain enabled and allow the Teacher to send and receive Messages.
3. WHEN the Teacher sends a Message, THE Chat_Panel SHALL display that Message with the Teacher's `sender_name` and a "Teacher" badge that visually distinguishes it from Student Messages.
4. IF the Chat_Panel fails to load message history on navigation to the Classroom page, THEN THE Chat_Panel SHALL display an inline error message and a retry button.

---

### Requirement 5: Student Chat in Course Details Page

**User Story:** As a student, I want a chat panel on my Course Details page, so that I can communicate with my teacher and classmates.

#### Acceptance Criteria

1. WHEN a Student navigates to `/student/courses/:id`, THE Chat_Panel SHALL be rendered as a third tab labelled "Chat" in the existing tab bar alongside "Assignments" and "Notes".
2. WHEN a Student sends a Message, THE Chat_Panel SHALL display that Message with the Student's `sender_name`.
3. WHEN a Message with `sender_role` equal to `'Teacher'` is displayed in the Chat_Panel, THE Chat_Panel SHALL render it with a visually distinct background color and a "Teacher" badge to differentiate it from Student Messages.
4. IF the Chat_Panel fails to load message history on navigation to the Course Details page, THEN THE Chat_Panel SHALL display an inline error message and a retry button.

---

### Requirement 6: Message Persistence

**User Story:** As a teacher or student, I want chat history to be saved, so that I can read previous messages when I return to the course.

#### Acceptance Criteria

1. THE Chat_System SHALL persist all successfully sent Messages in the `course_messages` table in Supabase.
2. WHEN a Participant reopens the Chat_Panel for a course, THE Chat_System SHALL display the 100 most recent previously sent Messages in ascending `created_at` order.
3. THE Chat_System SHALL store each Message with a server-generated `created_at` timestamp (database default `now()`) to ensure consistent ordering across all clients.
4. IF the fetch of message history fails when the Chat_Panel is opened, THEN THE Chat_Panel SHALL display an inline error and a retry button, and SHALL NOT display a blank or partially loaded message list without indication.

---

### Requirement 7: Sender Identity Display

**User Story:** As a teacher or student, I want to see who sent each message, so that I can follow the conversation clearly.

#### Acceptance Criteria

1. THE Chat_Panel SHALL display the `sender_name` for every Message. IF `sender_name` is null or empty, THE Chat_Panel SHALL display "Unknown" as a fallback.
2. THE Chat_Panel SHALL display the `created_at` timestamp for every Message. WHERE the Message was sent on the current calendar day, THE Chat_Panel SHALL format the timestamp as "HH:MM AM/PM" (e.g., "10:35 AM"). WHERE the Message was sent on a prior day, THE Chat_Panel SHALL format the timestamp as "MMM DD, HH:MM AM/PM" (e.g., "Jan 03, 10:35 AM").
3. WHEN the authenticated Participant is the sender of a Message (`sender_id` matches the current user's id), THE Chat_Panel SHALL visually align that Message to the right side of the chat window (outgoing style).
4. WHEN the authenticated Participant is not the sender of a Message, THE Chat_Panel SHALL visually align that Message to the left side of the chat window (incoming style).

---

### Requirement 8: Real-Time Subscription Lifecycle

**User Story:** As a developer, I want the Supabase Realtime subscription to be properly managed, so that there are no memory leaks or duplicate messages when navigating between pages.

#### Acceptance Criteria

1. WHEN a Participant navigates away from the Chat_Panel, THE Chat_System SHALL unsubscribe from the Supabase_Realtime channel for that Course_Channel.
2. WHEN a Participant navigates back to the Chat_Panel, THE Chat_System SHALL re-subscribe to the Supabase_Realtime channel and reload the 100 most recent Messages.
3. IF the Supabase_Realtime WebSocket connection is interrupted, THEN THE Chat_Panel SHALL display a non-blocking inline banner (e.g., "Connection lost — messages may be delayed") until the connection is restored.
4. IF the Supabase_Realtime connection is restored after an interruption, THEN THE Chat_System SHALL re-subscribe to the channel and fetch any Messages with a `created_at` timestamp later than the last received Message.
5. IF re-subscription after a connection restoration fails, THEN THE Chat_Panel SHALL display an inline error and a manual retry button.

---

### Requirement 9: Database Schema

**User Story:** As a developer, I want a well-defined database schema for chat messages, so that the feature can be implemented consistently and extended in the future.

#### Acceptance Criteria

1. THE Chat_System SHALL use a `course_messages` table with the following columns: `id` (UUID, primary key, default `gen_random_uuid()`), `course_id` (UUID, not null, foreign key to `courses.id` on delete cascade), `sender_id` (UUID, not null, foreign key to `auth.users.id`), `sender_name` (text, not null), `sender_role` (text, not null, CHECK constraint limiting values to `'Teacher'` and `'Student'`), `content` (text, not null, max 2000 characters), `created_at` (timestamptz, not null, default `now()`).
2. THE Chat_System SHALL include a Supabase migration file that creates the `course_messages` table, its RLS policies (restricting read and insert to course participants), and enables Realtime on the table.
3. THE Chat_System SHALL create a composite index on `(course_id, created_at)` to support efficient retrieval of Messages ordered by time within a course.
