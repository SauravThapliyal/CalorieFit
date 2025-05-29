import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Search,
  Restaurant,
} from '@mui/icons-material';
import { foodApi, dietLogApi } from '../services/api';
import { Food, CreateFoodRequest } from '../types';

const WorkingNutrition: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Food Dialog
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [newFood, setNewFood] = useState<CreateFoodRequest>({
    name: '',
    description: '',
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    fiberPer100g: 0,
    category: '',
  });

  // Log Food Dialog
  const [logFoodOpen, setLogFoodOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState('Breakfast');

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [searchTerm, selectedCategory]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory.trim()) params.category = selectedCategory.trim();

      console.log('Fetching foods with params:', params);
      const response = await foodApi.getAll(params);
      console.log('Foods response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));

      // Handle paginated response format
      if (Array.isArray(response)) {
        console.log('Response is direct array, setting foods to:', response);
        setFoods(response);
      } else if (response && typeof response === 'object' && Array.isArray((response as any).foods)) {
        console.log('Response has foods property, setting foods to:', (response as any).foods);
        setFoods((response as any).foods);
      } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
        console.log('Response has data property, setting foods to:', (response as any).data);
        setFoods((response as any).data);
      } else {
        console.log('Response format not recognized, setting empty array. Response:', response);
        setFoods([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError('Failed to fetch foods. Please try again.');
      setFoods([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await foodApi.getCategories();
      setCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const handleCreateFood = async () => {
    try {
      await foodApi.create(newFood);
      setAddFoodOpen(false);
      setNewFood({
        name: '',
        description: '',
        caloriesPer100g: 0,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 0,
        fiberPer100g: 0,
        category: '',
      });
      fetchFoods();
      setError('');
    } catch (err) {
      console.error('Error creating food:', err);
      setError('Failed to create food. Please try again.');
    }
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;

    try {
      const logData = {
        foodId: selectedFood.id,
        quantity: parseFloat(quantity),
        unit: 'grams',
        mealType: mealType,
      };

      await dietLogApi.logFood(logData);
      setLogFoodOpen(false);
      setSelectedFood(null);
      setQuantity('100');
      setError('');
    } catch (err) {
      console.error('Error logging food:', err);
      setError('Failed to log food. Please try again.');
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  const calculateNutrition = (food: Food, qty: number) => {
    const multiplier = qty / 100;
    return {
      calories: parseFloat(formatNumber(food.caloriesPer100g * multiplier, 0)),
      protein: parseFloat(formatNumber(food.proteinPer100g * multiplier, 2)),
      carbs: parseFloat(formatNumber(food.carbsPer100g * multiplier, 2)),
      fat: parseFloat(formatNumber(food.fatPer100g * multiplier, 2)),
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nutrition Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search for foods and log your meals
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}



      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flex: 1, minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {(Array.isArray(categories) ? categories : []).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddFoodOpen(true)}
        >
          Add Custom Food
        </Button>
      </Box>

      {/* Foods List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {(Array.isArray(foods) ? foods : []).map((food) => (
            <Card key={food.id} sx={{ width: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {food.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {food.description}
                </Typography>

                <Chip label={food.category} size="small" sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Per 100g:</strong>
                  </Typography>
                  <Typography variant="body2">
                    Calories: {formatNumber(food.caloriesPer100g, 0)} | Protein: {formatNumber(food.proteinPer100g, 2)}g
                  </Typography>
                  <Typography variant="body2">
                    Carbs: {formatNumber(food.carbsPer100g, 2)}g | Fat: {formatNumber(food.fatPer100g, 2)}g
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Restaurant />}
                  onClick={() => {
                    setSelectedFood(food);
                    setLogFoodOpen(true);
                  }}
                >
                  Log Food
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {(Array.isArray(foods) ? foods : []).length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No foods found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or add a custom food
          </Typography>
        </Box>
      )}

      {/* Add Food Dialog */}
      <Dialog open={addFoodOpen} onClose={() => setAddFoodOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Food</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Food Name"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newFood.description}
              onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Category"
              value={newFood.category}
              onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Calories per 100g"
              type="number"
              value={newFood.caloriesPer100g}
              onChange={(e) => setNewFood({ ...newFood, caloriesPer100g: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
            />
            <TextField
              label="Protein per 100g (g)"
              type="number"
              value={newFood.proteinPer100g}
              onChange={(e) => setNewFood({ ...newFood, proteinPer100g: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Carbs per 100g (g)"
              type="number"
              value={newFood.carbsPer100g}
              onChange={(e) => setNewFood({ ...newFood, carbsPer100g: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Fat per 100g (g)"
              type="number"
              value={newFood.fatPer100g}
              onChange={(e) => setNewFood({ ...newFood, fatPer100g: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFoodOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFood} variant="contained">
            Add Food
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Food Dialog */}
      <Dialog open={logFoodOpen} onClose={() => setLogFoodOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Food: {selectedFood?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Quantity (grams)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Meal Type</InputLabel>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                label="Meal Type"
              >
                <MenuItem value="Breakfast">Breakfast</MenuItem>
                <MenuItem value="Lunch">Lunch</MenuItem>
                <MenuItem value="Dinner">Dinner</MenuItem>
                <MenuItem value="Snack">Snack</MenuItem>
              </Select>
            </FormControl>

            {selectedFood && quantity && (
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nutrition for {quantity}g:
                </Typography>
                {(() => {
                  const nutrition = calculateNutrition(selectedFood, parseFloat(quantity) || 0);
                  return (
                    <>
                      <Typography variant="body2">Calories: {formatNumber(nutrition.calories, 0)}</Typography>
                      <Typography variant="body2">Protein: {formatNumber(nutrition.protein, 2)}g</Typography>
                      <Typography variant="body2">Carbs: {formatNumber(nutrition.carbs, 2)}g</Typography>
                      <Typography variant="body2">Fat: {formatNumber(nutrition.fat, 2)}g</Typography>
                    </>
                  );
                })()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogFoodOpen(false)}>Cancel</Button>
          <Button onClick={handleLogFood} variant="contained">
            Log Food
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkingNutrition;
