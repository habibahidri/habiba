/**
 * Water Demand Calculator
 * Estimates daily irrigation demand based on crop area and type.
 */

export const CROP_TYPES = {
  vegetables: { name: 'Vegetables', nameAr: 'خضروات', etcFactor: 1.0, area: 800 },
  cereals:    { name: 'Cereals',    nameAr: 'حبوب',    etcFactor: 0.7, area: 1200 },
  fruit:      { name: 'Fruit',      nameAr: 'أشجار',   etcFactor: 0.9, area: 600 },
  greenhouse: { name: 'Greenhouse', nameAr: 'بيت زجاجي', etcFactor: 1.2, area: 300 },
}

// ETo (reference evapotranspiration) in mm/day — simplified
export function calculateDailyDemand(cropDemandM3 = 3.5) {
  // Returns passed value directly (user-adjustable in UI)
  return cropDemandM3
}

export function waterDemandBreakdown() {
  return Object.values(CROP_TYPES).map(c => ({
    name: c.name,
    nameAr: c.nameAr,
    demand: ((c.etcFactor * 5 * c.area) / 1000).toFixed(1), // m³/day approx
  }))
}
