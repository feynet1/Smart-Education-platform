# Requirements Document

## Introduction

The Assignment Submission feature enables students to submit files directly against their assignments in the Smart Education platform. Uploading a file automatically marks the assignment as done, replacing the existing manual checkbox. Students may resubmit at any time — the latest file always replaces the previous one. Teachers gain a per-assignment submissions panel where they can see which students have submitted, when they submitted, and download each file. Submissions made after the assignment's due date are allowed but visually flagged as late.

This feature extends the existing `student_assignments` table with file metadata columns and introduces a new `assignment-submissions` Supabase Storage bucket. It touches the Student Assignments page (`/student/assignments`), the Course Details assignments tab, and the Teacher Assignments page (`/teacher/assignments/:id`).

---

## Glossary

- **Submission_System**: The end-to-end feature responsible for accepting, storing, and displaying student file submissions.
- **Student**: An authenticated user with the `student` role who is enrolled in at least one course.
- **Teacher**: An authenticated user with the `teacher` role who owns one or more courses.
- **Assignment**: A record in the `assignments` table belonging to a course, with a `due_date` (date, no time component).
- **Student_Assignment**: A record in the `student_assignments` table linking a Student to an Assignment, tracking submission status and file metadata.
- **File_Validator**: The client-side component that checks a selected file's type and size before upload begins.
- **Storage_Client**: The Supabase Storage interface used to upload and download files from the `assignment-submissions` bucket.
- **Submissions_Panel**: The teacher-facing UI component that lists all Student_Assignments for a given Assignment.
- **Late_Badge**: A visual indicator (e.g., an orange "Late" chip) shown when a submission's `submitted_at` timestamp is after the Assignment's deadline.
- **Submit_Button**: The UI control on the student side that opens the file selection dialog, replacing the previous completion checkbox.
- **Submission_Dialog**: The modal dialog through which a Student selects and confirms a file to upload.
- **Deadline**: The end of the Assignment's `due_date` day, defined as `due_date 23:59:59 UTC`.

---

## Requirements

### Requirement 1: Student File Submission

**User Story:** As a student, I want to submit a file for an assignment, so that my teacher can review my work and my assignment is automatically marked as done.

#### Acceptance Criteria

1. WHEN a Student views an assignment with no prior submission, THE Submit_Button SHALL be displayed in place of the completion checkbox.
2. WHEN a Student views an assignment that already has a submission, THE Submit_Button SHALL display a "Submitted" state showing the submitted file name and the submission timestamp formatted as "MMM DD, YYYY h:mm a" (e.g., "Jan 03, 2025 10:35 AM").
3. WHEN a Student clicks the Submit_Button (in either the initial or "Submitted" state), THE Submission_Dialog SHALL open and allow the Student to select a file from their device.
4. WHEN a Student confirms a file selection in the Submission_Dialog, THE Submission_System SHALL upload the file to the `assignment-submissions` Supabase Storage bucket under the path `{assignment_id}/{student_id}/{file_name}`.
5. WHEN a file upload to Supabase Storage completes successfully AND the subsequent Student_Assignment database upsert also succeeds, THE Submission_System SHALL set `status = 'done'`, `file_path`, `file_name`, `file_size`, and `submitted_at = now()` on the Student_Assignment record.
6. IF a file upload fails due to a network or storage error, THEN THE Submission_System SHALL display an inline error message inside the Submission_Dialog and leave the Student_Assignment record unchanged.
7. IF the file upload succeeds but the Student_Assignment database update fails, THEN THE Submission_System SHALL display an inline error message inside the Submission_Dialog, attempt to delete the orphaned file from Storage, and leave the Student_Assignment record unchanged. IF the orphan deletion also fails, THE Submission_System SHALL log the orphaned file path to the browser console.

---

### Requirement 2: File Validation

**User Story:** As a student, I want to be informed immediately if my file is invalid, so that I don't waste time waiting for a failed upload.

