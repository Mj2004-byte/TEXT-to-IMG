const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`)
  }
  return data
}

export function generateImage(prompt) {
  return request('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
}

export function listGenerations() {
  return request('/api/generations')
}

