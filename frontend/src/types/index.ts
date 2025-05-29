export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  hasProfile: boolean;
  role: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  hasProfile: boolean;
  role: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3
}

export enum ActivityLevel {
  Sedentary = 1,
  LightlyActive = 2,
  ModeratelyActive = 3,
  VeryActive = 4,
  ExtraActive = 5
}

export enum FitnessGoal {
  WeightLoss = 1,
  WeightGain = 2,
  MaintainWeight = 3,
  CustomPlan = 4
}

export interface UserProfile {
  id: number;
  userId: string;
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  targetWeight: number;
  bmi: number;
  bmiCategory: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  recommendation: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserProfileRequest {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  targetWeight: number;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  instructions: string;
  type: string | number;
  location: string | number;
  difficulty: string | number;
  durationMinutes: number;
  caloriesBurnedPerMinute: number;
  imageUrl: string;
  videoUrl: string;
  muscleGroups: string[];
  equipment: string[];
  isActive: boolean;
  createdAt: string;
}

// Food Types
export interface Food {
  id: number;
  name: string;
  description: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  category: string;
  imageUrl: string;
}

export interface CreateFoodRequest {
  name: string;
  description: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  category: string;
  imageUrl?: string;
}

// Diet Log Types
export interface DietLog {
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

export interface CreateDietLogRequest {
  foodId: number;
  quantity: number;
  unit: string;
  loggedAt?: string;
  mealType: string;
}
