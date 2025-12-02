const API_BASE_URL = 'http://localhost:4000'; // Your backend URL

export async function logMeal(items, logged_at = null) {
  // Get access token from localStorage (or wherever you store it)
  const accessToken = localStorage.getItem('accessToken'); // Adjust key name based on your auth implementation
  
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  // Transform frontend meal items to backend format
  const requestBody = {
    items: items.map(item => ({
      item_name: item.food_name,  // Backend expects 'item_name'
      quantity: item.quantity,
      calorie_count: item.calories  // Backend expects 'calorie_count'
    })),
    ...(logged_at && { logged_at }) // Include logged_at if provided
  };

  const response = await fetch(`${API_BASE_URL}/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` // Include access token in header
    },
    credentials: 'include', // Important: allows cookies (for refresh token) to be sent
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    // Handle different error statuses
    if (response.status === 401) {
      // Token expired or invalid - might want to try refreshing
      throw new Error('Authentication failed. Please log in again.');
    }
    const errorData = await response.json().catch(() => ({ message: 'Failed to log meal' }));
    throw new Error(errorData.message || 'Failed to log meal');
  }

  return await response.json();
}