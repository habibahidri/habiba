/**
 * Simulated on-site power flow.
 * This is a deterministic energy balance, not a forecast service and not a trained model.
 *
 * Grid connected: every requested load is served. Surplus renewable energy charges
 * the battery, then exports. A deficit discharges the battery, then imports from the grid.
 *
 * Grid unavailable: a hybrid inverter can deliver renewable power and battery power
 * up to its kW limit. Loads are kept or dropped by priority. Renewable production
 * that cannot be used or stored is curtailed. Panels alone do not feed loads
 * beyond what the inverter and the battery can support.
 */

const PRIORITY_RANK = {
  critical: 0,
  important: 1,
  flexible: 2,
  'non-essential': 3,
}

export function renewableKwAt({ source, day, conditions, simHour }) {
  const daily = day?.kwh ?? 0
  if (daily <= 0) return 0
  if (source === 'solar') {
    const hours = Math.max(0.5, conditions?.solarHours ?? 7)
    const start = 12 - hours / 2
    const end = start + hours
    if (simHour >= start && simHour < end) return daily / hours
    return 0
  }
  return daily / 24
}

export function allocateLoads(loads, availableKw) {
  const ranked = [...loads].sort(
    (a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9),
  )
  let remaining = availableKw
  let blocked = false
  const servedById = {}
  for (const load of ranked) {
    const need = load.kw
    if (!blocked && remaining + 1e-9 >= need) {
      remaining -= need
      servedById[load.id] = { ...load, served: true, servedKw: need }
    } else {
      if (need > 0) blocked = true
      servedById[load.id] = { ...load, served: need <= 0, servedKw: 0 }
    }
  }
  return loads.map((load) => servedById[load.id])
}

export function stepEnergy({
  dtHours,
  renewableKw,
  loads,
  battery,
  gridAvailable,
}) {
  const dt = Math.max(0, dtHours)
  const desiredKw = loads.reduce((sum, load) => sum + load.kw, 0)
  const capacity = battery.capacityKwh
  const inverterKw = battery.maxKw
  let stored = (battery.chargePct / 100) * capacity

  let servedLoads
  let gridImportKwh = 0
  let gridExportKwh = 0
  let chargeKwh = 0
  let dischargeKwh = 0
  let curtailedKwh = 0
  let unmetKwh = 0

  if (gridAvailable) {
    servedLoads = loads.map((load) => ({ ...load, served: true, servedKw: load.kw }))
    const produced = renewableKw * dt
    const demand = desiredKw * dt
    const fromRenew = Math.min(produced, demand)
    const deficit = demand - fromRenew
    const surplus = produced - fromRenew
    const maxTransfer = inverterKw * dt
    dischargeKwh = Math.min(deficit, stored, maxTransfer)
    stored -= dischargeKwh
    gridImportKwh = deficit - dischargeKwh
    const room = Math.max(0, capacity - stored)
    chargeKwh = Math.min(surplus, room, maxTransfer)
    stored += chargeKwh
    gridExportKwh = surplus - chargeKwh
  } else {
    const renewToAc = Math.min(renewableKw, inverterKw)
    const storedKw = dt > 0 ? stored / dt : 0
    const batteryToAc = Math.min(Math.max(0, inverterKw - renewToAc), storedKw)
    const availableKw = renewToAc + batteryToAc
    servedLoads = allocateLoads(loads, availableKw)
    const servedKw = servedLoads.reduce((sum, load) => sum + load.servedKw, 0)
    unmetKwh = Math.max(0, desiredKw - servedKw) * dt

    const produced = renewableKw * dt
    const servedEnergy = servedKw * dt
    const fromRenew = Math.min(produced, servedEnergy, renewToAc * dt)
    const needBattery = Math.max(0, servedEnergy - fromRenew)
    dischargeKwh = Math.min(needBattery, stored, batteryToAc * dt)
    stored -= dischargeKwh

    const surplusRenew = Math.max(0, produced - fromRenew)
    const inverterLeft = Math.max(0, inverterKw * dt - fromRenew - dischargeKwh)
    const room = Math.max(0, capacity - stored)
    chargeKwh = Math.min(surplusRenew, room, inverterLeft)
    stored += chargeKwh
    curtailedKwh = Math.max(0, surplusRenew - chargeKwh)
  }

  const chargePct = capacity > 0
    ? Math.max(0, Math.min(100, (stored / capacity) * 100))
    : 0
  const servedKw = servedLoads.reduce((sum, load) => sum + load.servedKw, 0)

  return {
    battery: { ...battery, chargePct },
    loads: servedLoads,
    renewableKw,
    loadKw: desiredKw,
    servedKw,
    balanceKw: renewableKw - desiredKw,
    batteryKw: dt > 0 ? (chargeKwh - dischargeKwh) / dt : 0,
    gridImportKwh,
    gridExportKwh,
    chargeKwh,
    dischargeKwh,
    curtailedKwh,
    unmetKwh,
    productionKwh: renewableKw * dt,
    consumptionKwh: servedKw * dt,
  }
}

export function emptyEnergyMeters() {
  return {
    productionKwh: 0,
    consumptionKwh: 0,
    gridImportKwh: 0,
    gridExportKwh: 0,
    curtailedKwh: 0,
    unmetKwh: 0,
    chargeKwh: 0,
    dischargeKwh: 0,
  }
}

export function formatSimClock(simDay, simHour) {
  const hour = Math.floor(simHour) % 24
  const minute = Math.floor((simHour % 1) * 60)
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `Day ${simDay + 1} · ${hh}:${mm}`
}
