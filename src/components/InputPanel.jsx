import { useRef, useState } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = result.split(',')[1]
      resolve({ base64, mediaType: file.type, previewUrl: result })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function InputPanel({
  logText,
  onLogTextChange,
  image,
  onImageChange,
  onAnalyse,
  onClear,
  loading,
  hasContent,
}) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  async function handleFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) return
    const result = await fileToBase64(file)
    onImageChange(result)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handlePaste(e) {
    const item = Array.from(e.clipboardData.items).find(i => i.kind === 'file' && ACCEPTED_TYPES.includes(i.type))
    if (item) {
      e.preventDefault()
      handleFile(item.getAsFile())
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Text input */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Paste Log / Error Output
          </label>
          <textarea
            value={logText}
            onChange={e => onLogTextChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={'Traceback (most recent call last):\n  File "app.py", line 42, in <module>\n    result = process(data)\nAttributeError: \'NoneType\' object has no attribute \'process\''}
            className="h-64 lg:h-80 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600 font-mono leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Image drop zone */}
        <div className="flex flex-col gap-2 lg:w-80">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Drop Screenshot
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            onClick={() => !image && fileInputRef.current?.click()}
            className={`
              h-64 lg:h-80 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer
              ${dragging
                ? 'border-violet-500 bg-violet-950/30'
                : image
                  ? 'border-zinc-700 bg-zinc-900 cursor-default'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ''
              }}
            />
            {image ? (
              <div className="relative w-full h-full p-2">
                <img
                  src={image.previewUrl}
                  alt="Screenshot preview"
                  className="w-full h-full object-contain rounded"
                />
                <button
                  onClick={e => { e.stopPropagation(); onImageChange(null) }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-300 hover:bg-red-900 hover:border-red-700 hover:text-red-300 flex items-center justify-center text-xs transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
                <div className="absolute bottom-3 left-3 rounded px-2 py-0.5 bg-zinc-900/80 text-xs text-zinc-400">
                  Screenshot ready
                </div>
              </div>
            ) : (
              <div className="text-center px-6">
                <div className="text-3xl mb-3 opacity-40">
                  {dragging ? '↓' : '⌃'}
                </div>
                <p className="text-sm text-zinc-400">
                  {dragging ? 'Drop to add screenshot' : 'Drop or click to add screenshot'}
                </p>
                <p className="text-xs text-zinc-600 mt-1">PNG, JPEG, WEBP · or paste from clipboard</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAnalyse}
          disabled={!hasContent || loading}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${hasContent && !loading
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Analysing...
            </>
          ) : (
            'Analyse'
          )}
        </button>

        {hasContent && !loading && (
          <button
            onClick={onClear}
            className="px-4 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Clear
          </button>
        )}

        {!hasContent && (
          <p className="text-xs text-zinc-600">
            Paste log text or drop a screenshot to get started
          </p>
        )}
      </div>
    </div>
  )
}
