import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress,
    Typography, Box, Divider, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTeacher } from '../../../contexts/TeacherContext';
import { DEFAULT_WEIGHTS, CATEGORY_LABELS, CATEGORIES } from '../../../utils/gradeUtils';

const GRADE_LEVELS = ['1','2','3','4','5','6','7','8','9','10','11','12','University'];

const EditCourse = ({ open, onClose, course, onSuccess, onError }) => {
    const { updateCourse, fetchWeights, saveWeights, courseWeights } = useTeacher();
    const [saving, setSaving] = useState(false);
    const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (course) {
            setValue('name', course.name);
            setValue('subject', course.subject);
            setValue('grade', course.grade);
            setValue('description', course.description || '');
            // Load existing weights
            if (courseWeights[course.id]) {
                const w = courseWeights[course.id];
                setWeights({
                    homework: w.homework, assignment: w.assignment, quiz: w.quiz,
                    midterm: w.midterm, project: w.project, final_exam: w.final_exam,
                });
            } else {
                fetchWeights(course.id).then(w => {
                    if (w) setWeights({
                        homework: w.homework, assignment: w.assignment, quiz: w.quiz,
                        midterm: w.midterm, project: w.project, final_exam: w.final_exam,
                    });
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course]);

    const weightTotal = CATEGORIES.reduce((s, c) => s + (parseFloat(weights[c]) || 0), 0);
    const weightValid = Math.abs(weightTotal - 100) < 0.01;

    const handleWeightChange = (cat, val) => {
        setWeights(w => ({ ...w, [cat]: val === '' ? '' : parseFloat(val) || 0 }));
    };

    const onSubmit = async (data) => {
        if (!weightValid) return;
        setSaving(true);
        const [courseResult, weightsResult] = await Promise.all([
            updateCourse(course.id, data),
            saveWeights(course.id, weights),
        ]);
        setSaving(false);
        if (courseResult?.success && weightsResult?.success) {
            onClose();
            onSuccess?.('Course updated successfully');
        } else {
            onError?.(courseResult?.error || weightsResult?.error || 'Failed to update course');
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
                                {GRADE_LEVELS.map(g => (
                                    <MenuItem key={g} value={g}>
                                        {g === 'University' ? 'University' : `Grade ${g}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description (optional)"
                                {...register('description')} />
                        </Grid>

                        {/* Assessment weights */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Assessment Weights
                                </Typography>
                                <Typography variant="caption"
                                    color={weightValid ? 'success.main' : 'error.main'} fontWeight={600}>
                                    Total: {weightTotal.toFixed(0)}% {weightValid ? '✓' : '(must equal 100%)'}
                                </Typography>
                            </Box>
                            {!weightValid && (
                                <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                                    Weights must add up to exactly 100%
                                </Alert>
                            )}
                            <Grid container spacing={1.5}>
                                {CATEGORIES.map(cat => (
                                    <Grid item xs={6} sm={4} key={cat}>
                                        <TextField
                                            fullWidth size="small"
                                            label={`${CATEGORY_LABELS[cat]} (%)`}
                                            type="number"
                                            inputProps={{ min: 0, max: 100, step: 1 }}
                                            value={weights[cat]}
                                            onChange={e => handleWeightChange(cat, e.target.value)} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || !weightValid}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditCourse;
