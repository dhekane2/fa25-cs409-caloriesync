import apiClient from "./apiClient";

export async function fetchProfile() {
  const res = await apiClient.get('/dashboard/profile');
  return res.data;
}

export async function updateProfile(profilePayload) {
  const res = await apiClient.patch('/dashboard/profile', profilePayload);
  return res.data;
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
