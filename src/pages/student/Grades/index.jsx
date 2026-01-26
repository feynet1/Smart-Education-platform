import { useState } from 'react';
import { Box, Typography, Paper, Button, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
import { Download } from '@mui/icons-material';
import { useStudent } from '../../../contexts/StudentContext';

const Grades = () => {
    const { grades, enrolledCourses, gpa } = useStudent();
    const [filterCourse, setFilterCourse] = useState('all');

    // Filter grades by course
    const filteredGrades = filterCourse === 'all'
        ? grades
        : grades.filter(g => g.courseId === filterCourse);

    // GPA trend data (mock)
    const gpaData = [3.2, 3.4, 3.5, 3.6, 3.7, parseFloat(gpa)];
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'success';
        if (grade.startsWith('B')) return 'primary';
        if (grade.startsWith('C')) return 'warning';
        return 'error';
    };

    const columns = [
        { field: 'subject', headerName: 'Subject', flex: 1 },
        { field: 'assessment', headerName: 'Assessment', flex: 1 },
        { field: 'score', headerName: 'Score', width: 100 },
        {
            field: 'grade',
            headerName: 'Grade',
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" color={getGradeColor(params.value)} />
            )
        },
        { field: 'feedback', headerName: 'Feedback', flex: 1.5 },
        { field: 'date', headerName: 'Date', width: 120 },
    ];

    const handleExport = () => {
        const headers = ['Subject', 'Assessment', 'Score', 'Grade', 'Feedback', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredGrades.map(row => `${row.subject},${row.assessment},${row.score},${row.grade},"${row.feedback}",${row.date}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grades_export.csv';
        a.click();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Grades & Performance
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Track your academic progress
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
                    Export CSV
                </Button>
            </Box>

            {/* GPA Chart */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    GPA Trend
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                    <LineChart
                        xAxis={[{ scaleType: 'point', data: months }]}
                        series={[
                            {
                                data: gpaData,
                                label: 'GPA',
                                color: '#1976d2',
                            },
                        ]}
                        height={280}
                    />
                </Box>
            </Paper>

            {/* Filter & Table */}
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        Grade History
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Course</InputLabel>
                        <Select
                            value={filterCourse}
                            label="Filter by Course"
                            onChange={(e) => setFilterCourse(e.target.value)}
                        >
                            <MenuItem value="all">All Courses</MenuItem>
                            {enrolledCourses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ height: 400 }}>
                    <DataGrid
                        rows={filteredGrades}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default Grades;
