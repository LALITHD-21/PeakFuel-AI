# PeakFuel AI

> Smart Fitness, Food, and Health Decision Assistant built with pure HTML, CSS, and Vanilla JavaScript.

PeakFuel AI is an ultra-lightweight, offline-first wellness dashboard that helps users make better daily decisions around food, hydration, workouts, and recovery. It combines time-based context, local behavior tracking, a rule-based AI decision engine, and a premium responsive dashboard UI.

The project is intentionally small, fast, and easy to evaluate: no frameworks, no build tools, no heavy assets, and no backend required.

---

## Project Snapshot

| Area | Details |
| --- | --- |
| App Type | Static browser application |
| Stack | HTML5, CSS3, Vanilla JavaScript |
| Storage | `localStorage` |
| Core Mode | Works offline after opening in browser |
| Repository Budget | Designed to stay under 1 MB |
| Deployment Ready | Firebase Hosting config included |
| Security Style | No exposed real API keys, safe DOM updates, sanitized user input |

---

## Problem

Most food and fitness apps either feel too heavy, require accounts, depend on internet access, or simply track data without helping the user make a better decision in the moment.

PeakFuel AI focuses on practical daily guidance:

- Should I eat junk food late at night?
- Am I skipping meals too often?
- Is my health score improving?
- What workout should I do today?
- What quick meal or recovery habit should I choose next?

---

## Solution

PeakFuel AI turns simple user actions into real-time feedback using lightweight decision logic. The app tracks health choices locally and reacts instantly with:

- Live health score
- Risk level detection
- Habit warnings
- Quick meal suggestions
- Reward feedback
- Workout plan recommendations
- Hydration tracking
- AI coach fallback responses
- Profile-based personalization
- Google Maps healthy food search link

No server is required for the core experience.

---

## Key Features

### Premium Dashboard

- Live Health Score with real-time updates
- Today summary cards for healthy, junk, skipped, water, and fruit logs
- Behavior prediction panel
- Recent activity timeline
- Streak and recovery indicators
- Clean sidebar navigation
- Responsive layout for desktop and mobile

### Quick Log System

Users can instantly log:

- Healthy meal
- Junk food
- Skipped meal
- Water
- Fruit snack

Each action updates local counts, timestamps, health score, suggestions, and dashboard metrics.

### Rule-Based AI Engine

The app includes a clear, testable decision engine using local state:

- `junk_count`
- `healthy_count`
- `skip_count`
- `water_count`
- `fruit_count`
- `timestamps`
- `logs`

Core decision rules:

```text
IF time > 9 PM AND junk_count >= 2
THEN HIGH RISK

IF junk_count >= 3
THEN show habit warning

IF skip_count >= 1
THEN suggest quick meals

IF healthy_count > junk_count
THEN reward feedback
```

### Health Score

The score is intentionally simple and transparent:

```text
score = 100 - (junk_count * 10) - (skip_count * 15) + (healthy_count * 5)
```

The result is clamped between `0` and `100`.

### Workout Plans

The workout section includes goal-aware plans for:

- Strength
- Fat loss
- Endurance
- Balanced fitness

Plans include exercise cards, intensity guidance, recovery hints, and completion tracking.

### Nutrition Coach

The nutrition area includes:

- Meal plan ideas
- Macro-style targets
- Smart quick meal suggestions
- Goal-based food recommendations
- Healthy food search through Google Maps

### User Profile

Users can save:

- Name
- Goal
- Activity level
- Preferred diet style
- Weight
- Sleep target

Profile data is stored locally and used to personalize the dashboard and suggestions.

### AI Coach

The AI coach is designed safely:

- Uses offline fallback responses by default
- Includes an API key placeholder only
- Does not expose a real API key
- Browser-side API calls are intentionally disabled for production safety
- Recommends a backend proxy if real AI integration is added later

---

## Google Services Integration

PeakFuel AI includes meaningful lightweight Google integration without heavy embeds:

- Browser Geolocation API support
- Location status message: `Location detected`
- Google Maps search link for healthy food nearby

Example search target:

