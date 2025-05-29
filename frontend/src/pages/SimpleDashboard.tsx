import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  TrendingUp,
  EmojiEvents,
  LocalFireDepartment,
  MonitorWeight,
  CalendarToday,
  Timer,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userProfileApi, dietLogApi, exerciseApi, achievementApi, weightApi, streakApi } from '../services/api';

const SimpleDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({
    profile: null,
    dailySummary: null,
    recentWorkouts: [],
    todaysExercises: [],
    todaysCaloriesBurned: 0,
    achievements: [],
    streak: null,
    latestWeight: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [profile, dailySummary, allExerciseLogs, achievements, streak, latestWeight] = await Promise.all([
        userProfileApi.getProfile().catch(() => null),
        dietLogApi.getDailySummary().catch(() => null),
        exerciseApi.getExerciseLogs().catch(() => []),
        achievementApi.getUserAchievements().catch(() => []),
        streakApi.getCurrentStreak().catch(() => null),
        weightApi.getLatestWeight().catch(() => null),
      ]);

      // Filter today's exercises and calculate total calories burned
      console.log('All exercise logs:', allExerciseLogs);
      console.log('Today date:', today);

      const todaysExercises = Array.isArray(allExerciseLogs)
        ? allExerciseLogs.filter(log => {
            // Handle different date formats
            let logDate;
            if (log.exerciseDate) {
              // If it's already a date string, use it directly
              if (typeof log.exerciseDate === 'string' && log.exerciseDate.includes('-')) {
                logDate = log.exerciseDate.split('T')[0]; // Handle ISO string
              } else {
                logDate = new Date(log.exerciseDate).toISOString().split('T')[0];
              }
            } else {
              logDate = '';
            }
            console.log('Log date:', logDate, 'Today:', today, 'Match:', logDate === today, 'Original:', log.exerciseDate);
            return logDate === today;
          })
        : [];

      console.log('Today\'s exercises:', todaysExercises);
      const todaysCaloriesBurned = todaysExercises.reduce((total, log) => total + (log.caloriesBurned || 0), 0);
      console.log('Today\'s calories burned:', todaysCaloriesBurned);

      setDashboardData({
        profile,
        dailySummary,
        recentWorkouts: Array.isArray(allExerciseLogs) ? allExerciseLogs.slice(0, 3) : [],
        todaysExercises,
        todaysCaloriesBurned,
        achievements: Array.isArray(achievements) ? achievements : [],
        streak,
        latestWeight,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;

    // Ensure weight is in kg and height is in cm
    let weightInKg = weight;
    let heightInCm = height;

    // If height seems to be in meters (less than 3), convert to cm
    if (heightInCm < 3) {
      heightInCm = heightInCm * 100;
    }

    // If height is still unreasonably small or large, return 0
    if (heightInCm < 50 || heightInCm > 300) return 0;

    // If weight is unreasonably small or large, return 0
    if (weightInKg < 10 || weightInKg > 500) return 0;

    return weightInKg / ((heightInCm / 100) ** 2);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const { profile, dailySummary, recentWorkouts, todaysExercises, todaysCaloriesBurned, achievements, streak, latestWeight } = dashboardData;
  const currentWeight = latestWeight?.weight || profile?.weight || 0;
  const bmi = calculateBMI(currentWeight, profile?.height);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your fitness overview for today
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchDashboardData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Restaurant sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">
                  {formatNumber(dailySummary?.consumed?.calories || 0, 0)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Calories Consumed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goal: {formatNumber(dailySummary?.goals?.calories || 2000, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalFireDepartment sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">
                  {formatNumber(todaysCaloriesBurned || 0, 0)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Calories Burned
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {todaysExercises.length} workout{todaysExercises.length !== 1 ? 's' : ''} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FitnessCenter sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6">{recentWorkouts.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Workouts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonitorWeight sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">
                  {formatNumber(currentWeight, 1)} kg
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Current Weight
              </Typography>
              <Typography variant="caption" color="text.secondary">
                BMI: {formatNumber(bmi, 1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEvents sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">{achievements.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Achievements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Earned badges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Nutrition
              </Typography>
              {dailySummary ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Calories</Typography>
                      <Typography variant="body2">
                        {formatNumber(dailySummary.consumed?.calories || 0, 0)} / {formatNumber(dailySummary.goals?.calories || 2000, 0)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((dailySummary.consumed?.calories || 0) / (dailySummary.goals?.calories || 2000) * 100, 100)}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Protein</Typography>
                      <Typography variant="body2">
                        {formatNumber(dailySummary.consumed?.protein || 0, 1)}g / {formatNumber(dailySummary.goals?.protein || 150, 1)}g
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((dailySummary.consumed?.protein || 0) / (dailySummary.goals?.protein || 150) * 100, 100)}
                      color="secondary"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Carbs</Typography>
                      <Typography variant="body2">
                        {formatNumber(dailySummary.consumed?.carbs || 0, 1)}g / {formatNumber(dailySummary.goals?.carbs || 200, 1)}g
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((dailySummary.consumed?.carbs || 0) / (dailySummary.goals?.carbs || 200) * 100, 100)}
                      color="success"
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Fat</Typography>
                      <Typography variant="body2">
                        {formatNumber(dailySummary.consumed?.fat || 0, 1)}g / {formatNumber(dailySummary.goals?.fat || 70, 1)}g
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((dailySummary.consumed?.fat || 0) / (dailySummary.goals?.fat || 70) * 100, 100)}
                      color="warning"
                    />
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No nutrition data for today. Start logging your meals!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Workouts
              </Typography>
              {recentWorkouts.length > 0 ? (
                <Box>
                  {recentWorkouts.map((workout: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {workout.exerciseName || 'Workout'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(workout.durationMinutes || 0, 0)} min • {formatNumber(workout.caloriesBurned || 0, 0)} cal
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(workout.loggedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent workouts. Start your fitness journey!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Streak & Achievements */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Streak
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <LocalFireDepartment sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" color="error.main">
                  {streak?.currentStreak || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days in a row
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best: {streak?.longestStreak || 0} days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              {achievements.length > 0 ? (
                <Box>
                  {achievements.slice(0, 3).map((achievement: any, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                        <EmojiEvents />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {achievement.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No achievements yet. Keep working towards your goals!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/exercises')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FitnessCenter sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Start Workout</Typography>
              <Typography variant="body2" color="text.secondary">
                Browse exercises
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/nutrition')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Log Meal</Typography>
              <Typography variant="body2" color="text.secondary">
                Track nutrition
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/progress')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">View Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                Check stats
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/achievements')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Achievements</Typography>
              <Typography variant="body2" color="text.secondary">
                View badges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SimpleDashboard;
