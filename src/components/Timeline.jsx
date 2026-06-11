const TYPE_STYLES = {
  entry:       { icon: '→', color: 'text-green-400',  bg: 'bg-green-900/40',  border: 'border-green-700',  line: 'bg-green-800' },
  exit:        { icon: '←', color: 'text-zinc-400',   bg: 'bg-zinc-800',      border: 'border-zinc-600',   line: 'bg-zinc-700' },
  error:       { icon: '✕', color: 'text-red-400',    bg: 'bg-red-900/40',    border: 'border-red-700',    line: 'bg-red-800' },
  warning:     { icon: '⚠', color: 'text-amber-400',  bg: 'bg-amber-900/30',  border: 'border-amber-700',  line: 'bg-amber-800' },
  info:        { icon: '·', color: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-800',   line: 'bg-blue-900' },
  interesting: { icon: '★', color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-700', line: 'bg-purple-800' },
}

const DEFAULT_STYLE = { icon: '·', color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-600', line: 'bg-zinc-700' }

export default function Timeline({ timeline }) {
  if (!timeline?.length) {
    return <p className="text-sm text-zinc-500">No timeline data available.</p>
  }

  return (
    <div className="flex flex-col">
      {timeline.map((step, idx) => {
        const s = TYPE_STYLES[step.type] || DEFAULT_STYLE
        const isLast = idx === timeline.length - 1

        return (
          <div key={idx} className="flex gap-3">
            {/* Left column: connector + icon */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: '28px' }}>
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm flex-shrink-0 ${s.bg} ${s.border} ${s.color} font-mono`}>
                {s.icon}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${s.line} opacity-40`} style={{ minHeight: '16px' }} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-${isLast ? '0' : '4'} min-w-0`} style={{ paddingBottom: isLast ? 0 : '16px' }}>
              <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                <span className="text-xs text-zinc-500 font-mono">#{step.step}</span>
                {step.timestamp && (
                  <span className="text-xs text-zinc-600 font-mono">{step.timestamp}</span>
                )}
                {step.lineNumbers?.length > 0 && (
                  <span className="text-xs text-zinc-600">
                    line{step.lineNumbers.length > 1 ? 's' : ''} {step.lineNumbers.join(', ')}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-snug ${s.color === 'text-zinc-400' ? 'text-zinc-300' : s.color}`}>
                {step.event}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
