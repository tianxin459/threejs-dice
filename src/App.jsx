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

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-center gap-8 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Rolls</span>
            <span className="text-foreground/90 text-sm font-mono font-medium">{totalRolls}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Average</span>
            <span className="text-foreground/90 text-sm font-mono font-medium">{average}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Last</span>
            <span className="text-primary text-sm font-mono font-medium">{result ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* History panel - slide in from right */}
      <HistoryPanel history={history} show={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}

export default App
