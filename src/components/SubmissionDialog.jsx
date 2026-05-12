import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Box,
  LinearProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { useSubmission } from '../hooks/useSubmission';
import { validateFile } from '../utils/submissionUtils';

/**
 * SubmissionDialog — modal for file selection, validation, and upload confirmation.
 *
 * @param {object}  props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {{ id: string, title: string, due_date: string }} props.assignment
 * @param {string}  props.studentId
 * @param {{ fileName: string, fileSize: string, submittedAt: string, filePath: string } | null} props.existingSubmission
 * @param {function} props.onSuccess  — called with the updated record on success
 */
export default function SubmissionDialog({
  open,
  onClose,
  assignment,
  studentId,
  existingSubmission,
  onSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const { uploading, uploadProgress, error, upload, resubmit } = useSubmission();

  // Determine if the current time is past the assignment deadline.
  // setState is deferred via setTimeout to satisfy react-hooks/set-state-in-effect.
  const [isLateSubmission, setIsLateSubmission] = useState(false);
  useEffect(() => {
    if (!open || !assignment?.due_date) return;
    const timer = setTimeout(() => {
      setIsLateSubmission(new Date() > new Date(assignment.due_date + 'T23:59:59Z'));
    }, 0);
    return () => clearTimeout(timer);
  }, [open, assignment?.due_date]);

  function handleFileChange(e) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const err = validateFile(file);
    setValidationError(err);
    setSelectedFile(file);

    // Reset the input value so the same file can be re-selected after clearing
    e.target.value = '';
  }

  async function handleConfirm() {
    if (!selectedFile || validationError || uploading) return;

    let result;
    if (existingSubmission) {
      result = await resubmit(
        assignment.id,
        studentId,
        selectedFile,
        existingSubmission.filePath
      );
    } else {
      result = await upload(assignment.id, studentId, selectedFile);
    }

    if (result.ok) {
      onSuccess(result.record);
      handleClose();
    }
    // On error: useSubmission.error is set; dialog stays open
  }

  function handleClose() {
    if (uploading) return; // prevent closing while uploading
    setSelectedFile(null);
    setValidationError(null);
    onClose();
  }

  const confirmDisabled = !selectedFile || !!validationError || uploading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
      </DialogTitle>

      {uploading && (
        <LinearProgress
          variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
          value={uploadProgress}
        />
      )}

      <DialogContent>
        {/* Assignment title */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {assignment?.title}
        </Typography>

        {/* Late submission warning chip */}
        {isLateSubmission && (
          <Chip
            label="Late submission"
            size="small"
            sx={{ mb: 2, backgroundColor: 'warning.main', color: 'warning.contrastText' }}
          />
        )}

        {/* Prior submission info */}
        {existingSubmission && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current submission:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {existingSubmission.fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {existingSubmission.fileSize} &middot;{' '}
              {format(new Date(existingSubmission.submittedAt), 'MMM dd, yyyy h:mm a')}
            </Typography>
          </Box>
        )}

        {/* File picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Button
          variant="outlined"
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          sx={{ mb: 1 }}
        >
          Choose File
        </Button>

        {/* Selected file info */}
        {selectedFile && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
        )}

        {/* Validation error */}
        {validationError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {validationError}
          </Alert>
        )}

        {/* Upload / API error */}
        {error && !uploading && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {/* Accepted formats hint */}
        {!selectedFile && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Accepted: PDF, DOCX, DOC, JPG, PNG, ZIP &mdash; max 10 MB
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {uploading
            ? 'Uploading…'
            : existingSubmission
            ? 'Resubmit'
            : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
