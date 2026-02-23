import React from 'react'

export default function DiceResult({ result, isRolling }) {
  if (isRolling) {
    return (
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
        <div className="animate-pulse">
          <div className="text-6xl font-bold text-white/80">🎲</div>
          <div className="text-center text-white/60 mt-2">滚动中...</div>
        </div>
      </div>
    )
  }

  if (result === null) {
    return (
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
        <div className="text-white/50 text-lg">点击投掷骰子</div>
      </div>
    )
  }

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
      <div className="relative">
        <div className="text-9xl font-black text-white animate-bounce drop-shadow-2xl">
          {result}
        </div>
        <div className="absolute inset-0 text-9xl font-black text-yellow-400/30 blur-3xl -z-10">
          {result}
        </div>
      </div>
    </div>
  )
}
