-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: assignment_submission_columns
-- Adds file submission metadata columns to student_assignments and creates
-- the assignment-submissions storage bucket with RLS policies.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend student_assignments table
ALTER TABLE public.student_assignments
  ADD COLUMN IF NOT EXISTS file_path    text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS file_name    text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS file_size    text        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT NULL;

-- 2. Create the storage bucket (idempotent via INSERT ... ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-submissions',
  'assignment-submissions',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on storage.objects (already enabled by default in Supabase,
--    but included for explicitness)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ── Storage RLS Policies ──────────────────────────────────────────────────────

-- Drop existing policies to allow idempotent re-runs
DROP POLICY IF EXISTS "Students can upload their own submissions"  ON storage.objects;
DROP POLICY IF EXISTS "Students can delete their own submissions"  ON storage.objects;
DROP POLICY IF EXISTS "Students can read their own submissions"    ON storage.objects;
DROP POLICY IF EXISTS "Teachers can read course submissions"       ON storage.objects;

-- WRITE (INSERT): only the submitting student may upload
-- Path pattern: {assignment_id}/{student_id}/{file_name}
-- auth.uid()::text must match the second path segment
CREATE POLICY "Students can upload their own submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- DELETE: only the submitting student may delete their own file
CREATE POLICY "Students can delete their own submissions"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-submissions'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- READ (SELECT): submitting student may read their own file
CREATE POLICY "Students can read their own submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-submissions'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- READ (SELECT): teacher who owns the assignment's course may read all submissions
CREATE POLICY "Teachers can read course submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-submissions'
    AND EXISTS (
      SELECT 1
      FROM public.student_assignments sa
      JOIN public.assignments a ON a.id = sa.assignment_id
      JOIN public.courses c ON c.id = a.course_id
      WHERE sa.file_path = (storage.objects.bucket_id || '/' || storage.objects.name)
         OR sa.file_path = storage.objects.name
        AND c.teacher_id = auth.uid()
    )
  );
