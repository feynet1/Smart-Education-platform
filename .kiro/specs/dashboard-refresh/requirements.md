# Requirements Document

## Introduction

This document defines the requirements for the **Dashboard Refresh** feature in the Smart Education web application. The feature adds a consistent, manual refresh button to every student and teacher dashboard page. Users can trigger a data re-fetch from Supabase at any time without a full browser page reload. The button provides visual feedback (spinning icon and disabled state) during the operation and displays a brief success or error notification when the refresh completes.

The feature extends an existing partial implementation — the Student Dashboard home and Teacher Dashboard home already have a working `handleRefresh` pattern — to all remaining student and teacher pages.

---

## Glossary

- **Dashboard_Page**: Any page rendered within the student or teacher dashboard layout, including Courses, Assignments, Attendance, Grades, Events, Profile, and Classroom pages.
- **Refresh_Button**: The MUI `IconButton` placed in the page header that triggers a data re-fetch.
- **Refresh_Handler**: The `handleRefresh` async function local to each page that orchestrates the re-fetch.
- **Snackbar**: The MUI `Snackbar` + `Alert` component used to display success or error notifications after a refresh attempt.
- **StudentContext**: The React context that manages and exposes shared student data and fetch functions.
- **TeacherContext**: The React context that manages and exposes shared teacher data and fetch functions.
- **useEvents_Hook**: The `useEvents` custom React hook that fetches upcoming events from Supabase.
- **RefreshKey**: An integer state variable incremented to imperatively trigger a re-fetch in the `useEvents_Hook`.
- **CircularProgress**: The MUI spinner component displayed inside the Refresh_Button while a refresh is in progress.
- **ProtectedRoute**: The route wrapper that ensures only authenticated users can access dashboard pages.

---

## Requirements

### Requirement 1: Refresh Button Presence on All Dashboard Pages

**User Story:** As a student or teacher, I want a refresh button on every dashboard page, so that I can fetch the latest data at any time without reloading the browser.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL render a Refresh_Button in the page header area alongside the page title.
2. THE Refresh_Button SHALL be visible on all student dashboard pages: Dashboard, Courses, Assignments, Attendance, Grades, Events, and Profile.
3. THE Refresh_Button SHALL be visible on all teacher dashboard pages: Dashboard, Courses, Classroom, Attendance, Grades, Assignments, Events, and Profile.
4. WHERE a Dashboard_Page is accessed by an authenticated user, THE Refresh_Button SHALL be rendered only within a ProtectedRoute.

---

### Requirement 2: Refresh Button Visual Feedback During Loading

**User Story:** As a student or teacher, I want the refresh button to show a spinner and become unclickable while data is loading, so that I know a refresh is in progress and cannot accidentally trigger duplicate requests.

#### Acceptance Criteria

1. WHEN a user clicks the Refresh_Button, THE Refresh_Handler SHALL set the refreshing state to `true` before any data fetch begins.
2. WHILE the refreshing state is `true`, THE Refresh_Button SHALL be disabled and SHALL display a CircularProgress spinner in place of the refresh icon.
3. WHILE the refreshing state is `true`, THE Refresh_Button SHALL not accept additional click events.
4. WHEN all data fetches initiated by the Refresh_Handler have settled (resolved or rejected), THE Refresh_Handler SHALL set the refreshing state to `false`.

---

### Requirement 3: Data Re-fetch on Refresh

**User Story:** As a student or teacher, I want clicking the refresh button to re-fetch all relevant data for the current page from Supabase, so that I see up-to-date information without a full page reload.

#### Acceptance Criteria

1. WHEN a user clicks the Refresh_Button on the Student Courses page, THE Refresh_Handler SHALL call `fetchEnrollments` and `fetchAllCourses` from StudentContext.
2. WHEN a user clicks the Refresh_Button on the Student Assignments page, THE Refresh_Handler SHALL invoke the page-local `load` callback to re-fetch assignments and completions.
3. WHEN a user clicks the Refresh_Button on the Student Attendance page, THE Refresh_Handler SHALL call `fetchAttendanceHistory` from StudentContext.
4. WHEN a user clicks the Refresh_Button on the Student Grades page, THE Refresh_Handler SHALL call `fetchGrades` from StudentContext.
5. WHEN a user clicks the Refresh_Button on the Student Events page, THE Refresh_Handler SHALL increment the RefreshKey to trigger a re-fetch via the useEvents_Hook and SHALL re-fetch upcoming assignments via the page-local fetch.
6. WHEN a user clicks the Refresh_Button on the Student Profile page, THE Refresh_Handler SHALL re-fetch the user's profile data.
7. WHEN a user clicks the Refresh_Button on the Teacher Courses page, THE Refresh_Handler SHALL call `fetchCourses` from TeacherContext.
8. WHEN a user clicks the Refresh_Button on the Teacher Classroom page, THE Refresh_Handler SHALL call `fetchActiveSession` and `fetchSessionAttendance` from TeacherContext.
9. WHEN a user clicks the Refresh_Button on the Teacher Attendance page, THE Refresh_Handler SHALL call `fetchEnrolledStudents` and the page-local `fetchHistory` function from TeacherContext.
10. WHEN a user clicks the Refresh_Button on the Teacher Grades page, THE Refresh_Handler SHALL call `fetchGradeEntries` and `fetchWeights` from TeacherContext.
11. WHEN a user clicks the Refresh_Button on the Teacher Assignments page, THE Refresh_Handler SHALL invoke the page-local fetch for the teacher's assignments.
12. WHEN a user clicks the Refresh_Button on the Teacher Events page, THE Refresh_Handler SHALL increment the RefreshKey to trigger a re-fetch via the useEvents_Hook.
13. WHEN a user clicks the Refresh_Button on the Teacher Profile page, THE Refresh_Handler SHALL re-fetch the teacher's profile data.
14. THE Refresh_Handler SHALL execute multiple data fetches in parallel using `Promise.all` or equivalent concurrent execution.

