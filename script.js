"use strict";

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
const STORAGE_KEY = "athleteiq_state_v1";
const NIGHT_RISK_HOUR = 21;
const MAX_LOGS = 24;
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/healthy+food+near+me";

const DEFAULT_SETTINGS = {
  displayName: "Apex User",
  goal: "muscle",
  diet: "bulk",
  fitnessGoal: "strength",
  activityLevel: "moderate",
  equipment: "dumbbells",
  age: 25,
  heightCm: 170,
  weightKg: 70,
  workoutMinutes: 45,
  stepGoal: 8000,
  waterTarget: 8,
  healthyTarget: 3
};

function createInitialState() {
  return {
    junk_count: 0,
    healthy_count: 0,
    skip_count: 0,
    water_count: 0,
    workout_count: 0,
    steps_count: 4200,
    timestamps: [],
    logs: [],
    streakDates: [],
    settings: { ...DEFAULT_SETTINGS },
    savedDate: new Date().toDateString()
  };
}

let appState = createInitialState();
let elements = {};
let activeDiet = "bulk";
let activeWorkoutDay = "mon";
let currentMealIdea = "";

const optionSets = {
  goal: [
    ["energy", "Stable energy"],
    ["weight", "Weight mindful"],
    ["muscle", "Bulk and strength"],
    ["balanced", "Balanced eating"]
  ],
  diet: [
    ["bulk", "Bulking"],
    ["cut", "Cutting"],
    ["maintain", "Maintain"],
    ["keto", "Keto"]
  ],
  fitnessGoal: [
    ["mobility", "Mobility"],
    ["fat-loss", "Fat loss"],
    ["strength", "Strength"],
    ["endurance", "Endurance"],
    ["muscle", "Muscle gain"]
  ],
  activityLevel: [
    ["low", "Mostly seated"],
    ["moderate", "Moderately active"],
    ["high", "Very active"]
  ],
  equipment: [
    ["none", "No equipment"],
    ["dumbbells", "Dumbbells"],
    ["gym", "Gym access"]
  ]
};

const workoutData = {
  mon: {
    label: "Mon - Chest",
    focus: "Chest + HIIT",
    exercises: [
      ["Bench Press", "strength", "4 x 8", "80kg", "90s"],
      ["Incline DB Press", "strength", "3 x 10", "28kg", "75s"],
      ["Cable Flyes", "strength", "3 x 12", "15kg", "60s"],
      ["Treadmill Intervals", "cardio", "20 min", "1:1", "active"]
    ]
  },
  tue: {
    label: "Tue - Back",
    focus: "Pull Strength",
    exercises: [
      ["Deadlift", "strength", "4 x 6", "120kg", "120s"],
      ["Pull-Ups", "strength", "4 x 8", "BW+10", "90s"],
      ["Seated Row", "strength", "3 x 12", "60kg", "75s"],
      ["Rowing Machine", "cardio", "15 min", "steady", "active"]
    ]
  },
  wed: {
    label: "Wed - Legs",
    focus: "Lower Power",
    exercises: [
      ["Back Squat", "strength", "5 x 5", "100kg", "120s"],
      ["Romanian Deadlift", "strength", "3 x 10", "70kg", "90s"],
      ["Leg Press", "strength", "3 x 12", "160kg", "75s"],
      ["Stair Climb", "cardio", "20 min", "level 8", "active"]
    ]
  },
  thu: {
    label: "Thu - Cardio",
    focus: "Engine + Core",
    exercises: [
      ["5K Run", "cardio", "1 x 5km", "<25min", "5min"],
      ["Cycling", "cardio", "25 min", "interval", "active"],
      ["Core Circuit", "strength", "3 rounds", "15 each", "45s"],
      ["Mobility Flow", "cardio", "15 min", "full body", "none"]
    ]
  },
  fri: {
    label: "Fri - Shoulders",
    focus: "Shoulders",
    exercises: [
      ["Overhead Press", "strength", "4 x 8", "55kg", "90s"],
      ["Lateral Raises", "strength", "4 x 15", "10kg", "60s"],
      ["Face Pulls", "strength", "3 x 15", "20kg", "60s"],
      ["Jump Rope", "cardio", "3 x 5min", "fast", "2min"]
    ]
  },
  sat: {
    label: "Sat - Arms",
    focus: "Arms + Recovery",
    exercises: [
      ["Barbell Curl", "strength", "4 x 10", "35kg", "75s"],
      ["Skull Crushers", "strength", "4 x 10", "30kg", "75s"],
      ["Hammer Curls", "strength", "3 x 12", "16kg", "60s"],
      ["Easy Bike", "cardio", "20 min", "zone 2", "none"]
    ]
  },
  sun: {
    label: "Sun - Rest",
    focus: "Restore",
    exercises: [
      ["Full Body Stretch", "cardio", "30 min", "easy", "none"],
      ["Breathing Reset", "cardio", "10 min", "nasal", "none"]
    ]
  }
};

const dietFoods = {
  bulk: [
    ["Chicken Breast", "31g protein - 165 kcal/100g", "protein", "chicken"],
    ["Whole Eggs", "13g protein - 155 kcal", "protein", "eggs"],
    ["Brown Rice", "45g carbs - 215 kcal/cup", "carb", "rice"],
    ["Avocado", "15g healthy fat - 234 kcal", "fat", "avocado"],
    ["Whole Milk", "8g protein - 150 kcal", "protein", "milk"],
    ["Almonds", "6g protein - 164 kcal", "fat", "nuts"]
  ],
  cut: [
    ["Tuna", "25g protein - 109 kcal/100g", "protein", "fish"],
    ["Broccoli", "fiber rich - 31 kcal", "veg", "broccoli"],
    ["Sweet Potato", "20g carbs - 86 kcal", "carb", "potato"],
    ["Spinach", "3g protein - 23 kcal", "veg", "greens"],
    ["Turkey Breast", "29g protein - 135 kcal", "protein", "chicken"],
    ["Blueberries", "antioxidants - 57 kcal", "carb", "berries"]
  ],
  maintain: [
    ["Salmon", "25g protein - omega 3", "fat", "fish"],
    ["Quinoa", "8g protein - 222 kcal", "carb", "rice"],
    ["Greek Yogurt", "17g protein - 130 kcal", "protein", "yogurt"],
    ["Banana", "quick energy - 105 kcal", "carb", "fruit"],
    ["Peanut Butter", "16g fat - 188 kcal", "fat", "nuts"],
    ["Chicken Bowl", "balanced macros", "protein", "chicken"]
  ],
  keto: [
    ["Ribeye Steak", "26g protein - 22g fat", "fat", "steak"],
    ["Eggs", "6g protein - 5g fat", "protein", "eggs"],
    ["Cheddar", "7g protein - 9g fat", "fat", "cheese"],
    ["Avocado", "2g net carbs", "fat", "avocado"],
    ["Mackerel", "omega 3 rich", "fat", "fish"],
    ["Macadamia", "21g fat - 1g net carbs", "fat", "nuts"]
  ]
};

