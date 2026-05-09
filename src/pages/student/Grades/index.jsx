import { useState } from 'react';
import {
    Box, Typography, Paper, Button, Chip, MenuItem,
    Select, FormControl, InputLabel, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, LinearProgress,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';
import { gradeColor, scoreToGrade, CATEGORY_LABELS } from '../../../utils/gradeUtils';

const StudentGrades = () => {
    const { grades, gradesLoading, enrolledCourses, gpa } = useStudent();
    const [filterCourse, setFilterCourse] = useState('all');

    // Separate totals from category rows
    const categoryRows = grades.filter(g => !g.isTotal);
    const totalRows    = grades.filter(g => g.isTotal);

    const filteredRows = filterCourse === 'all'
        ? categoryRows
        : categoryRows.filter(g => g.courseId === filterCourse);

    const filteredTotals = filterCourse === 'all'
        ? totalRows
        : totalRows.filter(g => g.courseId === filterCourse);

    // Average score across all category entries
    const avgScore = categoryRows.length > 0
        ? (categoryRows.reduce((s, g) => s + g.score, 0) / categoryRows.length).toFixed(1)
        : null;

    const handleExport = () => {
        const headers = ['Course', 'Category', 'Score', 'Weight', 'Feedback', 'Date'];
        const rows = filteredRows.map(r => {
            const course = enrolledCourses.find(c => c.id === r.courseId);
            return `"${course?.name || r.courseId}","${CATEGORY_LABELS[r.category] || r.category}",${r.score},${r.weight}%,"${r.feedback}",${r.date}`;
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'grades_export.csv'; a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Grades & Performance</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Your weighted academic results
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={handleExport}
                    disabled={categoryRows.length === 0}>
                    Export CSV
                </Button>
            </Box>

            {/* Summary cards */}
            <Box display="flex" gap={3} mb={4} flexWrap="wrap">
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {gradesLoading ? '…' : categoryRows.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Assessments</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                        {gradesLoading ? '…' : (avgScore ? `${avgScore}%` : '—')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {gradesLoading ? '…' : gpa}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">GPA</Typography>
                </Paper>
            </Box>

            {/* Course totals summary */}
            {filteredTotals.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Course Totals</Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        {filteredTotals.map(t => {
                            const course = enrolledCourses.find(c => c.id === t.courseId);
                            const letter = scoreToGrade(t.score);
                            return (
                                <Box key={t.id} sx={{
                                    p: 2, borderRadius: 2, border: '1px solid #e0e0e0',
                                    minWidth: 180, flex: '1 1 180px',
                                }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {course?.name || 'Course'}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Typography variant="h5" fontWeight="bold">
                                            {t.score.toFixed(1)}%
                                        </Typography>
                                        <Chip label={letter} size="small" color={gradeColor(letter)} />
                                    </Box>
                                    <LinearProgress variant="determinate" value={t.score}
                                        sx={{ height: 6, borderRadius: 1 }}
                                        color={gradeColor(letter)} />
                                </Box>
                            );
                        })}
                    </Box>
                </Paper>
            )}

            {/* Detailed breakdown */}
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Assessment Breakdown</Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Course</InputLabel>
                        <Select value={filterCourse} label="Filter by Course"
                            onChange={e => setFilterCourse(e.target.value)}>
                            <MenuItem value="all">All Courses</MenuItem>
                            {enrolledCourses.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {gradesLoading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : filteredRows.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">
                            No grades recorded yet. Your teacher will enter scores here.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell><strong>Course</strong></TableCell>
                                    <TableCell><strong>Category</strong></TableCell>
                                    <TableCell align="center"><strong>Score</strong></TableCell>
                                    <TableCell align="center"><strong>Weight</strong></TableCell>
                                    <TableCell align="center"><strong>Grade</strong></TableCell>
                                    <TableCell><strong>Feedback</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.map(row => {
                                    const course = enrolledCourses.find(c => c.id === row.courseId);
                                    const letter = scoreToGrade(row.score);
                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {course?.name || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={CATEGORY_LABELS[row.category] || row.category}
                                                    size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {row.score}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    {row.weight}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={letter} size="small" color={gradeColor(letter)} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {row.feedback || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {row.date}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default StudentGrades;
