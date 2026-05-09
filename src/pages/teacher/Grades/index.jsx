import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Snackbar, Alert,
    CircularProgress, Avatar, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField, LinearProgress,
} from '@mui/material';
import { Edit, Grade as GradeIcon } from '@mui/icons-material';
import { useTeacher } from '../../../contexts/TeacherContext';
import { supabase } from '../../../supabaseClient';
import {
    scoreToGrade, gradeColor, calcWeightedTotal,
    CATEGORIES, CATEGORY_LABELS, DEFAULT_WEIGHTS,
} from '../../../utils/gradeUtils';

// ── Inline score cell — click to edit ────────────────────────
const ScoreCell = ({ entry, onEdit }) => {
    if (!entry) {
        return (
            <Tooltip title="Click to enter score">
                <Box
                    onClick={onEdit}
                    sx={{
                        minWidth: 56, height: 32, borderRadius: 1,
                        border: '1.5px dashed #ccc', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#bbb', fontSize: 12,
                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#f0f4ff' },
                    }}>
                    —
                </Box>
            </Tooltip>
        );
    }
    return (
        <Tooltip title="Click to edit">
            <Box
                onClick={onEdit}
                sx={{
                    minWidth: 56, height: 32, borderRadius: 1,
                    border: '1.5px solid transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                    '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f4ff' },
                }}>
                <Typography variant="body2" fontWeight="bold">{entry.score}%</Typography>
                <Edit sx={{ fontSize: 11, color: 'text.disabled' }} />
            </Box>
        </Tooltip>
    );
};

