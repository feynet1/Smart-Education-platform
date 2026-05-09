import { useState } from 'react';
import {
    Box, Typography, Paper, Button, Chip, MenuItem,
    Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';
import { gradeColor } from '../../../utils/gradeUtils';

const StudentGrades = () => {
    const { grades, gradesLoading, enrolledCourses, gpa } = useStudent();
    const [filterCourse, setFilterCourse] = useState('all');

    const filteredGrades = filterCourse === 'all'
        ? grades
        : grades.filter(g => g.courseId === filterCourse);

    const getGradeColor = (grade) => gradeColor(grade);

    const columns = [
        { field: 'subject',    headerName: 'Subject',    flex: 1, minWidth: 120 },
        { field: 'assessment', headerName: 'Assessment', flex: 1, minWidth: 140 },
        {
            field: 'score', headerName: 'Score', width: 90,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold">{params.value}%</Typography>
            ),
        },
        {
            field: 'grade', headerName: 'Grade', width: 90,
            renderCell: (params) => (
                <Chip label={params.value} size="small" color={getGradeColor(params.value)} />
            ),
        },
        { field: 'feedback', headerName: 'Feedback', flex: 1.5, minWidth: 160 },
        { field: 'date',     headerName: 'Date',     width: 110 },
    ];

    const handleExport = () => {
        const headers = ['Subject', 'Assessment', 'Score', 'Grade', 'Feedback', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredGrades.map(r =>
                `${r.subject},"${r.assessment}",${r.score},${r.grade},"${r.feedback}",${r.date}`
            ),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grades_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Summary stats
    const avgScore = grades.length > 0
        ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)
        : null;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Grades & Performance</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Track your academic progress
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={handleExport}
                    disabled={grades.length === 0}>
                    Export CSV
                </Button>
            </Box>

            {/* Summary cards */}
            <Box display="flex" gap={3} mb={4} flexWrap="wrap">
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {gradesLoading ? '…' : grades.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Grades</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                        {gradesLoading ? '…' : (avgScore ? `${avgScore}%` : '—')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Average Score</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 140 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {gradesLoading ? '…' : gpa}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">GPA</Typography>
                </Paper>
            </Box>

            {/* Filter & Table */}
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Grade History</Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Course</InputLabel>
                        <Select value={filterCourse} label="Filter by Course"
                            onChange={(e) => setFilterCourse(e.target.value)}>
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
                ) : grades.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">
                            No grades recorded yet. Your teacher will add grades here.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 420 }}>
                        <DataGrid
                            rows={filteredGrades}
                            columns={columns}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StudentGrades;
