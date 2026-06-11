import { useState, useRef } from 'react'
import InputPanel from './components/InputPanel.jsx'
import AnalysisResult from './components/AnalysisResult.jsx'

export default function App() {
  const [logText, setLogText] = useState('')
  const [image, setImage] = useState(null) // { base64, mediaType, previewUrl }
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  async function handleAnalyse() {
    if (!logText.trim() && !image) return

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: logText.trim() || undefined,
          imageBase64: image?.base64 || undefined,
          imageMediaType: image?.mediaType || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setAnalysis(data)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setLogText('')
    setImage(null)
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center text-sm font-bold">
            EA
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100 leading-none">Error Analyser</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Powered by Claude Opus</p>
          </div>
        </div>
        <div className="text-xs text-zinc-600 hidden sm:block">
          Paste logs · Drop screenshots · Get answers
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <InputPanel
          logText={logText}
          onLogTextChange={setLogText}
          image={image}
          onImageChange={setImage}
          onAnalyse={handleAnalyse}
          onClear={handleClear}
          loading={loading}
          hasContent={!!(logText.trim() || image)}
        />

        {error && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4 text-zinc-400">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm">Analysing with Claude Opus...</p>
          </div>
        )}

        {analysis && (
          <div ref={resultsRef} className="mt-6">
            <AnalysisResult analysis={analysis} logText={logText} />
          </div>
        )}
      </main>
    </div>
  )
}
