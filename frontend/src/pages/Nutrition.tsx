import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
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
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Autocomplete,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Restaurant,
  LocalFireDepartment,
  FitnessCenter,
  Delete,
} from '@mui/icons-material';
import { foodApi, dietLogApi } from '../services/api';
import { Food } from '../types';

interface DietLog {
  id: number;
  foodId: number;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  mealType: string;
}

interface DailySummary {
  date: string;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
  } | null;
  progress: {
    calorieProgress: number;
    proteinProgress: number;
  } | null;
}

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

const Nutrition: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Dialog states
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('grams');
  const [mealType, setMealType] = useState('Breakfast');
  const [searchTerm, setSearchTerm] = useState('');
  const [customFood, setCustomFood] = useState({
    name: '',
    caloriesPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: '',
  });
  const [isCustomFood, setIsCustomFood] = useState(false);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFoods(),
        fetchDietLogs(),
        fetchDailySummary(),
      ]);
    } catch (err) {
      setError('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await foodApi.getAll({ search: searchTerm });
      // Ensure response is always an array
      setFoods(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setFoods([]); // Set empty array on error
    }
  };

  const fetchDietLogs = async () => {
    try {
      const response = await dietLogApi.getDietLogs(selectedDate);
      setDietLogs(response.dietLogs || []);
    } catch (err) {
      console.error('Error fetching diet logs:', err);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await dietLogApi.getDailySummary(selectedDate);
      setDailySummary(response);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
  };

  const handleAddFood = async () => {
    if ((!selectedFood && !isCustomFood) || !quantity) return;

    try {
      let logData;

      if (isCustomFood) {
        // First create the custom food
        const newFood = {
          name: customFood.name,
          description: 'Custom food entry',
          caloriesPer100g: parseFloat(customFood.caloriesPer100g),
          proteinPer100g: parseFloat(customFood.proteinPer100g),
          carbsPer100g: parseFloat(customFood.carbsPer100g),
          fatPer100g: parseFloat(customFood.fatPer100g),
          fiberPer100g: 0,
          category: 'Custom',
        };

        const createdFood = await foodApi.create(newFood);

        logData = {
          foodId: createdFood.id,
          quantity: parseFloat(quantity),
          unit,
          mealType,
          loggedAt: new Date(selectedDate).toISOString(),
        };
      } else {
        logData = {
          foodId: selectedFood!.id,
          quantity: parseFloat(quantity),
          unit,
          mealType,
          loggedAt: new Date(selectedDate).toISOString(),
        };
      }

      await dietLogApi.logFood(logData);
      await fetchData();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log food');
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      await dietLogApi.deleteDietLog(logId);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete log');
    }
  };

  const handleCloseDialog = () => {
    setAddFoodDialogOpen(false);
    setSelectedFood(null);
    setQuantity('100');
    setUnit('grams');
    setMealType('Breakfast');
    setIsCustomFood(false);
    setCustomFood({
      name: '',
      caloriesPer100g: '',
      proteinPer100g: '',
      carbsPer100g: '',
      fatPer100g: '',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress < 50) return 'error';
    if (progress < 80) return 'warning';
    if (progress <= 100) return 'success';
    return 'info';
  };

  const groupLogsByMealType = (logs: DietLog[]) => {
    return logs.reduce((groups, log) => {
      const mealType = log.mealType || 'Other';
      if (!groups[mealType]) {
        groups[mealType] = [];
      }
      groups[mealType].push(log);
      return groups;
    }, {} as Record<string, DietLog[]>);
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

  const groupedLogs = groupLogsByMealType(dietLogs);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nutrition Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your daily food intake and monitor your nutritional goals
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Date Selector and Add Food Button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          type="date"
          label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddFoodDialogOpen(true)}
        >
          Add Food
        </Button>
      </Box>

      {/* Daily Summary */}
      {dailySummary && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Summary - {new Date(selectedDate).toLocaleDateString()}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Calories</Typography>
                    <Typography variant="body2">
                      {Math.round(dailySummary.consumed.calories)} / {dailySummary.goals?.calories || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(dailySummary.progress?.calorieProgress || 0, 100)}
                    color={getProgressColor(dailySummary.progress?.calorieProgress || 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Protein</Typography>
                    <Typography variant="body2">
                      {Math.round(dailySummary.consumed.protein)}g / {dailySummary.goals?.protein || 0}g
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(dailySummary.progress?.proteinProgress || 0, 100)}
                    color={getProgressColor(dailySummary.progress?.proteinProgress || 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <LocalFireDepartment sx={{ fontSize: 32, color: 'white', mb: 1 }} />
                      <Typography variant="h6" color="white">
                        {Math.round(dailySummary.consumed.calories)}
                      </Typography>
                      <Typography variant="body2" color="white">
                        Calories
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <FitnessCenter sx={{ fontSize: 32, color: 'white', mb: 1 }} />
                      <Typography variant="h6" color="white">
                        {Math.round(dailySummary.consumed.protein)}g
                      </Typography>
                      <Typography variant="body2" color="white">
                        Protein
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Meal Logs */}
      <Grid container spacing={3}>
        {(Array.isArray(mealTypes) ? mealTypes : []).map((meal) => (
          <Grid item xs={12} md={6} key={meal}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Restaurant sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {meal}
                </Typography>

                {groupedLogs[meal] && Array.isArray(groupedLogs[meal]) ? (
                  <List dense>
                    {groupedLogs[meal].map((log) => (
                      <ListItem key={log.id} divider>
                        <ListItemText
                          primary={log.foodName}
                          secondary={`${log.quantity}${log.unit} • ${Math.round(log.calories)} cal • ${Math.round(log.protein)}g protein`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteLog(log.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No foods logged for {meal.toLowerCase()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Food Dialog */}
      <Dialog open={addFoodDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Food to Log</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={!isCustomFood ? "contained" : "outlined"}
                onClick={() => setIsCustomFood(false)}
                size="small"
              >
                Search Foods
              </Button>
              <Button
                variant={isCustomFood ? "contained" : "outlined"}
                onClick={() => setIsCustomFood(true)}
                size="small"
              >
                Add Custom Food
              </Button>
            </Box>

            {!isCustomFood ? (
              <Autocomplete
                options={Array.isArray(foods) ? foods : []}
                getOptionLabel={(option) => option.name || ''}
                value={selectedFood}
                onChange={(_, newValue) => setSelectedFood(newValue)}
                onInputChange={(_, newInputValue) => {
                  setSearchTerm(newInputValue);
                  if (newInputValue.length > 2) {
                    fetchFoods();
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for food"
                    fullWidth
                    placeholder="Type to search foods..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.caloriesPer100g} cal/100g • {option.category}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Food Name"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    placeholder="Enter custom food name"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Calories per 100g"
                    type="number"
                    value={customFood.caloriesPer100g}
                    onChange={(e) => setCustomFood({ ...customFood, caloriesPer100g: e.target.value })}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Protein per 100g"
                    type="number"
                    value={customFood.proteinPer100g}
                    onChange={(e) => setCustomFood({ ...customFood, proteinPer100g: e.target.value })}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Carbs per 100g"
                    type="number"
                    value={customFood.carbsPer100g}
                    onChange={(e) => setCustomFood({ ...customFood, carbsPer100g: e.target.value })}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Fat per 100g"
                    type="number"
                    value={customFood.fatPer100g}
                    onChange={(e) => setCustomFood({ ...customFood, fatPer100g: e.target.value })}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {selectedFood && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedFood.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedFood.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${selectedFood.caloriesPer100g} cal/100g`} size="small" />
                <Chip label={`${selectedFood.proteinPer100g}g protein/100g`} size="small" />
                <Chip label={selectedFood.category} size="small" variant="outlined" />
              </Box>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unit}
                  label="Unit"
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <MenuItem value="grams">Grams</MenuItem>
                  <MenuItem value="pieces">Pieces</MenuItem>
                  <MenuItem value="cups">Cups</MenuItem>
                  <MenuItem value="tablespoons">Tablespoons</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={mealType}
                  label="Meal Type"
                  onChange={(e) => setMealType(e.target.value)}
                >
                  {(Array.isArray(mealTypes) ? mealTypes : []).map((meal) => (
                    <MenuItem key={meal} value={meal}>
                      {meal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {((selectedFood && !isCustomFood) || (isCustomFood && customFood.name && customFood.caloriesPer100g)) && quantity && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" color="white" gutterBottom>
                Nutritional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="body2" color="white">
                    Calories: {Math.round((
                      isCustomFood
                        ? parseFloat(customFood.caloriesPer100g)
                        : selectedFood!.caloriesPer100g
                    ) * parseFloat(quantity) / 100)}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="white">
                    Protein: {Math.round((
                      isCustomFood
                        ? parseFloat(customFood.proteinPer100g || '0')
                        : selectedFood!.proteinPer100g
                    ) * parseFloat(quantity) / 100)}g
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="white">
                    Carbs: {Math.round((
                      isCustomFood
                        ? parseFloat(customFood.carbsPer100g || '0')
                        : selectedFood!.carbsPer100g
                    ) * parseFloat(quantity) / 100)}g
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="white">
                    Fat: {Math.round((
                      isCustomFood
                        ? parseFloat(customFood.fatPer100g || '0')
                        : selectedFood!.fatPer100g
                    ) * parseFloat(quantity) / 100)}g
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddFood}
            variant="contained"
            disabled={
              !quantity ||
              (!isCustomFood && !selectedFood) ||
              (isCustomFood && (!customFood.name || !customFood.caloriesPer100g))
            }
          >
            Add to Log
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Nutrition;

