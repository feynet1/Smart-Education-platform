/**
 * Admin User Management
 * 
 * View and manage all platform users (Students, Teachers, Admins).
 * Supports role changes and status toggling.
 */
import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    Avatar,
    Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search, Edit, Block, CheckCircle, PersonAdd, Delete } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';

const UsersManagement = () => {
    const { users, updateUserRole, toggleUserStatus, addUser, deleteUser } = useAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [addDialog, setAddDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
    const [addFormData, setAddFormData] = useState({ name: '', email: '', role: 'Student' });
    const [selectedRole, setSelectedRole] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Filter users based on search and role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handle role change
    const handleRoleChange = () => {
        if (editDialog.user && selectedRole) {
            updateUserRole(editDialog.user.id, selectedRole);
            setSnackbar({ open: true, message: `Role updated to ${selectedRole}`, severity: 'success' });
            setEditDialog({ open: false, user: null });
        }
    };

    // Handle status toggle
    const handleToggleStatus = (userId) => {
        toggleUserStatus(userId);
        setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
    };

    const handleAddUser = () => {
        if (addFormData.name && addFormData.email && addFormData.role) {
            addUser(addFormData);
            setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
            setAddDialog(false);
            setAddFormData({ name: '', email: '', role: 'Student' });
        }
    };

    const handleDeleteUser = () => {
        if (deleteDialog.userId) {
            deleteUser(deleteDialog.userId);
            setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
            setDeleteDialog({ open: false, userId: null });
        }
    };

    // DataGrid columns
    const columns = [
        {
            field: 'avatar',
            headerName: '',
            width: 60,
            renderCell: (params) => (
                <Avatar sx={{ bgcolor: params.row.role === 'Admin' ? 'error.main' : params.row.role === 'Teacher' ? 'success.main' : 'primary.main' }}>
                    {params.row.name.charAt(0)}
                </Avatar>
            ),
            sortable: false,
        },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'Admin' ? 'error' : params.value === 'Teacher' ? 'success' : 'primary'}
                />
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    color={params.value === 'active' ? 'success' : 'default'}
                />
            ),
        },
        { field: 'createdAt', headerName: 'Joined', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    <Tooltip title="Edit Role">
                        <IconButton
                            size="small"
                            onClick={() => {
                                setEditDialog({ open: true, user: params.row });
                                setSelectedRole(params.row.role);
                            }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(params.row.id)}
                            color={params.row.status === 'active' ? 'default' : 'success'}
                        >
                            {params.row.status === 'active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, userId: params.row.id })}
                        >
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage all platform users, roles, and permissions
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAddDialog(true)}>
                    Add User
                </Button>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleFilter}
                            label="Role"
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Roles</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Teacher">Teacher</MenuItem>
                            <MenuItem value="Student">Student</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Users Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                        },
                    }}
                />
            </Paper>

            {/* Edit Role Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogContent sx={{ minWidth: 300 }}>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Change role for: <strong>{editDialog.user?.name}</strong>
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={selectedRole}
                            label="Role"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Teacher">Teacher</MenuItem>
                            <MenuItem value="Student">Student</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
                    <Button onClick={handleRoleChange} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
            {/* Add User Dialog */}
            <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={addFormData.name}
                            onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            type="email"
                            value={addFormData.email}
                            onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={addFormData.role}
                                label="Role"
                                onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                            >
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Teacher">Teacher</MenuItem>
                                <MenuItem value="Student">Student</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained" disabled={!addFormData.name || !addFormData.email}>Add User</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancel</Button>
                    <Button onClick={handleDeleteUser} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

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

export default UsersManagement;
