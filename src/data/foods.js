/**
 * 食物数据为常见近似值（每100g）。不同品牌/烹饪方式会有差异，系统以“可执行的日常规划”为目标。
 */

/**
 * @typedef {"protein"|"carb"|"veg"|"fruit"|"dairy"|"fat"} FoodCategory
 *
 * @typedef {Object} NutritionFood
 * @property {string} id
 * @property {string} nameZh
 * @property {FoodCategory} category
 * @property {number} kcalPer100g
 * @property {number} proteinPer100g
 * @property {number} carbsPer100g
 * @property {number} fatPer100g
 * @property {string[]} [tags]
 * @property {string[]} [allergens]
 */

/** @type {NutritionFood[]} */
export const FOODS = [
  // carbs
  { id: "rice_cooked", nameZh: "米饭（熟）", category: "carb", kcalPer100g: 116, proteinPer100g: 2.6, carbsPer100g: 25.9, fatPer100g: 0.3 },
  { id: "oats_dry", nameZh: "燕麦（干）", category: "carb", kcalPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9 },
  { id: "noodles_cooked", nameZh: "面条（熟）", category: "carb", kcalPer100g: 138, proteinPer100g: 4.5, carbsPer100g: 25.1, fatPer100g: 1.1 },
  { id: "sweet_potato", nameZh: "红薯（熟）", category: "carb", kcalPer100g: 90, proteinPer100g: 1.6, carbsPer100g: 20.7, fatPer100g: 0.1 },

  // proteins
  { id: "chicken_breast", nameZh: "鸡胸肉（熟）", category: "protein", kcalPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0.0, fatPer100g: 3.6 },
  { id: "egg_whole", nameZh: "鸡蛋（全蛋）", category: "protein", kcalPer100g: 143, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5 },
  { id: "egg_white", nameZh: "蛋清", category: "protein", kcalPer100g: 52, proteinPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2 },
  { id: "lean_pork", nameZh: "瘦猪肉（熟）", category: "protein", kcalPer100g: 195, proteinPer100g: 29.0, carbsPer100g: 0.0, fatPer100g: 7.5 },
  { id: "lean_beef", nameZh: "瘦牛肉（熟）", category: "protein", kcalPer100g: 217, proteinPer100g: 26.0, carbsPer100g: 0.0, fatPer100g: 11.8 },
  { id: "cod", nameZh: "鳕鱼（熟）", category: "protein", kcalPer100g: 105, proteinPer100g: 23.0, carbsPer100g: 0.0, fatPer100g: 0.9 },
  { id: "salmon", nameZh: "三文鱼（熟）", category: "protein", kcalPer100g: 206, proteinPer100g: 22.1, carbsPer100g: 0.0, fatPer100g: 12.4 },
  { id: "shrimp", nameZh: "虾仁（熟）", category: "protein", kcalPer100g: 99, proteinPer100g: 24.0, carbsPer100g: 0.2, fatPer100g: 0.3, allergens: ["shellfish"] },
  { id: "tofu_firm", nameZh: "北豆腐/老豆腐", category: "protein", kcalPer100g: 76, proteinPer100g: 8.1, carbsPer100g: 1.9, fatPer100g: 4.8, tags: ["soy"], allergens: ["soy"] },

  // veg
  { id: "broccoli", nameZh: "西兰花", category: "veg", kcalPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7.2, fatPer100g: 0.4 },
  { id: "spinach", nameZh: "菠菜", category: "veg", kcalPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { id: "cucumber", nameZh: "黄瓜", category: "veg", kcalPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { id: "tomato", nameZh: "番茄", category: "veg", kcalPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { id: "mushroom", nameZh: "蘑菇", category: "veg", kcalPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { id: "mixed_greens", nameZh: "生菜/混合沙拉菜", category: "veg", kcalPer100g: 17, proteinPer100g: 1.4, carbsPer100g: 3.3, fatPer100g: 0.2 },

  // fruit
  { id: "apple", nameZh: "苹果", category: "fruit", kcalPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2 },
  { id: "banana", nameZh: "香蕉", category: "fruit", kcalPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3 },
  { id: "orange", nameZh: "橙子", category: "fruit", kcalPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 11.8, fatPer100g: 0.1 },

  // dairy
  { id: "greek_yogurt_0", nameZh: "无糖高蛋白酸奶（0脂）", category: "dairy", kcalPer100g: 59, proteinPer100g: 10.3, carbsPer100g: 3.6, fatPer100g: 0.4, allergens: ["milk"] },
  { id: "milk_skim", nameZh: "脱脂牛奶", category: "dairy", kcalPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5.0, fatPer100g: 0.1, allergens: ["milk"] },

  // fats
  { id: "olive_oil", nameZh: "橄榄油", category: "fat", kcalPer100g: 884, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0 },
];

/** @type {Map<string, NutritionFood>} */
export const FOOD_BY_ID = new Map(FOODS.map((f) => [f.id, f]));

/**
 * @typedef {Object} FoodPortion
 * @property {string} foodId
 * @property {number} grams
 */

/**
 * @param {string} foodId
 * @param {number} grams
 */
export function portionNutrition(foodId, grams) {
  const food = FOOD_BY_ID.get(foodId);
  if (!food) throw new Error(`Unknown foodId: ${foodId}`);
  const factor = grams / 100;
  return {
    kcal: food.kcalPer100g * factor,
    proteinG: food.proteinPer100g * factor,
    carbsG: food.carbsPer100g * factor,
    fatG: food.fatPer100g * factor,
  };
}

/**
 * @param {{nutAllergy:boolean}} prefs
 * @returns {NutritionFood[]}
 */
export function foodsForPrefs(prefs) {
  if (!prefs.nutAllergy) return FOODS;
  // 当前食物库不包含坚果/花生条目；保留过滤口以便未来扩展。
  return FOODS.filter((f) => !(f.tags || []).includes("nut") && !((f.allergens || []).includes("nuts") || (f.allergens || []).includes("peanut")));
}

