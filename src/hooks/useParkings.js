import { useState, useEffect, useCallback } from 'react'

const AFS_URL =
  'https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/sytral:tcl_sytral.tclparcrelaistr/items?&f=application/geo%2Bjson&crs=EPSG:4171&startIndex=0&sortby=gid&limit=100'

const WFS_URL =
  'https://data.grandlyon.com/geoserver/sytral/ows?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=sytral:tcl_sytral.tclparcrelaistr&outputFormat=application/json&SRSNAME=EPSG:4171&startIndex=0&sortby=gid&count=100'

/**
 * Parse a GeoJSON FeatureCollection into a normalized array of parking objects.
 * Both AFS and WFS return the same GeoJSON structure.
 */
function parseFeatures(geojson) {
  if (!geojson?.features) return []

  return geojson.features
    .filter((f) => f.geometry?.coordinates)
    .map((f) => {
      const p = f.properties ?? {}

      // Normalize coordinates: handle Point [lng,lat] and MultiPoint/nested [[lng,lat],...]
      let rawCoords = f.geometry.coordinates
      if (Array.isArray(rawCoords[0])) rawCoords = rawCoords[0]
      const [lng, lat] = rawCoords

      const capacite = Number(p.capacite ?? 0)
      const nb_pr = Number(p.nb_tot_place_dispo ?? p.nb_pr ?? 0)
      const nb_pmr = Number(p.place_handi ?? p.nb_pmr ?? 0)

      // Derive status: API has no explicit etat field
      const etat = p.etat
        ? String(p.etat).toUpperCase()
        : nb_pr === 0
          ? 'COMPLET'
          : 'OUVERT'

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return null
      }

      return {
        id: String(p.gid ?? p.id ?? `${lat}-${lng}`),
        nom: p.nom ?? p.name ?? 'Parc Relais',
        etat,
        capacite,
        nb_pr,
        nb_pmr,
        horaires: p.horaires ?? null,
        lat,
        lng,
        lastUpdate: p.last_update ?? p.dateupdate ?? null,
      }
    })
    .filter(Boolean)
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

export function useParkings() {
  const [parkings, setParkings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState(null) // 'AFS' | 'WFS'
  const [lastFetched, setLastFetched] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // --- Try AFS first ---
    try {
      const json = await fetchWithTimeout(AFS_URL)
      const data = parseFeatures(json)
      if (data.length === 0) throw new Error('AFS returned 0 features')
      setParkings(data)
      setSource('AFS')
      setLastFetched(new Date())
      setLoading(false)
      return
    } catch (afsErr) {
      console.warn('[Lyon Relais] AFS failed, switching to WFS fallback:', afsErr.message)
    }

    // --- Fallback: WFS ---
    try {
      const json = await fetchWithTimeout(WFS_URL)
      const data = parseFeatures(json)
      if (data.length === 0) throw new Error('WFS returned 0 features')
      setParkings(data)
      setSource('WFS')
      setLastFetched(new Date())
    } catch (wfsErr) {
      console.error('[Lyon Relais] Both AFS and WFS failed:', wfsErr.message)
      setError('Impossible de charger les données. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { parkings, loading, error, source, lastFetched, refresh: fetchData }
}
