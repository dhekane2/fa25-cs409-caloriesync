export async function mockLogin({ email, password }) {
  await delay(400);

  // Basic field validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Retrieve stored profile from localStorage 
  const stored = localStorage.getItem('cs_profile');
  if (!stored) {
    // No account registered yet
    throw new Error('Account not found. Please sign up first.');
  }

  const profile = JSON.parse(stored);

  // Check if email matches 
  if (
    !profile.email ||
    profile.email.toLowerCase() !== email.toLowerCase()
  ) {
    throw new Error('Email not found. Please check your email or sign up.');
  }

  // Validate password
  if (!profile.password || profile.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  // Passed all checks — issue token 
  localStorage.setItem('cs_token', 'mock-token');
  return {
    token: 'mock-token',
    user: {
      name: profile.name || 'User',
      email: profile.email,
    },
  };
}

// Sign up mock – email & password required, phone optional.
// Also saves the full profile into localStorage so Dashboard can read it.
export async function mockSignUp(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Email & password are still required
      if (!data.email || !data.password) {
        reject(new Error('Email and password are required'));
        return;
      }

      // Build a full name if firstName/lastName are provided
      const fullNameFromParts = [data.firstName, data.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const profileToStore = {
        ...data,
        // Keep compatibility with existing code that uses `name`
        name: data.name || fullNameFromParts || '',
      };

      // Save profile and token to localStorage for Dashboard usage
      localStorage.setItem('cs_profile', JSON.stringify(profileToStore));
      localStorage.setItem('cs_token', 'mock-token');

      resolve({
        success: true,
        user: {
          name: profileToStore.name,
          email: data.email,
          phone: data.phone || null, // may be empty
        },
      });
    }, 400);
  });
}

export function getMockProfile() {
  const stored = localStorage.getItem('cs_profile');
  if (stored) {
    const f = JSON.parse(stored);

    // Prefer explicit name, otherwise fallback to firstName + lastName
    const fullName =
      f.name ||
      [f.firstName, f.lastName].filter(Boolean).join(' ').trim() ||
      'ian';

    const dailyTarget = 2427; // just a mock number; could be recomputed

    return {
      name: fullName,
      email: f.email || 'ian@gmail.com',
      age: parseInt(f.age || '24', 10),
      gender: f.gender || 'Male',
      currentWeight: parseFloat(f.weight || '75'),
      goalWeight: parseFloat(f.goalWeight || '70'),
      goalTimeframe: `${f.goalTimeValue || '4'} ${
        f.goalTimeUnit || 'months'
      }`,
      dailyTarget,
    };
  }

  // Default profile if there is nothing stored yet
  return {
    name: 'ian',
    email: 'ian@gmail.com',
    age: 24,
    gender: 'Male',
    currentWeight: 75,
    goalWeight: 70,
    goalTimeframe: '4 weeks',
    dailyTarget: 1500,
  };
}

// Calendar mock
export function getMockMonthlyCalendar(offset = 0) {
  const today = new Date();
  const targetMonth = new Date(
    today.getFullYear(),
    today.getMonth() + offset,
    1,
  );
  const monthLabel = targetMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    1,
  );
  const lastDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  );
  const startOffset = firstDay.getDay(); // 0=Sun
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const days = [];
  let total = 0;

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() + (i - startOffset));
    const inMonth = d.getMonth() === targetMonth.getMonth();
    const key = d.toISOString().substring(0, 10);
    const day = d.getDate();

    let dayTotal = 0;
    if (inMonth) {
      // Mock number between 1200–2400
      dayTotal = Math.round(1200 + Math.random() * 1200);
      total += dayTotal;
    }

    days.push({ key, day, inMonth, total: dayTotal });
  }

  return { monthLabel, total, days };
}

// Weekly trend mock
export function getMockWeeklyTrend(offsetWeeks = 0) {
  const baseDate = new Date();
  // Move to last Sunday
  baseDate.setDate(baseDate.getDate() - baseDate.getDay());

  const points = [];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i + offsetWeeks * 7);
    const dayLabel = daysShort[d.getDay()];

    const expected = 1800;
    const actual = 1600 + Math.round(Math.random() * 800);

    points.push({
      day: dayLabel,
      actual,
      expected,
    });
  }

  const start = points[0];
  const end = points[6];

  const rangeLabel = `${start.day} – ${end.day} (Current Week)`;
  const accuracy = 63;

  return { rangeLabel, accuracy, points };
}

// Track Calories: today's blank list
export function createEmptyMealListForToday() {
  const today = new Date().toISOString().substring(0, 10);
  return { date: today, items: [] };
}

// Nutritionix search mock
export async function mockSearchFood(query) {
  await delay(300);
  if (!query) return [];
  // Mock 3 sample results
  return [
    {
      id: '1',
      food_name: 'Grilled Chicken Breast',
      nf_calories: 220,
      serving_qty: 1,
      serving_unit: 'serving',
    },
    {
      id: '2',
      food_name: 'Brown Rice',
      nf_calories: 180,
      serving_qty: 1,
      serving_unit: 'cup',
    },
    {
      id: '3',
      food_name: 'Apple',
      nf_calories: 95,
      serving_qty: 1,
      serving_unit: 'medium',
    },
  ];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

