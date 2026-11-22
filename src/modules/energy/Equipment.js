/**
 * Farm equipment catalogue.
 * Power ratings are simulation parameters for a small irrigated farm,
 * not measurements from a meter.
 */

export const PRIORITY_ORDER = ['critical', 'important', 'flexible', 'non-essential']

export const EQUIPMENT = [
  {
    id: 'pump',
    name: 'Water pump',
    nameAr: 'مضخة المياه',
    priority: 'critical',
    ratedKw: 2.2,
    standbyKw: 0.02,
    follows: 'pump',
  },
  {
    id: 'irrigation',
    name: 'Irrigation controller',
    nameAr: 'جهاز الري',
    priority: 'important',
    ratedKw: 0.15,
    standbyKw: 0.01,
    follows: 'irrigation',
  },
  {
    id: 'ventilation',
    name: 'Greenhouse ventilation',
    nameAr: 'تهوية البيت',
    priority: 'important',
    ratedKw: 0.8,
    standbyKw: 0.04,
    schedule: [8, 20],
  },
  {
    id: 'lighting',
    name: 'Yard lighting',
    nameAr: 'الإنارة',
    priority: 'flexible',
    ratedKw: 0.36,
    standbyKw: 0,
    schedule: [18, 23],
  },
  {
    id: 'machinery',
    name: 'Workshop tools',
    nameAr: 'معدات الورشة',
    priority: 'non-essential',
    ratedKw: 1.6,
    standbyKw: 0.06,
    manual: true,
  },
]

export function resolveLoads({ simHour, pumpActive, irrigationActive, equipmentOn }) {
  return EQUIPMENT.map((eq) => {
    let running = false
    if (eq.follows === 'pump') running = pumpActive
    else if (eq.follows === 'irrigation') running = irrigationActive
    else if (eq.schedule) {
      const [from, to] = eq.schedule
      running = simHour >= from && simHour < to
    } else if (eq.manual) {
      running = Boolean(equipmentOn?.[eq.id])
    }
    const kw = running ? eq.ratedKw : eq.standbyKw
    return {
      ...eq,
      running,
      standby: !running && eq.standbyKw > 0,
      kw,
    }
  })
}

export function formatSchedule(eq) {
  if (eq.follows === 'pump') return 'Follows pump'
  if (eq.follows === 'irrigation') return 'Follows irrigation'
  if (eq.schedule) {
    const [from, to] = eq.schedule
    const pad = (h) => `${String(h).padStart(2, '0')}:00`
    return `${pad(from)}–${pad(to)}`
  }
  if (eq.manual) return 'Manual'
  return ''
}
