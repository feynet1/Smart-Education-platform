# Implementation Plan: Assignment Submission

## Overview

Implement file-based assignment submission for the Smart Education platform. The plan follows a bottom-up dependency order: database migration first, then utilities and the data hook in parallel, then UI components, and finally page-level integration for both student and teacher views.

---

## Tasks

- [x] 1. SQL migration — extend schema and configure storage bucket
  - [x] 1.1 Create `supabase/migrations/assignment_submission_columns.sql`
    - Add `file_path`, `file_name`, `file_size`, `submitted_at` columns to `student_assignments` using `ALTER TABLE … ADD COLUMN IF NOT EXISTS`
    - Insert the `assignment-submissions` bucket row into `storage.buckets` with `public = false`, `file_size_limit = 10485760`, and the six allowed MIME types
    - Drop and recreate the four RLS policies on `storage.objects`: student upload, student delete, student read, teacher read
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 7.1, 7.2, 7.5, 7.6, 7.7_

- [ ] 2. Utility functions — `src/utils/submissionUtils.js`
  - [-] 2.1 Implement `isLate`, `formatFileSize`, and `validateFile`
    - `isLate(submittedAt, dueDate)`: returns `true` iff `new Date(submittedAt) > new Date(dueDate + 'T23:59:59Z')`; returns `false` for null inputs
    - `formatFileSize(bytes)`: converts bytes to human-readable string with `B`, `KB`, or `MB` suffix; `0` → `"0 B"`
    - `validateFile(file)`: checks MIME type against the six allowed types and size in `(0, 10_485_760]`; returns `null` on pass or an error string on failure
    - Export all three functions as named exports
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.2, 4.3, 6.3_
  - [ ]* 2.2 Write property test for `validateFile` — MIME type validation
    - **Property 3: MIME type validation**
    - Use `fast-check`: generate arbitrary strings as MIME types; assert `validateFile({type: mime, size: 1}) === null` iff `mime ∈ ALLOWED_MIME`
    - **Validates: Requirements 2.1, 2.2**
  - [ ]* 2.3 Write property test for `validateFile` — file size validation
    - **Property 4: File size validation**
    - Use `fast-check`: generate integers in `[-1, 11_000_000]`; assert `validateFile({type: 'application/pdf', size: n}) === null` iff `0 < n ≤ 10_485_760`
    - **Validates: Requirements 2.3, 2.4**
  - [ ]* 2.4 Write property test for `isLate`
    - **Property 5: Late submission detection**
    - Use `fast-check`: generate two `fc.date()` values; assert `isLate(s.toISOString(), d.toISOString().slice(0,10)) === (s > new Date(d.toISOString().slice(0,10) + 'T23:59:59Z'))`
    - **Validates: Requirements 4.2, 4.3**
  - [ ]* 2.5 Write property test for `formatFileSize`
    - **Property 7: formatFileSize round-trip accuracy**
    - Use `fast-check`: generate integers in `[1, 10_485_760]`; assert output is a non-empty string with a numeric value and a unit suffix (`B`, `KB`, or `MB`), and the numeric value is within 5% of the true converted value
    - **Validates: Requirements 6.3**

- [ ] 3. `useSubmission` hook — `src/hooks/useSubmission.js`
  - [-] 3.1 Implement `upload`, `resubmit`, `download`, and `fetchSubmissions`
    - `upload(assignmentId, studentId, file)`: upload to `assignment-submissions/{assignmentId}/{studentId}/{file.name}`, then upsert `student_assignments` with `status='done'`, `file_path`, `file_name`, `file_size` (via `formatFileSize`), `submitted_at = new Date().toISOString()`; on DB failure attempt `storage.remove([path])`; return `{ ok, error }`
    - `resubmit(assignmentId, studentId, file, oldFilePath)`: delete `oldFilePath` first, then upload new file, then upsert; on upload failure return error without touching DB; on DB failure attempt `storage.remove([newPath])`; return `{ ok, error }`
    - `download(filePath, fileName)`: call `supabase.storage.from('assignment-submissions').download(filePath)`, create object URL, trigger `<a>` click with `download=fileName`, revoke URL; return `{ ok, error }`
    - `fetchSubmissions(assignmentId)`: select all `student_assignments` rows for the assignment joined with `profiles` for student names; return array of `SubmissionRecord` objects
    - Expose `uploading` (boolean) and `error` (string|null) state
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 3.2, 3.3, 3.4, 3.5, 3.6, 5.4, 7.3, 7.4_
  - [ ]* 3.2 Write property test for storage path construction
    - **Property 1: Storage path construction**
    - Use `fast-check`: generate two `fc.uuid()` values and a `fc.string({ minLength: 1 })`; assert the path built inside `upload` equals `` `${assignmentId}/${studentId}/${fileName}` ``
    - Extract a pure `buildPath(assignmentId, studentId, fileName)` helper from the hook to make this testable
    - **Validates: Requirements 1.4, 7.3**

