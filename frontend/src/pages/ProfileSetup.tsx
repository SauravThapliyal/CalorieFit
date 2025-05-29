import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Gender, ActivityLevel, FitnessGoal } from '../types';
import { userProfileApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Basic Info', 'Activity Level', 'Fitness Goals'];

const ProfileSetup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateProfileStatus } = useAuth();

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: Gender.Male,
    activityLevel: ActivityLevel.Sedentary,
    fitnessGoal: FitnessGoal.MaintainWeight,
    targetWeight: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const profileData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height) / 100, // Convert cm to meters
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        targetWeight: parseFloat(formData.targetWeight),
      };

      await userProfileApi.createProfile(profileData);
      updateProfileStatus(true);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Profile creation error:', err);
      // Extract validation errors if available
      let errorMessage = 'Failed to create profile. Please try again.';
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 30, max: 300, step: 0.1 }}
              helperText="Enter your weight between 30-300 kg"
            />
            <TextField
              fullWidth
              label="Height (cm)"
              type="number"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 100, max: 250, step: 1 }}
              helperText="Enter your height between 100-250 cm"
            />
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 13, max: 120, step: 1 }}
              helperText="Enter your age between 13-120 years"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value={Gender.Male}>Male</MenuItem>
                <MenuItem value={Gender.Female}>Female</MenuItem>
                <MenuItem value={Gender.Other}>Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Activity Level</InputLabel>
              <Select
                value={formData.activityLevel}
                onChange={(e) => handleChange('activityLevel', e.target.value)}
                label="Activity Level"
              >
                <MenuItem value={ActivityLevel.Sedentary}>Sedentary (little/no exercise)</MenuItem>
                <MenuItem value={ActivityLevel.LightlyActive}>Lightly Active (light exercise 1-3 days/week)</MenuItem>
                <MenuItem value={ActivityLevel.ModeratelyActive}>Moderately Active (moderate exercise 3-5 days/week)</MenuItem>
                <MenuItem value={ActivityLevel.VeryActive}>Very Active (hard exercise 6-7 days/week)</MenuItem>
                <MenuItem value={ActivityLevel.ExtraActive}>Extra Active (very hard exercise, physical job)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Fitness Goal</InputLabel>
              <Select
                value={formData.fitnessGoal}
                onChange={(e) => handleChange('fitnessGoal', e.target.value)}
                label="Fitness Goal"
              >
                <MenuItem value={FitnessGoal.WeightLoss}>Weight Loss</MenuItem>
                <MenuItem value={FitnessGoal.WeightGain}>Weight Gain</MenuItem>
                <MenuItem value={FitnessGoal.MaintainWeight}>Maintain Weight</MenuItem>
                <MenuItem value={FitnessGoal.CustomPlan}>Custom Plan</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Target Weight (kg)"
              type="number"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 30, max: 300, step: 0.1 }}
              helperText="Enter your target weight between 30-300 kg"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Complete Your Profile
          </Typography>

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Complete Profile' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileSetup;
