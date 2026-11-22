import React from 'react'
import useFarmStore from '../store/farmStore'
import { ENERGY_SOURCES } from '../modules/energy/EnergyConfig'

export default function ForecastChart() {
  const forecast = useFarmStore(s => s.forecast)
  const simDay = useFarmStore(s => s.simDay)
  const energySource = useFarmStore(s => s.energySource)
  const language = useFarmStore(s => s.language)
  const src = ENERGY_SOURCES[energySource]

  if (!forecast || forecast.length === 0) {
    return <div style={{color:'var(--text-muted)',fontSize:'0.75rem',padding:'8px 0'}}>No forecast data</div>
  }

  const maxKwh = Math.max(...forecast.map(d => d.kwh), src.thresholdKwh * 1.2)

  const colorFor = (kwh) => {
    if (kwh >= src.thresholdKwh)        return 'good'
    if (kwh >= src.thresholdKwh * 0.6)  return 'ok'
    return 'bad'
  }

  const metaLine = (day) => {
    if (energySource === 'solar') return `☁ ${day.meta?.cloud ?? ''}`
    if (energySource === 'wind')  return `${day.meta?.speed ?? ''}`
    if (energySource === 'hydro') return `${day.meta?.flow ?? ''}`
    return ''
  }

  return (
    <div className="dash-section">
      <div className="dash-section-title">
        <h3>{language === 'ar' ? 'توقعات الطاقة (7 أيام)' : '7-Day Energy Forecast'}</h3>
        <span className="section-icon">{src.icon}</span>
      </div>
      <div className="forecast-wrap">
        {forecast.map((day, i) => {
          const cls = colorFor(day.kwh)
          const pct = Math.round((day.kwh / maxKwh) * 100)
          const active = forecast.length > 0 && (simDay % forecast.length) === i
          return (
            <div key={i} className={`forecast-day${active ? ' active' : ''}`}>
              <div className="forecast-pct" style={{
                color: cls === 'good' ? 'var(--accent-green)' : cls === 'ok' ? 'var(--accent-warning)' : 'var(--accent-danger)'
              }}>{day.kwh.toFixed(0)}</div>
              <div className="forecast-bar-wrap">
                <div
                  className={`forecast-bar ${cls}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              {/* Threshold line */}
              <div className="forecast-label">{day.label}</div>
              <div className="forecast-label" style={{fontSize:'0.55rem',color:'var(--text-muted)'}}>{metaLine(day)}</div>
            </div>
          )
        })}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'4px',fontSize:'0.65rem'}}>
        <span style={{display:'flex',alignItems:'center',gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#22c55e',display:'inline-block'}}></span> {language==='ar'?'كافي':'Sufficient'}</span>
        <span style={{display:'flex',alignItems:'center',gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#f97316',display:'inline-block'}}></span> {language==='ar'?'منخفض':'Low'}</span>
        <span style={{display:'flex',alignItems:'center',gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#ef4444',display:'inline-block'}}></span> {language==='ar'?'نقص':'Shortage'}</span>
      </div>
      <div style={{marginTop:'6px',padding:'4px 6px',background:'rgba(255,255,255,0.03)',borderRadius:'4px',fontSize:'0.65rem',color:'var(--text-muted)'}}>
        Threshold: {src.thresholdKwh} kWh/day minimum
      </div>
    </div>
  )
}
