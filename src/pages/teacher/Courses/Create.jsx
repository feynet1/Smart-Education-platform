import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTeacher } from '../../../contexts/TeacherContext';

const CreateCourse = ({ open, onClose, onSuccess, onError }) => {
    const { addCourse } = useTeacher();
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setSaving(true);
        const result = await addCourse(data);
        setSaving(false);
        if (result?.success) {
            reset();
            onClose();
            onSuccess?.('Course created successfully');
        } else {
            onError?.(result?.error || 'Failed to create course');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Course</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
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
                                <MenuItem value="9">Grade 9</MenuItem>
                                <MenuItem value="10">Grade 10</MenuItem>
                                <MenuItem value="11">Grade 11</MenuItem>
                                <MenuItem value="12">Grade 12</MenuItem>
                                <MenuItem value="Uni">University</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={3} label="Description (optional)"
                                {...register('description')} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Creating…' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateCourse;
