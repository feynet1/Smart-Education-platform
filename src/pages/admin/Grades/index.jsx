/**
 * Admin Grades Analytics
 * 
 * Platform-wide grade analytics and GPA tracking.
 * Shows grade distribution and performance metrics.
 */
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    LinearProgress
} from '@mui/material';
import { useAdmin } from '../../../contexts/AdminContext';

const GradesAnalytics = () => {
    const { grades } = useAdmin();

    // Grade distribution
    const gradeDistribution = grades.reduce((acc, g) => {
        acc[g.grade] = (acc[g.grade] || 0) + 1;
        return acc;
    }, {});

    // Calculate average score
    const avgScore = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        : 0;

    // Grade color helper
    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'success';
        if (grade.startsWith('B')) return 'primary';
        if (grade.startsWith('C')) return 'warning';
        return 'error';
    };

    // Performance categories
    const excellent = grades.filter(g => g.score >= 90).length;
    const good = grades.filter(g => g.score >= 70 && g.score < 90).length;
    const needsImprovement = grades.filter(g => g.score < 70).length;

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Grades Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Platform-wide academic performance metrics
                </Typography>
            </Box>

            {/* Overview Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                            {grades.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Grades</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {avgScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Average Score</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {excellent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Excellent (90%+)</Typography>
                    </Paper>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                            {good}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Good (70-89%)</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Additional Stats Row */}
            <Grid container spacing={3} mb={3}>
                <Grid item size={{ xs: 12, sm: 6, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="error.main">
                            {needsImprovement}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Needs Improvement (&lt;70%)</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Grade Distribution */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Grade Distribution
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map(grade => {
                                const count = gradeDistribution[grade] || 0;
                                const percentage = grades.length > 0 ? Math.round((count / grades.length) * 100) : 0;
                                return (
                                    <Box key={grade} display="flex" alignItems="center" gap={2}>
                                        <Chip
                                            label={grade}
                                            size="small"
                                            color={getGradeColor(grade)}
                                            sx={{ minWidth: 40 }}
                                        />
                                        <Box flex={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={percentage}
                                                sx={{ height: 8, borderRadius: 1 }}
                                                color={getGradeColor(grade)}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Grades */}
                <Grid item size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Recent Grades
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Subject</strong></TableCell>
                                        <TableCell><strong>Assessment</strong></TableCell>
                                        <TableCell align="center"><strong>Score</strong></TableCell>
                                        <TableCell align="center"><strong>Grade</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grades.length > 0 ? grades.slice(0, 10).map((grade) => (
                                        <TableRow key={grade.id} hover>
                                            <TableCell>{grade.subject}</TableCell>
                                            <TableCell>{grade.assessment}</TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="bold">{grade.score}%</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={grade.grade}
                                                    size="small"
                                                    color={getGradeColor(grade.grade)}
                                                />
                                            </TableCell>
                                            <TableCell>{grade.date}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">No grades recorded yet</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
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
