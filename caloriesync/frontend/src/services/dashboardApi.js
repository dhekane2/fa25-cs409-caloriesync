const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchProfile() {
  const r = await fetch(`${API_URL}/dashboard/profile`, { headers: authHeaders() });
  if (!r.ok) throw new Error("Failed to fetch profile");
  return await r.json();
}

export async function fetchMonthlyStats(year, month) {
  const r = await fetch(`${API_URL}/dashboard/monthly?year=${year}&month=${month}`, {
    headers: authHeaders()
  });
  if (!r.ok) throw new Error("Failed to fetch month");
  return await r.json();
}

export async function fetchWeeklyStats(startDate) {
  const r = await fetch(`${API_URL}/dashboard/weekly?start_date=${startDate}`, {
    headers: authHeaders()
  });
  if (!r.ok) throw new Error("Failed to fetch week");
  return await r.json();
}
