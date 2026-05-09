import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTeacher } from '../../../contexts/TeacherContext';

const EditCourse = ({ open, onClose, course, onSuccess, onError }) => {
    const { updateCourse } = useTeacher();
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (course) {
            setValue('name', course.name);
            setValue('subject', course.subject);
            setValue('grade', course.grade);
            setValue('description', course.description || '');
        }
    }, [course, setValue]);

    const onSubmit = async (data) => {
        setSaving(true);
        const result = await updateCourse(course.id, data);
        setSaving(false);
        if (result?.success) {
            onClose();
            onSuccess?.('Course updated successfully');
        } else {
            onError?.(result?.error || 'Failed to update course');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Course</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Course Name"
                                {...register('name', { required: true })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Subject"
                                {...register('subject', { required: true })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Grade Level"
                                defaultValue={course?.grade || ''}
                                {...register('grade', { required: true })}>
                                <MenuItem value="1">Grade 1</MenuItem>
                                <MenuItem value="2">Grade 2</MenuItem>
                                <MenuItem value="3">Grade 3</MenuItem>
                                <MenuItem value="4">Grade 4</MenuItem>
                                <MenuItem value="5">Grade 5</MenuItem>
                                <MenuItem value="6">Grade 6</MenuItem>
                                <MenuItem value="7">Grade 7</MenuItem>
                                <MenuItem value="8">Grade 8</MenuItem>
                                <MenuItem value="9">Grade 9</MenuItem>
                                <MenuItem value="10">Grade 10</MenuItem>
                                <MenuItem value="11">Grade 11</MenuItem>
                                <MenuItem value="12">Grade 12</MenuItem>
                                <MenuItem value="University">University</MenuItem>
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
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditCourse;
