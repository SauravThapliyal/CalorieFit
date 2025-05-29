import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit,
  Person,
  FitnessCenter,
  Height,
  MonitorWeight,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userProfileApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateProfileStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: '',
    fitnessGoal: '',
    age: '',
    gender: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await userProfileApi.getProfile();
      setUserProfile(profile);
      setEditData({
        height: profile.height ? Math.round(profile.height * 100).toString() : '', // Convert meters to cm
        weight: profile.weight?.toString() || '',
        targetWeight: profile.targetWeight?.toString() || '',
        activityLevel: profile.activityLevel?.toString() || '',
        fitnessGoal: profile.fitnessGoal?.toString() || '',
        age: profile.age?.toString() || '',
        gender: profile.gender?.toString() || '',
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);

      // Check if it's a "profile not found" error
      if (err.response?.status === 404 || err.response?.data?.message?.includes('not found')) {
        // Update user's hasProfile status and redirect to profile setup
        updateProfileStatus(false);
        navigate('/profile-setup');
        return;
      }

      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await userProfileApi.updateProfile({
        height: parseFloat(editData.height) / 100, // Convert cm to meters
        weight: parseFloat(editData.weight),
        targetWeight: parseFloat(editData.targetWeight),
        activityLevel: parseInt(editData.activityLevel),
        fitnessGoal: parseInt(editData.fitnessGoal),
        age: parseInt(editData.age),
        gender: parseInt(editData.gender),
      });
      setEditOpen(false);
      fetchProfile();
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
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
    if (heightInCm < 50 || heightInCm > 300) {
      console.warn('Invalid height for BMI calculation:', heightInCm);
      return 0;
    }

    // If weight is unreasonably small or large, return 0
    if (weightInKg < 10 || weightInKg > 500) {
      console.warn('Invalid weight for BMI calculation:', weightInKg);
      return 0;
    }

    const bmi = weightInKg / ((heightInCm / 100) ** 2);
    console.log('BMI Calculation:', { weight: weightInKg, height: heightInCm, bmi });
    return bmi;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'info' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'error' };
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

  const bmi = calculateBMI(userProfile?.weight, userProfile?.height);
  const bmiInfo = getBMICategory(bmi);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and fitness goals
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date().toLocaleDateString()}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditOpen(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Physical Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Height sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Height</Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main">
                    {userProfile?.height ? Math.round(userProfile.height * 100) : 'Not set'} {userProfile?.height ? 'cm' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MonitorWeight sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6">Current Weight</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary.main">
                    {userProfile?.weight || 'Not set'} {userProfile?.weight ? 'kg' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FitnessCenter sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6">Target Weight</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {userProfile?.targetWeight || 'Not set'} {userProfile?.targetWeight ? 'kg' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6">BMI</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {bmi ? `${bmi.toFixed(2)} kg/m²` : 'Not calculated'}
                  </Typography>
                  {bmi > 0 && (
                    <Chip
                      label={bmiInfo.category}
                      color={bmiInfo.color as any}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Fitness Goals */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fitness Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Activity Level
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.activityLevel || 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fitness Goal
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {userProfile?.fitnessGoal || 'Not set'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Height (cm)"
              type="number"
              value={editData.height}
              onChange={(e) => setEditData({ ...editData, height: e.target.value })}
              fullWidth
              inputProps={{ min: 100, max: 250, step: 1 }}
              helperText="Enter your height between 100-250 cm"
            />
            <TextField
              label="Current Weight (kg)"
              type="number"
              value={editData.weight}
              onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
              fullWidth
            />
            <TextField
              label="Target Weight (kg)"
              type="number"
              value={editData.targetWeight}
              onChange={(e) => setEditData({ ...editData, targetWeight: e.target.value })}
              fullWidth
            />
            <TextField
              label="Age"
              type="number"
              value={editData.age}
              onChange={(e) => setEditData({ ...editData, age: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                label="Gender"
              >
                <MenuItem value="1">Male</MenuItem>
                <MenuItem value="2">Female</MenuItem>
                <MenuItem value="3">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Activity Level</InputLabel>
              <Select
                value={editData.activityLevel}
                onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value })}
                label="Activity Level"
              >
                <MenuItem value="1">Sedentary</MenuItem>
                <MenuItem value="2">Lightly Active</MenuItem>
                <MenuItem value="3">Moderately Active</MenuItem>
                <MenuItem value="4">Very Active</MenuItem>
                <MenuItem value="5">Extra Active</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Fitness Goal</InputLabel>
              <Select
                value={editData.fitnessGoal}
                onChange={(e) => setEditData({ ...editData, fitnessGoal: e.target.value })}
                label="Fitness Goal"
              >
                <MenuItem value="1">Weight Loss</MenuItem>
                <MenuItem value="2">Weight Gain</MenuItem>
                <MenuItem value="3">Maintain Weight</MenuItem>
                <MenuItem value="4">Custom Plan</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
