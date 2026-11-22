/**
 * Solar Energy Predictor
 * Formula: P = Area × Efficiency × Irradiance × (1 - cloudFactor)
 * Panel array: 24 panels × 1.6 m² each, 20% efficiency
 */

export const SOLAR_PANEL_COUNT = 24
export const SOLAR_PANEL_WATTS = 320
export const SOLAR_NAMEPLATE_KW = (SOLAR_PANEL_COUNT * SOLAR_PANEL_WATTS) / 1000
const PANEL_AREA = SOLAR_PANEL_COUNT * 1.6 // m² — 320 W at 20% and 1 kW/m²
const PANEL_EFFICIENCY = 0.20
const PEAK_IRRADIANCE = 1.0        // kW/m² at peak sun

function dailyProduction(cloudCover, solarHours, seed = 0) {
  const jitter = (Math.sin(seed * 137.5) * 0.5 + 0.5) * 0.25 - 0.12
  const cloudFactor = Math.min(1, (cloudCover + jitter * 20) / 100)
  const kw = PANEL_AREA * PANEL_EFFICIENCY * PEAK_IRRADIANCE * (1 - cloudFactor)
  return Math.max(0, kw * solarHours)
}

export function solarForecast(conditions) {
  const { cloudCover = 30, solarHours = 7 } = conditions
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cloudVariants  = [cloudCover, cloudCover * 0.9, cloudCover * 1.1, cloudCover * 1.3,
                          cloudCover * 0.8, cloudCover * 1.5, cloudCover * 1.0]
  const hourVariants   = [solarHours, solarHours - 0.5, solarHours + 0.5, solarHours - 1,
                          solarHours + 1, solarHours - 1.5, solarHours]
  return days.map((label, i) => {
    const kwh = dailyProduction(cloudVariants[i], hourVariants[i], i)
    return { label, kwh: +kwh.toFixed(1), type: 'solar',
             meta: { cloud: Math.min(100, Math.max(0, cloudVariants[i])).toFixed(0) + '%',
                     hours: hourVariants[i].toFixed(1) + 'h' } }
  })
}
