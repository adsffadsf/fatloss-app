/**
 * @typedef {"cn"|"who"} BmiStandard
 * @typedef {"male"|"female"} Sex
 * @typedef {"sedentary"|"light"|"moderate"|"active"|"very_active"} ActivityLevel
 */

/**
 * @param {number} heightCm
 * @returns {number}
 */
export function heightM(heightCm) {
  return heightCm / 100;
}

/**
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number}
 */
export function calcBmi(weightKg, heightCm) {
  const hm = heightM(heightCm);
  return weightKg / (hm * hm);
}

/**
 * @typedef {Object} BmiCategory
 * @property {"underweight"|"normal"|"overweight"|"obese"} id
 * @property {string} labelZh
 */

/**
 * @param {number} bmi
 * @param {BmiStandard} standard
 * @returns {BmiCategory}
 */
export function bmiCategory(bmi, standard) {
  const under = 18.5;
  const normalUpper = standard === "cn" ? 24.0 : 25.0;
  const overweightUpper = standard === "cn" ? 28.0 : 30.0;

  if (bmi < under) return { id: "underweight", labelZh: "偏瘦" };
  if (bmi < normalUpper) return { id: "normal", labelZh: "正常" };
  if (bmi < overweightUpper) return { id: "overweight", labelZh: "超重" };
  return { id: "obese", labelZh: "肥胖" };
}

/**
 * Mifflin–St Jeor BMR (kcal/day)
 * @param {Sex} sex
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @returns {number}
 */
export function calcBmrMifflin(sex, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/**
 * @param {ActivityLevel} level
 * @returns {number}
 */
export function activityMultiplier(level) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.2;
  }
}

/**
 * @param {number} bmr
 * @param {ActivityLevel} level
 * @returns {number}
 */
export function calcTdee(bmr, level) {
  return bmr * activityMultiplier(level);
}

/**
 * @param {number} n
 * @param {number} digits
 */
export function round(n, digits = 0) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

