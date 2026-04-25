import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, TextField,
    Snackbar, Alert, CircularProgress, Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Save, Download } from '@mui/icons-material';
import { format } from 'date-fns';
import { useTeacher } from '../../../contexts/TeacherContext';

const STATUS_COLORS = {
    Present: 'success',
    Absent: 'error',
    Late: 'warning',
};

const AttendanceHelper = () => {
    const { id: courseId } = useParams();
    const { courses, students, fetchAttendance, saveAttendance, attendance, attendanceLoading } = useTeacher();
    const course = courses.find(c => c.id === courseId);

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [rows, setRows] = useState([]);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Load attendance when course or date changes
    useEffect(() => {
        if (!courseId || !selectedDate) return;

        const loadAttendance = async () => {
            const existing = attendance[courseId]?.[selectedDate];
            let records;

            if (existing) {
                records = existing;
            } else {
                records = await fetchAttendance(courseId, selectedDate);
            }

            // Build rows — use fetched records or default all to Present
            const initialRows = students.map(student => {
                const found = records.find(r => r.studentId === student.id);
                return {
                    id: student.id,
                    name: student.name,
                    status: found?.status || 'Present',
                };
            });
            setRows(initialRows);
        };

        loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, selectedDate]);

    const handleProcessRowUpdate = (newRow) => {
        setRows(prev => prev.map(r => r.id === newRow.id ? newRow : r));
        return newRow;
    };

    const handleSave = async () => {
        setSaving(true);
        const records = rows.map(r => ({
            studentId: r.id,
            name: r.name,
            status: r.status,
        }));
        const result = await saveAttendance(courseId, selectedDate, records);
        setSaving(false);
        if (result.success) {
            setSnackbar({ open: true, message: 'Attendance saved successfully', severity: 'success' });
        } else {
            setSnackbar({ open: true, message: result.error || 'Failed to save attendance', severity: 'error' });
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['Name', 'Status', 'Date'].join(','),
            ...rows.map(r => `${r.name},${r.status},${selectedDate}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${course?.name}_${selectedDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!course) return <Typography p={3}>Course not found</Typography>;

    const columns = [
        { field: 'name', headerName: 'Student Name', flex: 1, minWidth: 200 },
        {
            field: 'status',
            headerName: 'Status',
            width: 160,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['Present', 'Absent', 'Late'],
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={STATUS_COLORS[params.value] || 'default'}
                />
            ),
        },
    ];

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Attendance</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {course.name} — {format(new Date(selectedDate + 'T00:00:00'), 'MMMM do, yyyy')}
                    </Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        type="date"
                        size="small"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
                        Export CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </Box>
            </Box>

            {/* Summary chips */}
            <Box display="flex" gap={2} mb={2}>
                {['Present', 'Absent', 'Late'].map(status => (
                    <Chip
                        key={status}
                        label={`${status}: ${rows.filter(r => r.status === status).length}`}
                        color={STATUS_COLORS[status]}
                        variant="outlined"
                        size="small"
                    />
                ))}
            </Box>

            <Paper elevation={2} sx={{ height: 500, width: '100%' }}>
                {attendanceLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        processRowUpdate={handleProcessRowUpdate}
                        onProcessRowUpdateError={(err) => console.error(err)}
                        hideFooter
                        disableRowSelectionOnClick
                        sx={{ border: 'none' }}
                    />
                )}
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceHelper;
