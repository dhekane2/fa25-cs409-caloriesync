import apiClient from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchProfile() {

  const res = await apiClient.get('/dashboard/profile');    
  return await res.data;
  
}

export async function fetchMonthlyStats(year, month) {
  const res = await apiClient.get('/dashboard/monthly', {
      params: {
        year: String(year),
        month: String(month).padStart(2, '0'),
      },
  });
  return res.data;
}

export async function fetchWeeklyStats(startDate) {
  const res = await apiClient.get('/dashboard/weekly', {
    params: { start_date: startDate },
  });
  return res.data;
}
