import React from 'react'

function DiceDots({ value, size = 28 }) {
  const dotPositions = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]],
  }
  const dots = dotPositions[value] || []
  const isOne = value === 1

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="4" y="4" width="92" height="92" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(200,169,110,0.15)" strokeWidth="2" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={10} fill={isOne ? '#c8a96e' : '#e8e8ed'} />
      ))}
    </svg>
  )
}

export default function HistoryPanel({ history, show, onClose }) {
  return (
    <>
      {/* Overlay */}
      {show && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-muted/95 backdrop-blur-xl border-l border-border z-40 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div>
            <h2 className="text-foreground text-sm font-medium">History</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              {history.length > 0 ? `${history.length} rolls` : 'No rolls yet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Roll list */}
        <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 65px)' }}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30 mb-3">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              <p className="text-xs">Roll the dice to start</p>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-1">
              {history.map((item, index) => (
                <div
                  key={`${item.time}-${index}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                  style={{
                    animation: index === 0 ? 'fade-in-up 0.3s ease-out' : undefined,
                  }}
                >
                  {/* Roll number */}
                  <span className="text-muted-foreground text-[10px] font-mono w-5 text-right shrink-0">
                    {history.length - index}
                  </span>

                  {/* Dice face visual */}
                  <DiceDots value={item.face} size={32} />

                  {/* Value */}
                  <span className={`text-lg font-bold font-mono ${item.face === 1 ? 'text-primary' : 'text-foreground'}`}>
                    {item.face}
                  </span>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Time */}
                  <span className="text-muted-foreground text-[10px] font-mono tracking-wider">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
