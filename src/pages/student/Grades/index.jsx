import {
    Box, Typography, Paper, Button, Chip, CircularProgress,
    LinearProgress, Accordion, AccordionSummary, AccordionDetails,
    Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { Download, ExpandMore } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';
import { gradeColor, scoreToGrade, CATEGORY_LABELS } from '../../../utils/gradeUtils';

const StudentGrades = () => {
    const { grades, gradesLoading, enrolledCourses, gpa } = useStudent();

    // Separate totals from category rows
    const categoryRows = grades.filter(g => !g.isTotal);
    const totalRows    = grades.filter(g => g.isTotal);

    // Group category rows by courseId
    const byCourse = categoryRows.reduce((acc, row) => {
        if (!acc[row.courseId]) acc[row.courseId] = [];
        acc[row.courseId].push(row);
        return acc;
    }, {});

    // Average score across all category entries (percentage)
    const avgScore = categoryRows.length > 0
        ? (categoryRows.reduce((s, g) => s + (g.percentage ?? g.score), 0) / categoryRows.length).toFixed(1)
        : null;

    const handleExport = () => {
        const headers = ['Course', 'Category', 'Score', 'Max', 'Percentage', 'Weight', 'Feedback', 'Date'];
        const rows = categoryRows.map(r => {
            const course = enrolledCourses.find(c => c.id === r.courseId);
            return `"${course?.name || r.courseId}","${CATEGORY_LABELS[r.category] || r.category}",${r.score},${r.maxMark},${r.percentage}%,${r.weight}%,"${r.feedback}",${r.date}`;
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
            {/* Header */}
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
                        {gradesLoading ? '…' : totalRows.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Courses Graded</Typography>
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

            {/* Per-course accordion cards */}
            {gradesLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : totalRows.length === 0 && categoryRows.length === 0 ? (
                <Paper elevation={2} sx={{ p: 6, borderRadius: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No grades recorded yet. Your teacher will enter scores here.
                    </Typography>
                </Paper>
            ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Courses with totals */}
                    {totalRows.map(total => {
                        const course = enrolledCourses.find(c => c.id === total.courseId);
                        const letter = total.isComplete ? scoreToGrade(total.score) : null;
                        const catRows = byCourse[total.courseId] || [];

                        return (
                            <Accordion key={total.id} elevation={2}
                                sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                                <AccordionSummary expandIcon={<ExpandMore />}
                                    sx={{ borderRadius: 2 }}>
                                    <Box display="flex" alignItems="center" gap={2} width="100%" pr={2}>
                                        {/* Course name */}
                                        <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 120 }}>
                                            {course?.name || 'Course'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                            {course?.subject}
                                        </Typography>
                                        {/* Total score */}
                                        <Box display="flex" alignItems="center" gap={1.5} mr={2}>
                                            <Box sx={{ width: 120 }}>
                                                <LinearProgress variant="determinate"
                                                    value={total.score}
                                                    sx={{ height: 8, borderRadius: 1 }}
                                                    color={letter ? gradeColor(letter) : 'info'} />
                                            </Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {total.score.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        {/* Grade chip */}
                                        {letter
                                            ? <Chip label={letter} color={gradeColor(letter)} size="small" />
                                            : <Chip label={`${total.enteredWeight}% entered`} size="small" variant="outlined" color="info" />
                                        }
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    <Table size="small">
                                        <TableBody>
                                            {catRows.map(row => {
                                                const pct = row.percentage ?? row.score;
                                                const rowLetter = scoreToGrade(pct);
                                                return (
                                                    <TableRow key={row.id} hover>
                                                        <TableCell sx={{ width: 130 }}>
                                                            <Chip label={CATEGORY_LABELS[row.category] || row.category}
                                                                size="small" variant="outlined" />
                                                        </TableCell>
                                                        <TableCell sx={{ width: 100 }}>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {row.score}/{row.maxMark}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {pct}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ width: 60 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {row.weight}% weight
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ width: 60 }}>
                                                            <Chip label={rowLetter} size="small"
                                                                color={gradeColor(rowLetter)} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {row.feedback || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ width: 90 }}>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {row.date}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}

                    {/* Courses with partial grades (no total yet) */}
                    {Object.entries(byCourse)
                        .filter(([cid]) => !totalRows.find(t => t.courseId === cid))
                        .map(([cid, catRows]) => {
                            const course = enrolledCourses.find(c => c.id === cid);
                            return (
                                <Accordion key={cid} elevation={2}
                                    sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Box display="flex" alignItems="center" gap={2} width="100%" pr={2}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 120 }}>
                                                {course?.name || 'Course'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                                {course?.subject}
                                            </Typography>
                                            <Chip label="Partial grades" size="small" variant="outlined" color="info" />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0 }}>
                                        <Table size="small">
                                            <TableBody>
                                                {catRows.map(row => {
                                                    const pct = row.percentage ?? row.score;
                                                    return (
                                                        <TableRow key={row.id} hover>
                                                            <TableCell sx={{ width: 130 }}>
                                                                <Chip label={CATEGORY_LABELS[row.category] || row.category}
                                                                    size="small" variant="outlined" />
                                                            </TableCell>
                                                            <TableCell sx={{ width: 100 }}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {row.score}/{row.maxMark}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {pct}%
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ width: 60 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {row.weight}% weight
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {row.feedback || '—'}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                </Box>
            )}
        </Box>
    );
};

export default StudentGrades;