const dietTargets = {
  bulk: { calories: 3200, protein: 190, carbs: 360, fat: 88, water: 3.5 },
  cut: { calories: 2100, protein: 200, carbs: 160, fat: 65, water: 3 },
  maintain: { calories: 2700, protein: 160, carbs: 280, fat: 78, water: 2.8 },
  keto: { calories: 2500, protein: 175, carbs: 25, fat: 185, water: 3 }
};

function sanitizeInput(value, maxLength = 180) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function calculateScore(junkCount = appState.junk_count, skipCount = appState.skip_count, healthyCount = appState.healthy_count) {
  const rawScore = 100 - (junkCount * 10) - (skipCount * 15) + (healthyCount * 5);
  return Math.max(0, Math.min(100, rawScore));
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) {
      appState = createInitialState();
      saveData();
      return;
    }
    appState = normalizeState(saved);
    if (appState.savedDate !== new Date().toDateString()) {
      appState = {
        ...createInitialState(),
        settings: appState.settings,
        streakDates: appState.streakDates
      };
    }
    activeDiet = appState.settings.diet;
  } catch (error) {
    console.warn("PeakFuel AI load fallback:", error);
    appState = createInitialState();
  }
}

function saveData() {
  try {
    appState.savedDate = new Date().toDateString();
    updateCurrentStreakDate();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    setText(elements.saveState, "Saved offline");
  } catch (error) {
    setText(elements.saveState, "Storage full");
    console.warn("PeakFuel AI save error:", error);
  }
}

function normalizeState(rawState) {
  const base = createInitialState();
  const settings = { ...DEFAULT_SETTINGS, ...(rawState.settings || {}) };
  return {
    ...base,
    junk_count: clampNumber(rawState.junk_count, 0, 999, 0),
    healthy_count: clampNumber(rawState.healthy_count, 0, 999, 0),
    skip_count: clampNumber(rawState.skip_count, 0, 999, 0),
    water_count: clampNumber(rawState.water_count, 0, 30, 0),
    workout_count: clampNumber(rawState.workout_count, 0, 20, 0),
    steps_count: clampNumber(rawState.steps_count, 0, 100000, 0),
    timestamps: Array.isArray(rawState.timestamps) ? rawState.timestamps.slice(0, MAX_LOGS).map((item) => sanitizeInput(item, 40)) : [],
    logs: Array.isArray(rawState.logs) ? rawState.logs.slice(0, MAX_LOGS).map(normalizeLog).filter(Boolean) : [],
    streakDates: Array.isArray(rawState.streakDates) ? rawState.streakDates.slice(-14).map((date) => sanitizeInput(date, 40)) : [],
    settings: {
      displayName: sanitizeInput(settings.displayName, 32) || DEFAULT_SETTINGS.displayName,
      goal: sanitizeChoice(settings.goal, ["energy", "weight", "muscle", "balanced"], DEFAULT_SETTINGS.goal),
      diet: sanitizeChoice(settings.diet, ["bulk", "cut", "maintain", "keto"], DEFAULT_SETTINGS.diet),
      fitnessGoal: sanitizeChoice(settings.fitnessGoal, ["mobility", "fat-loss", "strength", "endurance", "muscle"], DEFAULT_SETTINGS.fitnessGoal),
      activityLevel: sanitizeChoice(settings.activityLevel, ["low", "moderate", "high"], DEFAULT_SETTINGS.activityLevel),
      equipment: sanitizeChoice(settings.equipment, ["none", "dumbbells", "gym"], DEFAULT_SETTINGS.equipment),
      age: clampNumber(settings.age, 13, 100, DEFAULT_SETTINGS.age),
      heightCm: clampNumber(settings.heightCm, 120, 230, DEFAULT_SETTINGS.heightCm),
      weightKg: clampNumber(settings.weightKg, 30, 250, DEFAULT_SETTINGS.weightKg),
      workoutMinutes: clampNumber(settings.workoutMinutes, 10, 90, DEFAULT_SETTINGS.workoutMinutes),
      stepGoal: clampNumber(settings.stepGoal, 1000, 30000, DEFAULT_SETTINGS.stepGoal),
      waterTarget: clampNumber(settings.waterTarget, 4, 12, DEFAULT_SETTINGS.waterTarget),
      healthyTarget: clampNumber(settings.healthyTarget, 2, 6, DEFAULT_SETTINGS.healthyTarget)
    },
    savedDate: sanitizeInput(rawState.savedDate, 40) || base.savedDate
  };
}

function normalizeLog(log) {
  if (!log || typeof log !== "object") return null;
  const type = sanitizeChoice(log.type, ["healthy", "junk", "skip", "water", "fruit", "workout"], "healthy");
  const timestamp = Number.isNaN(Date.parse(log.timestamp)) ? new Date().toISOString() : log.timestamp;
  return {
    type,
    note: sanitizeInput(log.note || getDefaultNote(type), 70),
    timestamp,
    scoreAfter: clampNumber(log.scoreAfter, 0, 100, calculateScore())
  };
}

