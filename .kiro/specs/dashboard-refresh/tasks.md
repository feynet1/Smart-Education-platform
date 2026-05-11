# Implementation Plan: Dashboard Refresh

## Overview

Add a consistent manual refresh button (MUI `IconButton` + `Tooltip` + `CircularProgress` spinner + `Snackbar` feedback) to every student and teacher dashboard page that does not already have one. The work is split into three layers:

1. **Shared infrastructure** — extend `useEvents` hook with `refreshKey` and expose `fetchGrades`, `fetchAllCourses`, `fetchEnrollments` from `StudentContext`.
2. **Student pages** — Courses, Assignments, Attendance, Grades, Events, Profile.
3. **Teacher pages** — Courses (List), Classroom (already partial — complete it), Attendance, Grades, Assignments, Events (new page), Settings/Profile.

Student Dashboard home and Teacher Dashboard home already have refresh — they are excluded.

---

## Tasks

- [x] 1. Extend shared infrastructure

  - [x] 1.1 Add `refreshKey` parameter to `useEvents` hook
    - In `src/hooks/useEvents.js`, add an optional `refreshKey = 0` second parameter
    - Add `refreshKey` to the `useEffect` dependency array so incrementing it re-runs the fetch
    - No other logic changes needed
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 1.2 Expose `fetchGrades`, `fetchAllCourses`, and `fetchEnrollments` from `StudentContext`
    - In `src/contexts/StudentContext.jsx`, add `fetchGrades`, `fetchAllCourses`, and `fetchEnrollments` to the `value` object passed to `StudentContext.Provider`
    - All three functions already exist internally — this is purely an export change
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 2. Add refresh to Student pages

  - [ ] 2.1 Add refresh button and handler to Student Courses page
    - In `src/pages/student/Courses/index.jsx`, add `refreshing` and `snackbar` state
    - Destructure `fetchEnrollments` and `fetchAllCourses` from `useStudent()` (now exported via task 1.2)
    - Implement `handleRefresh` calling `Promise.all([fetchEnrollments(), fetchAllCourses()])`
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box`
    - Add `Snackbar` + `Alert` at the bottom of the return
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress` from MUI
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.1, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 2.2 Add refresh button and handler to Student Assignments page
    - In `src/pages/student/Assignments/index.jsx`, add `refreshing` and `snackbar` state
    - Implement `handleRefresh` that calls the existing `load()` callback and sets snackbar on success/error
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the title)
    - Add `Snackbar` + `Alert` at the bottom of the return
    - Import `Refresh`, `Tooltip`, `IconButton` from MUI (CircularProgress already imported)
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.2, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 2.3 Add refresh button and handler to Student Attendance page
    - In `src/pages/student/Attendance/index.jsx`, add `refreshing` and `snackbar` state
    - Destructure `fetchAttendanceHistory` from `useStudent()`
    - Implement `handleRefresh` calling `fetchAttendanceHistory()`
    - Convert the existing header `Box` (currently only has title) to `display="flex" justifyContent="space-between"` and add the `IconButton`
    - Add `Snackbar` + `Alert` at the bottom of the return
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress`, `Snackbar`, `Alert` from MUI
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.3, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 2.4 Add refresh button and handler to Student Grades page
    - In `src/pages/student/Grades/index.jsx`, add `refreshing` and `snackbar` state
    - Destructure `fetchGrades` from `useStudent()` (now exported via task 1.2)
    - Implement `handleRefresh` calling `fetchGrades()`
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the Export CSV button)
    - Add `Snackbar` + `Alert` at the bottom of the return
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress`, `Snackbar`, `Alert` from MUI
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.4, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 2.5 Add refresh button and handler to Student Events page
    - In `src/pages/student/Events/index.jsx`, add `refreshKey`, `refreshing`, and `snackbar` state
    - Pass `refreshKey` as the second argument to `useEvents('students', refreshKey)`
    - Implement `handleRefresh`: set `refreshing(true)`, increment `refreshKey`, re-fetch local assignments
    - Add a `useEffect` watching `loading` to set `refreshing(false)` once the hook fetch settles
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box`
    - Add `Snackbar` + `Alert` at the bottom of the return
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress`, `Snackbar`, `Alert` from MUI
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.5, 4.1–4.3, 5.1–5.3, 6.1–6.5, 9.1–9.5_

  - [ ] 2.6 Add refresh button and handler to Student Profile page
    - In `src/pages/student/Profile/index.jsx`, add `refreshing` state (snackbar already exists)
    - Destructure `updateProfile` from `useAuth()` — profile data is already live via context; for a manual refresh, re-read the profile from Supabase using `supabase.from('profiles').select('*').eq('id', user.id).single()` and call `updateProfile` or a local setter
    - Implement `handleRefresh` that re-fetches the profile row and updates local `name`/`phone` state, then shows the snackbar
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box`
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress` from MUI
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.6, 4.1–4.3, 5.1–5.3, 9.1–9.5_

