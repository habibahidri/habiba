import { create } from 'zustand'
import { generateForecast } from '../modules/energy/EnergyConfig'
import { computePumpDecision } from '../modules/pump/PumpController'
import { resolveLoads } from '../modules/energy/Equipment'
import {
  renewableKwAt,
  stepEnergy,
  emptyEnergyMeters,
} from '../modules/energy/EnergyBalance'

const INITIAL_CONDITIONS = {
  solar: { cloudCover: 30, solarHours: 7 },
  wind: { windSpeed: 6.5 },
  hydro: { flowRate: 0.04, headHeight: 8 },
}

const INITIAL_BATTERY = {
  capacityKwh: 15,
  chargePct: 60,
  maxKw: 5,
}

function rotateForecast(forecast, simDay) {
  if (!forecast?.length) return []
  const index = ((simDay % forecast.length) + forecast.length) % forecast.length
  return forecast.slice(index).concat(forecast.slice(0, index))
}

function activeDay(forecast, simDay) {
  if (!forecast?.length) return null
  const index = ((simDay % forecast.length) + forecast.length) % forecast.length
  return forecast[index]
}

function decide(state) {
  return computePumpDecision({
    forecast: rotateForecast(state.forecast, state.simDay),
    waterLevel: state.waterLevel,
    tankCapacity: state.tankCapacity,
    cropDemand: state.cropDemand,
    energySource: state.energySource,
    refillLatched: state.refillLatched,
  })
}

function resolvePump(state, decision) {
  if (state.waterLevel >= 95) return false
  if (state.pumpControl === 'on') return true
  if (state.pumpControl === 'off') return false
  return decision?.recommendPump === true
}

function applyEnergy(state, pumpActive, dtHours) {
  const day = activeDay(state.forecast, state.simDay)
  const renewableKw = renewableKwAt({
    source: state.energySource,
    day,
    conditions: state.conditions[state.energySource],
    simHour: state.simHour,
  })
  const loads = resolveLoads({
    simHour: state.simHour,
    pumpActive,
    irrigationActive: state.irrigationActive,
    equipmentOn: state.equipmentOn,
  })
  const step = stepEnergy({
    dtHours,
    renewableKw,
    loads,
    battery: state.battery,
    gridAvailable: state.gridAvailable,
  })
  const meters = {
    productionKwh: state.meters.productionKwh + step.productionKwh,
    consumptionKwh: state.meters.consumptionKwh + step.consumptionKwh,
    gridImportKwh: state.meters.gridImportKwh + step.gridImportKwh,
    gridExportKwh: state.meters.gridExportKwh + step.gridExportKwh,
    curtailedKwh: state.meters.curtailedKwh + step.curtailedKwh,
    unmetKwh: state.meters.unmetKwh + step.unmetKwh,
    chargeKwh: state.meters.chargeKwh + step.chargeKwh,
    dischargeKwh: state.meters.dischargeKwh + step.dischargeKwh,
  }
  return { step, meters }
}

const initialForecast = generateForecast('solar', INITIAL_CONDITIONS.solar)
const initialCore = {
  energySource: 'solar',
  forecast: initialForecast,
  simDay: 0,
  simHour: 9,
  waterLevel: 62,
  tankCapacity: 50,
  cropDemand: 3.5,
  pumpControl: 'auto',
  refillLatched: false,
  irrigationActive: true,
  gridAvailable: true,
  battery: { ...INITIAL_BATTERY },
  equipmentOn: { machinery: false },
  conditions: INITIAL_CONDITIONS,
  meters: emptyEnergyMeters(),
}
const initialDecision = decide(initialCore)
const initialPump = resolvePump(initialCore, initialDecision)
const initialEnergy = applyEnergy(initialCore, initialPump, 0)

