/**
 * Hydropower Energy Predictor
 * P = η × ρ × g × Q × H
 * η = 0.85 (turbine efficiency), ρ = 1000 kg/m³, g = 9.81 m/s²
 */

const ETA   = 0.85
const RHO   = 1000
const G     = 9.81
const HOURS = 24

function hydroPower(Q, H) {
  return ETA * RHO * G * Q * H / 1000  // kW
}

export function hydroForecast(conditions) {
  const { flowRate = 4.2, headHeight = 8 } = conditions
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const flowVariants = [flowRate, flowRate * 0.9, flowRate * 0.95, flowRate * 0.7,
                        flowRate * 0.6, flowRate * 0.85, flowRate * 1.0]
  return days.map((label, i) => {
    const Q   = Math.max(0, flowVariants[i] * (1 + Math.sin(i * 1.7) * 0.05))
    const kwh = hydroPower(Q, headHeight) * HOURS
    const availability = Q < flowRate * 0.5 ? 'Low' : Q < flowRate * 0.8 ? 'Medium' : 'High'
    return { label, kwh: +kwh.toFixed(1), type: 'hydro',
             meta: { flow: Q.toFixed(1) + ' m³/s', availability } }
  })
}
