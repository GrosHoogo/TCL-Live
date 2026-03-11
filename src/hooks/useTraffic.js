import { useState, useEffect, useCallback } from 'react'

const TRAFFIC_URL =
  'https://data.grandlyon.com/fr/datapusher/ws/rdata/tcl_sytral.tclalertetrafic_2/all.json?maxfeatures=100&start=1&filename=alertes-trafic-reseau-transports-commun-lyonnais-v2'

// Basic Auth header built from Vite env vars (stored in .env, never committed)
const AUTH_HEADER = `Basic ${btoa(
  `${import.meta.env.VITE_GL_USER}:${import.meta.env.VITE_GL_PASS}`
)}`

/**
 * Parse the datapusher JSON response (data.values[]).
 * Filters out alerts whose `fin` date is in the past.
 */
function parseAlerts(data) {
  if (!Array.isArray(data?.values)) return []

  const now = new Date()

  return data.values
    .filter((v) => {
      if (!v.fin) return true
      // Parse "YYYY-MM-DD HH:MM:SS" → Date
      const fin = new Date(v.fin.replace(' ', 'T'))
      return fin > now
    })
    .map((v) => ({
      id: String(v.n ?? Math.random()),
      ligne: v.ligne_com ?? v.ligne_cli ?? null,
      titre: (v.titre ?? 'Perturbation').trim(),
      message: v.message ?? '',
      cause: v.cause ?? null,
      mode: v.mode ?? null,
      type: v.type ?? 'Information',
      severity: Number(v.niveauseverite ?? 30),
      dateDebut: v.debut ?? null,
      dateFin: v.fin ?? null,
    }))
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Authorization: AUTH_HEADER },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export function useTraffic() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await fetchWithTimeout(TRAFFIC_URL)
      setAlerts(parseAlerts(json))
      setLastFetched(new Date())
    } catch (err) {
      console.error('[Lyon Relais] Traffic fetch failed:', err.message)
      setError('Impossible de charger les infos trafic.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { alerts, loading, error, lastFetched, refresh: fetchData }
}
