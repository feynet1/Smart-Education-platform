import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Divider,
} from '@mui/material';
import { Download, Person } from '@mui/icons-material';
import useSubmission from '../hooks/useSubmission';
import { isLate } from '../utils/submissionUtils';
import { format } from 'date-fns';
import { supabase } from '../supabaseClient';

/**
 * SubmissionsPanel — teacher-facing dialog listing all enrolled students
 * and their submission status for one assignment.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {function} props.onClose
 * @param {{ id: string, title: string, due_date: string }} props.assignment
 * @param {string}   props.courseId
 */
export default function SubmissionsPanel({ open, onClose, assignment, courseId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { download, fetchSubmissions } = useSubmission();

  useEffect(() => {
    if (!open || !assignment?.id || !courseId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      // Fetch enrolled students and submissions in parallel
      const [enrolledResult, submissions] = await Promise.all([
        fetchEnrolledStudents(courseId),
        fetchSubmissions(assignment.id),
      ]);

      if (cancelled) return;

      // Build a lookup map from submissions by studentId
      const submissionMap = new Map(submissions.map((s) => [s.studentId, s]));

      // Merge: one row per enrolled student
      const merged = enrolledResult.map((student) => {
        const sub = submissionMap.get(student.id) ?? null;
        return {
          studentId: student.id,
          studentName: student.name || student.email || 'Unknown',
          status: sub ? sub.status : 'pending',
          filePath: sub?.filePath ?? null,
          fileName: sub?.fileName ?? null,
          fileSize: sub?.fileSize ?? null,
          submittedAt: sub?.submittedAt ?? null,
        };
      });

      setRows(merged);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, assignment?.id, courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDownload(filePath, fileName) {
    const result = await download(filePath, fileName);
    if (!result.ok) {
      setDownloadError(result.error ?? 'Download failed');
      setSnackbarOpen(true);
    }
  }

  function handleSnackbarClose() {
    setSnackbarOpen(false);
    setDownloadError(null);
  }

  const submittedCount = rows.filter((r) => r.filePath !== null).length;
  const totalCount = rows.length;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
              Submissions — {assignment?.title}
            </Typography>
            {!loading && (
              <Chip
                label={`${submittedCount} / ${totalCount} submitted`}
                color={submittedCount === totalCount && totalCount > 0 ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No students enrolled yet</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {rows.map((row, index) => (
                <Box key={row.studentId}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      row.filePath ? (
                        <Tooltip title={`Download ${row.fileName ?? 'file'}`}>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDownload(row.filePath, row.fileName)}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {row.studentName && row.studentName !== 'Unknown'
                          ? row.studentName.charAt(0).toUpperCase()
                          : <Person fontSize="small" />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body1" component="span">
                            {row.studentName}
                          </Typography>
                          <Chip
                            label={row.filePath ? 'Submitted' : 'Not submitted'}
                            color={row.filePath ? 'success' : 'default'}
                            size="small"
                          />
                          {row.filePath && isLate(row.submittedAt, assignment?.due_date) && (
                            <Chip label="Late" color="warning" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        row.submittedAt
                          ? format(new Date(row.submittedAt), 'MMM dd, yyyy h:mm a')
                          : 'Not submitted'
                      }
                    />
                  </ListItem>
                  {index < rows.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {downloadError}
        </Alert>
      </Snackbar>
    </>
  );
}

/**
 * Fetch enrolled students for a course, with fallback if the join fails.
 *
 * @param {string} courseId
 * @returns {Promise<Array<{ id: string, name: string, email: string }>>}
 */
async function fetchEnrolledStudents(courseId) {
  // Try with profiles join first
  const { data, error } = await supabase
    .from('enrollments')
    .select('student_id, profiles(id, name, email)')
    .eq('course_id', courseId);

  if (!error && data) {
    return data.map((row) => ({
      id: row.student_id,
      name: row.profiles?.name ?? '',
      email: row.profiles?.email ?? '',
    }));
  }

  // Fallback: fetch student_ids only, then fetch profiles separately
  console.warn('[SubmissionsPanel] Join failed, falling back to separate queries:', error);

  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId);

  if (enrollError || !enrollments?.length) {
    console.error('[SubmissionsPanel] Failed to fetch enrollments:', enrollError);
    return [];
  }

  const studentIds = enrollments.map((e) => e.student_id);

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', studentIds);

  if (profilesError) {
    console.error('[SubmissionsPanel] Failed to fetch profiles:', profilesError);
    // Return students with no name info
    return studentIds.map((id) => ({ id, name: '', email: '' }));
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return studentIds.map((id) => {
    const p = profileMap.get(id);
    return { id, name: p?.name ?? '', email: p?.email ?? '' };
  });
}
