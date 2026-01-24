# Education and Management Platform - Frontend Auth Module

## Overview
This project is a React-based frontend authentication module for the "Education and Management Platform". It demonstrates production-quality UI/UX, robust form validation, state management, and role-based access control (RBAC).

## Features
- **Authentication**: Login and Registration with Zod validation.
- **RBAC**: Protected routes for Student and Teacher roles.
- **State Management**: `AuthContext` for global user state and `localStorage` persistence.
- **UI/UX**: Material UI (MUI) with a professional academic theme.
- **Security**: Mock authentication with password strength checks.

## Tech Stack
- React 18
- Vite
- React Router DOM v6
- Material UI (@mui/material)
- React Hook Form + Zod

## Key Concepts

### AuthContext Flow
The `AuthContext` (`src/components/AuthContext.jsx`) provides the authentication state (`user`, `isAuthenticated`, `loading`) to the entire application.
- **Login**: Validates credentials against mock data and sets the user state.
- **Register**: Simulates registration and auto-logins.
- **Persistence**: User state is saved to `localStorage` to persist sessions across reloads.

### Role-Based Access Control (RBAC)
The `ProtectedRoute` component (`src/components/ProtectedRoute.jsx`) wraps protected pages.
- Checks if the user is authenticated.
- Checks if the user's role matches `allowedRoles`.
- Redirects unauthorized attempts to the appropriate dashboard or login page.

### LocalStorage Persistence
Authentication tokens (simulated by user object) are stored in `localStorage`. On app load, `AuthContext` initializes state from this storage.

## Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Mock Credentials
- **Student**: `student@test.com` / `Password123!`
- **Teacher**: `teacher@test.com` / `Password123!`