const TeacherGrades = () => {
    const { id: courseId } = useParams();
    const {
        courses,
        gradeEntries, gradesLoading, courseWeights,
        fetchGradeEntries, saveGradeEntry, deleteGradeEntry,
        fetchWeights,
    } = useTeacher();

    const course = courses.find(c => c.id === courseId);
    const isLoading = gradesLoading[courseId] ?? false;
    const weights = courseWeights[courseId] || DEFAULT_WEIGHTS;
    const entries = gradeEntries[courseId] || {};

    // ── Fetch enrolled students for this course ───────────────
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [enrolledLoading, setEnrolledLoading] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        const fetchEnrolled = async () => {
            setEnrolledLoading(true);
            try {
                const { data, error } = await supabase
                    .from('enrollments')
                    .select('student_id, profiles(id, name, email)')
                    .eq('course_id', courseId);
                if (error) throw error;
                const list = (data || []).map(e => ({
                    id: e.student_id,
                    name: e.profiles?.name || e.profiles?.email?.split('@')[0] || 'Unknown',
                }));
                setEnrolledStudents(list);
            } catch (err) {
                console.error('Failed to fetch enrolled students:', err);
            } finally {
                setEnrolledLoading(false);
            }
        };
        fetchEnrolled();
    }, [courseId]);

    // Dialog state for editing a single cell
    const [dialog, setDialog] = useState({ open: false, studentId: '', studentName: '', category: '' });
    const [scoreInput, setScoreInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnack = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

    useEffect(() => {
        if (courseId) {
            fetchGradeEntries(courseId);
            fetchWeights(courseId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Roster = enrolled students (from enrollments table)
    // Also include any students who have grade entries but aren't in the enrollment list
    const rosterMap = {};
    enrolledStudents.forEach(s => { rosterMap[s.id] = s; });
    Object.keys(entries).forEach(sid => {
        if (!rosterMap[sid]) {
            rosterMap[sid] = { id: sid, name: entries[sid]?.name || 'Unknown' };
        }
    });
    const rosterStudents = Object.values(rosterMap);

    const openEdit = (studentId, studentName, category) => {
        const existing = entries[studentId]?.[category];
        setScoreInput(existing ? String(existing.score) : '');
        setFeedbackInput(existing?.feedback || '');
        setDialog({ open: true, studentId, studentName, category });
    };

    const handleSave = async () => {
        const score = parseFloat(scoreInput);
        if (isNaN(score) || score < 0 || score > 100) {
            showSnack('Score must be 0 – 100', 'error');
            return;
        }
        setSaving(true);
        const result = await saveGradeEntry({
            courseId,
            studentId:   dialog.studentId,
            studentName: dialog.studentName,
            category:    dialog.category,
            score,
            feedback:    feedbackInput.trim() || null,
        });
        setSaving(false);
        if (result.success) {
            showSnack('Score saved');
            setDialog(d => ({ ...d, open: false }));
        } else {
            showSnack(result.error || 'Failed to save', 'error');
        }
    };

    const handleClear = async () => {
        setSaving(true);
        await deleteGradeEntry(courseId, dialog.studentId, dialog.category);
        setSaving(false);
        showSnack('Score cleared', 'info');
        setDialog(d => ({ ...d, open: false }));
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    // Column widths
    const COL_W = 90;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Grades</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{course.name}</Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                    {CATEGORIES.map(cat => (
                        <Chip key={cat} size="small" variant="outlined"
                            label={`${CATEGORY_LABELS[cat]}: ${weights[cat] ?? DEFAULT_WEIGHTS[cat]}%`} />
                    ))}
                </Box>
            </Box>

            <Paper elevation={2}>
                <TableContainer>
                    <Table size="small" sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ minWidth: 160 }}><strong>Student</strong></TableCell>
                                {CATEGORIES.map(cat => (
                                    <TableCell key={cat} align="center" sx={{ width: COL_W }}>
                                        <Typography variant="caption" fontWeight="bold" display="block">
                                            {CATEGORY_LABELS[cat]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {weights[cat] ?? DEFAULT_WEIGHTS[cat]}%
                                        </Typography>
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ width: 100 }}><strong>Total</strong></TableCell>
                                <TableCell align="center" sx={{ width: 80 }}><strong>Grade</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading || enrolledLoading ? (
                                <TableRow>
                                    <TableCell colSpan={CATEGORIES.length + 3} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : rosterStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={CATEGORIES.length + 3} align="center" sx={{ py: 5 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <GradeIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                                            <Typography color="text.secondary">
                                                No students enrolled yet. Students join using the course join code.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : rosterStudents.map(student => {
                                const studentEntries = entries[student.id] || {};
                                const scoreMap = {};
                                CATEGORIES.forEach(cat => {
                                    const e = studentEntries[cat];
                                    if (e) scoreMap[cat] = e.score;
                                });
                                const total = calcWeightedTotal(scoreMap, weights);
                                const letterGrade = total != null ? scoreToGrade(total) : null;

                                return (
                                    <TableRow key={student.id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                                                    {student.name.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2">{student.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        {CATEGORIES.map(cat => (
                                            <TableCell key={cat} align="center" sx={{ px: 0.5 }}>
                                                <ScoreCell
                                                    entry={studentEntries[cat]}
                                                    onEdit={() => openEdit(student.id, student.name, cat)}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">
                                            {total != null ? (
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {total.toFixed(1)}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate" value={total}
                                                        sx={{ height: 4, borderRadius: 1, mt: 0.3 }}
                                                        color={gradeColor(letterGrade)} />
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">—</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {letterGrade
                                                ? <Chip label={letterGrade} size="small" color={gradeColor(letterGrade)} />
                                                : <Typography variant="caption" color="text.disabled">—</Typography>
                                            }
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Score entry dialog */}
            <Dialog open={dialog.open}
                onClose={() => !saving && setDialog(d => ({ ...d, open: false }))}
                maxWidth="xs" fullWidth>
                <DialogTitle>
                    {CATEGORY_LABELS[dialog.category]} — {dialog.studentName}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            autoFocus required fullWidth
                            label="Score (0 – 100)" type="number"
                            inputProps={{ min: 0, max: 100, step: 0.5 }}
                            value={scoreInput}
                            onChange={e => setScoreInput(e.target.value)}
                            helperText={
                                scoreInput !== '' && !isNaN(parseFloat(scoreInput))
                                    ? `Letter: ${scoreToGrade(parseFloat(scoreInput))}`
                                    : 'Enter a number between 0 and 100'
                            } />
                        <TextField
                            fullWidth multiline rows={2}
                            label="Feedback (optional)"
                            value={feedbackInput}
                            onChange={e => setFeedbackInput(e.target.value)} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    {entries[dialog.studentId]?.[dialog.category] && (
                        <Button color="error" onClick={handleClear} disabled={saving} sx={{ mr: 'auto' }}>
                            Clear
                        </Button>
                    )}
                    <Button onClick={() => setDialog(d => ({ ...d, open: false }))} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherGrades;
