import { parseUserProfileFromForm, safeLoadUserProfile } from "./lib/models.js";
import { bmiCategory, calcBmi, calcBmrMifflin, calcTdee, round } from "./lib/metrics.js";
import { computeTargets } from "./lib/targets.js";
import { generateDayPlan } from "./lib/planner.js";

const STORAGE_KEY = "fatloss_profile_v1";

/** @type {import("./lib/models.js").UserProfile|null} */
let currentProfile = null;
/** @type {any} */
let currentComputed = null;
let shuffleCounter = 0;

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch {
    // ignore
  }
}

registerServiceWorker();

const form = /** @type {HTMLFormElement} */ (document.getElementById("profileForm"));
const errorsEl = /** @type {HTMLDivElement} */ (document.getElementById("formErrors"));
const resultCard = /** @type {HTMLElement} */ (document.getElementById("resultCard"));
const resultSummary = /** @type {HTMLDivElement} */ (document.getElementById("resultSummary"));
const planView = /** @type {HTMLDivElement} */ (document.getElementById("planView"));

const btnShuffle = /** @type {HTMLButtonElement} */ (document.getElementById("btnShuffle"));
const btnCopy = /** @type {HTMLButtonElement} */ (document.getElementById("btnCopy"));
const btnExport = /** @type {HTMLButtonElement} */ (document.getElementById("btnExport"));

