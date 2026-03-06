import { FOOD_BY_ID, portionNutrition, foodsForPrefs } from "../data/foods.js";

/**
 * @typedef {"breakfast"|"lunch"|"dinner"|"snack"} MealName
 * @typedef {"protein"|"carb"|"veg"|"fat"|"fruit"|"dairy"} ItemRole
 *
 * @typedef {Object} PlanItem
 * @property {string} foodId
 * @property {string} nameZh
 * @property {number} grams
 * @property {ItemRole} role
 * @property {{kcal:number, proteinG:number, carbsG:number, fatG:number}} nutrition
 *
 * @typedef {Object} MealPlan
 * @property {MealName} mealName
 * @property {string} titleZh
 * @property {PlanItem[]} items
 * @property {{kcal:number, proteinG:number, carbsG:number, fatG:number}} totals
 *
 * @typedef {Object} DayPlan
 * @property {string} seed
 * @property {MealPlan[]} meals
 * @property {{kcal:number, proteinG:number, carbsG:number, fatG:number}} totals
 * @property {string[]} notes
 */

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * @param {number} n
 * @returns {number}
 */
function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * 简单可复现的 RNG（mulberry32）
 * @param {number} seed
 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {string} seedStr
 */
function seedToInt(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @typedef {Object} TemplateItem
 * @property {string} foodId
 * @property {number} grams
 * @property {ItemRole} role
 *
 * @typedef {Object} TemplateMeal
 * @property {MealName} mealName
 * @property {string} titleZh
 * @property {TemplateItem[]} items
 *
 * @typedef {Object} DayTemplate
 * @property {string} id
 * @property {TemplateMeal[]} meals
 */

/** @type {DayTemplate[]} */
const TEMPLATES = [
  {
    id: "t1",
    meals: [
      {
        mealName: "breakfast",
        titleZh: "早餐",
        items: [
          { foodId: "oats_dry", grams: 55, role: "carb" },
          { foodId: "milk_skim", grams: 250, role: "dairy" },
          { foodId: "egg_whole", grams: 120, role: "protein" }, // ~2 eggs
          { foodId: "tomato", grams: 150, role: "veg" },
        ],
      },
      {
        mealName: "lunch",
        titleZh: "午餐",
        items: [
          { foodId: "rice_cooked", grams: 200, role: "carb" },
          { foodId: "chicken_breast", grams: 180, role: "protein" },
          { foodId: "broccoli", grams: 220, role: "veg" },
          { foodId: "olive_oil", grams: 8, role: "fat" },
        ],
      },
      {
        mealName: "snack",
        titleZh: "加餐",
        items: [
          { foodId: "greek_yogurt_0", grams: 220, role: "dairy" },
          { foodId: "apple", grams: 180, role: "fruit" },
        ],
      },
      {
        mealName: "dinner",
        titleZh: "晚餐",
        items: [
          { foodId: "sweet_potato", grams: 250, role: "carb" },
          { foodId: "cod", grams: 200, role: "protein" },
          { foodId: "spinach", grams: 220, role: "veg" },
          { foodId: "olive_oil", grams: 6, role: "fat" },
        ],
      },
    ],
  },
  {
    id: "t2",
    meals: [
      {
        mealName: "breakfast",
        titleZh: "早餐",
        items: [
          { foodId: "egg_white", grams: 220, role: "protein" },
          { foodId: "egg_whole", grams: 60, role: "protein" },
          { foodId: "rice_cooked", grams: 160, role: "carb" },
          { foodId: "cucumber", grams: 200, role: "veg" },
        ],
      },
      {
        mealName: "lunch",
        titleZh: "午餐",
        items: [
          { foodId: "noodles_cooked", grams: 260, role: "carb" },
          { foodId: "shrimp", grams: 200, role: "protein" },
          { foodId: "mushroom", grams: 200, role: "veg" },
          { foodId: "olive_oil", grams: 8, role: "fat" },
        ],
      },
      {
        mealName: "snack",
        titleZh: "加餐",
        items: [
          { foodId: "milk_skim", grams: 300, role: "dairy" },
          { foodId: "banana", grams: 120, role: "fruit" },
        ],
      },
      {
        mealName: "dinner",
        titleZh: "晚餐",
        items: [
          { foodId: "rice_cooked", grams: 200, role: "carb" },
          { foodId: "tofu_firm", grams: 250, role: "protein" },
          { foodId: "mixed_greens", grams: 250, role: "veg" },
          { foodId: "olive_oil", grams: 10, role: "fat" },
        ],
      },
    ],
  },
  {
    id: "t3",
    meals: [
      {
        mealName: "breakfast",
        titleZh: "早餐",
        items: [
          { foodId: "greek_yogurt_0", grams: 260, role: "dairy" },
          { foodId: "oats_dry", grams: 45, role: "carb" },
          { foodId: "orange", grams: 200, role: "fruit" },
        ],
      },
      {
        mealName: "lunch",
        titleZh: "午餐",
        items: [
          { foodId: "sweet_potato", grams: 280, role: "carb" },
          { foodId: "lean_pork", grams: 180, role: "protein" },
          { foodId: "broccoli", grams: 240, role: "veg" },
          { foodId: "olive_oil", grams: 8, role: "fat" },
        ],
      },
      {
        mealName: "snack",
        titleZh: "加餐",
        items: [
          { foodId: "milk_skim", grams: 250, role: "dairy" },
          { foodId: "apple", grams: 160, role: "fruit" },
        ],
      },
      {
        mealName: "dinner",
        titleZh: "晚餐",
        items: [
          { foodId: "rice_cooked", grams: 180, role: "carb" },
          { foodId: "chicken_breast", grams: 180, role: "protein" },
          { foodId: "spinach", grams: 240, role: "veg" },
          { foodId: "olive_oil", grams: 8, role: "fat" },
        ],
      },
    ],
  },
];

/**
 * @param {TemplateItem} ti
 */
function templateItemToPlanItem(ti) {
  const food = FOOD_BY_ID.get(ti.foodId);
  if (!food) throw new Error(`Unknown food in template: ${ti.foodId}`);
  const nutrition = portionNutrition(ti.foodId, ti.grams);
  return {
    foodId: ti.foodId,
    nameZh: food.nameZh,
    grams: ti.grams,
    role: ti.role,
    nutrition,
  };
}

/**
 * @param {PlanItem[]} items
 */
function sumItems(items) {
  return items.reduce(
    (acc, it) => {
      acc.kcal += it.nutrition.kcal;
      acc.proteinG += it.nutrition.proteinG;
      acc.carbsG += it.nutrition.carbsG;
      acc.fatG += it.nutrition.fatG;
      return acc;
    },
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

/**
 * @param {MealPlan[]} meals
 */
function sumMeals(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.kcal += m.totals.kcal;
      acc.proteinG += m.totals.proteinG;
      acc.carbsG += m.totals.carbsG;
      acc.fatG += m.totals.fatG;
      return acc;
    },
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

/**
 * @param {PlanItem} item
 */
function recalcItem(item) {
  item.nutrition = portionNutrition(item.foodId, item.grams);
}

/**
 * @param {MealPlan[]} meals
 */
function recalcMeals(meals) {
  for (const meal of meals) {
    for (const item of meal.items) recalcItem(item);
    meal.totals = sumItems(meal.items);
  }
}

/**
 * @param {DayTemplate} t
 */
function templateToMeals(t) {
  return t.meals.map((m) => {
    const items = m.items.map(templateItemToPlanItem);
    const totals = sumItems(items);
    return { mealName: m.mealName, titleZh: m.titleZh, items, totals };
  });
}

/**
 * @param {MealPlan[]} meals
 * @param {number} factor
 */
function scaleEnergyAdjustable(meals, factor) {
  const scalableRoles = new Set(["carb", "fat"]);
  for (const meal of meals) {
    for (const item of meal.items) {
      if (!scalableRoles.has(item.role)) continue;
      const minG = item.role === "fat" ? 3 : 60;
      const maxG = item.role === "fat" ? 25 : 450;
      item.grams = clamp(round1(item.grams * factor), minG, maxG);
    }
  }
}

/**
 * 计算“固定项”热量（蔬菜/水果/奶制品/蛋白等）与“可调项”(主食+油脂)热量。
 * @param {MealPlan[]} meals
 */
function splitFixedAdjustableKcal(meals) {
  let fixedKcal = 0;
  let adjustableKcal = 0;
  for (const meal of meals) {
    for (const item of meal.items) {
      const kcal = item.nutrition.kcal;
      if (item.role === "carb" || item.role === "fat") adjustableKcal += kcal;
      else fixedKcal += kcal;
    }
  }
  return { fixedKcal, adjustableKcal };
}

/**
 * 找一个“补蛋白友好”的食物（优先鸡胸/蛋清/鳕鱼）。
 * @param {MealPlan[]} meals
 */
function pickProteinBooster(meals) {
  const preferred = ["chicken_breast", "egg_white", "cod", "shrimp", "tofu_firm"];
  for (const id of preferred) {
    for (const meal of meals) {
      const found = meal.items.find((it) => it.foodId === id);
      if (found) return { meal, item: found };
    }
  }
  // fallback: 找任意蛋白项
  for (const meal of meals) {
    const found = meal.items.find((it) => it.role === "protein" || it.role === "dairy");
    if (found) return { meal, item: found };
  }
  return null;
}

/**
 * @param {MealPlan[]} meals
 * @param {number} reduceKcal
 */
function reduceCarbsToOffset(meals, reduceKcal) {
  if (reduceKcal <= 0) return;
  /** @type {PlanItem[]} */
  const carbItems = [];
  for (const meal of meals) {
    for (const item of meal.items) if (item.role === "carb") carbItems.push(item);
  }
  if (carbItems.length === 0) return;

  // 按当前热量从高到低优先减
  carbItems.sort((a, b) => b.nutrition.kcal - a.nutrition.kcal);
  let remaining = reduceKcal;

  for (const item of carbItems) {
    if (remaining <= 0) break;
    const food = FOOD_BY_ID.get(item.foodId);
    if (!food) continue;
    const kcalPerGram = food.kcalPer100g / 100;
    const minG = 60;
    const canReduceG = Math.max(0, item.grams - minG);
    const canReduceKcal = canReduceG * kcalPerGram;
    const takeKcal = Math.min(remaining, canReduceKcal);
    const reduceG = takeKcal / kcalPerGram;
    item.grams = round1(item.grams - reduceG);
    remaining -= takeKcal;
    recalcItem(item);
  }
}

/**
 * @param {Object} args
 * @param {number} args.targetKcal
 * @param {number} args.proteinMinG
 * @param {{nutAllergy:boolean}} args.prefs
 * @param {string} args.seed
 * @returns {DayPlan}
 */
export function generateDayPlan({ targetKcal, proteinMinG, prefs, seed }) {
  const availableFoods = foodsForPrefs(prefs);
  const allowedFoodIds = new Set(availableFoods.map((f) => f.id));

  const seedInt = seedToInt(seed);
  const rand = rng(seedInt);

  // 选模板（确保模板里的食物都可用）
  const candidates = TEMPLATES.filter((t) =>
    t.meals.every((m) => m.items.every((it) => allowedFoodIds.has(it.foodId)))
  );
  if (candidates.length === 0) throw new Error("没有可用模板（可能因为过敏/忌口过滤导致）。");
  const template = candidates[Math.floor(rand() * candidates.length)];

  /** @type {MealPlan[]} */
  const meals = templateToMeals(template);
  /** @type {string[]} */
  const notes = [];

  // Step 1: 先按“可调项”(主食+油)整体缩放到目标热量附近
  const { fixedKcal, adjustableKcal } = splitFixedAdjustableKcal(meals);
  const desiredAdjustable = Math.max(200, targetKcal - fixedKcal);
  const factor = adjustableKcal > 0 ? desiredAdjustable / adjustableKcal : 1;
  scaleEnergyAdjustable(meals, clamp(factor, 0.7, 1.6));
  recalcMeals(meals);

  // Step 2: 若蛋白不足，优先增加“补蛋白友好”项，再用减少主食做热量对冲
  for (let i = 0; i < 6; i++) {
    const totals = sumMeals(meals);
    const proteinGap = proteinMinG - totals.proteinG;
    if (proteinGap <= 0.5) break;

    const booster = pickProteinBooster(meals);
    if (!booster) break;
    const { item } = booster;
    const food = FOOD_BY_ID.get(item.foodId);
    if (!food) break;

    const proteinPerGram = food.proteinPer100g / 100;
    const kcalPerGram = food.kcalPer100g / 100;
    if (proteinPerGram <= 0) break;

    // 增加一点冗余，避免浮点误差；每轮最多加 80g
    const addProteinG = clamp(proteinGap * 1.05, 5, 30);
    const addGrams = clamp(addProteinG / proteinPerGram, 20, 80);
    item.grams = round1(item.grams + addGrams);
    recalcItem(item);

    // 对冲热量：减少部分主食
    const extraKcal = addGrams * kcalPerGram;
    reduceCarbsToOffset(meals, extraKcal * 0.8);
    recalcMeals(meals);
  }

  // Step 3: 微调热量到目标附近（优先调主食）
  for (let i = 0; i < 10; i++) {
    const totals = sumMeals(meals);
    const delta = targetKcal - totals.kcal;
    if (Math.abs(delta) <= 80) break;

    /** @type {PlanItem[]} */
    const carbItems = [];
    for (const meal of meals) for (const item of meal.items) if (item.role === "carb") carbItems.push(item);
    if (carbItems.length === 0) break;

    // 选择热量最高的主食进行调整
    carbItems.sort((a, b) => b.nutrition.kcal - a.nutrition.kcal);
    const item = carbItems[0];
    const food = FOOD_BY_ID.get(item.foodId);
    if (!food) break;
    const kcalPerGram = food.kcalPer100g / 100;

    const adjustG = clamp(delta / kcalPerGram, -80, 80);
    const minG = 60;
    const maxG = 450;
    item.grams = clamp(round1(item.grams + adjustG), minG, maxG);
    recalcItem(item);
    recalcMeals(meals);
  }

  // 备注与输出
  const totals = sumMeals(meals);
  if (totals.proteinG < proteinMinG) notes.push("蛋白可能略低：可优先增加鸡胸/鱼/蛋清，或减少部分主食换蛋白。");
  if (Math.abs(totals.kcal - targetKcal) > 120) notes.push("总热量与目标存在一定偏差：可用“换一份”或手动调整主食克数。");

  // 规范化数字显示
  for (const meal of meals) {
    for (const item of meal.items) {
      item.grams = round1(item.grams);
      item.nutrition = {
        kcal: round1(item.nutrition.kcal),
        proteinG: round1(item.nutrition.proteinG),
        carbsG: round1(item.nutrition.carbsG),
        fatG: round1(item.nutrition.fatG),
      };
    }
    meal.totals = {
      kcal: round1(meal.totals.kcal),
      proteinG: round1(meal.totals.proteinG),
      carbsG: round1(meal.totals.carbsG),
      fatG: round1(meal.totals.fatG),
    };
  }

  return {
    seed,
    meals,
    totals: {
      kcal: round1(totals.kcal),
      proteinG: round1(totals.proteinG),
      carbsG: round1(totals.carbsG),
      fatG: round1(totals.fatG),
    },
    notes,
  };
}

