/**
 * Admin Reports & Logs
 *
 * Fetches activity logs from Supabase and provides search, filter, and CSV export.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Search, Download, Refresh, History } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const ReportsAndLogs = () => {
    const { systemLogs, logsLoading, fetchLogs } = useAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Get unique action type prefixes for the filter dropdown
    const actionTypes = [...new Set(systemLogs.map(log => log.action.split(' ')[0]))];

    // Filter logs
    const filteredLogs = systemLogs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action.startsWith(actionFilter);
        return matchesSearch && matchesAction;
    });

    // Handle refresh
    const handleRefresh = async () => {
        await fetchLogs();
        setSnackbar({ open: true, message: 'Logs refreshed', severity: 'info' });
    };

    // Handle CSV export
    const handleExport = () => {
        const csvContent = [
            ['ID', 'Action', 'User', 'Timestamp'].join(','),
            ...filteredLogs.map(log =>
                [log.id, `"${log.action}"`, log.user, log.timestamp].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: 'Logs exported successfully', severity: 'success' });
    };

    // Chip color based on action keyword
    const getActionColor = (action) => {
        if (action.includes('Created') || action.includes('logged in') || action.includes('Invited')) return 'success';
        if (action.includes('Deleted') || action.includes('removed')) return 'error';
        if (action.includes('Updated') || action.includes('Changed') || action.includes('Toggled')) return 'warning';
        return 'default';
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                        Reports & Activity Logs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Live system activity from Supabase ({systemLogs.length} total entries)
                    </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                        variant="outlined"
                        startIcon={logsLoading ? <CircularProgress size={16} /> : <Refresh />}
                        onClick={handleRefresh}
                        disabled={logsLoading}
                    >
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box display="grid" gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }} gap={2}>
                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {systemLogs.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Logs</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                            {systemLogs.filter(l =>
                                l.action.includes('Created') ||
                                l.action.includes('logged') ||
                                l.action.includes('Invited')
                            ).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Create / Login</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {systemLogs.filter(l =>
                                l.action.includes('Updated') ||
                                l.action.includes('Changed') ||
                                l.action.includes('Toggled')
                            ).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Update Actions</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="error.main">
                            {systemLogs.filter(l => l.action.includes('Deleted')).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Delete Actions</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box display="flex" gap={2} flexWrap="wrap" flexDirection={{ xs: 'column', sm: 'row' }}>
                    <TextField
                        size="small"
                        placeholder="Search by action or user..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        sx={{ width: { xs: '100%', sm: 260 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
                        <InputLabel>Action Type</InputLabel>
                        <Select
                            value={actionFilter}
                            label="Action Type"
                            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="all">All Actions</MenuItem>
                            {actionTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Logs Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell width={80}><strong>ID</strong></TableCell>
                                <TableCell><strong>Action</strong></TableCell>
                                <TableCell><strong>User</strong></TableCell>
                                <TableCell><strong>Timestamp</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                            Loading logs from Supabase…
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    #{log.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <History fontSize="small" color="action" />
                                                    <Typography variant="body2">{log.action}</Typography>
                                                    <Chip
                                                        label={log.action.split(' ')[0]}
                                                        size="small"
                                                        color={getActionColor(log.action)}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>{log.user}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {log.timestamp}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No logs found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredLogs.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{ overflowX: 'auto' }}
                />
            </Paper>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ReportsAndLogs;