function setErrors(messages) {
  if (!messages || messages.length === 0) {
    errorsEl.classList.remove("errors--show");
    errorsEl.innerHTML = "";
    return;
  }
  errorsEl.classList.add("errors--show");
  errorsEl.innerHTML = `<div><strong>请修正以下问题：</strong></div><ul>${messages
    .map((m) => `<li>${escapeHtml(m)}</li>`)
    .join("")}</ul>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pill(text, variant = "ok") {
  const cls = variant === "warn" ? "pill pill--warn" : variant === "danger" ? "pill pill--danger" : "pill pill--ok";
  return `<div class="${cls}">${text}</div>`;
}

function formatPct(n) {
  return `${Math.round(n * 100)}%`;
}

function formatKcal(n) {
  return `${Math.round(n)} kcal`;
}

function formatG(n) {
  return `${Math.round(n)} g`;
}

function loadProfileIntoForm(profile) {
  const set = (name, value) => {
    const el = /** @type {HTMLInputElement|HTMLSelectElement|null} */ (form.elements.namedItem(name));
    if (!el) return;
    el.value = value;
  };

  set("heightCm", String(profile.heightCm));
  set("weightKg", String(profile.weightKg));
  set("sex", profile.sex);
  set("age", profile.age === null ? "" : String(profile.age));
  set("activityLevel", profile.activityLevel === null ? "" : profile.activityLevel);
  set("bmiStandard", profile.bmiStandard);
  const nut = /** @type {HTMLInputElement|null} */ (form.elements.namedItem("nutAllergy"));
  if (nut) nut.checked = Boolean(profile.nutAllergy);
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

function tryLoadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return safeLoadUserProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

function computeAll(profile) {
  const bmi = calcBmi(profile.weightKg, profile.heightCm);
  const bmiCat = bmiCategory(bmi, profile.bmiStandard);

  const hasBmrInputs = profile.age !== null;
  const hasTdeeInputs = profile.age !== null && profile.activityLevel !== null;

  const bmr = hasBmrInputs ? calcBmrMifflin(profile.sex, profile.weightKg, profile.heightCm, profile.age) : null;
  const tdee = hasTdeeInputs ? calcTdee(/** @type {number} */ (bmr), /** @type {any} */ (profile.activityLevel)) : null;

  const targets = computeTargets({
    sex: profile.sex,
    bmi,
    bmiStandard: profile.bmiStandard,
    tdeeKcal: tdee,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
  });

  return { bmi, bmiCat, bmr, tdee, targets };
}

function buildSeed(profile, computed) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return [
    `${y}-${m}-${d}`,
    profile.sex,
    profile.heightCm,
    profile.weightKg,
    profile.age ?? "na",
    profile.activityLevel ?? "na",
    profile.bmiStandard,
    profile.nutAllergy ? "nutFree" : "noNutFilter",
    shuffleCounter,
    Math.round(computed.targets.targetKcal),
  ].join("|");
}

function render(profile, computed, dayPlan) {
  const { bmi, bmiCat, bmr, tdee, targets } = computed;

  const bmiVariant = bmiCat.id === "normal" ? "ok" : bmiCat.id === "underweight" ? "warn" : "danger";
  const hasTdee = tdee !== null;

  const summaryHtml = [
    pill(`BMI：<strong>${round(bmi, 1)}</strong>（${escapeHtml(bmiCat.labelZh)}；口径：${profile.bmiStandard === "cn" ? "中国" : "WHO"}）`, bmiVariant),
    pill(`目标热量：<strong>${formatKcal(targets.targetKcal)}</strong>（缺口 ${formatKcal(targets.deficitKcal)} / ${formatPct(targets.deficitPct)}）`),
    pill(`蛋白：<strong>${formatG(targets.proteinTargetG)}</strong>（范围 ${formatG(targets.proteinMinG)}–${formatG(targets.proteinMaxG)}；参考体重 ${round(targets.referenceWeightKg, 1)}kg）`),
    pill(`TDEE：<strong>${hasTdee ? formatKcal(tdee) : "未提供足够信息"}</strong>${hasTdee ? "" : "（当前为保守估算）"}`, hasTdee ? "ok" : "warn"),
    pill(`BMR：<strong>${bmr !== null ? formatKcal(bmr) : "未提供年龄"}</strong>`, bmr !== null ? "ok" : "warn"),
  ].join("");

  const notes = [...targets.notes, ...dayPlan.notes];
  const notesHtml =
    notes.length > 0
      ? `<div class="meal" style="border-style:dashed"><div class="meal__header"><div class="meal__name">提示</div></div><ul style="margin:6px 0 0 18px;color:rgba(168,178,209,.95);line-height:1.45">${notes
          .map((n) => `<li>${escapeHtml(n)}</li>`)
          .join("")}</ul></div>`
      : "";

  const mealsHtml = dayPlan.meals
    .map((meal) => {
      const rows = meal.items
        .map(
          (it) =>
            `<tr><td>${escapeHtml(it.nameZh)}</td><td>${Math.round(it.grams)} g</td><td style="text-align:right">${Math.round(
              it.nutrition.kcal
            )}</td></tr>`
        )
        .join("");
      return `<div class="meal">
        <div class="meal__header">
          <div class="meal__name">${escapeHtml(meal.titleZh)}</div>
          <div class="meal__kcal">${formatKcal(meal.totals.kcal)}（P ${formatG(meal.totals.proteinG)} / C ${formatG(
        meal.totals.carbsG
      )} / F ${formatG(meal.totals.fatG)}）</div>
        </div>
        <table class="table">
          <thead><tr><th>食物</th><th>重量</th><th style="text-align:right">热量(kcal)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("");

  const dayTotalHtml = `<div class="meal">
      <div class="meal__header">
        <div class="meal__name">全天汇总</div>
        <div class="meal__kcal"><strong>${formatKcal(dayPlan.totals.kcal)}</strong>（P ${formatG(dayPlan.totals.proteinG)} / C ${formatG(
    dayPlan.totals.carbsG
  )} / F ${formatG(dayPlan.totals.fatG)}）</div>
      </div>
      <div style="color:rgba(168,178,209,.92);font-size:13px;line-height:1.5">
        建议：优先保证蛋白与蔬菜；总热量若偏差较大，可先调主食克数（米饭/面/红薯/燕麦），再微调油脂。
      </div>
    </div>`;

  resultSummary.innerHTML = summaryHtml;
  planView.innerHTML = `${notesHtml}${mealsHtml}${dayTotalHtml}`;

  resultCard.classList.remove("card--hidden");
  btnShuffle.disabled = false;
  btnCopy.disabled = false;
  btnExport.disabled = false;
}