#### Acceptance Criteria

1. WHEN a Student selects a file, THE File_Validator SHALL check the file's MIME type against the allowed set: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`, `image/jpeg`, `image/png`, `application/zip`.
2. IF a Student selects a file whose MIME type is not in the allowed set, THEN THE File_Validator SHALL reject the file, display an inline error message inside the Submission_Dialog listing the accepted formats (PDF, DOCX, DOC, JPG, PNG, ZIP), and keep the Submission_Dialog open. No upload attempt SHALL be made.
3. WHEN a Student selects a file, THE File_Validator SHALL check that the file size is greater than 0 bytes and does not exceed 10,485,760 bytes (10 MB).
4. IF a Student selects a file whose size is 0 bytes or exceeds 10,485,760 bytes, THEN THE File_Validator SHALL reject the file, display an inline error message inside the Submission_Dialog stating the size constraint, and keep the Submission_Dialog open. No upload attempt SHALL be made.
5. WHEN a file passes both type and size validation, THE Submission_Dialog SHALL enable the confirm/upload action button.
6. WHERE a Student attempts a late submission (after the Deadline), THE File_Validator SHALL apply the same type and size validation rules as for on-time submissions.

---

### Requirement 3: Resubmission

**User Story:** As a student, I want to replace my previous submission with a new file, so that I can correct mistakes or submit an improved version.

#### Acceptance Criteria

1. WHEN a Student views an assignment that already has a submission, THE Submission_System SHALL display the previously submitted file name, file size, and submission timestamp alongside a "Resubmit" button.
2. WHEN a Student completes a resubmission, THE Submission_System SHALL overwrite the existing `file_path`, `file_name`, `file_size`, and `submitted_at` values in the Student_Assignment record with the new file's metadata.
3. WHEN a Student initiates a resubmission, THE Storage_Client SHALL delete the prior submission file from Storage before uploading the new file, to prevent orphaned objects. The new file SHALL be stored at `{assignment_id}/{student_id}/{new_file_name}`.
4. WHILE a resubmission upload is in progress, THE Submission_System SHALL display an upload progress indicator and disable the resubmit action to prevent duplicate submissions.
5. IF a resubmission upload fails, THEN THE Submission_System SHALL display an inline error message inside the Submission_Dialog and leave the Student_Assignment record and the prior submission file unchanged.
6. IF the resubmission upload succeeds but the Student_Assignment database update fails, THEN THE Submission_System SHALL display an inline error message inside the Submission_Dialog, attempt to delete the newly uploaded file from Storage, and leave the Student_Assignment record pointing to the prior submission.

---

### Requirement 4: Late Submission Flagging

**User Story:** As a student and teacher, I want late submissions to be clearly identified, so that both parties are aware of the submission timing relative to the deadline.

#### Acceptance Criteria

1. WHEN a Student submits a file and the current UTC timestamp is after `due_date 23:59:59 UTC`, THE Submission_System SHALL record the submission normally and set `submitted_at` to the actual submission time.
2. WHEN the Submissions_Panel renders a Student_Assignment where `submitted_at` is after `due_date 23:59:59 UTC`, THE Submissions_Panel SHALL display a Late_Badge next to that student's submission entry.
3. WHEN the student-side assignment list renders a Student_Assignment where `submitted_at` is after `due_date 23:59:59 UTC`, THE Submission_System SHALL display a Late_Badge on that assignment's submission status.
4. THE Submission_System SHALL accept late submissions without blocking or warning the Student prior to upload.

---

### Requirement 5: Teacher Submissions Panel

**User Story:** As a teacher, I want to see all student submissions for an assignment in one place, so that I can track who has submitted and download their work for review.

#### Acceptance Criteria

