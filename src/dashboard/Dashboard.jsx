import React from 'react'
import useFarmStore from '../store/farmStore'
import EnergySourceSelector from './EnergySourceSelector'
import ForecastChart from './ForecastChart'
import WaterReserveGauge from './WaterReserveGauge'
import AIDecisionLog from './AIDecisionLog'
import EnergyMonitor from './EnergyMonitor'
import { ENERGY_SOURCES } from '../modules/energy/EnergyConfig'

// Minimal inline stat row
function Stat({ label, labelAr, value, valueColor, lang }) {
  return (
    <div className="stat-row">
      <div className="stat-label">
        {label}
        {lang === 'en' && labelAr && <span className="stat-label-ar">{labelAr}</span>}
      </div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
    </div>
  )
}

// Minimal toggle
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" />
    </label>
  )
}

// Slider row
function SliderRow({ icon, label, labelAr, min, max, step, value, onChange, unit, colorClass, lang, digits }) {
  return (
    <div className="ctrl-row">
      <div className="ctrl-label">
        {icon} {label}
        {lang === 'en' && labelAr && <span className="sub">{labelAr}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        className={`ctrl-slider ${colorClass || ''}`} onChange={e => onChange(+e.target.value)} />
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', minWidth: '44px', textAlign: 'right' }}>
        {digits != null ? Number(value).toFixed(digits) : (typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value)}{unit}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const lang = useFarmStore(s => s.language)
  const energySource = useFarmStore(s => s.energySource)
  const pumpActive = useFarmStore(s => s.pumpActive)
  const irrigationActive = useFarmStore(s => s.irrigationActive)
  const setPumpActive = useFarmStore(s => s.setPumpActive)
  const setIrrigationActive = useFarmStore(s => s.setIrrigationActive)
  const waterLevel = useFarmStore(s => s.waterLevel)
  const setWaterLevel = useFarmStore(s => s.setWaterLevel)
  const tankCapacity = useFarmStore(s => s.tankCapacity)
  const setTankCapacity = useFarmStore(s => s.setTankCapacity)
  const cropDemand = useFarmStore(s => s.cropDemand)
  const setCropDemand = useFarmStore(s => s.setCropDemand)
  const conditions = useFarmStore(s => s.conditions)
  const setCondition = useFarmStore(s => s.setCondition)
  const forecast = useFarmStore(s => s.forecast)
  const simDay = useFarmStore(s => s.simDay)
  const pumpControl = useFarmStore(s => s.pumpControl)
  const releasePumpToAuto = useFarmStore(s => s.releasePumpToAuto)
  const power = useFarmStore(s => s.power)
  const src = ENERGY_SOURCES[energySource]

  const dayIndex = forecast.length ? simDay % forecast.length : 0
  const todayKwh = forecast[dayIndex]?.kwh ?? 0
  const pumpServed = power?.loads?.find(l => l.id === 'pump')?.served !== false
  const energyOk = todayKwh >= src.thresholdKwh

  return (
    <div className="sidebar">
      <EnergySourceSelector />

      {/* Energy Today */}
      <div className="dash-section">
        <div className="dash-section-title">
          <h3>{lang === 'ar' ? 'إنتاج اليوم المحاكى' : 'Simulated day production'}</h3>
        </div>

        <Stat
          label={lang === 'ar' ? 'الإنتاج' : 'Output'}
          labelAr="الإنتاج"
          value={`${todayKwh.toFixed(1)} kWh`}
          valueColor={energyOk ? 'var(--accent-green)' : 'var(--accent-danger)'}
          lang={lang}
        />
        <Stat
          label={lang === 'ar' ? 'الحد الأدنى' : 'Minimum'}
          value={`${src.thresholdKwh} kWh`}
          lang={lang}
        />
        <div className="stat-row">
          <div className="stat-label">{lang === 'ar' ? 'الحالة' : 'Status'}</div>
          <span className={`status-badge ${energyOk ? 'on' : 'alert'}`}>
            <span className="badge-dot" />
            {energyOk ? (lang === 'ar' ? 'كافية' : 'Sufficient') : (lang === 'ar' ? 'نقص' : 'Shortage')}
          </span>
        </div>

        {/* Source-specific sliders */}
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          {energySource === 'solar' && (<>
            <SliderRow icon="☁" label="Cloud cover" labelAr="الغيوم" min={0} max={100} step={5}
              value={conditions.solar.cloudCover} onChange={v => setCondition('solar', 'cloudCover', v)}
              unit="%" colorClass="solar" lang={lang} />
            <SliderRow icon="🌅" label="Sun hours" labelAr="ساعات الشمس" min={1} max={14} step={0.5}
              value={conditions.solar.solarHours} onChange={v => setCondition('solar', 'solarHours', v)}
              unit="h" colorClass="solar" lang={lang} />
          </>)}
          {energySource === 'wind' && (
            <SliderRow icon="〜" label="Wind speed" labelAr="سرعة الرياح" min={0} max={25} step={0.5}
              value={conditions.wind.windSpeed} onChange={v => setCondition('wind', 'windSpeed', v)}
              unit=" m/s" colorClass="wind" lang={lang} />
          )}
          {energySource === 'hydro' && (<>
            <SliderRow icon="〰" label="Flow rate" labelAr="معدل التدفق" min={0.005} max={0.2} step={0.005}
              value={conditions.hydro.flowRate} onChange={v => setCondition('hydro', 'flowRate', v)}
              unit=" m³/s" colorClass="hydro" lang={lang} digits={3} />
            <SliderRow icon="▲" label="Head height" labelAr="الارتفاع" min={2} max={30} step={1}
              value={conditions.hydro.headHeight} onChange={v => setCondition('hydro', 'headHeight', v)}
              unit="m" colorClass="hydro" lang={lang} />
          </>)}
        </div>
      </div>

      <EnergyMonitor />

      {/* 7-day forecast */}
      <ForecastChart />

      {/* Water reserve */}
      <WaterReserveGauge />

      {/* AI Decision */}
      <AIDecisionLog />

      {/* Controls */}
      <div className="dash-section">
        <div className="dash-section-title">
          <h3>{lang === 'ar' ? 'التحكم' : 'Controls'}</h3>
        </div>

        <div className="ctrl-row">
          <div className="ctrl-label">
            {lang === 'ar' ? 'المضخة' : 'Pump'}
            {lang === 'en' && <span className="sub">مضخة المياه</span>}
          </div>
          <span className={`status-badge ${pumpActive && pumpServed ? 'on' : 'off'}`} style={{ marginRight: '8px' }}>
            <span className="badge-dot" />
            {pumpActive && !pumpServed
              ? (lang === 'ar' ? 'بدون طاقة' : 'No power')
              : pumpActive
                ? (lang === 'ar' ? 'يعمل' : 'Running')
                : (lang === 'ar' ? 'متوقف' : 'Off')}
          </span>
          <Toggle checked={pumpActive} onChange={setPumpActive} />
        </div>

        <div className="ctrl-row">
          <div className="ctrl-label">
            {lang === 'ar' ? 'الري' : 'Irrigation'}
            {lang === 'en' && <span className="sub">نظام الري</span>}
          </div>
          <span className={`status-badge ${irrigationActive ? 'on' : 'off'}`} style={{ marginRight: '8px', borderColor: irrigationActive ? 'rgba(56,189,248,0.4)' : '', color: irrigationActive ? '#38bdf8' : '' }}>
            <span className="badge-dot" />
            {irrigationActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Off')}
          </span>
          <Toggle checked={irrigationActive} onChange={setIrrigationActive} />
        </div>

        {pumpControl !== 'auto' && (
          <button type="button" className="text-btn" onClick={releasePumpToAuto}>
            {lang === 'ar' ? 'إعادة المضخة إلى الوضع الآلي' : 'Return pump to automatic rule'}
          </button>
        )}
        {pumpControl === 'auto' && (
          <div className="hint-line">{lang === 'ar' ? 'تحت حد التعبئة تعمل المضخة وحدها حتى 90%.' : 'Under the seuil the pump refills by itself, up to 90%. A manual toggle holds until you release it.'}</div>
        )}

        <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

        <SliderRow icon="▣" label="Water level" labelAr="مستوى الخزان" min={0} max={100} step={1}
          value={Math.round(waterLevel)} onChange={setWaterLevel} unit="%" colorClass="hydro" lang={lang} />
        <SliderRow icon="⬡" label="Tank size" labelAr="حجم الخزان" min={10} max={200} step={5}
          value={tankCapacity} onChange={setTankCapacity} unit=" m³" lang={lang} />
        <SliderRow icon="〜" label="Daily demand" labelAr="الطلب اليومي" min={0.5} max={15} step={0.5}
          value={cropDemand} onChange={setCropDemand} unit=" m³" lang={lang} />
      </div>

      {/* Footer note */}
      <div style={{
        padding: '10px 16px 14px',
        fontSize: '0.62rem',
        color: 'var(--text-muted)',
        lineHeight: '1.7',
        borderTop: '1px solid var(--border)',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '1px 7px', marginBottom: '4px',
          background: 'rgba(249,115,22,0.12)',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '4px',
          color: 'var(--accent-warning)',
          fontWeight: '600',
          letterSpacing: '0.07em',
          fontSize: '0.6rem',
        }}>
          SIMULATED DATA — not real forecasts
        </span>
        <br />
        AgroNexus v1.0 · Water–Energy–Food Nexus
      </div>
    </div>
  )
}