const useFarmStore = create((set, get) => ({
  ...initialCore,
  pumpActive: initialPump,
  paused: false,
  simSpeed: 1,
  language: 'en',
  selectedObject: null,
  aiDecision: initialDecision,
  power: initialEnergy.step,
  meters: initialEnergy.meters,

  refreshDecision: () => {
    const state = get()
    const aiDecision = decide(state)
    const pumpActive = resolvePump(state, aiDecision)
    const { step, meters } = applyEnergy({ ...state, pumpActive }, pumpActive, 0)
    set({
      aiDecision,
      pumpActive,
      power: step,
      meters,
      refillLatched: aiDecision.refillLatched === true,
    })
  },

  setEnergySource: (src) => {
    const forecast = generateForecast(src, get().conditions[src])
    set({ energySource: src, forecast, meters: emptyEnergyMeters() })
    get().refreshDecision()
  },

  refreshForecast: () => {
    const { energySource, conditions } = get()
    const forecast = generateForecast(energySource, conditions[energySource])
    set({ forecast })
    get().refreshDecision()
  },

  setCondition: (source, key, value) => {
    const conditions = {
      ...get().conditions,
      [source]: { ...get().conditions[source], [key]: value },
    }
    set({ conditions })
    if (source === get().energySource) get().refreshForecast()
  },

  setWaterLevel: (v) => {
    set({ waterLevel: Math.max(0, Math.min(100, v)) })
    get().refreshDecision()
  },
  setTankCapacity: (v) => {
    set({ tankCapacity: v })
    get().refreshDecision()
  },
  setCropDemand: (v) => {
    set({ cropDemand: v })
    get().refreshDecision()
  },
  setSimSpeed: (v) => set({ simSpeed: v }),
  setPaused: (v) => set({ paused: v }),
  setGridAvailable: (v) => {
    set({ gridAvailable: v })
    get().refreshDecision()
  },
  setEquipmentOn: (id, on) => {
    set({ equipmentOn: { ...get().equipmentOn, [id]: on } })
    get().refreshDecision()
  },

  setPumpActive: (on) => {
    set({ pumpControl: on ? 'on' : 'off', pumpActive: on && get().waterLevel < 95 })
    get().refreshDecision()
  },
  releasePumpToAuto: () => {
    set({ pumpControl: 'auto' })
    get().refreshDecision()
  },

  setIrrigationActive: (v) => {
    set({ irrigationActive: v })
    get().refreshDecision()
  },
  setSelectedObject: (v) => set({ selectedObject: v }),
  setLanguage: (v) => set({ language: v }),

  tick: () => {
    const state = get()
    if (state.paused) return

    const dtHours = (1 / 60) * state.simSpeed
    const pumpActive = resolvePump(state, state.aiDecision)

    const dtDays = dtHours / 24
    const pumpRate = 8
    const drainRate = state.cropDemand
    const pumpPowered = state.power?.loads?.find((l) => l.id === 'pump')?.served !== false
    const irrigationPowered = state.power?.loads?.find((l) => l.id === 'irrigation')?.served !== false
    let delta = 0
    if (pumpActive && pumpPowered) {
      delta += (pumpRate * dtHours / state.tankCapacity) * 100
    }
    if (state.irrigationActive && irrigationPowered && state.waterLevel > 0) {
      const availableM3 = (state.waterLevel / 100) * state.tankCapacity
      const requested = drainRate * dtDays
      const used = Math.min(availableM3, requested)
      delta -= (used / state.tankCapacity) * 100
    }
    const waterLevel = Math.max(0, Math.min(100, state.waterLevel + delta))

    let simHour = state.simHour + dtHours
    let simDay = state.simDay
    let dayAdvanced = false
    if (simHour >= 24) {
      simHour -= 24
      simDay += 1
      dayAdvanced = true
    }

    const next = {
      ...state,
      pumpActive,
      waterLevel,
      simHour,
      simDay,
      meters: dayAdvanced ? emptyEnergyMeters() : state.meters,
    }
    const decision = decide(next)
    const { step, meters } = applyEnergy(next, pumpActive, dtHours)

    set({
      pumpActive,
      waterLevel,
      simHour,
      simDay,
      aiDecision: decision,
      power: step,
      battery: step.battery,
      meters,
      refillLatched: decision.refillLatched === true,
    })
  },
}))

export default useFarmStore
