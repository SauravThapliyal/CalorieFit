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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Restaurant,
} from '@mui/icons-material';
import { foodApi } from '../../services/api';

const FoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);

  const [foodData, setFoodData] = useState({
    name: '',
    description: '',
    category: '',
    caloriesPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: '',
    fiberPer100g: '',
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await foodApi.getAllAdmin();
      // Handle paginated response
      if (response && typeof response === 'object' && Array.isArray((response as any).foods)) {
        setFoods((response as any).foods);
      } else if (Array.isArray(response)) {
        setFoods(response);
      } else {
        setFoods([]);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError('Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (food?: any) => {
    if (food) {
      setEditingFood(food);
      setFoodData({
        name: food.name || '',
        description: food.description || '',
        category: food.category || '',
        caloriesPer100g: food.caloriesPer100g?.toString() || '',
        proteinPer100g: food.proteinPer100g?.toString() || '',
        carbsPer100g: food.carbsPer100g?.toString() || '',
        fatPer100g: food.fatPer100g?.toString() || '',
        fiberPer100g: food.fiberPer100g?.toString() || '',
      });
    } else {
      setEditingFood(null);
      setFoodData({
        name: '',
        description: '',
        category: '',
        caloriesPer100g: '',
        proteinPer100g: '',
        carbsPer100g: '',
        fatPer100g: '',
        fiberPer100g: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFood(null);
  };

  const handleSaveFood = async () => {
    try {
      const foodPayload = {
        name: foodData.name,
        description: foodData.description,
        category: foodData.category,
        caloriesPer100g: parseFloat(foodData.caloriesPer100g) || 0,
        proteinPer100g: parseFloat(foodData.proteinPer100g) || 0,
        carbsPer100g: parseFloat(foodData.carbsPer100g) || 0,
        fatPer100g: parseFloat(foodData.fatPer100g) || 0,
        fiberPer100g: parseFloat(foodData.fiberPer100g) || 0,
      };

      if (editingFood) {
        await foodApi.update(editingFood.id, foodPayload);
      } else {
        await foodApi.create(foodPayload);
      }

      handleCloseDialog();
      fetchFoods();
      setError('');
    } catch (err) {
      console.error('Error saving food:', err);
      setError('Failed to save food');
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        await foodApi.delete(id);
        fetchFoods();
        setError('');
      } catch (err) {
        console.error('Error deleting food:', err);
        setError('Failed to delete food');
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
        <Typography variant="h5">Food Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Food
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
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Calories/100g</TableCell>
              <TableCell>Protein/100g</TableCell>
              <TableCell>Carbs/100g</TableCell>
              <TableCell>Fat/100g</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foods.map((food) => (
              <TableRow key={food.id}>
                <TableCell>
                  <Typography variant="subtitle2">{food.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {food.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={food.category} size="small" />
                </TableCell>
                <TableCell>{formatNumber(food.caloriesPer100g, 0)}</TableCell>
                <TableCell>{formatNumber(food.proteinPer100g, 2)}g</TableCell>
                <TableCell>{formatNumber(food.carbsPer100g, 2)}g</TableCell>
                <TableCell>{formatNumber(food.fatPer100g, 2)}g</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(food)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteFood(food.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {foods.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No foods found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first food to get started
          </Typography>
        </Box>
      )}

      {/* Add/Edit Food Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFood ? 'Edit Food' : 'Add New Food'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Food Name"
                value={foodData.name}
                onChange={(e) => setFoodData({ ...foodData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Category"
                value={foodData.category}
                onChange={(e) => setFoodData({ ...foodData, category: e.target.value })}
                fullWidth
                placeholder="e.g., Fruits, Vegetables, Meat"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={foodData.description}
                onChange={(e) => setFoodData({ ...foodData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Calories per 100g"
                type="number"
                value={foodData.caloriesPer100g}
                onChange={(e) => setFoodData({ ...foodData, caloriesPer100g: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Protein per 100g (g)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={foodData.proteinPer100g}
                onChange={(e) => setFoodData({ ...foodData, proteinPer100g: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Carbs per 100g (g)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={foodData.carbsPer100g}
                onChange={(e) => setFoodData({ ...foodData, carbsPer100g: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fat per 100g (g)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={foodData.fatPer100g}
                onChange={(e) => setFoodData({ ...foodData, fatPer100g: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fiber per 100g (g)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={foodData.fiberPer100g}
                onChange={(e) => setFoodData({ ...foodData, fiberPer100g: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveFood}
          >
            {editingFood ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoodManagement;
