import { useState, useEffect, useCallback } from 'react'

const SCHEDULE_URL =
  'https://data.grandlyon.com/fr/datapusher/ws/rdata/tcl_sytral.tclpassagearret/all.json?maxfeatures=2000&start=1&filename=prochains-passages-reseau-transports-commun-lyonnais-rhonexpress-disponibilites-temps-reel'

const AUTH_HEADER = `Basic ${btoa(
  `${import.meta.env.VITE_GL_USER}:${import.meta.env.VITE_GL_PASS}`
)}`

/**
 * Derive the transport mode from the line name.
 * Métro: A B C D  |  Funiculaire: F1 F2  |  Tramway: T+digit  |  Bus: everything else
 */
export function getTransportMode(ligne) {
  if (!ligne) return 'Bus'
  const l = String(ligne).toUpperCase().trim()
  if (['A', 'B', 'C', 'D'].includes(l)) return 'Métro'
  if (['F1', 'F2'].includes(l)) return 'Funiculaire'
  if (/^T\d/.test(l)) return 'Tramway'
  return 'Bus'
}

function parsePassages(data) {
  if (!Array.isArray(data?.values)) return []

  return data.values.map((v) => ({
    id: String(v.gid ?? v.id ?? Math.random()),
    ligne: v.ligne ?? null,
    direction: v.direction ?? null,
    delaipassage: v.delaipassage ?? null,
    heurepassage: v.heurepassage ?? null,
    type: v.type ?? 'T',   // 'T' = Théorique, 'E' = Estimé (temps réel)
    stopId: v.idtarretdestination ?? null,
    mode: getTransportMode(v.ligne),
  }))
}

async function fetchWithTimeout(url, timeoutMs = 30000) {
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

export function useSchedules() {
  const [passages, setPassages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await fetchWithTimeout(SCHEDULE_URL)
      setPassages(parsePassages(json))
      setLastFetched(new Date())
    } catch (err) {
      console.error('[Lyon Relais] Schedules fetch failed:', err.message)
      setError('Impossible de charger les horaires.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { passages, loading, error, lastFetched, refresh: fetchData }
}
