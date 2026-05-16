import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress,
    Typography, Box, Divider, Alert, Table, TableBody,
    TableCell, TableHead, TableRow,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { useTeacher } from '../../../contexts/TeacherContext';
import { DEFAULT_WEIGHTS, DEFAULT_MAX_MARKS, CATEGORY_LABELS, CATEGORIES } from '../../../utils/gradeUtils';

const CreateCourse = ({ open, onClose, onSuccess, onError }) => {
    const { profile } = useAuth();
    const { addCourse, saveWeights } = useTeacher();
    const [saving, setSaving] = useState(false);
    const [weights,  setWeights]  = useState({ ...DEFAULT_WEIGHTS });
    // Default max marks = weight value (e.g. Final 25% → max 25 marks)
    const [maxMarks, setMaxMarks] = useState({ ...DEFAULT_WEIGHTS });
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const weightTotal = CATEGORIES.reduce((s, c) => s + (parseFloat(weights[c]) || 0), 0);
    const weightValid = Math.abs(weightTotal - 100) < 0.01;

    // Determine allowed grades based on teacher's branch name
    const teacherBranchName = profile?.branch_name?.toLowerCase() || '';
    const isPrimary = teacherBranchName.includes('primary');
    const isSecondary = teacherBranchName.includes('secondary') || teacherBranchName.includes('high');
    const isPrep = teacherBranchName.includes('preparatory');
    const isUniversity = teacherBranchName.includes('university') || teacherBranchName.includes('college');
    const allowAllGrades = !isPrimary && !isSecondary && !isPrep && !isUniversity;

    const renderGradeOptions = () => {
        const options = [];

        if (allowAllGrades || isPrimary) {
            for (let i = 1; i <= 8; i++) options.push(<MenuItem key={i} value={String(i)}>Grade {i}</MenuItem>);
        }
        if (allowAllGrades || isSecondary) {
            for (let i = 9; i <= 10; i++) options.push(<MenuItem key={i} value={String(i)}>Grade {i}</MenuItem>);
        }
        if (allowAllGrades || isPrep) {
            for (let i = 11; i <= 12; i++) options.push(<MenuItem key={i} value={String(i)}>Grade {i}</MenuItem>);
        }
        if (allowAllGrades || isUniversity) {
            options.push(<MenuItem key="University" value="University">University</MenuItem>);
        }
        
        return options;
    };

    const onSubmit = async (data) => {
        if (!weightValid) return;
        setSaving(true);
        const result = await addCourse(data);
        if (result?.success) {
            await saveWeights(result.course.id, weights, maxMarks);
            reset();
            setWeights({ ...DEFAULT_WEIGHTS });
            setMaxMarks({ ...DEFAULT_MAX_MARKS });
            onClose();
            onSuccess?.('Course created successfully');
        } else {
            onError?.(result?.error || 'Failed to create course');
        }
        setSaving(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create New Course</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* Course info */}
                        <Grid item xs={12}>
                            <TextField fullWidth label="Course Name"
                                {...register('name', { required: true })}
                                error={!!errors.name}
                                helperText={errors.name ? 'Course name is required' : ''} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Subject"
                                {...register('subject', { required: true })}
                                error={!!errors.subject}
                                helperText={errors.subject ? 'Subject is required' : ''} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Grade Level" defaultValue=""
                                {...register('grade', { required: true })}
                                error={!!errors.grade}>
                                {renderGradeOptions()}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description (optional)"
                                {...register('description')} />
                        </Grid>

                        {/* Assessment weights + max marks */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Assessment Setup
                                </Typography>
                                <Typography variant="caption"
                                    color={weightValid ? 'success.main' : 'error.main'} fontWeight={600}>
                                    Weight Total: {weightTotal.toFixed(0)}% {weightValid ? '✓' : '(must equal 100%)'}
                                </Typography>
                            </Box>
                            {!weightValid && (
                                <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                                    Weights must add up to exactly 100%
                                </Alert>
                            )}
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Category</strong></TableCell>
                                        <TableCell align="center"><strong>Weight (%)</strong></TableCell>
                                        <TableCell align="center"><strong>Max Marks</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {CATEGORIES.map(cat => (
                                        <TableRow key={cat}>
                                            <TableCell>{CATEGORY_LABELS[cat]}</TableCell>
                                            <TableCell align="center" sx={{ width: 140 }}>
                                                <TextField
                                                    size="small" type="number"
                                                    inputProps={{ min: 0, max: 100, step: 1 }}
                                                    value={weights[cat]}
                                                    onChange={e => {
                                                        const val = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                                        setWeights(w => ({ ...w, [cat]: val }));
                                                        // Auto-sync max marks to weight value
                                                        setMaxMarks(m => ({ ...m, [cat]: val }));
                                                    }}
                                                    sx={{ width: 100 }} />
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: 140 }}>
                                                <TextField
                                                    size="small" type="number"
                                                    inputProps={{ min: 1, step: 1 }}
                                                    value={maxMarks[cat]}
                                                    onChange={e => setMaxMarks(m => ({
                                                        ...m, [cat]: e.target.value === '' ? '' : parseFloat(e.target.value) || 1
                                                    }))}
                                                    sx={{ width: 100 }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                Max Marks = the highest score a student can get in that category. Defaults to the weight value.
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || !weightValid}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Creating…' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateCourse;
