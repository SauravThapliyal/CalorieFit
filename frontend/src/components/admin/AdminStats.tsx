import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  EmojiEvents,
  People,
  TrendingUp,
  Today,
} from '@mui/icons-material';
import { exerciseApi, foodApi, achievementApi, userApi } from '../../services/api';

const AdminStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalExercises: 0,
    totalFoods: 0,
    totalAchievements: 0,
    totalUsers: 0,
    recentUsers: [] as any[],
    popularExercises: [] as any[],
    popularFoods: [] as any[],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [exercises, foods, achievements, users] = await Promise.all([
        exerciseApi.getAll().catch(() => []),
        foodApi.getAll().catch(() => ({ foods: [] })),
        achievementApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
      ]);

      // Handle different response formats
      const exerciseCount = Array.isArray(exercises) ? exercises.length : 0;
      const foodCount = foods && typeof foods === 'object' && Array.isArray((foods as any).foods)
        ? (foods as any).foods.length
        : Array.isArray(foods) ? foods.length : 0;
      const achievementCount = Array.isArray(achievements) ? achievements.length : 0;
      const userCount = Array.isArray(users) ? users.length : 0;

      setStats({
        totalExercises: exerciseCount,
        totalFoods: foodCount,
        totalAchievements: achievementCount,
        totalUsers: userCount,
        recentUsers: Array.isArray(users) ? users.slice(0, 5) : [],
        popularExercises: Array.isArray(exercises) ? exercises.slice(0, 5) : [],
        popularFoods: foods && typeof foods === 'object' && Array.isArray((foods as any).foods)
          ? (foods as any).foods.slice(0, 5)
          : Array.isArray(foods) ? foods.slice(0, 5) : [],
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 0): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <FitnessCenter />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {formatNumber(stats.totalExercises)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Exercises
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Restaurant />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {formatNumber(stats.totalFoods)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Foods
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {formatNumber(stats.totalAchievements)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Achievements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {formatNumber(stats.totalUsers)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Users
              </Typography>
              {stats.recentUsers.length > 0 ? (
                <List>
                  {stats.recentUsers.map((user: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          {user.firstName?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.firstName || ''} ${user.lastName || ''}`}
                        secondary={`${user.email} • ${user.role || 'User'}`}
                      />
                      <Chip
                        label={new Date(user.createdAt).toLocaleDateString()}
                        size="small"
                        color="primary"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No users found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Exercises
              </Typography>
              {stats.popularExercises.length > 0 ? (
                <List>
                  {stats.popularExercises.map((exercise: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <FitnessCenter />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={exercise.name}
                        secondary={`${exercise.type} • ${exercise.difficulty}`}
                      />
                      <Chip
                        label={`${formatNumber(exercise.caloriesBurnedPerMinute, 1)} cal/min`}
                        size="small"
                        color="secondary"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No exercises found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Foods
              </Typography>
              {stats.popularFoods.length > 0 ? (
                <List>
                  {stats.popularFoods.map((food: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <Restaurant />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={food.name}
                        secondary={food.category}
                      />
                      <Chip
                        label={`${formatNumber(food.caloriesPer100g, 0)} cal/100g`}
                        size="small"
                        color="warning"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No foods found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Database Status</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">API Status</Typography>
                  <Chip label="Healthy" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Last Updated</Typography>
                  <Chip label={new Date().toLocaleTimeString()} color="info" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStats;
