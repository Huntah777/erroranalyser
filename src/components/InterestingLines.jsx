const TYPE_STYLES = {
  error:       { label: 'error',       badge: 'bg-red-900/50 text-red-300 border-red-700',       icon: '✕' },
  warning:     { label: 'warning',     badge: 'bg-amber-900/40 text-amber-300 border-amber-700',   icon: '⚠' },
  info:        { label: 'info',        badge: 'bg-blue-900/40 text-blue-300 border-blue-800',      icon: 'ℹ' },
  interesting: { label: 'interesting', badge: 'bg-purple-900/40 text-purple-300 border-purple-700', icon: '★' },
  bottleneck:  { label: 'bottleneck',  badge: 'bg-orange-900/40 text-orange-300 border-orange-700', icon: '⧗' },
  anomaly:     { label: 'anomaly',     badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-700', icon: '?' },
  entry_point: { label: 'entry point', badge: 'bg-green-900/40 text-green-300 border-green-700',   icon: '→' },
}

const DEFAULT = { label: 'note', badge: 'bg-zinc-800 text-zinc-400 border-zinc-600', icon: '·' }

export default function InterestingLines({ lines }) {
  if (!lines?.length) {
    return <p className="text-sm text-zinc-500">No interesting lines identified.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, idx) => {
        const s = TYPE_STYLES[line.type] || DEFAULT

        return (
          <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${s.badge}`}>
                <span>{s.icon}</span>
                {s.label}
              </span>
              <span className="text-xs text-zinc-500 font-mono">line {line.lineNumber}</span>
            </div>

            {/* Code line */}
            <div className="px-3 py-2 font-mono text-xs text-zinc-200 whitespace-pre-wrap break-all border-b border-zinc-800/50 bg-zinc-950">
              {line.content}
            </div>

            {/* Reason */}
            <div className="px-3 py-2 text-xs text-zinc-400 leading-relaxed">
              {line.reason}
            </div>
          </div>
        )
      })}
    </div>
  )
}
