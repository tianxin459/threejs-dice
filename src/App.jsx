import React, { useState, useEffect } from 'react'
import DiceScene from './components/DiceScene'
import DiceResult from './components/DiceResult'
import HistoryPanel from './components/HistoryPanel'

function App() {
  const [version, setVersion] = useState(null)
  const [result, setResult] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        setVersion(`${data.version} (${data.buildDate})`)
      })
      .catch(err => {
        console.error('Failed to load version:', err)
        setVersion('1.0.0 (unknown)')
      })
  }, [])

  const handleRollStart = () => {
    setIsRolling(true)
    setResult(null)
  }

  const handleRollEnd = (face) => {
    setIsRolling(false)
    setResult(face)

    // 添加到历史记录
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setHistory(prev => [
      { face, time: timeStr },
      ...prev.slice(0, 9)
    ])
  }

  return (
    <div className="w-screen h-screen bg-slate-900 relative overflow-hidden">
      {/* Version display */}
      {version && (
        <div className="absolute top-4 left-4 text-white/60 text-sm font-mono z-20 pointer-events-none">
          v{version}
        </div>
      )}

      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-2xl font-light tracking-wider z-20 pointer-events-none select-none">
        🎲 骰子-点击投掷
      </div>

      {/* Dice Scene */}
      <DiceScene onRollStart={handleRollStart} onRollEnd={handleRollEnd} />

      {/* Result display - 正上方重点放大显示 */}
      <DiceResult result={result} isRolling={isRolling} />

      {/* History panel - 左侧 */}
      <HistoryPanel history={history} />
    </div>
  )
}

export default App
