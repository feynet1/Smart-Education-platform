/**
 * Admin User Management
 *
 * Fetches all users from Supabase profiles table.
 * Supports edit (name + role), activate/deactivate, invite, and delete.
 */
import { useState } from 'react';
import {
    Box, Typography, Paper, Button, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel, Select,
    MenuItem, TextField, InputAdornment, IconButton, Snackbar,
    Alert, Avatar, Tooltip, CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search, Edit, Block, CheckCircle, PersonAdd, Delete, Refresh } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const UsersManagement = () => {
    const {
        users, usersLoading, fetchUsers,
        updateUserRole, toggleUserStatus, addUser, deleteUser,
    } = useAdmin();

    const [searchTerm, setSearchTerm]     = useState('');
    const [roleFilter, setRoleFilter]     = useState('all');
    const [editDialog, setEditDialog]     = useState({ open: false, user: null });
    const [addDialog, setAddDialog]       = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [addFormData, setAddFormData]   = useState({ name: '', email: '', role: 'Student' });
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [saving, setSaving]             = useState(false);
    const [deleting, setDeleting]         = useState(false);
    const [inviting, setInviting]         = useState(false);
    const [snackbar, setSnackbar]         = useState({ open: false, message: '', severity: 'success' });

    const showSuccess = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' });
    const showError   = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleEditSave = async () => {
        if (!editDialog.user || !selectedRole || !selectedName.trim()) return;
        setSaving(true);
        const result = await updateUserRole(editDialog.user.id, selectedRole, selectedName.trim());
        setSaving(false);
        if (result?.success !== false) {
            showSuccess('User updated successfully');
            setEditDialog({ open: false, user: null });
        } else {
            showError(result.error || 'Failed to update user');
        }
    };

    const handleToggleStatus = async (userId) => {
        const result = await toggleUserStatus(userId);
        if (result?.success !== false) {
            showSuccess('User status updated');
        } else {
            showError(result.error || 'Failed to update status');
        }
    };

    const handleInviteUser = async () => {
        if (!addFormData.name.trim() || !addFormData.email.trim()) return;
        setInviting(true);
        const result = await addUser(addFormData);
        setInviting(false);
        if (result?.success) {
            showSuccess('Invitation sent successfully');
            setAddDialog(false);
            setAddFormData({ name: '', email: '', role: 'Student' });
        } else {
            showError(result.error || 'Failed to send invitation');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteDialog.user) return;
        setDeleting(true);
        const result = await deleteUser(deleteDialog.user.id);
        setDeleting(false);
        if (result?.success) {
            showSuccess('User deleted successfully');
            setDeleteDialog({ open: false, user: null });
        } else {
            showError(result.error || 'Failed to delete user');
        }
    };

    const columns = [
        {
            field: 'avatar', headerName: '', width: 56, sortable: false,
            renderCell: (params) => (
                <Avatar sx={{
                    width: 32, height: 32, fontSize: 14,
                    bgcolor: params.row.role === 'Admin' ? 'error.main'
                           : params.row.role === 'Teacher' ? 'success.main' : 'primary.main',
                }}>
                    {params.row.name.charAt(0).toUpperCase()}
                </Avatar>
            ),
        },
        { field: 'name',  headerName: 'Name',  flex: 1, minWidth: 140 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 190 },
        {
            field: 'role', headerName: 'Role', width: 110,
            renderCell: (params) => (
                <Chip label={params.value} size="small"
                    color={params.value === 'Admin' ? 'error' : params.value === 'Teacher' ? 'success' : 'primary'} />
            ),
        },
        {
            field: 'grade', headerName: 'Grade', width: 90,
            renderCell: (params) => (
                <Typography variant="body2" color={params.value === '—' ? 'text.disabled' : 'text.primary'}>
                    {params.value === '—' ? '—' : params.value === 'University' ? 'Univ.' : `Gr. ${params.value}`}
                </Typography>
            ),
        },
        {
            field: 'status', headerName: 'Status', width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined"
                    color={
                        params.value === 'active'   ? 'success' :
                        params.value === 'invited'  ? 'warning' : 'default'
                    } />
            ),
        },
        { field: 'createdAt', headerName: 'Joined', width: 110 },
        {
            field: 'actions', headerName: 'Actions', width: 130, sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={0.5}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => {
                            setEditDialog({ open: true, user: params.row });
                            setSelectedRole(params.row.role);
                            setSelectedName(params.row.name);
                        }}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small"
                            color={params.row.status === 'active' ? 'default' : 'success'}
                            onClick={() => handleToggleStatus(params.row.id)}>
                            {params.row.status === 'active'
                                ? <Block fontSize="small" />
                                : <CheckCircle fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error"
                            onClick={() => setDeleteDialog({ open: true, user: params.row })}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>User Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {usersLoading ? 'Loading…' : `${users.length} users on the platform`}
                    </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <Button variant="outlined" startIcon={usersLoading ? <CircularProgress size={16} /> : <Refresh />}
                        onClick={fetchUsers} disabled={usersLoading}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAddDialog(true)}>
                        Invite User
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box display="flex" gap={2} flexWrap="wrap" flexDirection={{ xs: 'column', sm: 'row' }}>
                    <TextField size="small" placeholder="Search by name or email…"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: { xs: '100%', sm: 260 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }} />
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Role</InputLabel>
                        <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                            <MenuItem value="all">All Roles</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Teacher">Teacher</MenuItem>
                            <MenuItem value="Student">Student</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Users Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflowX: 'auto' }}>
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    loading={usersLoading}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5' },
                    }}
                />
            </Paper>

            {/* ── Edit User Dialog ── */}
            <Dialog open={editDialog.open} onClose={() => !saving && setEditDialog({ open: false, user: null })} fullWidth maxWidth="xs">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1} sx={{ width: '100%' }}>
                        <TextField label="Full Name" fullWidth required
                            value={selectedName}
                            onChange={(e) => setSelectedName(e.target.value)} />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select value={selectedRole} label="Role"
                                onChange={(e) => setSelectedRole(e.target.value)}>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Teacher">Teacher</MenuItem>
                                <MenuItem value="Student">Student</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, user: null })} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleEditSave}
                        disabled={saving || !selectedName.trim() || !selectedRole}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Invite User Dialog ── */}
            <Dialog open={addDialog} onClose={() => !inviting && setAddDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Invite New User</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        An invitation email will be sent. The user sets their own password via the link.
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2} mt={1} sx={{ width: '100%' }}>
                        <TextField label="Full Name" fullWidth required
                            value={addFormData.name}
                            onChange={(e) => setAddFormData(f => ({ ...f, name: e.target.value }))} />
                        <TextField label="Email" fullWidth required type="email"
                            value={addFormData.email}
                            onChange={(e) => setAddFormData(f => ({ ...f, email: e.target.value }))} />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select value={addFormData.role} label="Role"
                                onChange={(e) => setAddFormData(f => ({ ...f, role: e.target.value }))}>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Teacher">Teacher</MenuItem>
                                <MenuItem value="Student">Student</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialog(false)} disabled={inviting}>Cancel</Button>
                    <Button variant="contained" onClick={handleInviteUser}
                        disabled={inviting || !addFormData.name.trim() || !addFormData.email.trim()}
                        startIcon={inviting ? <CircularProgress size={16} color="inherit" /> : null}>
                        {inviting ? 'Sending…' : 'Send Invite'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete <strong>{deleteDialog.user?.name}</strong> ({deleteDialog.user?.email})?
                        This removes them from the platform permanently.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDeleteUser} disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UsersManagement;