function buildCopyText(profile, computed, dayPlan) {
  const { bmi, bmiCat, targets, tdee } = computed;
  const lines = [];
  lines.push("【减脂系统｜今日菜单】");
  lines.push(`身高/体重：${profile.heightCm}cm / ${profile.weightKg}kg；性别：${profile.sex === "male" ? "男" : "女"}`);
  if (profile.age !== null) lines.push(`年龄：${profile.age}`);
  if (profile.activityLevel) lines.push(`活动水平：${profile.activityLevel}`);
  lines.push(`BMI：${round(bmi, 1)}（${bmiCat.labelZh}；口径：${profile.bmiStandard === "cn" ? "中国" : "WHO"}）`);
  lines.push(`目标热量：${Math.round(targets.targetKcal)} kcal/day；蛋白目标：${Math.round(targets.proteinTargetG)} g/day`);
  lines.push(`TDEE：${tdee !== null ? Math.round(tdee) + " kcal/day" : "未提供足够信息（当前为保守估算）"}`);
  lines.push("");
  for (const meal of dayPlan.meals) {
    lines.push(`- ${meal.titleZh}（${Math.round(meal.totals.kcal)} kcal）`);
    for (const it of meal.items) lines.push(`  - ${it.nameZh} ${Math.round(it.grams)}g（${Math.round(it.nutrition.kcal)} kcal）`);
  }
  lines.push("");
  lines.push(`全天：${Math.round(dayPlan.totals.kcal)} kcal（P ${Math.round(dayPlan.totals.proteinG)}g / C ${Math.round(
    dayPlan.totals.carbsG
  )}g / F ${Math.round(dayPlan.totals.fatG)}g）`);
  const notes = [...computed.targets.notes, ...dayPlan.notes];
  if (notes.length > 0) {
    lines.push("");
    lines.push("提示：");
    for (const n of notes) lines.push(`- ${n}`);
  }
  return lines.join("\n");
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function generateAndRender(profile) {
  const computed = computeAll(profile);
  const seed = buildSeed(profile, computed);
  const dayPlan = generateDayPlan({
    targetKcal: computed.targets.targetKcal,
    proteinMinG: computed.targets.proteinMinG,
    prefs: { nutAllergy: profile.nutAllergy },
    seed,
  });

  currentProfile = profile;
  currentComputed = { ...computed, seed, dayPlan };
  render(profile, computed, dayPlan);
}

// init: load from localStorage
const saved = tryLoadProfile();
if (saved) {
  loadProfileIntoForm(saved);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const parsed = parseUserProfileFromForm(fd);
  if (!parsed.ok || !parsed.value) {
    setErrors(parsed.issues.map((i) => i.message));
    return;
  }
  setErrors([]);
  shuffleCounter = 0;
  saveProfile(parsed.value);
  generateAndRender(parsed.value);
});

btnShuffle.addEventListener("click", () => {
  if (!currentProfile) return;
  shuffleCounter += 1;
  saveProfile(currentProfile);
  generateAndRender(currentProfile);
});

btnCopy.addEventListener("click", async () => {
  if (!currentComputed || !currentProfile) return;
  const text = buildCopyText(currentProfile, currentComputed, currentComputed.dayPlan);
  try {
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = "已复制";
    setTimeout(() => (btnCopy.textContent = "复制"), 900);
  } catch {
    // fallback: prompt
    window.prompt("复制以下文本：", text);
  }
});

btnExport.addEventListener("click", () => {
  if (!currentComputed || !currentProfile) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  downloadJson(`fatloss_plan_${y}${m}${d}.json`, {
    profile: currentProfile,
    computed: {
      bmi: currentComputed.bmi,
      bmiCategory: currentComputed.bmiCat,
      bmr: currentComputed.bmr,
      tdee: currentComputed.tdee,
      targets: currentComputed.targets,
    },
    dayPlan: currentComputed.dayPlan,
  });
});

