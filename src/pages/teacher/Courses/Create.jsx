
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

const CreateCourse = ({ open, onClose }) => {
    const { addCourse } = useTeacher();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        addCourse(data);
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Course</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Course Name"
                                {...register('name', { required: true })}
                                error={!!errors.name}
                                helperText={errors.name ? 'Course Name is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subject"
                                {...register('subject', { required: true })}
                                error={!!errors.subject}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Grade Level"
                                defaultValue=""
                                {...register('grade', { required: true })}
                                error={!!errors.grade}
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
                    <Button type="submit" variant="contained">Create</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateCourse;