- [ ] 3. Checkpoint — student pages
  - Ensure all tests pass and the six student pages each show a working refresh button. Ask the user if questions arise.

- [ ] 4. Add refresh to Teacher pages

  - [ ] 4.1 Add refresh button and handler to Teacher Courses (List) page
    - In `src/pages/teacher/Courses/List.jsx`, add `refreshing` state (snackbar already exists)
    - Destructure `fetchCourses` from `useTeacher()`
    - Implement `handleRefresh` calling `fetchCourses()`
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the Create Course button)
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress` from MUI
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.7, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 4.2 Complete refresh button on Teacher Classroom page
    - `src/pages/teacher/Classroom/index.jsx` already has a `handleRefresh` and `Refresh` icon button, but it only calls `fetchActiveSession` and lacks a `Snackbar` notification
    - Add `snackbar` state and a `Snackbar` + `Alert` at the bottom of the return
    - Update `handleRefresh` to show success/error snackbar after the fetch settles
    - Ensure the `Tooltip` wraps a `<span>` so it works when the button is disabled
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.8, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 4.3 Add refresh button and handler to Teacher Attendance page
    - In `src/pages/teacher/Attendance/index.jsx`, add `refreshing` state (snackbar already exists)
    - Implement `handleRefresh` calling `Promise.all([fetchEnrolledStudents(courseId), fetchHistory()])`
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the date picker and Save button)
    - `Refresh` icon is already imported; import `Tooltip` and `IconButton` if not already present
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.9, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 4.4 Add refresh button and handler to Teacher Grades page
    - In `src/pages/teacher/Grades/index.jsx`, add `refreshing` state (snackbar already exists)
    - Implement `handleRefresh` calling `Promise.all([fetchGradeEntries(courseId), fetchWeights(courseId)])`
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the category weight chips)
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress` from MUI
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.10, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 4.5 Add refresh button and handler to Teacher Assignments page
    - In `src/pages/teacher/Assignments/index.jsx`, add `refreshing` state (snackbar already exists)
    - Implement `handleRefresh` calling the existing `fetchAssignments()` callback
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box` (alongside the New Assignment button)
    - Import `Refresh`, `Tooltip` from MUI (`IconButton` and `CircularProgress` already imported)
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.11, 4.1–4.3, 5.1–5.3, 9.1–9.5_

  - [ ] 4.6 Create Teacher Events page with refresh support
    - Create `src/pages/teacher/Events/index.jsx` — the teacher currently has no Events page
    - Model it after the Student Events page but use `useEvents('teachers', refreshKey)`
    - Omit the student-specific "Upcoming Assignments" section
    - Include `refreshKey`, `refreshing`, and `snackbar` state from the start
    - Implement `handleRefresh` that increments `refreshKey` and watches `loading` to reset `refreshing`
    - Add `IconButton` + `Tooltip` + `CircularProgress` in the page header
    - Register the new page in the router (check `src/App.jsx` for the teacher route group)
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.12, 4.1–4.3, 5.1–5.3, 6.1–6.5, 9.1–9.5_

  - [ ] 4.7 Add refresh button and handler to Teacher Settings (Profile) page
    - In `src/pages/teacher/Settings/index.jsx`, add `refreshing` state (snackbar already exists)
    - Implement `handleRefresh` that re-fetches the teacher's profile row from `supabase.from('profiles').select('*').eq('id', user.id).single()` and updates local `name`/`phone` state
    - Add `IconButton` + `Tooltip` + `CircularProgress` to the existing header `Box`
    - Import `Refresh`, `Tooltip`, `IconButton`, `CircularProgress` from MUI
    - _Requirements: 1.1, 1.3, 2.1–2.4, 3.13, 4.1–4.3, 5.1–5.3, 9.1–9.5_

- [ ] 5. Final checkpoint — all pages
  - Ensure all tests pass and every student and teacher page (except the two Dashboard home pages) shows a working refresh button with spinner and snackbar. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Tasks 1.1 and 1.2 are prerequisites for tasks 2.5 (needs `refreshKey`) and 2.1/2.4 (need exported context functions) respectively; all other page tasks are independent of each other
- The Teacher Classroom page (task 4.2) already has a partial refresh implementation — the task is to complete it with snackbar feedback, not rewrite it
- The Teacher Events page (task 4.6) requires creating a new file and registering a route — check `src/App.jsx` for the correct route path pattern
- The design specifies `Promise.all` for parallel fetches; for pages with a single data source a direct `await` is acceptable
- All Snackbar components should use `autoHideDuration={3000}` and `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`
- The `<Tooltip>` must wrap a `<span>` around a disabled `IconButton` so MUI can attach the tooltip event listeners

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"] }
  ]
}
```
