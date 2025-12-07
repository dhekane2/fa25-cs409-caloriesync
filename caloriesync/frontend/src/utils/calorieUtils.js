// EER-based daily target using weight, height, age, gender, and goal timeframe
// currentWeight, goalWeight in kg
// timeUnit: "day" | "week" | "month"
// age in years
// gender: "Male" | "Female" (case-insensitive)
// heightCm in cm
export function calculateDailyTargetCalories(
  currentWeight,
  goalWeight,
  timeValue,
  timeUnit,
  age,
  gender,
  heightCm,
) {
  if (
    !currentWeight ||
    !goalWeight ||
    !timeValue ||
    !age ||
    !gender ||
    !heightCm
  ) {
    return 0;
  }

  // Convert timeframe to days
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
      // Fallback: treat unknown unit as "month"
      days = timeValue * 30;
  }

  // Maintenance calories using EER (DRI style)
  const heightM = heightCm / 100;
  const isFemale = String(gender).toLowerCase() === 'female';

  // Low active PA values
  const PA_MALE_LOW_ACTIVE = 1.11;
  const PA_FEMALE_LOW_ACTIVE = 1.12;
  const PA = isFemale ? PA_FEMALE_LOW_ACTIVE : PA_MALE_LOW_ACTIVE;

  let maintenanceEER;

  if (isFemale) {
    // Women: EER = 354 - 6.91*age + PA*(9.36*W + 726*H)
    maintenanceEER =
      354 - 6.91 * age + PA * (9.36 * currentWeight + 726 * heightM);
  } else {
    // Men: EER = 662 - 9.53*age + PA*(15.91*W + 539.6*H)
    maintenanceEER =
      662 - 9.53 * age + PA * (15.91 * currentWeight + 539.6 * heightM);
  }

  // Weight-change calories: 7700 kcal per kg
  const diffKg = currentWeight - goalWeight; // positive = weight loss
  const totalCalChange = diffKg * 7700;
  const dailyChange = totalCalChange / days;

  // Use half of the theoretical daily change to avoid extreme targets
  const adjustedDailyChange = dailyChange / 2;

  // Weight loss: target < maintenance; weight gain: target > maintenance
  const rawTarget = maintenanceEER - adjustedDailyChange;

  // Safety floor: at least 1200 kcal/day
  return Math.max(1200, Math.round(rawTarget));
}