1. WHEN a Teacher views the Assignments table on the Teacher Assignments page, THE Submission_System SHALL display a "View Submissions" icon button in the Actions column for each assignment row.
2. WHEN a Teacher clicks "View Submissions" for an assignment, THE Submissions_Panel SHALL open as a Dialog and display a list of all enrolled students for that assignment's course, showing each student's name, submission status ("Submitted" or "Not submitted"), submission timestamp formatted as "MMM DD, YYYY h:mm a" (if submitted), a Late_Badge (if applicable), and a download icon button (if submitted).
3. WHILE the Submissions_Panel is loading submission data, THE Submissions_Panel SHALL display a centered CircularProgress indicator in place of the student list.
4. WHEN a Teacher clicks the download button for a submitted Student_Assignment, THE Storage_Client SHALL retrieve the file from the `assignment-submissions` bucket and initiate a browser download using the stored `file_name` as the download filename.
5. IF the file download fails, THEN THE Submissions_Panel SHALL display an inline error Snackbar to the Teacher.
6. THE Submissions_Panel SHALL display a submission count summary in the format "X / Y submitted" (where X is the number of students with a non-null `file_path` and Y is the total enrolled student count) at the top of the panel, updated in real time as the panel loads.
7. WHEN the Submissions_Panel is open and no students are enrolled in the course, THE Submissions_Panel SHALL display a message "No students enrolled yet" in place of the student list.

---

### Requirement 6: Database Schema Extension

**User Story:** As a developer, I want the `student_assignments` table to store file metadata, so that submission information is persisted and queryable.

#### Acceptance Criteria

1. THE Submission_System SHALL add a `file_path` column of type `text` (nullable, default `null`) to the `student_assignments` table to store the Supabase Storage object path.
2. THE Submission_System SHALL add a `file_name` column of type `text` (nullable, default `null`) to the `student_assignments` table to store the original file name as provided by the Student.
3. THE Submission_System SHALL add a `file_size` column of type `text` (nullable, default `null`) to the `student_assignments` table to store the human-readable file size string (e.g., "2.4 MB").
4. THE Submission_System SHALL add a `submitted_at` column of type `timestamptz` (nullable, default `null`) to the `student_assignments` table to store the UTC timestamp of the most recent submission.
5. WHEN a Student_Assignment has no file submission, THE Submission_System SHALL store `null` in all four new columns (`file_path`, `file_name`, `file_size`, `submitted_at`).
6. WHEN a Student_Assignment has a file submission, THE Submission_System SHALL store non-null values in all four columns: `file_path`, `file_name`, `file_size`, and `submitted_at`.
7. THE Submission_System SHALL include a SQL migration file that adds the four columns to the existing `student_assignments` table using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements.

---

### Requirement 7: Storage Bucket Configuration

**User Story:** As a developer, I want student submissions stored in a dedicated Supabase Storage bucket, so that submission files are isolated from course notes and access policies can be applied independently.

#### Acceptance Criteria

1. THE Storage_Client SHALL store all student submission files in a bucket named `assignment-submissions`, separate from the existing `course-notes` bucket.
2. THE Storage_Client SHALL enforce a maximum object size of 10,485,760 bytes (10 MB) at the bucket or RLS policy level.
3. WHEN a Student uploads a file, THE Storage_Client SHALL store the file at the path `{assignment_id}/{student_id}/{file_name}` within the `assignment-submissions` bucket.
4. WHEN a Teacher requests a download, THE Storage_Client SHALL perform a direct download (using `supabase.storage.from('assignment-submissions').download(path)`) and trigger a browser download with the original `file_name`.
5. THE Storage_Client SHALL restrict read access to submission files so that only the submitting Student (identified by `auth.uid() = student_id` in the path) and the Teacher who owns the specific Assignment's course may read or download files.
6. THE Storage_Client SHALL restrict write (upload and delete) access so that only the submitting Student may upload or delete their own submission files.
7. THE Submission_System SHALL include a SQL migration file or setup instructions for creating the `assignment-submissions` bucket and its Storage policies.
