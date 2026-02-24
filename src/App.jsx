import React, { useState, useEffect } from 'react'
import DiceScene from './components/DiceScene'
import DiceResult from './components/DiceResult'
import HistoryPanel from './components/HistoryPanel'

function App() {
  const [result, setResult] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const handleRollStart = () => {
    setIsRolling(true)
    setResult(null)
  }

  const handleRollEnd = (face) => {
    setIsRolling(false)
    setResult(face)

    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setHistory(prev => [
      { face, time: timeStr },
      ...prev.slice(0, 19)
    ])
  }

  // Calculate stats
  const totalRolls = history.length
  const average = totalRolls > 0
    ? (history.reduce((sum, h) => sum + h.face, 0) / totalRolls).toFixed(1)
    : '—'

  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-foreground/80 text-sm font-medium tracking-wide uppercase">Dice</span>
          </div>

          {/* History toggle */}
          <button
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setShowHistory(!showHistory)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-medium">{totalRolls}</span>
          </button>
        </div>
      </header>

      {/* 3D Dice Scene - full screen */}
      <DiceScene onRollStart={handleRollStart} onRollEnd={handleRollEnd} />

      {/* Result display - centered */}
      <DiceResult result={result} isRolling={isRolling} />

      {/* Bottom recent results strip */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex flex-col items-center gap-2 px-4 pb-6 pt-3">
          {/* Label */}
          <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">
            {totalRolls > 0 ? `Recent ${Math.min(totalRolls, 10)} of ${totalRolls}` : 'No rolls yet'}
          </span>
          {/* Results row */}
          <div className="flex items-center gap-2">
            {totalRolls === 0 ? (
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center"
                  >
                    <span className="text-muted-foreground/30 text-sm font-mono">-</span>
                  </div>
                ))}
              </div>
            ) : (
              history.slice(0, 10).map((item, i) => (
                <div
                  key={`${totalRolls}-${i}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
                    ${i === 0
                      ? 'bg-primary/15 border-2 border-primary/50 scale-110'
                      : 'bg-card border border-border'
                    }
                    ${i > 0 ? 'animate-fade-in-up' : 'animate-result-pop'}
                  `}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className={`text-sm font-mono font-semibold ${
                    i === 0 ? 'text-primary' : 'text-foreground/70'
                  } ${item.face === 1 ? '!text-red-400' : ''}`}>
                    {item.face}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History panel - slide in from right */}
      <HistoryPanel history={history} show={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}

export default App
