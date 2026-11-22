import React from 'react'
import useFarmStore from '../store/farmStore'

export default function WaterReserveGauge() {
  const waterLevel = useFarmStore(s => s.waterLevel)
  const tankCapacity = useFarmStore(s => s.tankCapacity)
  const aiDecision = useFarmStore(s => s.aiDecision)
  const language = useFarmStore(s => s.language)
  const seuilPct = aiDecision?.seuilPct ?? 0
  const seuilM3 = aiDecision?.seuilM3 ?? 0
  const refillTarget = aiDecision?.refillTargetPct ?? 90

  const color =
    waterLevel > 70 ? '#38bdf8' :
    waterLevel > 40 ? '#f59e0b' : '#ef4444'

  const currentM3 = ((waterLevel / 100) * tankCapacity).toFixed(1)

  return (
    <div className="dash-section">
      <div className="dash-section-title">
        <h3>{language === 'ar' ? 'خزان المياه' : 'Water Reserve'}</h3>
        <span className="section-icon">🪣</span>
      </div>

      {/* Circular gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0 8px' }}>
        <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
          <svg viewBox="0 0 70 70" width="70" height="70">
            {/* Background ring */}
            <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            {/* Required level arc (orange) */}
            {seuilPct > 0 && (
              <circle
                cx="35" cy="35" r="28"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeDasharray={`${(seuilPct / 100) * 175.9} 175.9`}
                strokeLinecap="round"
                transform="rotate(-90 35 35)"
                opacity={0.4}
              />
            )}
            {/* Fill arc */}
            <circle
              cx="35" cy="35" r="28"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={`${(waterLevel / 100) * 175.9} 175.9`}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
            {/* Center text */}
            <text x="35" y="33" textAnchor="middle" fill={color} fontSize="11" fontWeight="700" fontFamily="Space Grotesk">
              {waterLevel.toFixed(0)}%
            </text>
            <text x="35" y="45" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="Inter">
              {currentM3} m³
            </text>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div className="stat-row">
            <div className="stat-label">
              {language === 'ar' ? 'السعة الكلية' : 'Tank capacity'}
              <span className="stat-label-ar">{language === 'en' ? 'الحجم الإجمالي' : ''}</span>
            </div>
            <div className="stat-value">{tankCapacity} m³</div>
          </div>
          <div className="stat-row">
            <div className="stat-label">
              {language === 'ar' ? 'حد التعبئة' : 'Seuil'}
              <span className="stat-label-ar">{language === 'en' ? 'حد التعبئة' : ''}</span>
            </div>
            <div className={`stat-value ${seuilPct > waterLevel ? 'danger' : 'good'}`}>
              {seuilM3} m³
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-label">
              {language === 'ar' ? 'أيام النقص' : 'Shortage days'}
              <span className="stat-label-ar">{language === 'en' ? 'أيام النقص' : ''}</span>
            </div>
            <div className={`stat-value ${(aiDecision?.shortageDays ?? 0) > 0 ? 'warning' : 'good'}`}>
              {aiDecision?.shortageDays ?? 0} day{(aiDecision?.shortageDays ?? 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Linear bar */}
      <div className="water-gauge-wrap">
        <div className="water-gauge-bar" style={{ position: 'relative' }}>
          <div className="water-gauge-fill" style={{ width: `${waterLevel}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
          {/* Required level marker */}
          {seuilPct > 0 && (
            <div style={{
              position: 'absolute',
              left: `${seuilPct}%`,
              top: '-4px',
              bottom: '-4px',
              width: '2px',
              background: '#f59e0b',
              borderRadius: '1px',
            }} title={`Seuil: ${seuilPct.toFixed(0)}%`} />
          )}
        </div>
        <div className="water-gauge-pct" style={{ color }}>{waterLevel.toFixed(0)}%</div>
      </div>
      <div style={{ fontSize: '0.62rem', color: waterLevel < seuilPct ? 'var(--accent-warning)' : 'var(--text-muted)', marginTop: '3px' }}>
        {language === 'ar'
          ? `التعبئة الآلية تحت ${seuilPct.toFixed(0)}% (${seuilM3} م³) حتى ${refillTarget}%`
          : `Automatic refill under ${seuilPct.toFixed(0)}% (${seuilM3} m³), stop at ${refillTarget}%`}
      </div>
    </div>
  )
}
