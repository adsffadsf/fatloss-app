/**
 * @typedef {"male"|"female"} Sex
 * @typedef {"cn"|"who"} BmiStandard
 * @typedef {"sedentary"|"light"|"moderate"|"active"|"very_active"} ActivityLevel
 *
 * @typedef {Object} UserProfile
 * @property {number} heightCm
 * @property {number} weightKg
 * @property {Sex} sex
 * @property {number|null} age
 * @property {ActivityLevel|null} activityLevel
 * @property {BmiStandard} bmiStandard
 * @property {boolean} nutAllergy
 *
 * @typedef {Object} ValidationIssue
 * @property {string} field
 * @property {string} message
 *
 * @typedef {Object} ParseResult
 * @property {boolean} ok
 * @property {UserProfile|null} value
 * @property {ValidationIssue[]} issues
 */

/**
 * @param {unknown} v
 * @returns {number|null}
 */
function toNumberOrNull(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t.length === 0) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function inRange(n, min, max) {
  return n >= min && n <= max;
}

/**
 * @param {FormData} formData
 * @returns {ParseResult}
 */
export function parseUserProfileFromForm(formData) {
  /** @type {ValidationIssue[]} */
  const issues = [];

  const heightCm = toNumberOrNull(formData.get("heightCm"));
  const weightKg = toNumberOrNull(formData.get("weightKg"));
  const sex = String(formData.get("sex") ?? "").trim();
  const ageRaw = toNumberOrNull(formData.get("age"));
  const activityLevelRaw = String(formData.get("activityLevel") ?? "").trim();
  const bmiStandard = String(formData.get("bmiStandard") ?? "cn").trim();
  const nutAllergy = formData.get("nutAllergy") === "on";

  if (heightCm === null || !inRange(heightCm, 120, 230)) {
    issues.push({ field: "heightCm", message: "身高请填写 120–230 cm 的数字。" });
  }
  if (weightKg === null || !inRange(weightKg, 30, 250)) {
    issues.push({ field: "weightKg", message: "体重请填写 30–250 kg 的数字。" });
  }
  if (sex !== "male" && sex !== "female") {
    issues.push({ field: "sex", message: "性别请选择“男/女”。" });
  }

  let age = null;
  if (ageRaw !== null) {
    if (!Number.isInteger(ageRaw) || !inRange(ageRaw, 13, 90)) {
      issues.push({ field: "age", message: "年龄如填写，请填写 13–90 的整数。" });
    } else {
      age = ageRaw;
    }
  }

  /** @type {ActivityLevel|null} */
  let activityLevel = null;
  if (activityLevelRaw.length > 0) {
    if (
      activityLevelRaw !== "sedentary" &&
      activityLevelRaw !== "light" &&
      activityLevelRaw !== "moderate" &&
      activityLevelRaw !== "active" &&
      activityLevelRaw !== "very_active"
    ) {
      issues.push({
        field: "activityLevel",
        message: "活动水平值不合法，请重新选择。",
      });
    } else {
      activityLevel = /** @type {ActivityLevel} */ (activityLevelRaw);
    }
  }

  if (bmiStandard !== "cn" && bmiStandard !== "who") {
    issues.push({ field: "bmiStandard", message: "BMI 口径值不合法，请重新选择。" });
  }

  if (issues.length > 0) {
    return { ok: false, value: null, issues };
  }

  /** @type {UserProfile} */
  const profile = {
    heightCm: /** @type {number} */ (heightCm),
    weightKg: /** @type {number} */ (weightKg),
    sex: /** @type {"male"|"female"} */ (sex),
    age,
    activityLevel,
    bmiStandard: /** @type {"cn"|"who"} */ (bmiStandard),
    nutAllergy,
  };

  return { ok: true, value: profile, issues: [] };
}

/**
 * @param {unknown} raw
 * @returns {UserProfile|null}
 */
export function safeLoadUserProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const r = /** @type {any} */ (raw);

  const heightCm = toNumberOrNull(r.heightCm);
  const weightKg = toNumberOrNull(r.weightKg);
  const sex = String(r.sex ?? "").trim();
  const age = toNumberOrNull(r.age);
  const activityLevel = String(r.activityLevel ?? "").trim();
  const bmiStandard = String(r.bmiStandard ?? "cn").trim();
  const nutAllergy = Boolean(r.nutAllergy);

  if (heightCm === null || !inRange(heightCm, 120, 230)) return null;
  if (weightKg === null || !inRange(weightKg, 30, 250)) return null;
  if (sex !== "male" && sex !== "female") return null;
  if (bmiStandard !== "cn" && bmiStandard !== "who") return null;

  /** @type {number|null} */
  let ageNorm = null;
  if (age !== null && Number.isInteger(age) && inRange(age, 13, 90)) ageNorm = age;

  /** @type {ActivityLevel|null} */
  let activityNorm = null;
  if (
    activityLevel === "sedentary" ||
    activityLevel === "light" ||
    activityLevel === "moderate" ||
    activityLevel === "active" ||
    activityLevel === "very_active"
  ) {
    activityNorm = activityLevel;
  }

  return {
    heightCm,
    weightKg,
    sex,
    age: ageNorm,
    activityLevel: activityNorm,
    bmiStandard,
    nutAllergy,
  };
}

