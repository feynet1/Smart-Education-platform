// Returns true when submitted_at is after due_date 23:59:59 UTC
export function isLate(submittedAt, dueDate) {
  if (!submittedAt || !dueDate) return false;
  return new Date(submittedAt) > new Date(dueDate + 'T23:59:59Z');
}

// Converts bytes to human-readable string, e.g. 2516582 → "2.4 MB"
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' MB'.replace('MB', units[i]);
}

// Validates a File object; returns null on success or an error string
export const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'application/zip',
]);
export const MAX_BYTES = 1_048_576; // 1 MB

export function validateFile(file) {
  if (!ALLOWED_MIME.has(file.type)) {
    return 'Accepted formats: PDF, DOCX, DOC, JPG, PNG, ZIP';
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return 'File must be between 1 byte and 1 MB';
  }
  return null;
}

// Pure helper for storage path construction (also used in tests)
export function buildPath(assignmentId, studentId, fileName) {
  return `${assignmentId}/${studentId}/${fileName}`;
}
