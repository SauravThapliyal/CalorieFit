const API_BASE_URL = 'http://localhost:5263';

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's a relative path from the API
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and add the base URL
  return `${API_BASE_URL}/${imagePath}`;
};

export const getExerciseImageUrl = (exercise: any): string => {
  return getImageUrl(exercise?.imageUrl) || '/images/exercises/default.jpg';
};

export const getFoodImageUrl = (food: any): string => {
  return getImageUrl(food?.imageUrl) || '/images/foods/default.jpg';
};
