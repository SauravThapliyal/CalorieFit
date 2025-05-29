import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseTimer from '../components/ExerciseTimer';
import { Exercise } from '../types';
import { exerciseApi } from '../services/api';

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);

  // Helper functions for enum conversion
  const getDifficultyText = (difficulty: string | number) => {
    if (typeof difficulty === 'string') return difficulty;
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  const getTypeText = (type: string | number) => {
    if (typeof type === 'string') return type;
    switch (type) {
      case 1: return 'Cardio';
      case 2: return 'Strength';
      case 3: return 'Flexibility';
      case 4: return 'HIIT';
      default: return 'Other';
    }
  };

  const getLocationText = (location: string | number) => {
    if (typeof location === 'string') return location;
    switch (location) {
      case 1: return 'Home';
      case 2: return 'Gym';
      case 3: return 'Outdoor';
      case 4: return 'Both';
      default: return 'Any';
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);



  const fetchExercises = async () => {
    try {
      const data = await exerciseApi.getAll();
      setExercises(data);
    } catch (err: any) {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = useCallback(() => {
    let filtered = exercises;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some(muscle =>
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (typeFilter !== '') {
      filtered = filtered.filter(exercise => {
        const exerciseType = typeof exercise.type === 'number' ? getTypeText(exercise.type) : exercise.type;
        return exerciseType.toLowerCase() === typeFilter.toLowerCase();
      });
    }

    // Difficulty filter
    if (difficultyFilter !== '') {
      filtered = filtered.filter(exercise => {
        const exerciseDifficulty = typeof exercise.difficulty === 'number' ? getDifficultyText(exercise.difficulty) : exercise.difficulty;
        return exerciseDifficulty.toLowerCase() === difficultyFilter.toLowerCase();
      });
    }

    // Location filter
    if (locationFilter !== '') {
      filtered = filtered.filter(exercise => {
        const exerciseLocation = typeof exercise.location === 'number' ? getLocationText(exercise.location) : exercise.location;
        return exerciseLocation.toLowerCase() === locationFilter.toLowerCase();
      });
    }

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, typeFilter, difficultyFilter, locationFilter]);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimerOpen(true);
  };

  const handleViewDetails = (exercise: Exercise) => {
    // TODO: Open exercise details modal or navigate to details page
    console.log('Viewing details for:', exercise.name);
  };

  const handleTimerComplete = async (exercise: Exercise, duration: number) => {
    try {
      // Ensure minimum 1 minute duration (backend validation requires 1-600 minutes)
      const durationMinutes = Math.max(1, Math.round(duration / 60));
      const actualDurationMinutes = duration / 60; // Use actual duration for calorie calculation

      // Calculate calories burned with detailed logging
      const rawCalories = actualDurationMinutes * exercise.caloriesBurnedPerMinute;
      const roundedCalories = Math.round(rawCalories);
      const caloriesBurned = Math.max(1, roundedCalories);

      console.log('Calorie calculation details:');
      console.log('- Duration (seconds):', duration);
      console.log('- Duration (minutes):', actualDurationMinutes);
      console.log('- Calories per minute:', exercise.caloriesBurnedPerMinute);
      console.log('- Raw calories:', rawCalories);
      console.log('- Rounded calories:', roundedCalories);
      console.log('- Final calories (min 1):', caloriesBurned);

      const exerciseDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

      const logData = {
        exerciseId: exercise.id,
        durationMinutes: durationMinutes,
        caloriesBurned: caloriesBurned,
        exerciseDate: exerciseDate,
        notes: `Completed via exercise timer (${Math.round(duration)}s)`
      };

      console.log('Logging exercise with data:', logData);
      console.log('CaloriesBurned is null?', caloriesBurned === null);
      console.log('CaloriesBurned is undefined?', caloriesBurned === undefined);
      console.log('CaloriesBurned type:', typeof caloriesBurned);

      const response = await exerciseApi.logExercise(logData);
      console.log('Backend response:', response);
      console.log(`Successfully logged ${exercise.name} for ${durationMinutes} minutes, ${caloriesBurned} calories burned`);

      // Show success message
      setError(''); // Clear any previous errors

    } catch (err: any) {
      console.error('Error logging exercise:', err);

      // Show more detailed error message
      let errorMessage = 'Exercise completed but failed to save to your log. Please try logging it manually.';
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMessage = `Failed to log exercise: ${errors.join(', ')}`;
      } else if (err.response?.data?.message) {
        errorMessage = `Failed to log exercise: ${err.response.data.message}`;
      }

      setError(errorMessage);
    } finally {
      setTimerOpen(false);
      setSelectedExercise(null);
    }
  };

  const handleTimerClose = () => {
    setTimerOpen(false);
    setSelectedExercise(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setDifficultyFilter('');
    setLocationFilter('');
  };

  useEffect(() => {
    filterExercises();
  }, [filterExercises]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Exercise Library
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as string)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Cardio">Cardio</MenuItem>
                <MenuItem value="Strength">Strength</MenuItem>
                <MenuItem value="Flexibility">Flexibility</MenuItem>
                <MenuItem value="HIIT">HIIT</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as string)}
                label="Difficulty"
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as string)}
                label="Location"
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Gym">Gym</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              label="Clear Filters"
              onClick={clearFilters}
              onDelete={clearFilters}
              deleteIcon={<FilterList />}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Results */}
      <Typography variant="h6" gutterBottom>
        {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
      </Typography>

      <Grid container spacing={3}>
        {filteredExercises.map((exercise) => (
          <Grid item xs={12} sm={6} md={4} key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              onStartExercise={handleStartExercise}
              onViewDetails={handleViewDetails}
            />
          </Grid>
        ))}
      </Grid>

      {filteredExercises.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No exercises found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}

      {/* Exercise Timer */}
      {selectedExercise && (
        <ExerciseTimer
          exercise={selectedExercise}
          open={timerOpen}
          onClose={handleTimerClose}
          onComplete={handleTimerComplete}
        />
      )}
    </Container>
  );
};

export default ExerciseLibrary;
