/**
 * Required Reserve Calculator
 * Calculates how much water must be pre-stored to survive an energy shortage.
 */

import { ENERGY_SOURCES } from '../energy/EnergyConfig'

/** Days of demand kept in the tank even when the forecast has no shortage. */
export const MIN_RESERVE_DAYS = 2
/** Automatic refill runs until this level, then stops. */
export const REFILL_TARGET_PCT = 90

export function calculateRequiredReserve({ forecast, energySource, cropDemand, tankCapacity }) {
  const threshold = ENERGY_SOURCES[energySource]?.thresholdKwh ?? 15
  let shortageDays = 0
  let shortageStart = -1

  forecast.forEach((day, i) => {
    if (day.kwh < threshold) {
      shortageDays++
      if (shortageStart === -1) shortageStart = i
    }
  })

  const capacity = Math.max(tankCapacity, 0.1)
  const requiredM3   = shortageDays * cropDemand
  const requiredPct  = Math.min(100, (requiredM3 / capacity) * 100)
  const floorM3 = Math.max(0, cropDemand * MIN_RESERVE_DAYS)
  const seuilM3 = Math.max(requiredM3, floorM3)
  const seuilPct = Math.min(REFILL_TARGET_PCT - 5, (seuilM3 / capacity) * 100)

  return {
    shortageDays,
    shortageStart,
    requiredM3: +requiredM3.toFixed(1),
    requiredPct: +requiredPct.toFixed(1),
    seuilM3: +seuilM3.toFixed(1),
    seuilPct: +seuilPct.toFixed(1),
  }
}
