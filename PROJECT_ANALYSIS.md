# PROJECT_ANALYSIS — smart-farm (AgroNexus)

Inspection date: 14 November 2026. Findings come from the source in this workspace, not from the README.

## Project overview

This repository is a **browser-only digital twin** branded **AgroNexus** (`index.html` title: “AgroNexus — Smart Farm Digital Twin”). The npm package name is `smart-farm`.

It simulates one farm with:

- one active renewable source at a time (solar, wind, or hydro),
- a formula-based 7-day energy forecast from user sliders,
- a water tank and irrigation pump,
- a rule that recommends pumping before forecasted low-production days.

The UI labels the decision panel “System Decision” and the footer says **“SIMULATED DATA — not real forecasts.”** That label is accurate.

**PlantDNA is not in this workspace.** There is no DNA sequence handling, classifier, trained model, crop-variety database, wheat analysis, disease model, research retrieval, backend, database, or external weather API. A search of sibling folders under `.gemini/antigravity/scratch` found only this app and an unrelated portfolio. The stock `README.md` still describes the Vite React template and does not document AgroNexus.

## Actual folder structure

```
smart-farm/
  index.html                 # entry HTML, AgroNexus title
  package.json
  vite.config.js             # Vite + React, dev server port 5173
  .oxlintrc.json
  README.md                  # unmodified Vite template
  public/
    favicon.svg
    icons.svg                # farm-icon.svg referenced by index.html is missing
  src/
    main.jsx                 # React mount
    App.jsx                  # header + 3D viewport + dashboard
    store/farmStore.js       # Zustand state and simulation tick
    styles/index.css
    modules/
      energy/EnergyConfig.js
      energy/SolarPredictor.js
      energy/WindPredictor.js
      energy/HydroPredictor.js
      water/WaterDemand.js
      water/ReserveCalculator.js
      pump/PumpController.js
    dashboard/
      Dashboard.jsx
      EnergySourceSelector.jsx
      ForecastChart.jsx
      WaterReserveGauge.jsx
      AIDecisionLog.jsx
    scene/
      FarmScene.jsx
      terrain/Terrain.jsx, CropField.jsx
      buildings/FarmBuilding.jsx, Greenhouse.jsx
      vegetation/Tree.jsx
      water/WaterTank.jsx, WaterPump.jsx, IrrigationPipes.jsx
      energy/SolarArray.jsx, WindTurbine.jsx, HydroStation.jsx
```

No `tests/`, no `.env`, no API routes, no server.

## Technology stack

| Layer | What is used |
| --- | --- |
| UI | React 19, Vite 8 |
| 3D | Three.js, `@react-three/fiber`, `@react-three/drei` (primitive meshes, not imported GLTF models) |
| State | Zustand (`src/store/farmStore.js`) |
| Charts | Custom CSS bar chart. `recharts` is in `package.json` and is **not imported** |
| Lint | oxlint |
| Backend / DB / ML | None |

