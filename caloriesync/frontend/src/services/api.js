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
