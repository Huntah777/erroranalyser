const LINE_CLASS = {
  error:       'log-line-error',
  warning:     'log-line-warning',
  info:        'log-line-info',
  interesting: 'log-line-interesting',
  bottleneck:  'log-line-bottleneck',
  anomaly:     'log-line-anomaly',
  entry_point: 'log-line-entry_point',
}

const LINE_TEXT_COLOR = {
  error:       'text-red-300',
  warning:     'text-amber-300',
  info:        'text-blue-300',
  interesting: 'text-purple-300',
  bottleneck:  'text-orange-300',
  anomaly:     'text-yellow-300',
  entry_point: 'text-green-300',
}

export default function HighlightedLog({ logText, interestingLines }) {
  const lines = logText.split('\n')

  const lineMap = {}
  for (const il of (interestingLines || [])) {
    lineMap[il.lineNumber] = il
  }

  return (
    <div className="overflow-auto rounded border border-zinc-800 bg-zinc-950">
      <table className="w-full text-xs font-mono">
        <tbody>
          {lines.map((line, idx) => {
            const lineNum = idx + 1
            const highlight = lineMap[lineNum]
            const cls = highlight ? LINE_CLASS[highlight.type] || '' : ''
            const textColor = highlight ? LINE_TEXT_COLOR[highlight.type] || 'text-zinc-300' : 'text-zinc-400'

            return (
              <tr key={idx} className={`group hover:bg-zinc-800/40 ${cls}`}>
                <td className="select-none text-right text-zinc-600 group-hover:text-zinc-500 pr-4 pl-3 py-0.5 w-12 border-r border-zinc-800 align-top">
                  {lineNum}
                </td>
                <td className={`pl-3 pr-4 py-0.5 whitespace-pre-wrap break-all ${textColor}`}>
                  {line || ' '}
                </td>
                {highlight && (
                  <td className="pr-3 pl-2 py-0.5 align-top whitespace-nowrap">
                    <span className="text-xs text-zinc-500 italic hidden group-hover:inline">
                      {highlight.reason}
                    </span>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="px-3 py-2 border-t border-zinc-800 flex flex-wrap gap-3 text-xs text-zinc-600">
        {Object.keys(LINE_CLASS).map(type => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-sm ${LINE_CLASS[type]?.replace('border-l-2', '')?.trim()}`} />
            {type.replace('_', ' ')}
          </span>
        ))}
        <span className="text-zinc-700 ml-2">· Hover a highlighted line to see the reason</span>
      </div>
    </div>
  )
}
