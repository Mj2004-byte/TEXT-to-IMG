import { useEffect, useMemo, useState } from 'react'
import { generateImage, listGenerations } from './api'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const canGenerate = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading])

  useEffect(() => {
    let cancelled = false
    listGenerations()
      .then((r) => {
        if (cancelled) return
        setHistory(r.generations || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function onGenerate(e) {
    e.preventDefault()
    const p = prompt.trim()
    if (!p) return

    setLoading(true)
    setError('')
    try {
      const r = await generateImage(p)
      setImageUrl(r?.image?.dataUrl || '')
      const next = await listGenerations()
      setHistory(next.generations || [])
    } catch (err) {
      setError(err?.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <div>
            <div className="title">TXTTOIMG</div>
            <div className="subtitle">Type a prompt, get an image.</div>
          </div>
        </div>
        <div className="meta">MERN • Text → Image</div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Prompt</h2>
          <form onSubmit={onGenerate} className="form">
            <label className="label" htmlFor="prompt">
              Describe what you want to generate
            </label>
            <textarea
              id="prompt"
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic neon city at night, cinematic lighting, ultra detailed"
              rows={5}
            />
            <div className="row">
              <button className="btn" type="submit" disabled={!canGenerate}>
                {loading ? 'Generating…' : 'Generate image'}
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setPrompt('')
                  setError('')
                }}
                disabled={loading}
              >
                Clear
              </button>
            </div>
            {error ? <div className="error">{error}</div> : null}
          </form>
        </section>

        <section className="card">
          <h2>Result</h2>
          {imageUrl ? (
            <div className="result">
              <img className="resultImg" src={imageUrl} alt="Generated" />
            </div>
          ) : (
            <div className="empty">
              {loading ? 'Working on it…' : 'Your generated image will show up here.'}
            </div>
          )}
        </section>
      </main>

      <section className="card history">
        <div className="historyHead">
          <h2>Recent generations</h2>
          <div className="hint">Click any image to preview it above.</div>
        </div>
        {history?.length ? (
          <div className="thumbGrid">
            {history.map((g) => (
              <button
                key={g._id}
                className="thumb"
                type="button"
                onClick={() => setImageUrl(g.imageDataUrl)}
                title={g.prompt}
              >
                <img src={g.imageDataUrl} alt={g.prompt} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">No generations yet.</div>
        )}
      </section>
    </div>
  )
}

export default App
