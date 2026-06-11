import { useState } from 'react'
import Timeline from './Timeline.jsx'
import HighlightedLog from './HighlightedLog.jsx'
import InterestingLines from './InterestingLines.jsx'

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-900 text-red-300 border border-red-700', dot: 'bg-red-500', label: 'CRITICAL' },
  error:    { badge: 'bg-red-950 text-red-400 border border-red-800', dot: 'bg-red-400', label: 'ERROR' },
  warning:  { badge: 'bg-amber-950 text-amber-400 border border-amber-800', dot: 'bg-amber-400', label: 'WARNING' },
  info:     { badge: 'bg-blue-950 text-blue-400 border border-blue-800', dot: 'bg-blue-400', label: 'INFO' },
}

const TABS = ['Timeline', 'Log View', 'Interesting Lines', 'Suggestions']

export default function AnalysisResult({ analysis, logText }) {
  const [activeTab, setActiveTab] = useState('Timeline')

  const sev = SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.info

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${sev.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
            {sev.label}
          </span>
          <span className="rounded px-2.5 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700">
            {analysis.logType}
          </span>
        </div>
        <p className="text-zinc-100 font-semibold text-base leading-snug">{analysis.summary}</p>
      </div>

      {/* Root Cause */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Root Cause</h3>
        <p className="text-zinc-200 text-sm leading-relaxed">{analysis.rootCause}</p>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
                ${activeTab === tab
                  ? 'border-violet-500 text-violet-400 bg-zinc-800/50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }
              `}
            >
              {tab}
              {tab === 'Interesting Lines' && analysis.interestingLines?.length > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-900 text-violet-300 text-xs px-1.5 py-0.5">
                  {analysis.interestingLines.length}
                </span>
              )}
              {tab === 'Suggestions' && analysis.suggestions?.length > 0 && (
                <span className="ml-1.5 rounded-full bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5">
                  {analysis.suggestions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'Timeline' && (
            <Timeline timeline={analysis.timeline} />
          )}
          {activeTab === 'Log View' && (
            logText
              ? <HighlightedLog logText={logText} interestingLines={analysis.interestingLines} />
              : <p className="text-sm text-zinc-500">Log view is only available when you paste log text (not available for screenshot-only analysis).</p>
          )}
          {activeTab === 'Interesting Lines' && (
            <InterestingLines lines={analysis.interestingLines} />
          )}
          {activeTab === 'Suggestions' && (
            <SuggestionsList suggestions={analysis.suggestions} explanation={analysis.explanation} />
          )}
        </div>
      </div>
    </div>
  )
}

function SuggestionsList({ suggestions, explanation }) {
  return (
    <div className="flex flex-col gap-5">
      {explanation && (
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Explanation</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
        </div>
      )}
      {suggestions?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Suggestions</h4>
          <ol className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-900 text-violet-300 text-xs flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <span className="text-zinc-300 leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
