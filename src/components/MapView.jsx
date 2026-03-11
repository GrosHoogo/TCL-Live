import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ParkCard from './ParkCard'

const LYON_CENTER = [45.764, 4.835]
const DEFAULT_ZOOM = 12

// --- Custom SVG marker factory ---
function makeMarkerIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 14 24 16 24S32 26.5 32 16C32 7.16 24.84 0 16 0z"
        fill="${color}" filter="url(#shadow)"/>
      <text x="16" y="20" text-anchor="middle" fill="white"
        font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700">P</text>
    </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

const ICON_GREEN  = makeMarkerIcon('#10b981') // emerald-500
const ICON_ORANGE = makeMarkerIcon('#f97316') // orange-500
const ICON_RED    = makeMarkerIcon('#ef4444') // red-500
const ICON_GRAY   = makeMarkerIcon('#9ca3af') // gray-400

function getMarkerIcon(park) {
  if (park.etat === 'FERME' || park.etat === 'FERMÉ') return ICON_GRAY
  if (park.etat === 'COMPLET') return ICON_RED
  if (park.capacite === 0) return ICON_GRAY
  const ratio = (park.capacite - park.nb_pr) / park.capacite
  if (ratio <= 0.5) return ICON_GREEN
  if (ratio <= 0.8) return ICON_ORANGE
  return ICON_RED
}

/** Auto-fit bounds when parkings change */
function BoundsUpdater({ parkings, active }) {
  const map = useMap()

  useEffect(() => {
    if (!active || parkings.length === 0) return
    const bounds = parkings.map((p) => [p.lat, p.lng])
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [active, parkings, map])

  return null
}

export default function MapView({ parkings, loading, isFavorite, onToggleFavorite, isActive }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-tcl-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de la carte…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <MapContainer
        center={LYON_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <BoundsUpdater parkings={parkings} active={isActive} />

        {parkings.map((park) => (
          <Marker
            key={park.id}
            position={[park.lat, park.lng]}
            icon={getMarkerIcon(park)}
          >
            <Popup>
              <ParkCard
                parking={park}
                isFavorite={isFavorite(park.id)}
                onToggleFavorite={onToggleFavorite}
                compact={false}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 z-[999] flex flex-col gap-1.5 text-xs">
        {[
          { color: 'bg-emerald-500', label: 'Disponible' },
          { color: 'bg-orange-400', label: 'Limité' },
          { color: 'bg-red-500', label: 'Complet' },
          { color: 'bg-gray-400', label: 'Fermé' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
