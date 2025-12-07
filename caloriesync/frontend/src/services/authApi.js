const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",   // 👈 THIS IS THE FIX
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const msg = await res.json();
    throw new Error(msg.message || "Login failed");
  }

  return await res.json();
}
