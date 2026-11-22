import { solarForecast }  from './SolarPredictor'
import { windForecast }   from './WindPredictor'
import { hydroForecast }  from './HydroPredictor'

export const ENERGY_SOURCES = {
  solar: {
    id: 'solar',
    label: 'Solar',
    labelAr: 'طاقة شمسية',
    icon: '☀️',
    color: '#f59e0b',
    thresholdKwh: 15, // min kWh/day considered sufficient
  },
  wind: {
    id: 'wind',
    label: 'Wind',
    labelAr: 'طاقة الريح',
    icon: '💨',
    color: '#06b6d4',
    thresholdKwh: 12,
  },
  hydro: {
    id: 'hydro',
    label: 'Hydro',
    labelAr: 'طاقة مائية',
    icon: '💧',
    color: '#38bdf8',
    thresholdKwh: 20,
  },
}

export function generateForecast(source, conditions) {
  switch (source) {
    case 'solar': return solarForecast(conditions)
    case 'wind':  return windForecast(conditions)
    case 'hydro': return hydroForecast(conditions)
    default:      return solarForecast(conditions)
  }
}
