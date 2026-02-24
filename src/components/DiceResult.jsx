import React from 'react'

// Dice face SVG representations
export function DiceFace({ value, size = 80 }) {
  const dotPositions = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  }

  const dots = dotPositions[value] || []
  const isOne = value === 1

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect
        x="2" y="2" width="96" height="96" rx="16"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(200,169,110,0.3)"
        strokeWidth="1.5"
      />
      {dots.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={value <= 2 ? 10 : 8}
          fill={isOne ? '#c8a96e' : '#e8e8ed'}
        />
      ))}
    </svg>
  )
}

export default function DiceResult({ result, isRolling }) {
  if (isRolling) {
    return null
  }

  if (result === null) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Click to roll
        </p>
      </div>
    )
  }

  return (
    <div className="absolute top-[15%] left-1/2 z-20 pointer-events-none select-none animate-result-appear"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <DiceFace value={result} size={88} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-bold text-foreground tracking-tight font-mono">
            {result}
          </span>
        </div>
      </div>
    </div>
  )
}
