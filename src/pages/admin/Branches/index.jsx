import { useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Tooltip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useAdmin } from '../../../contexts/AdminContext';
import { format } from 'date-fns';

const Branches = () => {
    const { branches, users, courses, addBranch, updateBranch, deleteBranch } = useAdmin();

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleOpenDialog = (branch = null) => {
        if (branch) {
            setIsEditing(true);
            setCurrentBranch(branch);
            setFormData({ name: branch.name, description: branch.description || '' });
        } else {
            setIsEditing(false);
            setCurrentBranch(null);
            setFormData({ name: '', description: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (isEditing) {
            await updateBranch(currentBranch.id, formData);
        } else {
            await addBranch(formData);
        }
        setSubmitting(false);
        handleCloseDialog();
    };

    const handleDeleteClick = (branch) => {
        setBranchToDelete(branch);
        setDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        await deleteBranch(branchToDelete.id);
        setSubmitting(false);
        setDeleteDialog(false);
        setBranchToDelete(null);
    };

    // Calculate stats for each branch
    const getBranchStats = (branchId) => {
        const branchUsers = users.filter(u => u.branch_id === branchId);
        const branchCourses = courses.filter(c => c.branchId === branchId);
        return {
            admins: branchUsers.filter(u => u.role === 'Admin').length,
            teachers: branchUsers.filter(u => u.role === 'Teacher').length,
            students: branchUsers.filter(u => u.role === 'Student').length,
            courses: branchCourses.length
        };
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Branches</Typography>
                    <Typography color="text.secondary">
                        Manage school branches and campus locations
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                >
                    Add Branch
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><b>Branch Name</b></TableCell>
                            <TableCell><b>Description</b></TableCell>
                            <TableCell><b>Statistics</b></TableCell>
                            <TableCell><b>Created</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {branches.map(branch => {
                            const stats = getBranchStats(branch.id);
                            return (
                                <TableRow key={branch.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{branch.name}</TableCell>
                                    <TableCell>{branch.description || '—'}</TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            <Chip size="small" label={`${stats.admins} Admins`} color="error" variant="outlined" />
                                            <Chip size="small" label={`${stats.teachers} Teachers`} color="success" variant="outlined" />
                                            <Chip size="small" label={`${stats.students} Students`} color="primary" variant="outlined" />
                                            <Chip size="small" label={`${stats.courses} Courses`} color="warning" variant="outlined" />
                                        </Box>
                                    </TableCell>
                                    <TableCell>{format(new Date(branch.created_at), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(branch)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton color="error" onClick={() => handleDeleteClick(branch)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {branches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No branches created yet. Click "Add Branch" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{isEditing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                    <DialogContent dividers>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Branch Name"
                            type="text"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Primary (1-8)"
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={submitting || !formData.name.trim()}
                            sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                        >
                            {submitting ? 'Saving...' : 'Save Branch'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Branch</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <b>{branchToDelete?.name}</b>?
                    </Typography>
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        Warning: Users and courses assigned to this branch will remain in the database but will lose their branch assignment. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={submitting}>
                        {submitting ? 'Deleting...' : 'Delete Branch'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Branches;
