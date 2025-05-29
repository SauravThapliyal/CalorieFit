import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  LocalFireDepartment,
  Info,
  PlayArrow,
} from '@mui/icons-material';
import { Exercise } from '../types';
import { getExerciseImageUrl } from '../utils/imageUtils';

interface ExerciseCardProps {
  exercise: Exercise;
  onStartExercise?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onStartExercise,
  onViewDetails,
}) => {
  const getDifficultyColor = (difficulty: string | number) => {
    const difficultyStr = typeof difficulty === 'number' ? getDifficultyText(difficulty) : difficulty;
    switch (difficultyStr.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={getExerciseImageUrl(exercise)}
        alt={exercise.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {exercise.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {exercise.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            label={getDifficultyText(exercise.difficulty)}
            color={getDifficultyColor(exercise.difficulty) as any}
            size="small"
          />
          <Chip
            label={getTypeText(exercise.type)}
            variant="outlined"
            size="small"
          />
          <Chip
            label={getLocationText(exercise.location)}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {exercise.durationMinutes} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalFireDepartment fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {exercise.caloriesBurnedPerMinute * exercise.durationMinutes} cal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {exercise.muscleGroups.slice(0, 3).map((muscle, index) => (
            <Chip
              key={index}
              label={muscle}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {exercise.muscleGroups.length > 3 && (
            <Chip
              label={`+${exercise.muscleGroups.length - 3} more`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="View Details">
            <IconButton onClick={() => onViewDetails?.(exercise)} size="small">
              <Info />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => onStartExercise?.(exercise)}
            size="small"
          >
            Start
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
