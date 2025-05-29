import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  FitnessCenter,
  Add,
  LocalFireDepartment,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { weightApi, userProfileApi, dietLogApi, achievementApi } from '../services/api';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weightRecords, setWeightRecords] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [addWeightOpen, setAddWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [weights, profile, summary, userAchievements] = await Promise.all([
        weightApi.getWeightRecords(30),
        userProfileApi.getProfile(),
        dietLogApi.getDailySummary(),
        achievementApi.getUserAchievements(),
      ]);

      setWeightRecords(Array.isArray(weights) ? weights : []);
      setUserProfile(profile);
      setDailySummary(summary);
      setAchievements(Array.isArray(userAchievements) ? userAchievements : []);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  const handleAddWeight = async () => {
    if (!newWeight) return;

    try {
      await weightApi.logWeight({
        weight: parseFloat(newWeight),
        loggedAt: new Date().toISOString(),
      });
      setAddWeightOpen(false);
      setNewWeight('');
      fetchProgressData();
    } catch (err) {
      console.error('Error adding weight:', err);
      setError('Failed to add weight record');
    }
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

  const getProgressStats = () => {
    const currentWeight = weightRecords.length > 0 ? weightRecords[0]?.weight : userProfile?.weight || 0;
    const targetWeight = userProfile?.targetWeight || 0;
    const height = userProfile?.height || 170;
    const currentBMI = calculateBMI(currentWeight, height);
    const targetBMI = calculateBMI(targetWeight, height);

    return [
      {
        title: 'Current Weight',
        current: currentWeight,
        target: targetWeight,
        unit: 'kg',
        change: weightRecords.length > 1 ? (weightRecords[0]?.weight - weightRecords[1]?.weight) : 0,
        icon: currentWeight <= targetWeight ? <TrendingDown /> : <TrendingUp />,
        color: currentWeight <= targetWeight ? 'success' : 'warning',
      },
      {
        title: 'BMI',
        current: currentBMI,
        target: targetBMI,
        unit: '',
        change: 0,
        icon: currentBMI <= targetBMI ? <TrendingDown /> : <TrendingUp />,
        color: currentBMI <= 25 ? 'success' : 'warning',
      },
      {
        title: 'Today\'s Calories',
        current: dailySummary?.consumed?.calories || 0,
        target: dailySummary?.goals?.calories || 2000,
        unit: 'kcal',
        change: 0,
        icon: <LocalFireDepartment />,
        color: 'primary',
      },
      {
        title: 'Achievements',
        current: achievements.length,
        target: 10,
        unit: 'badges',
        change: 0,
        icon: <EmojiEvents />,
        color: 'warning',
      },
    ];
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

  const progressStats = getProgressStats();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Progress Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your fitness journey and celebrate your achievements
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {progressStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${stat.color}.main`, mr: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {formatNumber(stat.current, stat.unit === 'kg' ? 2 : 0)} {stat.unit}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Target: {stat.target} {stat.unit}
                  </Typography>
                  {stat.change !== 0 && (
                    <Chip
                      label={`${stat.change > 0 ? '+' : ''}${formatNumber(stat.change, 2)} ${stat.unit}`}
                      size="small"
                      color={stat.change > 0 ? 'success' : 'error'}
                    />
                  )}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((stat.current / stat.target) * 100, 100)}
                  color={stat.color as any}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Weight Button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Weight Progress</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddWeightOpen(true)}
        >
          Log Weight
        </Button>
      </Box>

      {/* Weight Records */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Weight Records
              </Typography>
              {weightRecords.length > 0 ? (
                weightRecords.slice(0, 5).map((record, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold">
                        {record.weight} kg
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.loggedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No weight records yet. Start tracking your progress!
                </Typography>
              )}
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
                achievements.slice(0, 3).map((achievement, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      🏆 {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Start your fitness journey!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete workouts and track nutrition to earn achievements
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Weight Dialog */}
      <Dialog open={addWeightOpen} onClose={() => setAddWeightOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Weight</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Weight (kg)"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWeightOpen(false)}>Cancel</Button>
          <Button onClick={handleAddWeight} variant="contained">
            Log Weight
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Progress;
