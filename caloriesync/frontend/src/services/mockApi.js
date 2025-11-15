// src/services/mockApi.js

// 簡單以 localStorage / 假資料模擬 API

export async function mockLogin({ email, password }) {
  await delay(400);
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  localStorage.setItem('cs_token', 'mock-token');
  return { token: 'mock-token' };
}

export async function mockSignUp(form) {
  await delay(500);
  localStorage.setItem('cs_profile', JSON.stringify(form));
  localStorage.setItem('cs_token', 'mock-token');
  return { ok: true };
}

export function getMockProfile() {
  const stored = localStorage.getItem('cs_profile');
  if (stored) {
    const f = JSON.parse(stored);
    const dailyTarget = 2427; // just mock; could recompute
    return {
      name: f.name || 'ian',
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

// 月曆 mock
export function getMockMonthlyCalendar(offset = 0) {
  const today = new Date();
  const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const monthLabel = targetMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
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
      // 模擬 1200–2400 之間的數字
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
  baseDate.setDate(baseDate.getDate() - baseDate.getDay()); // 上一個 Sunday

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

// Track Calories：今日的空清單
export function createEmptyMealListForToday() {
  const today = new Date().toISOString().substring(0, 10);
  return { date: today, items: [] };
}

// Nutritionix 搜尋 mock
export async function mockSearchFood(query) {
  await delay(300);
  if (!query) return [];
  // 模擬三個固定結果
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