- [ ] 4. `SubmissionDialog` component — `src/components/SubmissionDialog.jsx`
  - [~] 4.1 Implement `SubmissionDialog`
    - Accept props: `open`, `onClose`, `assignment` (`{ id, title, due_date }`), `studentId`, `existingSubmission` (null or `{ fileName, fileSize, submittedAt, filePath }`), `onSuccess`
    - Internal state: `selectedFile`, `validationError`, `isLateWarning`
    - On file input change: call `validateFile(file)`; set `validationError` or clear it; set `isLateWarning` when `Date.now() > new Date(assignment.due_date + 'T23:59:59Z')`
    - Confirm button enabled only when `selectedFile !== null && validationError === null && !uploading`
    - On confirm: call `useSubmission.upload()` or `useSubmission.resubmit()` based on `existingSubmission`; on success call `onSuccess(updatedRecord)` and close; on error display `useSubmission.error` inline
    - Show prior file info (name, size, timestamp) when `existingSubmission` is non-null
    - Show `CircularProgress` and disable button while `uploading` is true
    - _Requirements: 1.3, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.4, 3.5_

- [ ] 5. `SubmissionsPanel` component — `src/components/SubmissionsPanel.jsx`
  - [~] 5.1 Implement `SubmissionsPanel`
    - Accept props: `open`, `onClose`, `assignment` (`{ id, title, due_date }`), `courseId`
    - On open: fetch enrolled students (from `enrollments` + `profiles`) and call `useSubmission.fetchSubmissions(assignment.id)` in parallel; merge by `studentId`
    - Render summary chip `"X / Y submitted"` at the top (X = rows with non-null `filePath`, Y = total enrolled)
    - Per row: student name, status chip ("Submitted" / "Not submitted"), formatted timestamp (`format(submittedAt, 'MMM dd, yyyy h:mm a')`), `Late_Badge` (`<Chip label="Late" color="warning" size="small" />`) when `isLate(submittedAt, due_date)`, download `IconButton` when submitted
    - Download click: call `useSubmission.download(filePath, fileName)`; on error show error `Snackbar`
    - Show `CircularProgress` while `loading`; show "No students enrolled yet" when enrolled list is empty
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 4.2_
  - [ ]* 5.2 Write property test for submission count summary
    - **Property 6: Submission count summary**
    - Use `fast-check`: generate `fc.array(fc.record({ filePath: fc.option(fc.string()) }))`; assert the summary string equals `"${nonNull} / ${total} submitted"` where `nonNull` is the count of records with a non-null `filePath`
    - Extract a pure `buildSummary(records)` helper to make this testable
    - **Validates: Requirements 5.6**

- [~] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Student Assignments page — integrate submission UI
  - [~] 7.1 Update `src/pages/student/Assignments/index.jsx`
    - In `load()`, extend the `student_assignments` select to include `file_path, file_name, file_size, submitted_at`; remove `completed_at` from the select
    - Remove the `Checkbox` / `toggleDone` logic from `renderItem` and the `toggling` state
    - In the `secondaryAction` slot: render `<Button variant="outlined" size="small">Submit</Button>` when `completions[id]?.file_path == null`; render `<Button variant="contained" size="small" color="success">Resubmit</Button>` plus file name and formatted timestamp when a submission exists
    - Add `Late_Badge` (`<Chip label="Late" color="warning" size="small" />`) when `isLate(completions[id]?.submitted_at, item.due_date)` is true
    - Add `dialogOpen` and `selectedAssignment` state; wire Submit/Resubmit buttons to open `<SubmissionDialog>`
    - Render `<SubmissionDialog>` once at the bottom; in `onSuccess` update `completions` state with the returned record
    - Import `isLate` from `submissionUtils`, `SubmissionDialog` from components
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 4.3_
  - [ ]* 7.2 Write property test for submission timestamp formatting
    - **Property 2: Submission timestamp formatting**
    - Use `fast-check`: generate `fc.date()` and `fc.string({ minLength: 1 })`; assert the rendered submission status string contains `fileName` and `format(date, 'MMM dd, yyyy h:mm a')`
    - Extract a pure `formatSubmissionStatus(fileName, submittedAt)` helper to make this testable
    - **Validates: Requirements 1.2, 3.1**

- [ ] 8. Teacher Assignments page — add View Submissions button
  - [~] 8.1 Update `src/pages/teacher/Assignments/index.jsx`
    - Import `Visibility` from `@mui/icons-material`
    - Add `panelOpen` and `selectedAssignment` state
    - Add `openSubmissionsPanel(item)` handler that sets `selectedAssignment = item` and `panelOpen = true`
    - In the Actions `TableCell`, insert a `<Tooltip title="View Submissions"><IconButton size="small" onClick={() => openSubmissionsPanel(item)}><Visibility fontSize="small" /></IconButton></Tooltip>` before the Edit button
    - Render `<SubmissionsPanel>` once at the bottom of the component, controlled by `panelOpen` / `selectedAssignment`
    - Import `SubmissionsPanel` from components
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [~] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Tasks 2 and 3 have no dependency on each other and can run in parallel
- Tasks 4 and 5 can run in parallel once tasks 2 and 3 are complete
- Tasks 7 and 8 can run in parallel once tasks 4 and 5 are complete respectively
- Property tests require `fast-check` (`npm install --save-dev fast-check`)
- Pure helper functions (`buildPath`, `buildSummary`, `formatSubmissionStatus`) should be exported from their respective modules to enable property testing without mocking React hooks
- The `completed_at` column is kept in the DB for backward compatibility but is no longer written or read by the new submission flow

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "4.1", "5.1"] },
    { "id": 3, "tasks": ["5.2", "7.1", "8.1"] },
    { "id": 4, "tasks": ["7.2"] }
  ]
}
```
