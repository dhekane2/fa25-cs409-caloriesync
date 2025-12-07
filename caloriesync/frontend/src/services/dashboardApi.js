const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchProfile() {
  const r = await fetch(`${API_URL}/dashboard/profile`, {
    credentials: "include"
  });
  if (!r.ok) throw new Error("Failed to fetch profile");
  return await r.json();
}

export async function fetchMonthlyStats() {
  const r = await fetch(`${API_URL}/dashboard/monthly`, {
    credentials: "include"
  });
  if (!r.ok) throw new Error("Failed to fetch month");
  return await r.json();
}

export async function fetchWeeklyStats() {
  const r = await fetch(`${API_URL}/dashboard/weekly`, {
    credentials: "include"
  });
  if (!r.ok) throw new Error("Failed to fetch week");
  return await r.json();
}