function sanitizeChoice(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function getTimeContext(date = new Date()) {
  const hour = date.getHours();
  const minutes = hour * 60 + date.getMinutes();
  return {
    hour,
    label: minutes > NIGHT_RISK_HOUR * 60 || hour < 5 ? "Night" : "Day",
    isLateRiskWindow: minutes > NIGHT_RISK_HOUR * 60
  };
}

function getSuggestion(state = appState, date = new Date()) {
  const context = getTimeContext(date);
  const rules = [];
  let risk = "LOW";
  let prediction = getBehaviorPrediction(state, context);
  let message = "Balanced start. Log a meal and PeakFuel AI will adapt its advice.";

  if (context.isLateRiskWindow && state.junk_count >= 2) {
    risk = "HIGH";
    prediction = "Late-night craving risk";
    message = "High risk: avoid more junk tonight. Choose water, fruit, or a protein snack.";
    rules.push(["HIGH RISK", "IF time > 9PM AND junk_count >= 2"]);
  }
  if (state.junk_count >= 3) {
    risk = risk === "HIGH" ? risk : "MEDIUM";
    prediction = "Habit warning";
    message = risk === "HIGH" ? message : "Habit warning: junk choices are stacking up. Reset with a healthy next meal.";
    rules.push(["Habit warning", "IF junk_count >= 3"]);
  }
  if (state.skip_count >= 1) {
    risk = risk === "HIGH" ? risk : "MEDIUM";
    prediction = prediction === "Stable" ? "Meal gap risk" : prediction;
    if (risk !== "HIGH" && state.junk_count < 3) {
      message = "Quick meal suggested: yogurt, nuts, fruit, eggs, dal, or a simple sandwich.";
    }
    rules.push(["Quick meal suggestion", "IF skip_count >= 1"]);
  }
  if (state.healthy_count > state.junk_count) {
    if (risk === "LOW") {
      prediction = "Positive momentum";
      message = "Reward feedback: healthy choices are leading today. Keep the streak going.";
    }
    rules.push(["Reward feedback", "IF healthy_count > junk_count"]);
  }
  if (state.water_count < Math.ceil(state.settings.waterTarget / 2) && state.logs.length >= 2) {
    rules.push(["Hydration nudge", "water_count is below pace"]);
  }
  if (state.workout_count === 0 && state.logs.length >= 2) {
    rules.push(["Training reminder", "workout_count is 0"]);
  }
  if (rules.length === 0) rules.push(["Monitoring", "No risk rule triggered yet"]);
  return { context, risk, prediction, message, rules };
}

function getBehaviorPrediction(state = appState, context = getTimeContext()) {
  if (state.workout_count > 0 && state.healthy_count > state.junk_count) return "Performance aligned";
  if (state.skip_count >= 1 && state.healthy_count === 0) return "Overeating risk";
  if (context.hour >= 17 && state.junk_count >= 1) return "Evening craving watch";
  if (state.water_count < 2 && state.logs.length >= 3) return "Hydration lag";
  if (state.healthy_count >= state.settings.healthyTarget) return "Goal momentum";
  return "Stable";
}

function updateUI() {
  const score = calculateScore();
  const advice = getSuggestion();
  const proteinTarget = Math.round(appState.settings.weightKg * (appState.settings.goal === "muscle" ? 1.7 : 1.2));
  const scorePct = `${score}%`;
  const waterPct = `${Math.min(100, (appState.water_count / appState.settings.waterTarget) * 100)}%`;
  const workoutPct = `${Math.min(100, appState.workout_count * 100)}%`;

  setText(elements.heroName, appState.settings.displayName);
  setText(elements.sidebarName, appState.settings.displayName);
  setText(elements.sidebarGoal, getGoalLabel());
  setText(elements.avatar, getInitials(appState.settings.displayName));
  setText(elements.dashboardSubtitle, `${new Date().toLocaleDateString(undefined, { weekday: "long" })} - ${getGoalLabel()} - keep the next choice clean.`);
  setText(elements.scoreValue, score);
  setText(elements.ringScore, score);
  setText(elements.scoreStatus, score >= 80 ? "Strong" : score >= 60 ? "Recover" : "Act now");
  setText(elements.proteinTarget, proteinTarget);
  setText(elements.workoutCount, appState.workout_count);
  setText(elements.workoutStatus, appState.workout_count > 0 ? "Done" : "Ready");
  setText(elements.weightValue, appState.settings.weightKg);
  setText(elements.weightStatus, `BMI ${calculateBMI(appState.settings.heightCm, appState.settings.weightKg)}`);
  setText(elements.healthyImpact, `+${appState.healthy_count * 5}`);
  setText(elements.junkImpact, `-${appState.junk_count * 10}`);
  setText(elements.skipImpact, `-${appState.skip_count * 15}`);
  setText(elements.waterProgress, `${appState.water_count}/${appState.settings.waterTarget}`);
  setText(elements.waterLabel, `${appState.water_count} / ${appState.settings.waterTarget} glasses - ${(appState.water_count * 0.25).toFixed(2)}L`);
  setText(elements.riskLevel, advice.risk);
  setText(elements.prediction, advice.prediction);
  setText(elements.timeContext, `${advice.context.label} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`);
  setText(elements.suggestionText, advice.message);
  setText(elements.streakCount, getStreakCount());
  setText(elements.dataStatus, "Everything is stored locally in your browser.");

  setWidth(elements.scoreBar, scorePct);
  setWidth(elements.proteinBar, `${Math.min(100, (proteinTarget / 220) * 100)}%`);
  setWidth(elements.workoutBar, workoutPct);
  setWidth(elements.weightBar, `${Math.min(100, (appState.settings.weightKg / 120) * 100)}%`);
  setWidth(elements.healthyBar, `${Math.min(100, appState.healthy_count * 18)}%`);
  setWidth(elements.junkBar, `${Math.min(100, appState.junk_count * 20)}%`);
  setWidth(elements.skipBar, `${Math.min(100, appState.skip_count * 25)}%`);
  setWidth(elements.waterBar, waterPct);

  const circumference = 2 * Math.PI * 50;
  elements.scoreRing.style.strokeDasharray = String(circumference);
  elements.scoreRing.style.strokeDashoffset = String(circumference - (score / 100) * circumference);
  elements.scoreRing.style.stroke = score >= 75 ? "var(--green)" : score >= 45 ? "var(--yellow)" : "var(--red)";

  syncProfileForm();
  elements.calendarLink.href = buildGoogleCalendarLink(currentMealIdea || getMealSuggestion());
  elements.workoutCalendarLink.href = buildWorkoutCalendarLink(getWorkoutPlan());

  renderFoodTiles();
  renderTimeline();
  renderWaterCups();
  renderStreakDays();
  renderRules(advice.rules);
  renderWorkoutTabs();
  renderWorkoutGrid();
  renderDietTabs();
  renderFoodRecommendations();
  renderTargets();
  renderMealPlan();
  renderPRs();
  renderWellness();
  drawCharts();
}

function setText(element, value) {
  if (element && element.textContent !== String(value)) element.textContent = value;
}

function setWidth(element, width) {
  if (element) element.style.width = width;
}

function renderFoodTiles() {
  const tiles = document.querySelectorAll(".food-tile");
  const data = {
    healthy: ["Healthy meal", "Balanced plate"],
    junk: ["Junk food", "High risk"],
    skip: ["Skipped meal", "Meal gap"],
    water: ["Water", "Hydration"],
    fruit: ["Fruit snack", "Smart swap"]
  };
  tiles.forEach((button) => {
    const type = button.dataset.action;
    if (button.childElementCount > 0) return;
    const art = document.createElement("span");
    const title = document.createElement("strong");
    const sub = document.createElement("span");
    art.className = "tile-art";
    art.appendChild(createFoodSvg(type));
    title.textContent = data[type][0];
    sub.textContent = data[type][1];
    button.append(art, title, sub);
  });
}

function renderTimeline() {
  elements.timeline.replaceChildren();
  if (appState.logs.length === 0) {
    const empty = document.createElement("li");
    empty.className = "meal-item";
    const art = document.createElement("span");
    const info = document.createElement("div");
    const name = document.createElement("div");
    const time = document.createElement("div");
    art.className = "meal-art";
    art.appendChild(createFoodSvg("healthy"));
    info.className = "meal-info";
    name.className = "meal-name";
    time.className = "meal-time";
    name.textContent = "No food logged yet";
    time.textContent = "Use Quick Log to start";
    info.append(name, time);
    empty.append(art, info);
    elements.timeline.appendChild(empty);
    return;
  }

  appState.logs.slice(0, 5).forEach((log) => {
    const item = document.createElement("li");
    const art = document.createElement("span");
    const info = document.createElement("div");
    const name = document.createElement("div");
    const time = document.createElement("div");
    const score = document.createElement("div");
    item.className = "meal-item";
    art.className = "meal-art";
    info.className = "meal-info";
    name.className = "meal-name";
    time.className = "meal-time";
    score.className = "meal-cal";
    art.appendChild(createFoodSvg(log.type));
    name.textContent = log.note;
    time.textContent = `${formatTime(log.timestamp)} - ${log.type.toUpperCase()}`;
    score.textContent = `${log.scoreAfter}`;
    info.append(name, time);
    item.append(art, info, score);
    elements.timeline.appendChild(item);
  });
}

function renderWaterCups() {
  elements.waterCups.replaceChildren();
  for (let index = 0; index < appState.settings.waterTarget; index += 1) {
    const cup = document.createElement("button");
    cup.type = "button";
    cup.className = `cup${index < appState.water_count ? " filled" : ""}`;
    cup.setAttribute("aria-label", `Set water to ${index + 1} glasses`);
    cup.textContent = "W";
    cup.addEventListener("click", () => {
      appState.water_count = index < appState.water_count ? index : index + 1;
      logPassive("water", "Water adjusted");
      saveData();
      updateUI();
      showToast(`Water updated: ${appState.water_count} glasses`);
    });
    elements.waterCups.appendChild(cup);
  }
}

function renderStreakDays() {
  elements.streakDays.replaceChildren();
  const streak = getStreakCount();
  for (let index = 0; index < 7; index += 1) {
    const day = document.createElement("span");
    day.className = `streak-day${index < streak ? " done" : ""}`;
    elements.streakDays.appendChild(day);
  }
}

function renderRules(rules) {
  elements.ruleList.replaceChildren();
  rules.forEach(([name, detail]) => {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    const text = document.createElement("p");
    strong.textContent = name;
    text.textContent = detail;
    item.append(strong, text);
    elements.ruleList.appendChild(item);
  });
}

function renderWorkoutTabs() {
  elements.dayTabs.replaceChildren();
  Object.entries(workoutData).forEach(([key, plan]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-tab${activeWorkoutDay === key ? " active" : ""}`;
    button.textContent = plan.label;
    button.addEventListener("click", () => {
      activeWorkoutDay = key;
      renderWorkoutTabs();
      renderWorkoutGrid();
    });
    elements.dayTabs.appendChild(button);
  });
}

function renderWorkoutGrid() {
  const plan = getWorkoutPlan();
  setText(elements.workoutSummary, `${plan.title} - ${plan.duration} min - ${plan.intensity}`);
  setText(elements.recoveryTip, plan.recovery);
  elements.workoutGrid.replaceChildren();
  plan.exercises.forEach((exercise, index) => {
    const card = document.createElement("article");
    const top = document.createElement("div");
    const icon = document.createElement("div");
    const type = document.createElement("span");
    const name = document.createElement("div");
    const desc = document.createElement("div");
    const sets = document.createElement("div");
    const done = document.createElement("button");
    card.className = "exercise-card";
    top.className = "ex-top";
    icon.className = "ex-emoji";
    type.className = `ex-type ${exercise.type}`;
    name.className = "ex-name";
    desc.className = "ex-meta";
    sets.className = "ex-sets";
    done.className = "ex-done-btn";
    icon.textContent = exercise.type === "cardio" ? "RUN" : "LIFT";
    type.textContent = exercise.type;
    name.textContent = exercise.name;
    desc.textContent = exercise.desc;
    [exercise.sets, exercise.load, exercise.rest].forEach((value) => {
      const badge = document.createElement("span");
      badge.className = "set-badge";
      badge.textContent = value;
      sets.appendChild(badge);
    });
    done.type = "button";
    done.textContent = "Mark as Done";
    done.addEventListener("click", () => {
      done.classList.toggle("done");
      done.textContent = done.classList.contains("done") ? "Completed" : "Mark as Done";
      if (done.classList.contains("done")) showToast(`Exercise ${index + 1} logged`);
    });
    top.append(icon, type);
    card.append(top, name, desc, sets, done);
    elements.workoutGrid.appendChild(card);
  });
}

function renderDietTabs() {
  elements.dietTabs.replaceChildren();
  Object.keys(dietTargets).forEach((diet) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `diet-tab${activeDiet === diet ? " active" : ""}`;
    button.textContent = optionSets.diet.find(([value]) => value === diet)[1];
    button.addEventListener("click", () => {
      activeDiet = diet;
      appState.settings.diet = diet;
      saveData();
      renderDietTabs();
      renderFoodRecommendations();
      renderTargets();
    });
    elements.dietTabs.appendChild(button);
  });
}

function renderFoodRecommendations() {
  elements.foodRecList.replaceChildren();
  dietFoods[activeDiet].forEach(([name, macro, tag, type]) => {
    const card = document.createElement("article");
    const art = document.createElement("span");
    const info = document.createElement("div");
    const title = document.createElement("div");
    const sub = document.createElement("div");
    const badge = document.createElement("span");
    card.className = "food-rec-card";
    art.className = "food-art";
    title.className = "food-rec-name";
    sub.className = "food-rec-macro";
    badge.className = `food-rec-tag tag-${tag}`;
    art.appendChild(createFoodSvg(type));
    title.textContent = name;
    sub.textContent = macro;
    badge.textContent = tag;
    info.append(title, sub);
    card.append(art, info, badge);
    elements.foodRecList.appendChild(card);
  });
}

function renderTargets() {
  const target = dietTargets[activeDiet];
  elements.nutrientTargets.replaceChildren();
  [
    ["Calories", `${target.calories} kcal`, 100, "var(--green)"],
    ["Protein", `${target.protein} g`, Math.round((target.protein * 4 / target.calories) * 100), "var(--accent)"],
    ["Carbs", `${target.carbs} g`, Math.round((target.carbs * 4 / target.calories) * 100), "var(--yellow)"],
    ["Fat", `${target.fat} g`, Math.round((target.fat * 9 / target.calories) * 100), "var(--blue)"],
    ["Water", `${target.water} L/day`, 80, "var(--blue)"]
  ].forEach(([name, value, percent, color]) => {
    const row = document.createElement("div");
    const label = document.createElement("span");
    const val = document.createElement("strong");
    const bar = document.createElement("span");
    const fill = document.createElement("span");
    row.className = "target-row";
    label.textContent = name;
    val.textContent = value;
    bar.className = "macro-bar-bg";
    fill.style.width = `${Math.min(100, percent)}%`;
    fill.style.background = color;
    bar.appendChild(fill);
    row.append(label, bar, val);
    elements.nutrientTargets.appendChild(row);
  });
}

function renderMealPlan() {
  const days = [
    ["Monday", [["Breakfast", "Oats + Whey", "540", "healthy"], ["Lunch", "Chicken Bowl", "720", "chicken"], ["Dinner", "Salmon Pasta", "680", "fish"]]],
    ["Tuesday", [["Breakfast", "Egg Omelette", "480", "eggs"], ["Lunch", "Tuna Wrap", "560", "fish"], ["Dinner", "Steak + Potato", "750", "steak"]]],
    ["Wednesday", [["Breakfast", "Protein Pancakes", "510", "healthy"], ["Lunch", "Dal + Rice", "640", "rice"], ["Dinner", "Chicken Salad", "520", "chicken"]]]
  ];
  elements.mealPlanGrid.replaceChildren();
  days.forEach(([day, meals]) => {
    const block = document.createElement("section");
    const title = document.createElement("h3");
    const grid = document.createElement("div");
    title.className = "meal-plan-day-title";
    grid.className = "meal-plan-items";
    title.textContent = day;
    meals.forEach(([meal, name, kcal, type]) => {
      const item = document.createElement("article");
      const art = document.createElement("span");
      const mealEl = document.createElement("div");
      const nameEl = document.createElement("div");
      const calEl = document.createElement("div");
      item.className = "mp-item";
      art.className = "food-art";
      mealEl.className = "mp-item-meal";
      nameEl.className = "mp-item-name";
      calEl.className = "mp-item-cal";
      art.appendChild(createFoodSvg(type));
      mealEl.textContent = meal;
      nameEl.textContent = name;
      calEl.textContent = `${kcal} kcal`;
      item.append(art, mealEl, nameEl, calEl);
      grid.appendChild(item);
    });
    block.append(title, grid);
    elements.mealPlanGrid.appendChild(block);
  });
}

function renderPRs() {
  elements.prList.replaceChildren();
  [
    ["Bench Press", "102.5kg", "Apr 21"],
    ["Back Squat", "125kg", "Apr 18"],
    ["Deadlift", "150kg", "Apr 14"],
    ["5K Run", "23:42", "Apr 10"],
    ["Pull-Ups", "BW+20kg", "Apr 7"]
  ].forEach(([exercise, value, date], index) => {
    const item = document.createElement("div");
    const rank = document.createElement("div");
    const name = document.createElement("div");
    const group = document.createElement("div");
    const val = document.createElement("div");
    const when = document.createElement("div");
    item.className = "pr-item";
    rank.className = "pr-rank";
    name.className = "pr-exercise";
    val.className = "pr-value";
    when.className = "pr-date";
    rank.textContent = index + 1;
    name.textContent = exercise;
    val.textContent = value;
    when.textContent = date;
    group.append(val, when);
    item.append(rank, name, group);
    elements.prList.appendChild(item);
  });
}

function renderWellness() {
  const score = calculateScore();
  const metrics = [
    ["BMI estimate", String(calculateBMI(appState.settings.heightCm, appState.settings.weightKg))],
    ["Protein guide", `${Math.round(appState.settings.weightKg * 1.7)}g/day`],
    ["Steps remaining", `${Math.max(0, appState.settings.stepGoal - appState.steps_count)}`],
    ["Training readiness", score >= 70 && appState.water_count >= 2 ? "Ready" : "Go gentle"],
    ["Maps search", GOOGLE_MAPS_URL]
  ];
  elements.wellnessList.replaceChildren();
  metrics.forEach(([name, value]) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const strong = document.createElement("strong");
    label.textContent = name;
    strong.textContent = value;
    item.append(label, strong);
    elements.wellnessList.appendChild(item);
  });
}

function syncProfileForm() {
  elements.profileName.value = appState.settings.displayName;
  elements.goalSelect.value = appState.settings.goal;
  elements.dietSelect.value = appState.settings.diet;
  elements.fitnessSelect.value = appState.settings.fitnessGoal;
  elements.activitySelect.value = appState.settings.activityLevel;
  elements.equipmentSelect.value = appState.settings.equipment;
  elements.ageInput.value = appState.settings.age;
  elements.heightInput.value = appState.settings.heightCm;
  elements.weightInput.value = appState.settings.weightKg;
  elements.workoutMinutes.value = appState.settings.workoutMinutes;
  elements.stepGoal.value = appState.settings.stepGoal;
  elements.stepsInput.value = appState.steps_count;
}

function populateSelects() {
  fillSelect(elements.goalSelect, optionSets.goal);
  fillSelect(elements.dietSelect, optionSets.diet);
  fillSelect(elements.fitnessSelect, optionSets.fitnessGoal);
  fillSelect(elements.activitySelect, optionSets.activityLevel);
  fillSelect(elements.equipmentSelect, optionSets.equipment);
}

function fillSelect(select, options) {
  select.replaceChildren();
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
}

function logDecision(type, note = "") {
  const cleanType = sanitizeChoice(type, ["healthy", "junk", "skip", "water", "fruit", "workout"], "healthy");
  const cleanNote = sanitizeInput(note, 60) || getDefaultNote(cleanType);
  const timestamp = new Date().toISOString();
  applyImpact(cleanType, 1);
  appState.timestamps.unshift(timestamp);
  appState.logs.unshift({ type: cleanType, note: cleanNote, timestamp, scoreAfter: calculateScore() });
  appState.timestamps = appState.timestamps.slice(0, MAX_LOGS);
  appState.logs = appState.logs.slice(0, MAX_LOGS);
  currentMealIdea = getMealSuggestion();
  saveData();
  updateUI();
  showToast(`Logged: ${cleanNote}`);
}

function logPassive(type, note) {
  const timestamp = new Date().toISOString();
  appState.timestamps.unshift(timestamp);
  appState.logs.unshift({ type, note, timestamp, scoreAfter: calculateScore() });
  appState.timestamps = appState.timestamps.slice(0, MAX_LOGS);
  appState.logs = appState.logs.slice(0, MAX_LOGS);
}

function applyImpact(type, direction) {
  if (type === "healthy" || type === "fruit") appState.healthy_count = Math.max(0, appState.healthy_count + direction);
  if (type === "junk") appState.junk_count = Math.max(0, appState.junk_count + direction);
  if (type === "skip") appState.skip_count = Math.max(0, appState.skip_count + direction);
  if (type === "water") appState.water_count = Math.max(0, appState.water_count + direction);
  if (type === "workout") appState.workout_count = Math.max(0, appState.workout_count + direction);
}

function undoLastDecision() {
  const lastLog = appState.logs.shift();
  if (!lastLog) {
    showToast("Nothing to undo");
    return;
  }
  applyImpact(lastLog.type, -1);
  appState.timestamps.shift();
  saveData();
  updateUI();
  showToast("Last log removed");
}

function resetData() {
  const settings = appState.settings;
  const streakDates = appState.streakDates;
  appState = { ...createInitialState(), settings, streakDates };
  currentMealIdea = "";
  saveData();
  updateUI();
  showToast("Today reset");
}

function completeWorkout() {
  const plan = getWorkoutPlan();
  logDecision("workout", plan.title);
}

function getDefaultNote(type) {
  const labels = {
    healthy: "Healthy meal",
    junk: "Junk food",
    skip: "Skipped meal",
    water: "Glass of water",
    fruit: "Fruit snack",
    workout: "Workout completed"
  };
  return labels[type];
}

function getGoalLabel() {
  const goal = optionSets.goal.find(([value]) => value === appState.settings.goal);
  const fitness = optionSets.fitnessGoal.find(([value]) => value === appState.settings.fitnessGoal);
  return `${goal ? goal[1] : "Health"} + ${fitness ? fitness[1] : "Fitness"}`;
}

function getInitials(name) {
  return sanitizeInput(name, 32)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "AI";
}

function getMealSuggestion() {
  const foods = dietFoods[activeDiet] || dietFoods.bulk;
  return foods[Math.abs(appState.logs.length + appState.junk_count - appState.skip_count) % foods.length][0];
}

function getWorkoutPlan() {
  const base = workoutData[activeWorkoutDay] || workoutData.mon;
  const intensity = getWorkoutIntensity();
  const recovery = getRecoveryTip(intensity);
  return {
    title: base.focus,
    duration: appState.settings.workoutMinutes,
    intensity,
    recovery,
    exercises: base.exercises.map(([name, type, sets, load, rest]) => ({ name, type, sets, load, rest, desc: `${type === "cardio" ? "Conditioning" : "Strength"} focus` }))
  };
}

function getWorkoutIntensity() {
  if (appState.skip_count >= 1 || appState.water_count < 2) return "Light";
  if (appState.settings.activityLevel === "high" && appState.water_count >= 3) return "Challenging";
  if (appState.settings.activityLevel === "low") return "Easy";
  return "Moderate";
}

function getRecoveryTip(intensity) {
  if (appState.water_count < 2) return "Hydrate before training. Keep intensity light until water improves.";
  if (appState.skip_count >= 1) return "Eat a small snack before exercise because you skipped a meal.";
  if (intensity === "Challenging") return "Finish with easy movement and a protein-forward meal.";
  return "Recover with water, light stretching, and a balanced meal within two hours.";
}

function getStreakCount() {
  const dates = new Set(appState.streakDates);
  let streak = 0;
  const cursor = new Date();
  for (let day = 0; day < 14; day += 1) {
    if (!dates.has(cursor.toDateString())) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function updateCurrentStreakDate() {
  const today = new Date().toDateString();
  if (calculateScore() >= 70 && appState.logs.length > 0 && !appState.streakDates.includes(today)) {
    appState.streakDates.push(today);
  }
  appState.streakDates = appState.streakDates.slice(-14);
}

function calculateBMI(heightCm, weightKg) {
  const heightM = Number(heightCm) / 100;
  const weight = Number(weightKg);
  if (!heightM || !weight) return 0;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

function buildGoogleCalendarLink(mealIdea) {
  const start = new Date(Date.now() + 90 * 60 * 1000);
  const end = new Date(start.getTime() + 20 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "PeakFuel AI healthy meal reminder",
    details: `Suggested meal: ${sanitizeInput(mealIdea || "Balanced meal", 100)}`,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildWorkoutCalendarLink(plan) {
  const start = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + plan.duration * 60 * 1000);
  const details = `${plan.title}: ${plan.exercises.map((exercise) => `${exercise.name} ${exercise.sets}`).join(", ")}. ${plan.recovery}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `PeakFuel AI workout - ${plan.title}`,
    details: sanitizeInput(details, 450),
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function drawCharts() {
  drawLineChart(elements.scoreChart, [74, 78, 82, 76, 84, 88, calculateScore()], "#2d6a4f");
  drawBarChart(elements.activityChart, [appState.steps_count / 1000, appState.water_count, appState.healthy_count, appState.workout_count], ["steps", "water", "healthy", "workouts"]);
}

function drawLineChart(canvas, values, color) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawChartGrid(ctx, width, height);
  const max = 100;
  const step = width / (values.length - 1);
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = index * step;
    const y = height - (value / max) * (height - 28) - 14;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawBarChart(canvas, values, labels) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const max = Math.max(...values, 1);
  const gap = 24;
  const barWidth = (width - gap * (values.length + 1)) / values.length;
  ctx.clearRect(0, 0, width, height);
  drawChartGrid(ctx, width, height);
  values.forEach((value, index) => {
    const x = gap + index * (barWidth + gap);
    const barHeight = (value / max) * (height - 45);
    ctx.fillStyle = ["#2d6a4f", "#2b6cb0", "#ff6b35", "#d4a017"][index];
    ctx.fillRect(x, height - barHeight - 24, barWidth, barHeight);
    ctx.fillStyle = "#677062";
    ctx.font = "14px system-ui";
    ctx.fillText(labels[index], x, height - 6);
  });
}

function drawChartGrid(ctx, width, height) {
  ctx.strokeStyle = "#e8eae3";
  ctx.lineWidth = 1;
  for (let y = 20; y < height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.page === id));
  const page = document.getElementById(`page-${id}`);
  if (page) page.classList.add("active");
  if (id === "progress") setTimeout(drawCharts, 30);
}

function addChatMessage(text, sender) {
  const message = document.createElement("div");
  const bubble = document.createElement("div");
  const time = document.createElement("span");
  message.className = `chat-message ${sender}`;
  bubble.className = "chat-bubble";
  time.className = "chat-time";
  bubble.textContent = sanitizeInput(text, 320);
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  message.append(bubble, time);
  elements.chatLog.appendChild(message);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function getFallbackCoachResponse(question) {
  const lower = question.toLowerCase();
  if (lower.includes("protein")) return `Aim for about ${Math.round(appState.settings.weightKg * 1.7)}g protein today for your current goal.`;
  if (lower.includes("workout") || lower.includes("exercise")) return `Try ${getWorkoutPlan().title} for ${getWorkoutPlan().duration} minutes. ${getWorkoutPlan().recovery}`;
  if (lower.includes("water") || lower.includes("hydrate")) return `You have logged ${appState.water_count}/${appState.settings.waterTarget} glasses. Add water before more caffeine or snacks.`;
  if (lower.includes("skip")) return "A quick meal beats skipping. Try yogurt, eggs, dal, fruit, nuts, or a simple sandwich.";
  if (lower.includes("junk") || lower.includes("craving")) return "Use a swap: water first, then fruit or protein. If you still want it, keep the portion intentional.";
  return `${getSuggestion().message} Next move: ${getNextBestAction()}.`;
}

function getNextBestAction() {
  if (appState.skip_count >= 1) return "Quick meal";
  if (appState.water_count < Math.ceil(appState.settings.waterTarget / 2)) return "Drink water";
  if (appState.workout_count === 0) return "Train";
  if (appState.junk_count >= 2) return "Fruit swap";
  return "Maintain";
}

function handleCoachSubmit(event) {
  event.preventDefault();
  const question = sanitizeInput(elements.coachInput.value, 180);
  if (!question) return;
  elements.coachInput.value = "";
  addChatMessage(question, "user");
  if (OPENAI_API_KEY && OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY") {
    addChatMessage("API key detected, but this demo keeps browser calls disabled for security. Use a backend proxy in production.", "bot");
    return;
  }
  setTimeout(() => addChatMessage(getFallbackCoachResponse(question), "bot"), 250);
}

function exportData() {
  elements.importData.value = JSON.stringify(appState, null, 2);
  setText(elements.dataStatus, "Export ready. JSON is shown below.");
}

function importData() {
  try {
    appState = normalizeState(JSON.parse(elements.importData.value));
    activeDiet = appState.settings.diet;
    saveData();
    updateUI();
    showToast("Import complete");
  } catch (error) {
    setText(elements.dataStatus, "Import failed. Paste valid PeakFuel AI JSON.");
    console.warn("Import error:", error);
  }
}

function createFoodSvg(type) {
  const svg = svgEl("svg", { viewBox: "0 0 80 80", "aria-hidden": "true", focusable: "false" });
  const add = (name, attrs) => svg.appendChild(svgEl(name, attrs));
  const colors = {
    green: "#40916c",
    pale: "#d8f3dc",
    orange: "#ff6b35",
    yellow: "#d4a017",
    blue: "#2b6cb0",
    red: "#cc3d3d",
    ink: "#1a1d18",
    white: "#ffffff"
  };
  if (["healthy", "chicken", "rice"].includes(type)) {
    add("circle", { cx: 40, cy: 43, r: 28, fill: colors.white, stroke: "#e8eae3", "stroke-width": 3 });
    add("path", { d: "M25 42c5-13 18-18 31-15-2 16-17 24-31 15Z", fill: colors.green });
    add("path", { d: "M29 54c8-10 21-10 29-2-8 7-21 8-29 2Z", fill: colors.pale });
    add("circle", { cx: 31, cy: 51, r: 4, fill: colors.orange });
    add("circle", { cx: 51, cy: 51, r: 4, fill: colors.yellow });
  } else if (["junk", "burger"].includes(type)) {
    add("path", { d: "M18 36c4-16 40-16 44 0Z", fill: "#f2b84b" });
    add("rect", { x: 18, y: 39, width: 44, height: 8, rx: 3, fill: "#ffe16a" });
    add("rect", { x: 16, y: 49, width: 48, height: 9, rx: 4, fill: "#7c3a1b" });
    add("path", { d: "M21 59h38c-1 8-37 8-38 0Z", fill: "#f2b84b" });
    [30, 42, 52].forEach((cx, index) => add("circle", { cx, cy: 28 + index, r: 2, fill: colors.white }));
  } else if (type === "skip") {
    add("circle", { cx: 40, cy: 43, r: 24, fill: colors.white, stroke: "#e8eae3", "stroke-width": 3 });
    add("path", { d: "M40 43V28M40 43l12 8", fill: "none", stroke: colors.ink, "stroke-width": 5, "stroke-linecap": "round" });
    add("path", { d: "M21 64 62 23", fill: "none", stroke: colors.red, "stroke-width": 7, "stroke-linecap": "round" });
    add("rect", { x: 33, y: 13, width: 14, height: 8, rx: 3, fill: colors.blue });
  } else if (type === "water") {
    add("path", { d: "M25 17h30l-4 47H29Z", fill: colors.white, stroke: "#d5d8ce", "stroke-width": 3 });
    add("path", { d: "M29 39c7-5 15 5 22 0l-2 21H31Z", fill: "#8fd7ff" });
    add("path", { d: "M33 23 31 58", fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round" });
  } else if (["fruit", "berries"].includes(type)) {
    add("path", { d: "M40 31c8-12 27 0 19 20-5 15-16 16-19 9-4 7-16 6-20-9-7-20 12-32 20-20Z", fill: colors.red });
    add("path", { d: "M42 30c0-8 5-13 12-14", fill: "none", stroke: colors.ink, "stroke-width": 4, "stroke-linecap": "round" });
    add("path", { d: "M37 25c-6-7-1-13 9-12 0 8-3 12-9 12Z", fill: colors.green });
    add("circle", { cx: 31, cy: 42, r: 3, fill: colors.white });
  } else if (["eggs", "protein"].includes(type)) {
    add("ellipse", { cx: 30, cy: 42, rx: 15, ry: 20, fill: colors.white, stroke: "#e8eae3", "stroke-width": 3 });
    add("ellipse", { cx: 50, cy: 42, rx: 15, ry: 20, fill: colors.white, stroke: "#e8eae3", "stroke-width": 3 });
    add("circle", { cx: 30, cy: 45, r: 6, fill: colors.yellow });
    add("circle", { cx: 50, cy: 45, r: 6, fill: colors.yellow });
  } else if (["fish", "tuna"].includes(type)) {
    add("path", { d: "M17 42c13-17 33-17 46 0-13 17-33 17-46 0Z", fill: colors.blue });
    add("path", { d: "M63 42l11-10v20Z", fill: colors.blue });
    add("circle", { cx: 29, cy: 39, r: 3, fill: colors.white });
  } else if (["avocado", "fat"].includes(type)) {
    add("path", { d: "M40 14c22 12 22 52 0 52S18 26 40 14Z", fill: colors.green });
    add("path", { d: "M40 24c14 9 14 32 0 32S26 33 40 24Z", fill: colors.pale });
    add("circle", { cx: 40, cy: 44, r: 8, fill: "#7c3a1b" });
  } else {
    add("circle", { cx: 40, cy: 40, r: 26, fill: colors.pale });
    add("path", { d: "M27 42h26M40 29v26", stroke: colors.green, "stroke-width": 7, "stroke-linecap": "round" });
  }
  return svg;
}

function svgEl(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function showToast(message) {
  setText(elements.toastMessage, message);
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.page)));
  document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.jump)));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => logDecision(button.dataset.action)));
  document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
    elements.coachInput.value = button.dataset.prompt;
    elements.chatForm.requestSubmit();
  }));
  elements.undoButton.addEventListener("click", undoLastDecision);
  elements.resetButton.addEventListener("click", resetData);
  elements.completeWorkoutButton.addEventListener("click", completeWorkout);
  elements.refreshWorkoutButton.addEventListener("click", () => {
    activeWorkoutDay = Object.keys(workoutData)[(Object.keys(workoutData).indexOf(activeWorkoutDay) + 1) % Object.keys(workoutData).length];
    updateUI();
  });
  elements.customForm.addEventListener("submit", (event) => {
    event.preventDefault();
    logDecision(elements.customType.value, sanitizeInput(elements.customFood.value, 60));
    elements.customFood.value = "";
  });
  elements.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    appState.settings.displayName = sanitizeInput(elements.profileName.value, 32) || DEFAULT_SETTINGS.displayName;
    appState.settings.goal = sanitizeChoice(elements.goalSelect.value, optionSets.goal.map(([value]) => value), DEFAULT_SETTINGS.goal);
    appState.settings.diet = sanitizeChoice(elements.dietSelect.value, optionSets.diet.map(([value]) => value), DEFAULT_SETTINGS.diet);
    appState.settings.fitnessGoal = sanitizeChoice(elements.fitnessSelect.value, optionSets.fitnessGoal.map(([value]) => value), DEFAULT_SETTINGS.fitnessGoal);
    appState.settings.activityLevel = sanitizeChoice(elements.activitySelect.value, optionSets.activityLevel.map(([value]) => value), DEFAULT_SETTINGS.activityLevel);
    appState.settings.equipment = sanitizeChoice(elements.equipmentSelect.value, optionSets.equipment.map(([value]) => value), DEFAULT_SETTINGS.equipment);
    appState.settings.age = clampNumber(elements.ageInput.value, 13, 100, DEFAULT_SETTINGS.age);
    appState.settings.heightCm = clampNumber(elements.heightInput.value, 120, 230, DEFAULT_SETTINGS.heightCm);
    appState.settings.weightKg = clampNumber(elements.weightInput.value, 30, 250, DEFAULT_SETTINGS.weightKg);
    appState.settings.workoutMinutes = clampNumber(elements.workoutMinutes.value, 10, 90, DEFAULT_SETTINGS.workoutMinutes);
    appState.settings.stepGoal = clampNumber(elements.stepGoal.value, 1000, 30000, DEFAULT_SETTINGS.stepGoal);
    appState.steps_count = clampNumber(elements.stepsInput.value, 0, 100000, 0);
    activeDiet = appState.settings.diet;
    saveData();
    updateUI();
    showToast("Profile saved");
  });
  elements.chatForm.addEventListener("submit", handleCoachSubmit);
  elements.exportButton.addEventListener("click", exportData);
  elements.importButton.addEventListener("click", importData);
}

