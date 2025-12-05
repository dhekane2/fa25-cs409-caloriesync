import apiClient from './apiClient.js';

export async function logMeal(items, logged_at = null) {
  // Transform frontend meal items to backend format
  const requestBody = {
    items: items.map((item) => ({
      item_name: item.food_name, // Backend expects 'item_name'
      quantity: item.quantity,
      calorie_count: item.calories, // Backend expects 'calorie_count'
    })),
    ...(logged_at && { logged_at }), // Include logged_at if provided
  };

  try {
    const response = await apiClient.post('/meals', requestBody);
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // Even after refresh, we are unauthorized -> need to log in again
      throw new Error('Authentication failed. Please log in again.');
    }
    const message =
      err.response?.data?.message ||
      err.message ||
      'Failed to log meal';
    throw new Error(message);
  }
}

export async function searchUSDAFood(query) {
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const response = await apiClient.get('/meals/usda_search', {
      params: { query: query.trim() }
    });

    // Backend returns { message: 'FOUND', data: [...] } or { message: 'NOT_FOUND', data: null }
    if (response.data?.message === 'FOUND' && Array.isArray(response.data.data)) {
      // Transform backend format to frontend format
      return response.data.data.map((food) => ({
        id: food.fdcId?.toString() || `usda-${Date.now()}-${Math.random()}`,
        food_name: food.description || 'Unknown Food',
        nf_calories: food.calories || 0,
        nf_protein: food.protein || 0,
        nf_total_fat: food.fat || 0,
        nf_total_carbohydrate: food.carbs || 0,
        serving_qty: food.serving_size || 1,
        serving_unit: food.serving_size_unit || 'serving',
      }));
    }

    return [];
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    const message =
      err.response?.data?.message ||
      err.message ||
      'Failed to search for food';
    throw new Error(message);
  }
}