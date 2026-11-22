import React from 'react'
import useFarmStore from '../store/farmStore'

const ACTION_META = {
  pump:  { label: 'Pumping water',   labelAr: 'ضخ المياه',    color: '#38bdf8', dot: '#38bdf8' },
  idle:  { label: 'System idle',     labelAr: 'وضع استعداد',  color: '#22c55e', dot: '#22c55e' },
  wait:  { label: 'Waiting — low energy', labelAr: 'انتظار الطاقة', color: '#f59e0b', dot: '#f59e0b' },
}

export default function AIDecisionLog() {
  const aiDecision = useFarmStore(s => s.aiDecision)
  const lang = useFarmStore(s => s.language)
  const pumpActive = useFarmStore(s => s.pumpActive)
  const irrigationActive = useFarmStore(s => s.irrigationActive)

  const action = aiDecision?.action ?? 'idle'
  const severity = aiDecision?.severity ?? 'ok'
  const meta = ACTION_META[action] ?? ACTION_META.idle

  return (
    <div className="dash-section">
      <div className="dash-section-title">
        <h3>{lang === 'ar' ? 'قاعدة المضخة' : 'Pump rule'}</h3>
      </div>

      {/* Two mini status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
        <div style={{ padding: '8px 10px', background: 'var(--surface-elevated)', borderRadius: '8px', border: `1px solid ${pumpActive ? 'rgba(34,197,94,0.25)' : 'var(--border)'}` }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {lang === 'ar' ? 'المضخة' : 'Pump'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: pumpActive ? '#22c55e' : '#64748b', animation: pumpActive ? 'pulse-dot 1.5s infinite' : 'none' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Space Grotesk', color: pumpActive ? '#22c55e' : '#64748b' }}>
              {pumpActive ? (lang === 'ar' ? 'يعمل' : 'Running') : (lang === 'ar' ? 'متوقف' : 'Stopped')}
            </span>
          </div>
        </div>

        <div style={{ padding: '8px 10px', background: 'var(--surface-elevated)', borderRadius: '8px', border: `1px solid ${irrigationActive ? 'rgba(56,189,248,0.25)' : 'var(--border)'}` }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {lang === 'ar' ? 'الري' : 'Irrigation'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: irrigationActive ? '#38bdf8' : '#64748b', animation: irrigationActive ? 'pulse-dot 2s infinite' : 'none' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Space Grotesk', color: irrigationActive ? '#38bdf8' : '#64748b' }}>
              {irrigationActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Off')}
            </span>
          </div>
        </div>
      </div>

      {/* Current action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '8px 10px', background: 'var(--surface-elevated)', borderRadius: '8px', border: `1px solid ${meta.color}22` }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot, flexShrink: 0, animation: action === 'pump' ? 'pulse-dot 1.2s infinite' : 'none' }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', fontFamily: 'Space Grotesk', color: meta.color }}>
            {lang === 'ar' ? meta.labelAr : meta.label}
          </div>
          {aiDecision?.shortageDays > 0 && (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              {aiDecision.shortageDays} day{aiDecision.shortageDays !== 1 ? 's' : ''} shortage ahead
            </div>
          )}
        </div>
      </div>

      {/* Reasoning */}
      <div className={`ai-decision-box ${severity === 'warning' ? 'warning' : severity === 'danger' ? 'danger' : ''}`}>
        <div className="ai-title">
          {lang === 'ar' ? 'سبب القاعدة' : 'Why this rule fired'}
        </div>
        <p>{aiDecision?.reason ?? 'Initialising...'}</p>
      </div>
    </div>
  )
}
