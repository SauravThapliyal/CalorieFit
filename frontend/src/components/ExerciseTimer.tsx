import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  LinearProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  AccessTime,
  LocalFireDepartment,
} from '@mui/icons-material';
import { Exercise } from '../types';

interface ExerciseTimerProps {
  exercise: Exercise;
  open: boolean;
  onClose: () => void;
  onComplete: (exercise: Exercise, duration: number) => void;
}

const ExerciseTimer: React.FC<ExerciseTimerProps> = ({
  exercise,
  open,
  onClose,
  onComplete,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const targetDuration = exercise.durationMinutes * 60; // Convert to seconds

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeElapsed(0);
      setIsRunning(false);
      setIsPaused(false);
      console.log('ExerciseTimer - Dialog opened, timer reset');
    }
  }, [open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          if (newTime >= targetDuration) {
            setIsRunning(false);
            // Auto-complete when target duration is reached
            setTimeout(() => {
              handleComplete();
            }, 1000);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, targetDuration]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeElapsed(0);
  };

  const handleComplete = () => {
    console.log('ExerciseTimer - handleComplete called');
    console.log('- timeElapsed:', timeElapsed);
    console.log('- isRunning:', isRunning);
    console.log('- isPaused:', isPaused);
    onComplete(exercise, timeElapsed);
    handleClose();
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((timeElapsed / targetDuration) * 100, 100);
  const caloriesBurned = Math.round((timeElapsed / 60) * exercise.caloriesBurnedPerMinute);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{exercise.name}</Typography>
          <Chip
            label={exercise.type}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {/* Timer Display */}
          <Typography variant="h2" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
            {formatTime(timeElapsed)}
          </Typography>

          {/* Target Time */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Target: {formatTime(targetDuration)}
          </Typography>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4, mb: 3 }}
          />

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime color="action" />
              <Typography variant="body2">
                {Math.round(timeElapsed / 60)} / {exercise.durationMinutes} min
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalFireDepartment color="action" />
              <Typography variant="body2">
                {caloriesBurned} cal burned
              </Typography>
            </Box>
          </Box>

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {!isRunning ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleStart}
                sx={{ minWidth: 120 }}
              >
                Start
              </Button>
            ) : (
              <>
                <IconButton
                  onClick={handlePause}
                  size="large"
                  color={isPaused ? "primary" : "default"}
                  sx={{
                    bgcolor: isPaused ? 'primary.light' : 'grey.200',
                    '&:hover': { bgcolor: isPaused ? 'primary.main' : 'grey.300' }
                  }}
                >
                  {isPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
                <IconButton
                  onClick={handleStop}
                  size="large"
                  color="error"
                  sx={{
                    bgcolor: 'error.light',
                    '&:hover': { bgcolor: 'error.main' }
                  }}
                >
                  <Stop />
                </IconButton>
              </>
            )}
          </Box>

          {/* Exercise Instructions */}
          {exercise.instructions && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Instructions:</strong> {exercise.instructions}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          disabled={timeElapsed < 10} // Minimum 10 seconds
        >
          Complete Workout {timeElapsed < 10 && `(${10 - timeElapsed}s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseTimer;
