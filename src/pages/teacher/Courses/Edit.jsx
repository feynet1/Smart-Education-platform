import { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTeacher } from '../../../contexts/TeacherContext';

const EditCourse = ({ open, onClose, course }) => {
    const { updateCourse } = useTeacher();
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (course) {
            setValue('name', course.name);
            setValue('subject', course.subject);
            setValue('grade', course.grade);
            setValue('description', course.description);
        }
    }, [course, setValue]);

    const onSubmit = (data) => {
        updateCourse(course.id, data);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Course</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Course Name"
                                {...register('name', { required: true })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subject"
                                {...register('subject', { required: true })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Grade Level"
                                defaultValue={course?.grade || ""}
                                {...register('grade', { required: true })}
                            >
                                <MenuItem value="10">Grade 10</MenuItem>
                                <MenuItem value="11">Grade 11</MenuItem>
                                <MenuItem value="12">Grade 12</MenuItem>
                                <MenuItem value="Uni">University</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                {...register('description')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Changes</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditCourse;
