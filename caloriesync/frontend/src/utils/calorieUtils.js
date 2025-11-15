// 粗略版：用體重差 * 7700 / 天數 + 基礎維持熱量估計
export function calculateDailyTargetCalories(
  currentWeight,
  goalWeight,
  timeValue,
  timeUnit,
  age,
  gender,
) {
  if (!currentWeight || !goalWeight || !timeValue) return 0;

  let days = timeValue;
  switch (timeUnit) {
    case 'day':
      days = timeValue;
      break;
    case 'week':
      days = timeValue * 7;
      break;
    case 'month':
      days = timeValue * 30;
      break;
    default:
      days = timeValue * 30;
  }

  const diffKg = currentWeight - goalWeight; // 正值=減重
  const totalCalChange = diffKg * 7700;
  const dailyChange = totalCalChange / days;

  // 非嚴格 BMR，只是粗略計算
  const base = gender === 'female' ? 1400 : 1600;
  const ageAdj = age > 30 ? (age - 30) * 5 : 0;

  const target = base - ageAdj - dailyChange / 2;
  return Math.max(1200, Math.round(target));
}
