/**
 * Admin Grades Analytics
 * Shows platform-wide weighted grade totals computed from grade_entries.
 * GPA is auto-calculated from weighted totals.
 */
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, LinearProgress,
    CircularProgress, Button,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { gradeColor, gradeToPoints, CATEGORY_LABELS } from '../../../utils/gradeUtils';

const GradesAnalytics = () => {
    const { grades, gradesLoading, fetchAdminGrades, courses } = useAdmin();

    // grades = array of { id, courseId, studentName, score (weighted total), grade (letter), entries, date }

    // Grade distribution from letter grades
    const gradeDistribution = grades.reduce((acc, g) => {
        acc[g.grade] = (acc[g.grade] || 0) + 1;
        return acc;
    }, {});

    // Platform-wide GPA = average of all weighted totals converted to GPA points
    const platformGPA = grades.length > 0
        ? (grades.reduce((sum, g) => sum + gradeToPoints(g.grade), 0) / grades.length).toFixed(2)
        : '0.00';

    const avgScore = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        : 0;

    const excellent        = grades.filter(g => g.score >= 90).length;
    const needsImprovement = grades.filter(g => g.score < 70).length;

    // Course name lookup
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = c.name; });

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Grades Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Platform-wide weighted academic performance — {grades.length} student results
                    </Typography>
                </Box>
                <Button variant="outlined"
                    startIcon={gradesLoading ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={fetchAdminGrades} disabled={gradesLoading}>
                    Refresh
                </Button>
            </Box>

            {/* Overview Stats */}
            <Grid container spacing={3} mb={3}>
                {[
                    { label: 'Student Results',    value: grades.length,    color: 'primary.main' },
                    { label: 'Platform GPA',        value: platformGPA,      color: 'warning.main' },
                    { label: 'Average Score',       value: `${avgScore}%`,  color: 'success.main' },
                    { label: 'Excellent (90%+)',    value: excellent,        color: 'success.main' },
                    { label: 'Needs Improvement',  value: needsImprovement, color: 'error.main' },
                ].map(s => (
                    <Grid item key={s.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color={s.color}>
                                {gradesLoading ? <CircularProgress size={28} /> : s.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Grade Distribution */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Grade Distribution</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(g => {
                                const count = gradeDistribution[g] || 0;
                                const pct = grades.length > 0 ? Math.round((count / grades.length) * 100) : 0;
                                return (
                                    <Box key={g} display="flex" alignItems="center" gap={2}>
                                        <Chip label={g} size="small" color={gradeColor(g)} sx={{ minWidth: 42 }} />
                                        <Box flex={1}>
                                            <LinearProgress variant="determinate" value={pct}
                                                sx={{ height: 8, borderRadius: 1 }}
                                                color={gradeColor(g)} />
                                        </Box>
                                        <Typography variant="caption" sx={{ minWidth: 28, textAlign: 'right' }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Student Results Table */}
                <Grid item size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Student Weighted Results
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Course</strong></TableCell>
                                        {Object.keys(CATEGORY_LABELS).map(cat => (
                                            <TableCell key={cat} align="center">
                                                <Typography variant="caption" fontWeight="bold">
                                                    {CATEGORY_LABELS[cat].split(' ')[0]}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                        <TableCell align="center"><strong>Total</strong></TableCell>
                                        <TableCell align="center"><strong>Grade</strong></TableCell>
                                        <TableCell align="center"><strong>GPA</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gradesLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                                <CircularProgress size={28} />
                                            </TableCell>
                                        </TableRow>
                                    ) : grades.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    No grades recorded yet
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : grades.slice(0, 20).map(g => (
                                        <TableRow key={g.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {g.studentName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {courseMap[g.courseId] || '—'}
                                                </Typography>
                                            </TableCell>
                                            {Object.keys(CATEGORY_LABELS).map(cat => (
                                                <TableCell key={cat} align="center">
                                                    <Typography variant="caption"
                                                        color={g.entries?.[cat] != null ? 'text.primary' : 'text.disabled'}>
                                                        {g.entries?.[cat] != null
                                                            ? `${g.entries[cat].raw}/${g.entries[cat].max}`
                                                            : '—'}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {g.score.toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={g.grade} size="small" color={gradeColor(g.grade)} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="bold"
                                                    color="warning.main">
                                                    {gradeToPoints(g.grade).toFixed(1)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GradesAnalytics;
