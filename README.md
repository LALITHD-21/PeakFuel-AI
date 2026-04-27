# PeakFuel AI ⚡

> **Offline-First Fitness, Food, & Health Decision Coach**

PeakFuel AI is an intelligent, privacy-first web application designed to act as your personal performance cockpit. It helps you make better daily decisions regarding nutrition, workouts, hydration, and recovery—all without needing an internet connection.

## 🚀 Features

- **Offline-Core & Privacy First:** No backend, no databases, no tracking. Everything is stored locally in your browser using `localStorage`. Your health data never leaves your device.
- **Live Health Score & Macro Tracking:** Log healthy meals, junk food, skipped meals, and water intake to see your health score and daily targets update in real-time.
- **Rule-Based AI Coach:** An intelligent offline fallback engine predicts bad habits (like late-night cravings or skipping meals) and nudges you toward better choices.
- **Adaptive Workout Intelligence:** Generates custom training plans based on your profile goals (Strength, Fat Loss, Endurance) and adjusts intensity based on your recovery signals and hydration.
- **Interactive Dashboard:** Premium glassmorphism UI featuring streak counters, behavior prediction, quick logs, and personalized macro targets.
- **Data Portability:** Easily export your local data to a JSON file and import it anywhere.

## 🛠️ Tech Stack

Built with an **Ultra-Lightweight** architecture (under 1 MB repository size) to ensure blazing-fast load times and instant interactivity.
- **HTML5:** Fully accessible and semantic structure.
- **CSS3:** Premium UI/UX, deep glassmorphism, responsive grids, and smooth animations (Zero CSS frameworks).
- **Vanilla JavaScript:** Rule-based decision engine, dynamic DOM updates, and local storage management (Zero JS frameworks).

## 📥 Installation & Setup

Because PeakFuel AI is completely offline and client-side, setup takes zero seconds:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/LALITHD-21/PeakFuel-AI.git
   ```
2. Open the project folder.
3. Double-click `index.html` to open it in any modern web browser.
4. Go to the **Profile** tab, enter your details, and start logging!

## 🧠 How the AI Engine Works

Instead of just tracking past calories, PeakFuel AI focuses on **real-time decision making**:
- **Risk Assessment:** Combines time-of-day context with your recent logs (e.g., if you log junk food late at night, your Risk Level elevates to HIGH).
- **Recovery Signals:** If you skip meals or fall behind on water, your adaptive workout intensity is lowered to prioritize recovery.
- **AI Chat Coach:** Includes an interactive chat interface that uses smart, contextual fallback responses to answer your fitness questions offline.

## 🛡️ Security & Integrity

- **Safe DOM Updates:** Prevents Cross-Site Scripting (XSS) by using sanitized inputs.
- **100% Local:** No external API calls are made unless explicitly configured by the user.

---

*Take control of your performance. Fuel your peak.*
