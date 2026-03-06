import { bmiCategory } from "./metrics.js";

/**
 * @typedef {"cn"|"who"} BmiStandard
 * @typedef {"male"|"female"} Sex
 */

/**
 * @typedef {Object} TargetResult
 * @property {number} targetKcal
 * @property {number} deficitKcal
 * @property {number} deficitPct
 * @property {number} proteinMinG
 * @property {number} proteinTargetG
 * @property {number} proteinMaxG
 * @property {number} referenceWeightKg
 * @property {string[]} notes
 */

/**
 * 用于肥胖/超重用户：用“正常上限BMI对应体重”作为参考体重，避免按高体重把蛋白目标抬得过高。
 * @param {number} heightCm
 * @param {number} weightKg
 * @param {BmiStandard} bmiStandard
 */
export function proteinReferenceWeightKg(heightCm, weightKg, bmiStandard) {
  const hm = heightCm / 100;
  const upperNormalBmi = bmiStandard === "cn" ? 23.9 : 24.9;
  const upperNormalWeight = upperNormalBmi * hm * hm;
  return Math.min(weightKg, upperNormalWeight);
}

/**
 * @param {number} referenceWeightKg
 * @returns {{minG:number,targetG:number,maxG:number}}
 */
export function proteinTargets(referenceWeightKg) {
  const minG = 1.6 * referenceWeightKg;
  const targetG = 1.8 * referenceWeightKg;
  const maxG = 2.2 * referenceWeightKg;
  return { minG, targetG, maxG };
}

/**
 * @param {number} bmi
 * @param {BmiStandard} standard
 * @returns {number} 0.10-0.20
 */
export function deficitPctByBmi(bmi, standard) {
  const cat = bmiCategory(bmi, standard).id;
  if (cat === "underweight") return 0;
  if (cat === "normal") return 0.1;
  if (cat === "overweight") return 0.15;
  return 0.2;
}

/**
 * @param {Sex} sex
 * @returns {number}
 */
export function kcalFloorBySex(sex) {
  return sex === "female" ? 1200 : 1500;
}

/**
 * @param {Object} args
 * @param {Sex} args.sex
 * @param {number} args.bmi
 * @param {BmiStandard} args.bmiStandard
 * @param {number|null} args.tdeeKcal
 * @param {number} args.heightCm
 * @param {number} args.weightKg
 * @returns {TargetResult}
 */
export function computeTargets({ sex, bmi, bmiStandard, tdeeKcal, heightCm, weightKg }) {
  /** @type {string[]} */
  const notes = [];

  const referenceWeightKg = proteinReferenceWeightKg(heightCm, weightKg, bmiStandard);
  const { minG, targetG, maxG } = proteinTargets(referenceWeightKg);

  const deficitPct = deficitPctByBmi(bmi, bmiStandard);
  const kcalFloor = kcalFloorBySex(sex);

  // 缺少TDEE时给一个保守默认值（仅用于“能生成”，并提示补全信息）
  // 经验上：正常活动成年人维持热量约 25–33 kcal/kg
  const tdeeFallback = weightKg * 28;
  if (tdeeKcal === null) notes.push("未提供年龄或活动水平：TDEE 使用保守估算，建议补全信息以更准确。");
  const tdee = tdeeKcal ?? tdeeFallback;

  // 绝对缺口上限：500–750（按BMI偏高时允许更接近750）
  const absCap = bmiCategory(bmi, bmiStandard).id === "obese" ? 750 : 500;
  const rawDeficit = tdee * deficitPct;
  const deficitKcal = Math.min(rawDeficit, absCap);

  let targetKcal = tdee - deficitKcal;

  if (bmiCategory(bmi, bmiStandard).id === "underweight") {
    notes.push("当前BMI偏瘦：不建议继续减脂；此处默认按维持热量输出（不做热量缺口）。");
    targetKcal = tdee;
  }

  if (targetKcal < kcalFloor) {
    notes.push(`目标热量触及下限护栏：按${sex === "female" ? "女性1200" : "男性1500"} kcal/day下限输出。`);
    targetKcal = kcalFloor;
  }

  // 防止极端：不让目标热量低于TDEE的75%（除非触及下限护栏）
  const pctFloor = tdee * 0.75;
  if (targetKcal < pctFloor && targetKcal > kcalFloor) {
    notes.push("为避免过激热量缺口：目标热量按TDEE的75%下限做了保护。");
    targetKcal = pctFloor;
  }

  return {
    targetKcal,
    deficitKcal: Math.max(0, tdee - targetKcal),
    deficitPct: tdee > 0 ? (tdee - targetKcal) / tdee : 0,
    proteinMinG: minG,
    proteinTargetG: targetG,
    proteinMaxG: maxG,
    referenceWeightKg,
    notes,
  };
}

