import React from 'react'
import useFarmStore from '../store/farmStore'

const SOURCES = [
  { id: 'solar', icon: '☀️', label: 'Solar', labelAr: 'طاقة شمسية', className: 'solar' },
  { id: 'wind',  icon: '💨', label: 'Wind',  labelAr: 'طاقة الريح', className: 'wind'  },
  { id: 'hydro', icon: '💧', label: 'Hydro', labelAr: 'طاقة مائية', className: 'hydro' },
]

export default function EnergySourceSelector() {
  const energySource = useFarmStore(s => s.energySource)
  const setEnergySource = useFarmStore(s => s.setEnergySource)
  const language = useFarmStore(s => s.language)

  return (
    <div className="energy-selector">
      <h2>⚡ {language === 'ar' ? 'مصدر الطاقة المتجددة' : 'Renewable Energy Source'}</h2>
      <div className="energy-tabs">
        {SOURCES.map(src => (
          <button
            key={src.id}
            className={`energy-tab ${src.className}${energySource === src.id ? ' active' : ''}`}
            onClick={() => setEnergySource(src.id)}
            id={`energy-tab-${src.id}`}
          >
            <span className="tab-icon">{src.icon}</span>
            <span className="tab-label">{src.label}</span>
            <span className="tab-label-ar">{src.labelAr}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
