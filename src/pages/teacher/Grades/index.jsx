import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip, Snackbar, Alert,
    CircularProgress, Avatar, MenuItem, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Grade as GradeIcon, Search } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { scoreToGrade, gradeColor } from '../../../utils/gradeUtils';

const EMPTY_FORM = {
    studentId: '', studentName: '', assessment: '',
    score: '', feedback: '', gradedAt: new Date().toISOString().split('T')[0],
};

const TeacherGrades = () => {
    const { id: courseId } = useParams();
    const { courses, students, grades, gradesLoading, fetchGrades, saveGrade, deleteGrade } = useTeacher();
    const course = courses.find(c => c.id === courseId);

    const [search, setSearch] = useState('');
    const [dialog, setDialog] = useState({ open: false, mode: 'create', item: null });
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
    const [deleting, setDeleting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const courseGrades = grades[courseId] || [];

    const showSnack = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    const load = useCallback(() => {
        if (courseId) fetchGrades(courseId);
    }, [courseId, fetchGrades]);

    useEffect(() => { load(); }, [load]);

    const filteredGrades = courseGrades.filter(g =>
        g.student_name.toLowerCase().includes(search.toLowerCase()) ||
        g.assessment.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setDialog({ open: true, mode: 'create', item: null });
    };

    const openEdit = (item) => {
        setForm({
            studentId:   item.student_id,
            studentName: item.student_name,
            assessment:  item.assessment,
            score:       String(item.score),
            feedback:    item.feedback || '',
            gradedAt:    item.graded_at,
        });
        setDialog({ open: true, mode: 'edit', item });
    };

    const handleSave = async () => {
        const score = parseFloat(form.score);
        if (!form.studentId || !form.assessment.trim()) {
            showSnack('Student and assessment are required', 'error');
            return;
        }
        if (isNaN(score) || score < 0 || score > 100) {
            showSnack('Score must be between 0 and 100', 'error');
            return;
        }
        setSaving(true);
        const result = await saveGrade({
            courseId,
            studentId:   form.studentId,
            studentName: form.studentName,
            subject:     course?.subject || '',
            assessment:  form.assessment.trim(),
            score,
            grade:       scoreToGrade(score),
            feedback:    form.feedback.trim() || null,
            gradedAt:    form.gradedAt,
        });
        setSaving(false);
        if (result.success) {
            showSnack(dialog.mode === 'create' ? 'Grade saved' : 'Grade updated');
            setDialog({ open: false, mode: 'create', item: null });
        } else {
            showSnack(result.error || 'Failed to save grade', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.item) return;
        setDeleting(true);
        const result = await deleteGrade(courseId, deleteConfirm.item.id);
        setDeleting(false);
        setDeleteConfirm({ open: false, item: null });
        if (result.success) {
            showSnack('Grade deleted', 'info');
        } else {
            showSnack(result.error || 'Failed to delete', 'error');
        }
    };

    // Compute per-student averages for the summary row
    const studentAverages = Object.values(
        courseGrades.reduce((acc, g) => {
            if (!acc[g.student_id]) {
                acc[g.student_id] = { name: g.student_name, total: 0, count: 0 };
            }
            acc[g.student_id].total += parseFloat(g.score);
            acc[g.student_id].count += 1;
            return acc;
        }, {})
    ).map(s => ({ ...s, avg: (s.total / s.count).toFixed(1) }));

    if (!course) return <Typography p={3}>Course not found</Typography>;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Grades</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{course.name}</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
                    Add Grade
                </Button>
            </Box>

            {/* Student averages summary */}
            {studentAverages.length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
                        Student Averages
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        {studentAverages.map(s => (
                            <Box key={s.name} display="flex" alignItems="center" gap={1}
                                sx={{ bgcolor: '#f5f5f5', borderRadius: 2, px: 2, py: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                                    {s.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                                <Chip label={`${s.avg}%`} size="small"
                                    color={gradeColor(scoreToGrade(parseFloat(s.avg)))} />
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Search + Table */}
            <Paper elevation={2}>
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <TextField size="small" placeholder="Search student or assessment…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        sx={{ minWidth: 260 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }} />
                    <Typography variant="body2" color="text.secondary">
                        {courseGrades.length} grade{courseGrades.length !== 1 ? 's' : ''} recorded
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Student</strong></TableCell>
                                <TableCell><strong>Assessment</strong></TableCell>
                                <TableCell align="center"><strong>Score</strong></TableCell>
                                <TableCell align="center"><strong>Grade</strong></TableCell>
                                <TableCell><strong>Feedback</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell align="center" width={90}><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gradesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredGrades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <GradeIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                                            <Typography color="text.secondary">
                                                {search ? 'No matching grades' : 'No grades yet — click Add Grade to start'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : filteredGrades.map(item => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                                                {item.student_name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">{item.student_name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {item.assessment}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.score}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={item.grade} size="small" color={gradeColor(item.grade)} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.feedback || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.graded_at}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openEdit(item)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => setDeleteConfirm({ open: true, item })}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add / Edit Dialog */}
            <Dialog open={dialog.open}
                onClose={() => !saving && setDialog({ open: false, mode: 'create', item: null })}
                maxWidth="sm" fullWidth>
                <DialogTitle>{dialog.mode === 'create' ? 'Add Grade' : 'Edit Grade'}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* Student selector */}
                        <TextField select required fullWidth label="Student"
                            value={form.studentId}
                            onChange={e => {
                                const s = students.find(st => st.id === e.target.value);
                                setForm(f => ({ ...f, studentId: e.target.value, studentName: s?.name || '' }));
                            }}>
                            {students.length === 0
                                ? <MenuItem disabled value="">No students found</MenuItem>
                                : students.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))
                            }
                        </TextField>

                        <TextField required fullWidth label="Assessment (e.g. Midterm, Quiz 1)"
                            value={form.assessment}
                            onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))} />

                        <TextField required fullWidth label="Score (0 – 100)" type="number"
                            inputProps={{ min: 0, max: 100, step: 0.5 }}
                            value={form.score}
                            onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                            helperText={form.score !== '' && !isNaN(parseFloat(form.score))
                                ? `Letter grade: ${scoreToGrade(parseFloat(form.score))}`
                                : 'Enter a number between 0 and 100'} />

                        <TextField fullWidth label="Feedback (optional)" multiline rows={2}
                            value={form.feedback}
                            onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))} />

                        <TextField fullWidth label="Date" type="date"
                            value={form.gradedAt}
                            onChange={e => setForm(f => ({ ...f, gradedAt: e.target.value }))}
                            InputLabelProps={{ shrink: true }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ open: false, mode: 'create', item: null })} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : dialog.mode === 'create' ? 'Save Grade' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteConfirm.open}
                onClose={() => !deleting && setDeleteConfirm({ open: false, item: null })}>
                <DialogTitle>Delete Grade</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete <strong>{deleteConfirm.item?.student_name}</strong>&apos;s grade for{' '}
                        <strong>{deleteConfirm.item?.assessment}</strong>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, item: null })} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3500}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherGrades;