function cacheElements() {
  elements = {
    loader: document.getElementById("loader"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toast-message"),
    heroName: document.getElementById("hero-name"),
    sidebarName: document.getElementById("sidebar-name"),
    sidebarGoal: document.getElementById("sidebar-goal"),
    avatar: document.getElementById("avatar"),
    dashboardSubtitle: document.getElementById("dashboard-subtitle"),
    scoreValue: document.getElementById("score-value"),
    ringScore: document.getElementById("ring-score"),
    scoreStatus: document.getElementById("score-status"),
    scoreBar: document.getElementById("score-bar"),
    proteinTarget: document.getElementById("protein-target"),
    proteinStatus: document.getElementById("protein-status"),
    proteinBar: document.getElementById("protein-bar"),
    workoutCount: document.getElementById("workout-count"),
    workoutStatus: document.getElementById("workout-status"),
    workoutBar: document.getElementById("workout-bar"),
    weightValue: document.getElementById("weight-value"),
    weightStatus: document.getElementById("weight-status"),
    weightBar: document.getElementById("weight-bar"),
    scoreRing: document.getElementById("score-ring"),
    healthyImpact: document.getElementById("healthy-impact"),
    junkImpact: document.getElementById("junk-impact"),
    skipImpact: document.getElementById("skip-impact"),
    waterProgress: document.getElementById("water-progress"),
    healthyBar: document.getElementById("healthy-bar"),
    junkBar: document.getElementById("junk-bar"),
    skipBar: document.getElementById("skip-bar"),
    waterBar: document.getElementById("water-bar"),
    timeline: document.getElementById("timeline"),
    waterCups: document.getElementById("water-cups"),
    waterLabel: document.getElementById("water-label"),
    riskLevel: document.getElementById("risk-level"),
    prediction: document.getElementById("prediction"),
    timeContext: document.getElementById("time-context"),
    streakCount: document.getElementById("streak-count"),
    streakDays: document.getElementById("streak-days"),
    undoButton: document.getElementById("undo-button"),
    resetButton: document.getElementById("reset-button"),
    customForm: document.getElementById("custom-form"),
    customFood: document.getElementById("custom-food"),
    customType: document.getElementById("custom-type"),
    suggestionText: document.getElementById("suggestion-text"),
    ruleList: document.getElementById("rule-list"),
    completeWorkoutButton: document.getElementById("complete-workout-button"),
    workoutSummary: document.getElementById("workout-summary"),
    recoveryTip: document.getElementById("recovery-tip"),
    dayTabs: document.getElementById("day-tabs"),
    workoutGrid: document.getElementById("workout-grid"),
    refreshWorkoutButton: document.getElementById("refresh-workout-button"),
    workoutCalendarLink: document.getElementById("workout-calendar-link"),
    calendarLink: document.getElementById("calendar-link"),
    dietTabs: document.getElementById("diet-tabs"),
    foodRecList: document.getElementById("food-rec-list"),
    nutrientTargets: document.getElementById("nutrient-targets"),
    mealPlanGrid: document.getElementById("meal-plan-grid"),
    scoreChart: document.getElementById("score-chart"),
    activityChart: document.getElementById("activity-chart"),
    prList: document.getElementById("pr-list"),
    wellnessList: document.getElementById("wellness-list"),
    chatLog: document.getElementById("chat-log"),
    chatForm: document.getElementById("chat-form"),
    coachInput: document.getElementById("coach-input"),
    profileForm: document.getElementById("profile-form"),
    profileName: document.getElementById("profile-name"),
    goalSelect: document.getElementById("goal-select"),
    dietSelect: document.getElementById("diet-select"),
    fitnessSelect: document.getElementById("fitness-select"),
    activitySelect: document.getElementById("activity-select"),
    equipmentSelect: document.getElementById("equipment-select"),
    ageInput: document.getElementById("age-input"),
    heightInput: document.getElementById("height-input"),
    weightInput: document.getElementById("weight-input"),
    workoutMinutes: document.getElementById("workout-minutes"),
    stepGoal: document.getElementById("step-goal"),
    stepsInput: document.getElementById("steps-input"),
    saveState: document.getElementById("save-state"),
    dataStatus: document.getElementById("data-status"),
    importData: document.getElementById("import-data"),
    exportButton: document.getElementById("export-button"),
    importButton: document.getElementById("import-button"),
    testStatus: document.getElementById("test-status")
  };
}

function runTests() {
  const lateDate = new Date("2026-04-27T22:15:00");
  const tests = [
    ["Score formula", calculateScore(2, 1, 3), 80],
    ["Clamp high", calculateScore(0, 0, 9), 100],
    ["Clamp low", calculateScore(12, 4, 0), 0],
    ["High risk", getSuggestion({ ...createInitialState(), junk_count: 2 }, lateDate).risk, "HIGH"],
    ["Habit warning", getSuggestion({ ...createInitialState(), junk_count: 3 }).prediction, "Habit warning"],
    ["Skip rule", getSuggestion({ ...createInitialState(), skip_count: 1 }).rules.some(([name]) => name === "Quick meal suggestion"), true],
    ["Reward rule", getSuggestion({ ...createInitialState(), healthy_count: 2, junk_count: 1 }).prediction, "Positive momentum"],
    ["Input sanitization", sanitizeInput("<script>alert(1)</script>", 40).includes("<"), false],
    ["Calendar URL", buildGoogleCalendarLink("Fruit").startsWith("https://calendar.google.com/calendar/render?"), true],
    ["Workout plan", Array.isArray(getWorkoutPlan().exercises), true],
    ["BMI estimate", calculateBMI(170, 70), 24.2],
    ["State normalizer", normalizeState({ junk_count: "2", settings: { goal: "bad" } }).settings.goal, "muscle"]
  ];
  const passed = tests.filter((test) => Object.is(test[1], test[2])).length;
  console.log("Test Score:", calculateScore(2, 1, 3), "Expected:", 80);
  tests.forEach(([name, actual, expected]) => console.log(`Test ${name}:`, actual, "Expected:", expected));
  console.log("PeakFuel AI Tests Passed:", `${passed}/${tests.length}`);
  setText(elements.testStatus, `${passed}/${tests.length} passed`);
}

function init() {
  cacheElements();
  populateSelects();
  loadData();
  bindEvents();
  currentMealIdea = getMealSuggestion();
  addChatMessage("Hey! I am your offline PeakFuel AI coach. Ask about workouts, protein, cravings, hydration, or recovery.", "bot");
  updateUI();
  runTests();
  setTimeout(() => elements.loader.classList.add("hidden"), 450);
  setInterval(updateUI, 60000);
}

document.addEventListener("DOMContentLoaded", init);