```text
https://www.google.com/maps/search/healthy+food+near+me
```

This keeps the app fast, privacy-aware, and under the repository size limit.

---

## Accessibility

Accessibility was treated as a core requirement, not an afterthought.

Implemented accessibility features:

- Semantic HTML structure using `header`, `main`, `section`, and `aside`
- Keyboard-accessible buttons and controls
- Visible focus states
- ARIA labels for interactive actions
- High-contrast text and UI states
- Readable font sizes
- Responsive layout
- No interaction that requires a mouse only
- Safe text rendering with `textContent`

---

## Security

The project avoids common frontend security mistakes:

- No real API keys in the repository
- API placeholder only: `YOUR_OPENAI_API_KEY`
- User input is sanitized before use
- Dynamic text is rendered safely
- No `eval`
- No `document.write`
- No dangerous inline script injection
- Core data stays in `localStorage`
- No backend secrets are exposed

For production AI API usage, route requests through a secure backend proxy instead of calling an AI provider directly from the browser.

---

## Code Quality

The JavaScript is structured around small, readable functions.

Required core functions:

```text
calculateScore()
updateUI()
getSuggestion()
saveData()
loadData()
```

Additional structure includes:

- Central app state
- Data-driven UI rendering
- Reusable card rendering
- Minimal DOM updates
- Event listeners instead of inline handlers
- Comments for important logic
- Clear naming for state, logs, and UI targets

---

## Efficiency

PeakFuel AI is optimized for speed and simplicity:

- No frameworks
- No package manager required
- No build step
- No large images
- No heavy chart libraries
- No external runtime dependencies
- SVG/CSS-based visuals
- Small localStorage payloads
- Direct browser execution

The source footprint is far below the 1 MB requirement.

---

## Testing

The app includes a small built-in test section in `script.js`.

Open DevTools Console and look for logs from:

```text
runTests()
```

Test coverage includes:

- Score calculation
- Score clamping
- High-risk condition
- Habit warning condition
- Skip-meal suggestion condition
- Reward feedback condition

Example:

```javascript
console.log("Test Score:", calculateScore(2, 1, 3));
```

---

## File Structure

```text
PeakFuel-AI/
  index.html
  style.css
  script.js
  README.md
  firebase.json
```

---

## How To Run Locally

No installation is required.

```bash
git clone https://github.com/LALITHD-21/PeakFuel-AI.git
cd PeakFuel-AI
```

Then open:

```text
index.html
```

You can also serve it with any simple static server, but the app works directly in the browser.

---

## Deploy To Firebase Hosting

Firebase Hosting is the recommended Google Cloud deployment path for this project because the app is static, lightweight, and already includes `firebase.json`.

Install Firebase CLI:

```powershell
npm.cmd install -g firebase-tools
```

Login:

```powershell
firebase login
```

Initialize hosting if needed:

```powershell
firebase init hosting
```

Recommended setup answers:

```text
Public directory: .
Configure as single-page app: No
Set up GitHub deploys: Optional
Overwrite index.html: No
```

Deploy:

```powershell
firebase deploy --only hosting
```

Firebase will return production URLs similar to:

```text
https://your-project-id.web.app
https://your-project-id.firebaseapp.com
```

---

## Evaluation Checklist

| Requirement | Status |
| --- | --- |
| Code Quality | Clean functions, readable state, modular JS |
| Security | Safe DOM updates, sanitized input, no real keys |
| Efficiency | No frameworks, no heavy assets, under 1 MB |
| Testing | Console tests included |
| Accessibility | Semantic HTML, keyboard support, contrast, ARIA |
| Google Services | Geolocation plus Google Maps search |
| Offline Core | Works without backend or internet for core features |
| Deployment | Firebase Hosting config included |

---

## Repository

GitHub:

```text
https://github.com/LALITHD-21/PeakFuel-AI.git
```

---

## Final Note

PeakFuel AI is built to show that a smart health assistant does not need to be heavy. With a tiny static footprint, local-first storage, transparent rule-based intelligence, and polished UI, it delivers a fast and practical decision assistant that is easy to review, deploy, and extend.