## How to run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run preview
npm run lint
```

There is no test script.

## Main entry points

1. `index.html` loads `/src/main.jsx`.
2. `src/App.jsx` lays out the header, `FarmScene`, and `Dashboard`.
3. `src/store/farmStore.js` is the shared state. The 3D scene calls `tick()` once per animation frame.
4. Energy math starts at `generateForecast()` in `EnergyConfig.js`.
5. The pump recommendation starts at `computePumpDecision()` in `PumpController.js`.

## Existing modules and what they actually do

### Energy forecast (simulated formulas)

`EnergyConfig.js` allows exactly one source: `solar`, `wind`, or `hydro`. Each has an Arabic label and a daily kWh threshold (15 / 12 / 20).

| File | Inputs | Formula | Output |
| --- | --- | --- | --- |
| `SolarPredictor.js` | cloud cover %, sun hours | `P = 24 × 1.6 m² × 0.20 × 1 kW/m² × (1 − cloud) × hours`, plus sine jitter | 7 daily kWh values |
| `WindPredictor.js` | wind speed m/s | Betz-style `0.5 ρ A Cp v³`, cut-in 3 m/s, rated 12 m/s, cut-out 25 m/s, rotor radius **25 m** | 7 daily kWh values |
| `HydroPredictor.js` | flow m³/s, head m | `η ρ g Q H`, η = 0.85, run 24 h | 7 daily kWh values |

Day labels are fixed strings (`Today`, `Mon` … `Sat`), not a calendar and not a weather service. Changing the active source’s sliders regenerates the forecast.

**Scale mismatch:** the solar info panel says “12 × 320 W” and “3.84 kW” (`SolarArray.jsx`), while the predictor uses 24 panels × 1.6 m² × 20% (about 7.68 kW peak). Wind and hydro use utility-scale constants, so default forecasts sit far above the 12–20 kWh/day “sufficient” thresholds. Shortage logic is hard to demonstrate on wind or hydro without extreme slider values.

### Water and pump (deterministic rules)

- Tank: `waterLevel` percent and `tankCapacity` m³ (default 62% of 50 m³).
- Crop demand: one slider, default **3.5 m³/day**. It is not computed from DNA or from the crop meshes.
- `WaterDemand.js` defines four illustrative crop rows (vegetables, cereals, fruit, greenhouse) with area and an `etcFactor`. `calculateDailyDemand()` returns the slider value unchanged. `waterDemandBreakdown()` is **never called**. The breakdown uses a fixed 5 mm/day reference, so those numbers are placeholders.
- `ReserveCalculator.js` counts forecast days below the source threshold and sets `requiredM3 = shortageDays × cropDemand`.
- `PumpController.js` returns `pump`, `idle`, or `wait`, plus an English reason string. It is a rule table, not a model. The code and UI still name the result `aiDecision`.

### Simulation tick

`farmStore.tick()` runs every frame:

- Assumes one frame = 1/60 s, so at 60 fps about **one simulated hour passes per real second**. `simSpeed` exists in the store and has **no control in the UI**.
- Pump fill rate is hardcoded at **8 m³/h**. Irrigation drain uses `cropDemand` m³/day.
- If the current decision says `recommendPump` and the tank is under 95%, the tick turns the pump on. A manual Stop is overwritten on the next frames while that flag stays true.
- Filling the tank or moving the demand / capacity sliders does **not** recompute the decision. `refreshForecast()` runs only when the energy source or a condition slider changes. The reason text can show a stale water level.
- Irrigation is allowed to run with the pump off. The pipe mesh turns blue only when **both** irrigation and the pump are on (`IrrigationPipes.jsx`), so the visual does not match the drain logic.
- The pump does not check whether today’s kWh could actually run a 2.2 kW load. The 2.2 kW figure appears only in the 3D pump popup.

### Dashboard

`Dashboard.jsx` shows today’s kWh versus the threshold, source-specific sliders, the 7-day bars, the tank gauge (current volume and required reserve), the decision text, and pump / irrigation toggles plus tank sliders. English/Arabic is partial: many headings switch, but decision sentences stay English, and `<html dir="ltr">` never changes.

### 3D scene (visual twin of the same store)

`FarmScene.jsx` draws terrain, four crop zones (leafy, brassica, mixed, herbs — colors only), a farm building, a greenhouse, trees, tank, pump, pipes, a tractor, a weather-station pole, and crates. Only the selected energy source is mounted.

Click targets with live panels: tank, pump (start/stop), solar, wind, hydro. Greenhouse and farm building set `selectedObject` and **have no panel**. Crops, tractor, and weather station are not interactive. There is no battery, grid, generator, livestock, or outage lighting.

## Implemented features

- Single-page 3D farm and sidebar sharing one Zustand store.
- One-at-a-time solar / wind / hydro selection, each with its own inputs.
- Deterministic daily energy estimates in kWh, with an on-screen “simulated” disclaimer.
- Shortage-day count and required tank volume from those estimates and a single crop-demand number.
- Rule-based pump / wait / idle recommendation with a written reason.
- Animated tank level driven by pump fill and irrigation drain.
- Click-to-inspect panels for tank, pump, and the active energy asset.
- Partial EN/AR labels.
- Production build already present in `dist/` (not source of truth).

## Incomplete, placeholder, or misleading

| Item | Status |
| --- | --- |
| README | Does not describe this app |
| `recharts` | Unused dependency |
| `waterDemandBreakdown` / `CROP_TYPES` | Defined, not used by the slider or the scene |
| `simSpeed` | Stored, no UI |
| Greenhouse / farmhouse clicks | State only, no UI |
| Solar panel count | 3D label disagrees with the predictor |
| “AI” decision | Deterministic rules |
| Arabic mode | Incomplete; layout stays LTR |
| `index.html` icon | Points at missing `/farm-icon.svg` |
| Pipe “flow” | Requires pump and irrigation together, while irrigation drain does not |
| Decision freshness | Stale after water or demand changes |
| Manual pump stop | Overridden while `recommendPump` is true |

## What is real versus simulated

| | |
| --- | --- |
| Real external data | None. No API keys in the frontend because there are no API calls. |
| Trained ML | None. |
| Simulated | All energy, water, pump, and crop numbers. Formulas are explicit in the predictor files. |
| User input | Cloud cover, sun hours, wind speed, flow, head, tank size, tank level, daily demand, pump and irrigation toggles. |

## Missing for PlantDNA Nexus

Compared with the five target modules:

1. **Crop intelligence.** No sequences, classification, varieties, stress tolerance, growth stages, or a link from a crop profile into `cropDemand`. The 3D crops are decorative.
2. **Water.** Tank volume, a single demand number, reserve math, and a fill/drain tick exist. Missing: irrigation schedule, a hard stop when the tank is empty beyond the existing clamp, pump power tied to available energy, and pre-outage reserve as a timed 48-hour scenario.
3. **Energy monitoring and economization.** Production forecast exists. Missing: consumption in kWh, per-equipment loads, standby, battery state of charge, energy balance, savings estimates, and a biogas configuration. Renewable configs should stay separate; do not feed solar inputs into wind or hydro.
4. **Power continuity.** No grid on/off, storage, backup generator, equipment priorities (critical / important / flexible / non-essential), load shedding, or recovery report.
5. **Decision center.** One pump rule and one reason string exist. Missing: a log of events, outage responses, and wording that calls rules “rules.”
6. **48-hour demo.** No scenario trigger, replay, or post-event consumption report.

## Files to extend (do not replace)

Keep the split between `src/modules` (numbers), `src/store` (shared state), `src/dashboard` (controls), and `src/scene` (meshes).

| Concern | Extend |
| --- | --- |
| Shared scenario state | `src/store/farmStore.js` |
| Source selection | `src/modules/energy/EnergyConfig.js` and the three predictors |
| New loads, battery, grid | new files under `src/modules/energy/` (for example battery and equipment), called from the store |
| Crop water input | `src/modules/water/WaterDemand.js` — wire it only with values the project actually stores; do not invent DNA results |
| Reserve and pump rules | `ReserveCalculator.js`, `PumpController.js` |
| Recommendations and history | `AIDecisionLog.jsx`, `Dashboard.jsx` |
| 48-hour controls | `Dashboard.jsx` and `App.jsx` |
| Visual states | `FarmScene.jsx`, `WaterTank.jsx`, `WaterPump.jsx`, energy meshes |
| Run instructions | `README.md` (after the product name is confirmed) |

Avoid a second parallel folder tree (`crop-intelligence/`, `ai-decision-center/`, …) until a module outgrows `src/modules`.

## Recommended development steps

Work in the existing app. Do not rebuild the scene or the store.

1. **Fix the current loop before adding modules.** Recompute the pump decision when water level, demand, or capacity changes. Let a manual pump stop stick until the user or a new rule releases it. Align pipe color with irrigation, and align the solar panel label with `SolarPredictor.js`. Add a visible simulation clock because the tick is much faster than real time.
2. **Energy balance.** Add an equipment list with rated kW, priority, and on/off state. Track production, consumption, and balance in kWh using the existing forecast as *available renewable energy*, clearly marked simulated. Rescale wind and hydro constants to farm equipment, or show them as “scenario scale,” so shortage days are reachable.
3. **Economization rules.** Standby and schedule advice as explicit rules with the numbers that triggered them. One renewable configuration active, same as today. Biogas stays off unless a farm profile enables it.
4. **Outage scenario.** Grid flag, optional battery (kWh and charge), optional backup. During outage, renewable production does not power loads unless storage or a backup source is on. Shed non-essential and flexible loads. Keep critical loads only while backup energy lasts. Alert when it does not.
5. **Water link.** Drive `cropDemand` from a small, labeled crop profile (user-selected demand, not a DNA prediction). Pump only if water remains and the pump’s kW is covered. Recommend filling the tank before low-production days — this rule already exists and should stay the core of the demo.
6. **Decision log.** Append timestamped entries: rule name, reason, and the values used. Do not call the rule engine an AI model.
7. **3D.** Battery and grid status, tank fill (already dynamic), equipment on/off, dimmed scene during outage. Keep meshes in `src/scene` and decisions in `src/modules`.
8. **One replayable 48-hour script** in the store: pre-shortage warning, charge and fill, grid off, prioritized loads, irrigation if resources allow, grid restore, consumption summary.

PlantDNA crop and sequence features should be integrated only when that source code or a documented model is added to the repo. Until then, crop data in this app should stay user-configured simulation parameters.
