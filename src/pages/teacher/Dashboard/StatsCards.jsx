import { Grid, Paper, Typography, Box } from '@mui/material';
import { School, People, Class, Assignment } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </Box>
    </Paper>
);

const StatsCards = () => {
    // In a real app, mock these or fetch from context
    const stats = [
        { title: 'Total Courses', value: 4, icon: <School />, color: 'primary' },
        { title: 'Active Classes', value: 2, icon: <Class />, color: 'secondary' },
        { title: 'Students Today', value: 35, icon: <People />, color: 'success' },
        { title: 'Pending Grades', value: 12, icon: <Assignment />, color: 'warning' },
    ];

    return (
        <Grid container spacing={3} mb={4}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
