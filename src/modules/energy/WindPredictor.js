/**
 * Wind Energy Predictor
 * Uses simplified Betz law power curve:
 * P = 0.5 × ρ × A × Cp × v³
 * ρ = 1.225 kg/m³, A = π×r² (r=25m), Cp = 0.4 (Betz limit ~0.593)
 */

const AIR_DENSITY   = 1.225   // kg/m³
export const ROTOR_RADIUS_M = 3       // farm-scale turbine, 6 m diameter
export const ROTOR_DIAMETER_M = ROTOR_RADIUS_M * 2
const ROTOR_AREA    = Math.PI * ROTOR_RADIUS_M ** 2
const CP            = 0.38    // power coefficient
const HOURS_PER_DAY = 24
const CUT_IN_SPEED  = 3       // m/s — turbine starts
const CUT_OUT_SPEED = 25      // m/s — turbine shuts down
const RATED_SPEED   = 12      // m/s — full output

function turbinePower(v) {
  if (v < CUT_IN_SPEED || v > CUT_OUT_SPEED) return 0
  const vEff = Math.min(v, RATED_SPEED)
  return 0.5 * AIR_DENSITY * ROTOR_AREA * CP * vEff ** 3 / 1000 // kW
}

export function windForecast(conditions) {
  const { windSpeed = 6.5 } = conditions
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const speedVariants = [windSpeed, windSpeed * 1.1, windSpeed * 0.7, windSpeed * 0.5,
                         windSpeed * 0.9, windSpeed * 1.2, windSpeed * 0.6]
  return days.map((label, i) => {
    const v   = Math.max(0, speedVariants[i] + (Math.sin(i * 2.3) * 0.5))
    const kwh = turbinePower(v) * HOURS_PER_DAY
    const condition = v < CUT_IN_SPEED ? 'Calm' : v < 7 ? 'Light' : v < 12 ? 'Moderate' : 'Strong'
    return { label, kwh: +kwh.toFixed(1), type: 'wind',
             meta: { speed: v.toFixed(1) + ' m/s', condition } }
  })
}
