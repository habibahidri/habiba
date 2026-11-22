import React, { useEffect } from 'react'
import useFarmStore from './store/farmStore'
import FarmScene from './scene/FarmScene'
import Dashboard from './dashboard/Dashboard'
import { formatSimClock } from './modules/energy/EnergyBalance'

const SRC_COLORS = { solar: '#f59e0b', wind: '#06b6d4', hydro: '#38bdf8' }
const SRC_LABELS = { solar: 'Solar', wind: 'Wind', hydro: 'Hydro' }

function Header() {
  const language = useFarmStore(s => s.language)
  const setLanguage = useFarmStore(s => s.setLanguage)
  const energySource = useFarmStore(s => s.energySource)
  const simDay = useFarmStore(s => s.simDay)
  const simHour = useFarmStore(s => s.simHour)
  const paused = useFarmStore(s => s.paused)
  const simSpeed = useFarmStore(s => s.simSpeed)
  const setPaused = useFarmStore(s => s.setPaused)
  const setSimSpeed = useFarmStore(s => s.setSimSpeed)

  return (
    <header className="app-header">
      <div className="app-header-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" fill="url(#lg)" />
          <path d="M8 20 C8 14 12 10 16 10 C20 10 24 14 24 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="14" y="18" width="4" height="6" rx="1" fill="#fff" />
          <circle cx="16" cy="8" r="2" fill="#f59e0b" />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <h1>NEXUS <span>· Digital Twin</span></h1>
        </div>
      </div>

      {/* Active source indicator — minimal */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '5px 14px',
        background: `${SRC_COLORS[energySource]}12`,
        border: `1px solid ${SRC_COLORS[energySource]}30`,
        borderRadius: '8px',
        fontSize: '0.78rem',
        color: SRC_COLORS[energySource],
        fontFamily: 'Space Grotesk',
        fontWeight: '500',
        letterSpacing: '-0.01em',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: SRC_COLORS[energySource],
          display: 'inline-block',
          animation: 'pulse-dot 2s infinite',
        }} />
        {SRC_LABELS[energySource]} Energy Active
      </div>

      <div className="header-controls">
        <div className="sim-clock">
          <span>{formatSimClock(simDay, simHour)}</span>
          <button type="button" className="text-btn" onClick={() => setPaused(!paused)}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          {[1, 4, 12].map(speed => (
            <button
              key={speed}
              type="button"
              className={`text-btn${simSpeed === speed ? ' active' : ''}`}
              onClick={() => setSimSpeed(speed)}
            >
              {speed}×
            </button>
          ))}
        </div>
        <div className="header-badge">
          <div className="dot" /> Simulated
        </div>
        <button
          className={`lang-toggle ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          id="lang-toggle-btn"
        >
          {language === 'en' ? 'EN → AR' : 'AR → EN'}
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const setEnergySource = useFarmStore(s => s.setEnergySource)
  const energySource = useFarmStore(s => s.energySource)

  useEffect(() => {
    setEnergySource(energySource)
  }, [])

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <div className="viewport">
          <FarmScene />
          <div className="viewport-controls">
            <span><kbd>Drag</kbd> Orbit</span>
            <span>·</span>
            <span><kbd>Scroll</kbd> Zoom</span>
            <span>·</span>
            <span><kbd>Right drag</kbd> Pan</span>
            <span>·</span>
            <span><kbd>Click</kbd> Inspect</span>
          </div>
        </div>
        <Dashboard />
      </div>
    </div>
  )
}
