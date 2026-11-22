import React from 'react'
import useFarmStore from '../store/farmStore'
import { formatSchedule } from '../modules/energy/Equipment'

const PRIORITY_COLOR = {
  critical: '#ef4444',
  important: '#f59e0b',
  flexible: '#38bdf8',
  'non-essential': '#94a3b8',
}

function Stat({ label, value, color }) {
  return (
    <div className="stat-row">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
    </div>
  )
}

export default function EnergyMonitor() {
  const lang = useFarmStore((s) => s.language)
  const power = useFarmStore((s) => s.power)
  const meters = useFarmStore((s) => s.meters)
  const battery = useFarmStore((s) => s.battery)
  const gridAvailable = useFarmStore((s) => s.gridAvailable)
  const setGridAvailable = useFarmStore((s) => s.setGridAvailable)
  const equipmentOn = useFarmStore((s) => s.equipmentOn)
  const setEquipmentOn = useFarmStore((s) => s.setEquipmentOn)
  const loads = power?.loads ?? []
  const highest = loads.reduce((best, load) => (load.servedKw > (best?.servedKw ?? -1) ? load : best), null)
  const balance = power?.balanceKw ?? 0
  const stored = ((battery.chargePct / 100) * battery.capacityKwh).toFixed(1)
  const ar = lang === 'ar'

  return (
    <div className="dash-section">
      <div className="dash-section-title">
        <h3>{ar ? 'ميزان الطاقة' : 'Energy balance'}</h3>
      </div>

      <Stat
        label={ar ? 'الإنتاج الآن' : 'Production now'}
        value={`${(power?.renewableKw ?? 0).toFixed(2)} kW`}
        color="var(--accent-green)"
      />
      <Stat
        label={ar ? 'الاستهلاك الآن' : 'Consumption now'}
        value={`${(power?.servedKw ?? 0).toFixed(2)} kW`}
      />
      <Stat
        label={ar ? 'الفرق' : 'Balance'}
        value={`${balance >= 0 ? '+' : ''}${balance.toFixed(2)} kW`}
        color={balance >= 0 ? 'var(--accent-green)' : 'var(--accent-warning)'}
      />
      <Stat
        label={ar ? 'إنتاج اليوم' : 'Produced today'}
        value={`${meters.productionKwh.toFixed(2)} kWh`}
      />
      <Stat
        label={ar ? 'استهلاك اليوم' : 'Consumed today'}
        value={`${meters.consumptionKwh.toFixed(2)} kWh`}
      />
      <Stat
        label={ar ? 'استيراد من الشبكة' : 'Grid import today'}
        value={`${meters.gridImportKwh.toFixed(2)} kWh`}
      />
      <Stat
        label={ar ? 'تصدير للشبكة' : 'Grid export today'}
        value={`${meters.gridExportKwh.toFixed(2)} kWh`}
      />
      {meters.unmetKwh > 0.01 && (
        <Stat
          label={ar ? 'طلب غير ملبى' : 'Unmet demand today'}
          value={`${meters.unmetKwh.toFixed(2)} kWh`}
          color="var(--accent-danger)"
        />
      )}

      <div className="battery-row">
        <div className="battery-meta">
          <span>{ar ? 'البطارية' : 'Battery'}</span>
          <strong>{battery.chargePct.toFixed(0)}%</strong>
          <span className="text-muted">{stored} / {battery.capacityKwh} kWh</span>
        </div>
        <div className="battery-track">
          <div
            className="battery-fill"
            style={{
              width: `${battery.chargePct}%`,
              background: battery.chargePct > 30 ? '#22c55e' : '#f97316',
            }}
          />
        </div>
        <div className="text-muted" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
          {(power?.batteryKw ?? 0) >= 0.05
            ? `${ar ? 'شحن' : 'Charging'} ${(power.batteryKw).toFixed(2)} kW`
            : (power?.batteryKw ?? 0) <= -0.05
              ? `${ar ? 'تفريغ' : 'Discharging'} ${Math.abs(power.batteryKw).toFixed(2)} kW`
              : (ar ? 'البطارية ثابتة' : 'Battery idle')}
          {' · '}
          {ar ? 'العاكس' : 'Inverter'} {battery.maxKw} kW
        </div>
      </div>

      <div className="ctrl-row">
        <div className="ctrl-label">
          {ar ? 'شبكة الكهرباء' : 'Grid connection'}
          <span className="sub">{gridAvailable ? (ar ? 'متصلة' : 'Supplying deficits') : (ar ? 'منقطعة' : 'Outage — battery only')}</span>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={gridAvailable}
            onChange={(e) => setGridAvailable(e.target.checked)}
          />
          <div className="toggle-track" />
        </label>
      </div>

      {highest && highest.servedKw > 0 && (
        <div className="hint-line">
          {ar ? 'أعلى استهلاك' : 'Highest load'}: {ar ? highest.nameAr : highest.name} · {highest.servedKw.toFixed(2)} kW
        </div>
      )}

      <div className="dash-section-title" style={{ marginTop: '12px' }}>
        <h3>{ar ? 'المعدات' : 'Equipment'}</h3>
      </div>
      <div className="equip-table">
        {loads.map((load) => {
          const manual = load.manual
          return (
            <div key={load.id} className="equip-row">
              <div>
                <div className="equip-name">{ar ? load.nameAr : load.name}</div>
                <div className="equip-sub">
                  <span style={{ color: PRIORITY_COLOR[load.priority] }}>{load.priority}</span>
                  {' · '}
                  {formatSchedule(load)}
                  {load.standby && !load.served ? '' : load.standby ? ' · standby' : ''}
                </div>
              </div>
              <div className="equip-kw">
                <div style={{ color: load.served ? 'var(--text-primary)' : 'var(--accent-danger)' }}>
                  {load.served ? `${load.servedKw.toFixed(2)} kW` : (ar ? 'بدون طاقة' : 'No power')}
                </div>
                {manual && (
                  <label className="toggle-switch" style={{ marginLeft: '8px' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(equipmentOn[load.id])}
                      onChange={(e) => setEquipmentOn(load.id, e.target.checked)}
                    />
                    <div className="toggle-track" />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="hint-line">
        {ar
          ? 'أرقام محاكاة. الإنتاج يُوزَّع على ساعات الشمس للألواح، وعلى 24 ساعة للريح والماء.'
          : 'Simulated balance. Solar output is spread across the sun-hour window. Wind and hydro use a flat daily average. Rules, not a trained model.'}
      </p>
    </div>
  )
}
