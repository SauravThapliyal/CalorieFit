import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CloudUpload,
  FitnessCenter,
  Image,
} from '@mui/icons-material';
import { exerciseApi } from '../../services/api';
import { getExerciseImageUrl } from '../../utils/imageUtils';

const ExerciseManagement: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [exerciseData, setExerciseData] = useState({
    name: '',
    description: '',
    instructions: '',
    type: '',
    location: '',
    difficulty: '',
    durationMinutes: '',
    caloriesBurnedPerMinute: '',
    muscleGroups: '',
    equipment: '',
    imageUrl: '',
    videoUrl: '',
  });

  const exerciseTypes = [
    { value: 1, label: 'Cardio' },
    { value: 2, label: 'Strength' },
    { value: 3, label: 'Flexibility' },
    { value: 4, label: 'HIIT' },
    { value: 5, label: 'Sports' },
    { value: 6, label: 'Other' }
  ];

  const locations = [
    { value: 1, label: 'Home' },
    { value: 2, label: 'Gym' },
    { value: 3, label: 'Outdoor' },
    { value: 4, label: 'Both' },
    { value: 5, label: 'Online' }
  ];

  const difficulties = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' }
  ];

  useEffect(() => {
    fetchExercises();
  }, []);

  const getTypeLabel = (type: number) => {
    const typeObj = exerciseTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : 'Unknown';
  };

  const getLocationLabel = (location: number) => {
    const locationObj = locations.find(l => l.value === location);
    return locationObj ? locationObj.label : 'Unknown';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const difficultyObj = difficulties.find(d => d.value === difficulty);
    return difficultyObj ? difficultyObj.label : 'Unknown';
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await exerciseApi.getAllAdmin();
      setExercises(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (exercise?: any) => {
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseData({
        name: exercise.name || '',
        description: exercise.description || '',
        instructions: exercise.instructions || '',
        type: exercise.type?.toString() || '',
        location: exercise.location?.toString() || '',
        difficulty: exercise.difficulty?.toString() || '',
        durationMinutes: exercise.durationMinutes?.toString() || '',
        caloriesBurnedPerMinute: exercise.caloriesBurnedPerMinute?.toString() || '',
        muscleGroups: Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : '',
        equipment: Array.isArray(exercise.equipment) ? exercise.equipment.join(', ') : '',
        imageUrl: exercise.imageUrl || '',
        videoUrl: exercise.videoUrl || '',
      });
      setImagePreview(getExerciseImageUrl(exercise));
    } else {
      setEditingExercise(null);
      setExerciseData({
        name: '',
        description: '',
        instructions: '',
        type: '',
        location: '',
        difficulty: '',
        durationMinutes: '',
        caloriesBurnedPerMinute: '',
        muscleGroups: '',
        equipment: '',
        imageUrl: '',
        videoUrl: '',
      });
      setImagePreview('');
    }
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExercise(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveExercise = async () => {
    try {
      const exercisePayload = {
        name: exerciseData.name,
        description: exerciseData.description,
        instructions: exerciseData.instructions,
        type: parseInt(exerciseData.type) || 1,
        location: parseInt(exerciseData.location) || 1,
        difficulty: parseInt(exerciseData.difficulty) || 1,
        durationMinutes: parseInt(exerciseData.durationMinutes) || 0,
        caloriesBurnedPerMinute: parseFloat(exerciseData.caloriesBurnedPerMinute) || 0,
        muscleGroups: exerciseData.muscleGroups.split(',').map(mg => mg.trim()).filter(mg => mg),
        equipment: exerciseData.equipment.split(',').map(eq => eq.trim()).filter(eq => eq),
        videoUrl: exerciseData.videoUrl,
      };

      let savedExercise;
      if (editingExercise) {
        savedExercise = await exerciseApi.update(editingExercise.id, exercisePayload);
      } else {
        savedExercise = await exerciseApi.create(exercisePayload);
      }

      // Upload image if provided
      if (imageFile && savedExercise?.id) {
        await exerciseApi.uploadImage(savedExercise.id, imageFile);
      }

      handleCloseDialog();
      fetchExercises();
      setError('');
    } catch (err) {
      console.error('Error saving exercise:', err);
      setError('Failed to save exercise');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await exerciseApi.delete(id);
        fetchExercises();
        setError('');
      } catch (err) {
        console.error('Error deleting exercise:', err);
        setError('Failed to delete exercise');
      }
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Exercise Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Exercise
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Calories/Min</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>
                  <Avatar
                    src={getExerciseImageUrl(exercise)}
                    sx={{ width: 50, height: 50 }}
                  >
                    <FitnessCenter />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{exercise.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {exercise.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={getTypeLabel(exercise.type)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={getLocationLabel(exercise.location)} size="small" color="secondary" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getDifficultyLabel(exercise.difficulty)}
                    size="small"
                    color={exercise.difficulty === 1 ? 'success' :
                           exercise.difficulty === 2 ? 'warning' : 'error'}
                  />
                </TableCell>
                <TableCell>{exercise.durationMinutes} min</TableCell>
                <TableCell>{formatNumber(exercise.caloriesBurnedPerMinute, 1)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(exercise)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteExercise(exercise.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {exercises.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FitnessCenter sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No exercises found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first exercise to get started
          </Typography>
        </Box>
      )}

      {/* Add/Edit Exercise Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Exercise Name"
                value={exerciseData.name}
                onChange={(e) => setExerciseData({ ...exerciseData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={exerciseData.type}
                  onChange={(e) => setExerciseData({ ...exerciseData, type: e.target.value })}
                  label="Type"
                >
                  {exerciseTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={exerciseData.location}
                  onChange={(e) => setExerciseData({ ...exerciseData, location: e.target.value })}
                  label="Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location.value} value={location.value}>{location.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={exerciseData.difficulty}
                  onChange={(e) => setExerciseData({ ...exerciseData, difficulty: e.target.value })}
                  label="Difficulty"
                >
                  {difficulties.map((difficulty) => (
                    <MenuItem key={difficulty.value} value={difficulty.value}>{difficulty.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={exerciseData.durationMinutes}
                onChange={(e) => setExerciseData({ ...exerciseData, durationMinutes: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Calories Burned per Minute"
                type="number"
                inputProps={{ step: "0.1" }}
                value={exerciseData.caloriesBurnedPerMinute}
                onChange={(e) => setExerciseData({ ...exerciseData, caloriesBurnedPerMinute: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={exerciseData.description}
                onChange={(e) => setExerciseData({ ...exerciseData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Instructions"
                value={exerciseData.instructions}
                onChange={(e) => setExerciseData({ ...exerciseData, instructions: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Muscle Groups (comma separated)"
                value={exerciseData.muscleGroups}
                onChange={(e) => setExerciseData({ ...exerciseData, muscleGroups: e.target.value })}
                fullWidth
                placeholder="e.g., Chest, Shoulders, Triceps"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Equipment (comma separated)"
                value={exerciseData.equipment}
                onChange={(e) => setExerciseData({ ...exerciseData, equipment: e.target.value })}
                fullWidth
                placeholder="e.g., Dumbbells, Bench"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Video URL"
                value={exerciseData.videoUrl}
                onChange={(e) => setExerciseData({ ...exerciseData, videoUrl: e.target.value })}
                fullWidth
                placeholder="https://youtube.com/..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Box sx={{ textAlign: 'center' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveExercise}
          >
            {editingExercise ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseManagement;
