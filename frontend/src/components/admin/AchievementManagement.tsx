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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  EmojiEvents,
  FitnessCenter,
  Restaurant,
  TrendingUp,
  LocalFireDepartment,
  Timer,
} from '@mui/icons-material';
import { achievementApi } from '../../services/api';

const AchievementManagement: React.FC = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);

  const [achievementData, setAchievementData] = useState({
    name: '',
    description: '',
    type: '',
    requiredValue: '',
    points: '',
    iconUrl: '',
  });

  const achievementTypes = [
    { value: 1, label: 'Weight Loss', icon: <TrendingUp /> },
    { value: 2, label: 'Weight Gain', icon: <TrendingUp /> },
    { value: 3, label: 'Daily Streak', icon: <LocalFireDepartment /> },
    { value: 4, label: 'Total Workouts', icon: <FitnessCenter /> },
    { value: 5, label: 'Calories Burned', icon: <LocalFireDepartment /> },
    { value: 6, label: 'Consistent Logging', icon: <Timer /> },
    { value: 7, label: 'Calorie Goal', icon: <Restaurant /> },
    { value: 8, label: 'Protein Goal', icon: <Restaurant /> },
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await achievementApi.getAllAdmin();
      setAchievements(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (achievement?: any) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setAchievementData({
        name: achievement.name || '',
        description: achievement.description || '',
        type: achievement.type?.toString() || '',
        requiredValue: achievement.requiredValue?.toString() || '',
        points: achievement.points?.toString() || '',
        iconUrl: achievement.iconUrl || '',
      });
    } else {
      setEditingAchievement(null);
      setAchievementData({
        name: '',
        description: '',
        type: '',
        requiredValue: '',
        points: '',
        iconUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAchievement(null);
  };

  const handleSaveAchievement = async () => {
    try {
      const achievementPayload = {
        name: achievementData.name,
        description: achievementData.description,
        type: parseInt(achievementData.type) || 1,
        requiredValue: parseInt(achievementData.requiredValue) || 0,
        points: parseInt(achievementData.points) || 0,
        iconUrl: achievementData.iconUrl,
      };

      if (editingAchievement) {
        await achievementApi.update(editingAchievement.id, achievementPayload);
      } else {
        await achievementApi.create(achievementPayload);
      }

      handleCloseDialog();
      fetchAchievements();
      setError('');
    } catch (err) {
      console.error('Error saving achievement:', err);
      setError('Failed to save achievement');
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        await achievementApi.delete(id);
        fetchAchievements();
        setError('');
      } catch (err) {
        console.error('Error deleting achievement:', err);
        setError('Failed to delete achievement');
      }
    }
  };

  const getAchievementIcon = (type: string | number) => {
    const typeNum = Number(type);
    const achievementType = achievementTypes.find(t => t.value === typeNum);
    return achievementType ? achievementType.icon : <EmojiEvents />;
  };

  const getAchievementTypeLabel = (type: string | number) => {
    const typeNum = Number(type);
    const achievementType = achievementTypes.find(t => t.value === typeNum);
    return achievementType ? achievementType.label : 'Unknown';
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
        <Typography variant="h5">Achievement Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Achievement
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
              <TableCell>Icon</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {achievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    {getAchievementIcon(achievement.type)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{achievement.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {achievement.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={getAchievementTypeLabel(achievement.type)} size="small" />
                </TableCell>
                <TableCell>
                  {formatNumber(achievement.requiredValue, 0)}
                </TableCell>
                <TableCell>
                  <Chip label={`${achievement.points} pts`} size="small" color="warning" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={achievement.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={achievement.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(achievement)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteAchievement(achievement.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {achievements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No achievements found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first achievement to get started
          </Typography>
        </Box>
      )}

      {/* Add/Edit Achievement Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Achievement Name"
                value={achievementData.name}
                onChange={(e) => setAchievementData({ ...achievementData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={achievementData.type}
                  onChange={(e) => setAchievementData({ ...achievementData, type: e.target.value })}
                  label="Type"
                >
                  {achievementTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={achievementData.description}
                onChange={(e) => setAchievementData({ ...achievementData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Required Value"
                type="number"
                value={achievementData.requiredValue}
                onChange={(e) => setAchievementData({ ...achievementData, requiredValue: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Points"
                type="number"
                value={achievementData.points}
                onChange={(e) => setAchievementData({ ...achievementData, points: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Icon URL (optional)"
                value={achievementData.iconUrl}
                onChange={(e) => setAchievementData({ ...achievementData, iconUrl: e.target.value })}
                fullWidth
                placeholder="e.g., /images/achievements/first-workout.png"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveAchievement}
          >
            {editingAchievement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AchievementManagement;
