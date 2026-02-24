import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { History } from 'lucide-react'

export default function HistoryPanel({ history }) {
  return (
    <Card className="absolute left-4 top-1/2 -translate-y-1/2 w-64 backdrop-blur-md bg-black/40 border-white/10 shadow-2xl z-10 pointer-events-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <History className="w-4 h-4" />
          最近10次记录
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {history.length === 0 ? (
          <div className="text-white/40 text-xs py-4 text-center">暂无记录</div>
        ) : (
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={`${item.time}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Badge variant="secondary" className="text-2xl font-bold bg-yellow-500/20 text-yellow-400 border-yellow-500/30 h-10 w-10 flex items-center justify-center rounded-full px-0">
                  {item.face}
                </Badge>
                <span className="text-white/60 text-xs font-mono">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