---

### Requirement 4: Success Notification After Refresh

**User Story:** As a student or teacher, I want to see a brief success message after a refresh completes successfully, so that I know the data has been updated.

#### Acceptance Criteria

1. WHEN all data fetches in the Refresh_Handler resolve successfully, THE Dashboard_Page SHALL display a Snackbar with severity `success` and a confirmation message.
2. THE Snackbar SHALL auto-dismiss after 3000 milliseconds.
3. THE Snackbar SHALL be anchored at the bottom-center of the viewport.

---

### Requirement 5: Error Notification After Failed Refresh

**User Story:** As a student or teacher, I want to see an error message if a refresh fails, so that I know the data may be stale and can try again.

#### Acceptance Criteria

1. IF a data fetch in the Refresh_Handler throws an error, THEN THE Dashboard_Page SHALL display a Snackbar with severity `error` and an error message.
2. IF a refresh fails, THEN THE Dashboard_Page SHALL retain the previously loaded data and SHALL not clear the page content.
3. IF a refresh fails, THEN THE Refresh_Button SHALL be re-enabled so the user can retry.

---

### Requirement 6: useEvents Hook Refresh Support

**User Story:** As a developer, I want the useEvents hook to support an optional refresh key parameter, so that pages using the hook can imperatively trigger a re-fetch without rewriting the hook's internal logic.

#### Acceptance Criteria

1. THE useEvents_Hook SHALL accept an optional `refreshKey` integer parameter with a default value of `0`.
2. WHEN the `refreshKey` value changes, THE useEvents_Hook SHALL re-execute its data fetch effect.
3. WHILE the useEvents_Hook is fetching data, THE useEvents_Hook SHALL set its `loading` state to `true`.
4. WHEN the useEvents_Hook fetch settles, THE useEvents_Hook SHALL set its `loading` state to `false`.
5. THE useEvents_Hook SHALL return only events where the event date is greater than or equal to the current date and the event target matches `'all'` or the provided role.

---

### Requirement 7: StudentContext Exposes Required Fetch Functions

**User Story:** As a developer, I want the StudentContext to export all fetch functions needed by dashboard pages, so that page-level refresh handlers can call them directly.

#### Acceptance Criteria

1. THE StudentContext SHALL include `fetchGrades` in its exported context value.
2. THE StudentContext SHALL include `fetchAllCourses` in its exported context value.
3. THE StudentContext SHALL include `fetchEnrollments` in its exported context value.

---

### Requirement 8: Refresh Does Not Cause Full Page Reload

**User Story:** As a student or teacher, I want the refresh operation to update data in place, so that my current scroll position and UI state are preserved.

#### Acceptance Criteria

1. WHEN a user clicks the Refresh_Button, THE Dashboard_Page SHALL re-fetch data without triggering a browser navigation or full page reload.
2. WHEN a refresh completes, THE Dashboard_Page SHALL update only the data-driven portions of the UI through React state updates.

---

### Requirement 9: Consistent Refresh Button Appearance

**User Story:** As a student or teacher, I want the refresh button to look and behave the same way on every page, so that the interface feels predictable and professional.

#### Acceptance Criteria

1. THE Refresh_Button SHALL use the MUI `IconButton` component with `size="small"`.
2. THE Refresh_Button SHALL be wrapped in a MUI `Tooltip` with the title `"Refresh"`.
3. THE Refresh_Button SHALL display the MUI `Refresh` icon from `@mui/icons-material` when not in the refreshing state.
4. THE Refresh_Button SHALL display a `CircularProgress` with `size={20}` when in the refreshing state.
5. THE Refresh_Button SHALL be placed in the page header `Box` alongside the page title, consistent with the existing pattern on the Dashboard home pages.
