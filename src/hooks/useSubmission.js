import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatFileSize, buildPath } from '../utils/submissionUtils';

/**
 * Custom hook encapsulating all storage and database operations for
 * assignment submissions.
 *
 * @returns {{
 *   uploading: boolean,
 *   uploadProgress: number,
 *   error: string | null,
 *   upload: (assignmentId: string, studentId: string, file: File) => Promise<{ok: boolean, record?: object, error?: string}>,
 *   resubmit: (assignmentId: string, studentId: string, file: File, oldFilePath: string) => Promise<{ok: boolean, record?: object, error?: string}>,
 *   download: (filePath: string, fileName: string) => Promise<{ok: boolean, error?: string}>,
 *   fetchSubmissions: (assignmentId: string) => Promise<import('../utils/submissionUtils').SubmissionRecord[]>,
 * }}
 */
export function useSubmission() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a new file for an assignment (first submission).
   */
  async function upload(assignmentId, studentId, file) {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const path = buildPath(assignmentId, studentId, file.name);

    // 1. Upload to storage
    const { error: storageError } = await supabase.storage
      .from('assignment-submissions')
      .upload(path, file, { upsert: true });

    if (storageError) {
      const msg = storageError.message ?? 'Upload failed';
      setError(msg);
      setUploading(false);
      return { ok: false, error: msg };
    }

    // 2. Upsert student_assignments record
    const now = new Date().toISOString();
    const { data, error: dbError } = await supabase
      .from('student_assignments')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          status: 'done',
          file_path: path,
          file_name: file.name,
          file_size: formatFileSize(file.size),
          submitted_at: now,
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select()
      .single();

    if (dbError) {
      const msg = dbError.message ?? 'Failed to save submission record';
      setError(msg);
      setUploading(false);

      // Attempt orphan cleanup
      const { error: removeError } = await supabase.storage
        .from('assignment-submissions')
        .remove([path]);
      if (removeError) {
        console.error('[useSubmission] Orphaned file could not be deleted:', path, removeError);
      }

      return { ok: false, error: msg };
    }

    setUploadProgress(100);
    setUploading(false);
    return { ok: true, record: data };
  }

  /**
   * Replace an existing submission (resubmission).
   */
  async function resubmit(assignmentId, studentId, file, oldFilePath) {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // 1. Delete old file
    await supabase.storage
      .from('assignment-submissions')
      .remove([oldFilePath]);
    // Non-fatal: proceed even if old file deletion fails

    const newPath = buildPath(assignmentId, studentId, file.name);

    // 2. Upload new file
    const { error: storageError } = await supabase.storage
      .from('assignment-submissions')
      .upload(newPath, file, { upsert: true });

    if (storageError) {
      const msg = storageError.message ?? 'Upload failed';
      setError(msg);
      setUploading(false);
      return { ok: false, error: msg };
    }

    // 3. Upsert student_assignments record
    const now = new Date().toISOString();
    const { data, error: dbError } = await supabase
      .from('student_assignments')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          status: 'done',
          file_path: newPath,
          file_name: file.name,
          file_size: formatFileSize(file.size),
          submitted_at: now,
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select()
      .single();

    if (dbError) {
      const msg = dbError.message ?? 'Failed to save submission record';
      setError(msg);
      setUploading(false);

      // Attempt orphan cleanup for newly uploaded file
      const { error: removeError } = await supabase.storage
        .from('assignment-submissions')
        .remove([newPath]);
      if (removeError) {
        console.error('[useSubmission] Orphaned file could not be deleted:', newPath, removeError);
      }

      return { ok: false, error: msg };
    }

    setUploadProgress(100);
    setUploading(false);
    return { ok: true, record: data };
  }

  /**
   * Download a submitted file and trigger browser save.
   */
  async function download(filePath, fileName) {
    setError(null);

    const { data, error: downloadError } = await supabase.storage
      .from('assignment-submissions')
      .download(filePath);

    if (downloadError) {
      const msg = downloadError.message ?? 'Download failed';
      setError(msg);
      return { ok: false, error: msg };
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { ok: true };
  }

  /**
   * Fetch all student_assignment rows for a given assignment (teacher panel).
   * Joins with profiles to get student names.
   *
   * @param {string} assignmentId
   * @returns {Promise<Array>}
   */
  async function fetchSubmissions(assignmentId) {
    // Fetch student_assignments rows for this assignment
    const { data, error: fetchError } = await supabase
      .from('student_assignments')
      .select('student_id, status, file_path, file_name, file_size, submitted_at')
      .eq('assignment_id', assignmentId);

    if (fetchError) {
      console.error('[useSubmission] fetchSubmissions error:', fetchError);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Fetch profile names separately to avoid join syntax issues
    const studentIds = data.map((r) => r.student_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', studentIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return data.map((row) => {
      const profile = profileMap.get(row.student_id);
      return {
        studentId: row.student_id,
        studentName: profile?.name || profile?.email || 'Unknown',
        status: row.status,
        filePath: row.file_path,
        fileName: row.file_name,
        fileSize: row.file_size,
        submittedAt: row.submitted_at,
      };
    });
  }

  return {
    uploading,
    uploadProgress,
    error,
    upload,
    resubmit,
    download,
    fetchSubmissions,
  };
}

export default useSubmission;
