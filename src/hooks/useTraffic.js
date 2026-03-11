import { useState, useEffect, useCallback } from 'react'

const TRAFFIC_URL =
  'https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/sytral:tcl_sytral.tclalerte_2_0_0/items?f=application/geo%2Bjson&limit=100'

function parseAlerts(geojson) {
  if (!geojson?.features) return []

  return geojson.features
    .map((f) => {
      const p = f.properties ?? {}
      return {
        id: String(p.gid ?? p.id ?? Math.random()),
        ligne: p.ligne ?? p.line ?? null,
        titre: p.titre ?? p.title ?? p.nom ?? 'Perturbation',
        message: p.message ?? p.description ?? '',
        dateDebut: p.date_debut ?? p.dateDebut ?? p.date_start ?? null,
        dateFin: p.date_fin ?? p.dateFin ?? p.date_end ?? null,
        type: (p.type_alerte ?? p.type ?? 'INFO').toUpperCase(),
      }
    })
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
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
