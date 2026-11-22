/**
 * Intelligent Pump Controller
 * Decides whether to pump, idle, or wait based on forecast and water level.
 */

import { ENERGY_SOURCES } from '../energy/EnergyConfig'
import { calculateRequiredReserve, REFILL_TARGET_PCT } from '../water/ReserveCalculator'

export function computePumpDecision({
  forecast,
  waterLevel,
  tankCapacity,
  cropDemand,
  energySource = 'solar',
  refillLatched = false,
}) {
  if (!forecast || forecast.length === 0) {
    return { action: 'idle', reason: 'No forecast data available.', severity: 'ok', recommendPump: false, refillLatched: false }
  }

  const src = ENERGY_SOURCES[energySource] ?? ENERGY_SOURCES.solar
  const reserve = calculateRequiredReserve({
    forecast, energySource, cropDemand, tankCapacity,
  })
  const { shortageDays, shortageStart, requiredM3, requiredPct, seuilM3, seuilPct } = reserve

  const currentM3 = (waterLevel / 100) * tankCapacity
  const todayKwh = forecast[0]?.kwh ?? 0
  const energyOk = todayKwh >= src.thresholdKwh
  const tankFull = waterLevel >= 95
  const underSeuil = waterLevel < seuilPct
  const continueFill = refillLatched && waterLevel < REFILL_TARGET_PCT

  let action = 'idle'
  let reason = ''
  let severity = 'ok'
  let recommendPump = false
  let nextLatch = false

  if (tankFull) {
    action = 'idle'
    reason = `Tank is at ${waterLevel.toFixed(0)}% — above the refill stop. No pumping needed.`
  } else if (underSeuil || continueFill) {
    action = 'pump'
    severity = underSeuil ? 'warning' : 'ok'
    recommendPump = true
    nextLatch = true
    if (underSeuil) {
      reason = `Reserve is under the seuil: ${currentM3.toFixed(1)} m³ (${waterLevel.toFixed(0)}%) is below ${seuilM3.toFixed(1)} m³ (${seuilPct.toFixed(0)}%). ` +
        `Automatic refill until ${REFILL_TARGET_PCT}%. The pump runs only while its power is covered.`
      if (shortageDays > 0) {
        reason += ` Forecast also has ${shortageDays} low-${src.label} day${shortageDays > 1 ? 's' : ''}` +
          `${shortageStart === 0 ? ' starting today' : ` starting in ${shortageStart} day(s)`}.`
      }
    } else {
      reason = `Refill in progress. Tank at ${waterLevel.toFixed(0)}% (${currentM3.toFixed(1)} m³). ` +
        `Pump stays on until ${REFILL_TARGET_PCT}% so it does not stop on the seuil.`
    }
  } else if (shortageDays > 0 && !energyOk) {
    action = 'wait'
    severity = 'danger'
    reason = `Insufficient ${src.label} energy today (${todayKwh.toFixed(1)} kWh < ${src.thresholdKwh} kWh). ` +
      `Shortage expected for ${shortageDays} day${shortageDays > 1 ? 's' : ''}. ` +
      `Reserve is still above the seuil (${waterLevel.toFixed(0)}% vs ${seuilPct.toFixed(0)}%).`
  } else {
    action = 'idle'
    reason = `Reserve is above the seuil (${waterLevel.toFixed(0)}% vs ${seuilPct.toFixed(0)}%, ${currentM3.toFixed(1)} / ${seuilM3.toFixed(1)} m³). No refill.`
  }

  return {
    action,
    reason,
    severity,
    recommendPump,
    refillLatched: nextLatch,
    shortageDays,
    requiredPct,
    requiredM3,
    seuilPct,
    seuilM3,
    refillTargetPct: REFILL_TARGET_PCT,
  }
}
