import apiClient from './apiClient.js';

// Create or replace all meals for a given date.
export async function createOrReplaceMeal(items, logged_at = null) {
  const requestBody = {
    items: items.map((item) => ({
      item_name: item.food_name,
      quantity: item.quantity,
      calorie_count: item.calories,
    })),
    ...(logged_at && { logged_at }),
  };

  try {
    const response = await apiClient.post('/meals', requestBody);
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    const message =
      err.response?.data?.message || err.message || 'Failed to save meal';
    throw new Error(message);
  }
}

// Backwards-compatible name used elsewhere
export async function logMeal(items, logged_at = null) {
  return createOrReplaceMeal(items, logged_at);
}

export async function fetchMealsForDate(dateStr) {
  if (!dateStr) {
    return { date: null, items: [] };
  }

  try {
    const response = await apiClient.get('/meals/by-date', {
      params: { date: dateStr },
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    const message =
      err.response?.data?.message ||
      err.message ||
      'Failed to load meals for date';
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
