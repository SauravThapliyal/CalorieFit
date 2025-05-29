import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { userProfileApi } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.hasProfile) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const profileData = await userProfileApi.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.hasProfile && !loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Welcome to CalorieFit! Let's set up your profile to get personalized recommendations.
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/profile-setup')}
          >
            Complete Your Profile
          </Button>
        </Box>
      </Container>
    );
  }

  const quickStats = [
    {
      title: 'Today\'s Calories',
      value: '1,250',
      target: profile?.dailyCalorieGoal || 2000,
      current: 1250,
      icon: <Restaurant />,
      color: 'primary',
    },
    {
      title: 'Workouts This Week',
      value: '3',
      target: 5,
      current: 3,
      icon: <FitnessCenter />,
      color: 'secondary',
    },
    {
      title: 'Weight Progress',
      value: `${profile?.weight || 0} kg`,
      target: profile?.targetWeight || 0,
      current: profile?.weight || 0,
      icon: <TrendingUp />,
      color: 'success',
    },
    {
      title: 'Achievements',
      value: '12',
      target: 20,
      current: 12,
      icon: <EmojiEvents />,
      color: 'warning',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your fitness overview for today
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${stat.color}.main`, mr: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stat.current / stat.target) * 100}
                  color={stat.color as any}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {stat.current} / {stat.target}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/exercises')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FitnessCenter sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Start Workout</Typography>
              <Typography variant="body2" color="text.secondary">
                Browse exercise library
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/nutrition')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Log Meal</Typography>
              <Typography variant="body2" color="text.secondary">
                Track your nutrition
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/progress')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">View Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                Check your stats
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/achievements')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Achievements</Typography>
              <Typography variant="body2" color="text.secondary">
                View your badges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
