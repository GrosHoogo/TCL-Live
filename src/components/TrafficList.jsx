import { useState } from 'react'
import { Search, X, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react'

// Mode → emoji badge
const MODE_EMOJI = {
  'Métro': '🚇',
  'Tramway': '🚊',
  'Bus': '🚌',
  'Navette maritime/fluviale': '⛵',
}

function formatDate(str) {
  if (!str) return null
  try {
    return new Date(str.replace(' ', 'T')).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

/**
 * Severity: niveauseverite 20 = high impact, 30 = medium, 40 = low/info
 * type: "Perturbation" | "Information" | "Information ligne"
 */
function getStyle(type, severity) {
  if (type === 'Perturbation' || severity <= 20) {
    return {
      Icon: AlertTriangle,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconColor: 'text-orange-500',
      typeBadge: 'bg-orange-100 text-orange-700',
    }
  }
  if (severity <= 30) {
    return {
      Icon: Zap,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      typeBadge: 'bg-blue-100 text-blue-700',
    }
  }
  // severity 40+ → soft info
  return {
    Icon: Info,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconColor: 'text-gray-400',
    typeBadge: 'bg-gray-100 text-gray-500',
  }
}

function AlertCard({ alert }) {
  const style = getStyle(alert.type, alert.severity)
  const { Icon } = style
  const modeEmoji = MODE_EMOJI[alert.mode] ?? '🚦'
  const dateDebut = formatDate(alert.dateDebut)
  const dateFin = formatDate(alert.dateFin)

  // Hide "far future" end date (year > 2050)
  const showDateFin = dateFin && alert.dateFin && Number(alert.dateFin.slice(0, 4)) < 2050

  return (
    <article className={`rounded-2xl border p-4 flex gap-3 ${style.bg} ${style.border}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={18} className={style.iconColor} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Badges row: mode emoji + line + type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm leading-none">{modeEmoji}</span>
          {alert.ligne && (
            <span className="px-2 py-0.5 rounded-md bg-gray-800 text-white text-xs font-bold tracking-wide">
              {alert.ligne}
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.typeBadge}`}>
            {alert.type}
          </span>
          {alert.cause && (
            <span className="text-[11px] text-gray-400 capitalize">{alert.cause}</span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 leading-snug">{alert.titre}</p>

        {/* Message */}
        {alert.message && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{alert.message}</p>
        )}

        {/* Dates */}
        {(dateDebut || showDateFin) && (
          <p className="text-[11px] text-gray-400 pt-0.5">
            {dateDebut && <span>Du {dateDebut}</span>}
            {showDateFin && <span> au {dateFin}</span>}
          </p>
        )}
      </div>
    </article>
  )
}

function SkeletonAlert() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 flex gap-3 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded w-6" />
          <div className="h-5 bg-gray-200 rounded w-10" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function TrafficList({ alerts, loading, error }) {
  const [searchQuery, setSearchQuery] = useState('')

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">⚠️</div>
        <p className="text-gray-700 font-medium">Erreur de chargement</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonAlert key={i} />)}
      </div>
    )
  }

  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? alerts.filter(
        (a) =>
          (a.ligne ?? '').toLowerCase().includes(query) ||
          (a.titre ?? '').toLowerCase().includes(query) ||
          (a.mode ?? '').toLowerCase().includes(query)
      )
    : alerts

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky search bar */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 bg-gray-50 sticky top-0 z-10">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ligne, mode ou titre… (ex: T1, Bus, C3)"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-tcl-red focus:ring-2 focus:ring-red-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label="Effacer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* No active alerts */}
      {alerts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <p className="text-gray-700 font-semibold">Aucune perturbation</p>
          <p className="text-gray-400 text-sm">Le réseau TCL fonctionne normalement.</p>
        </div>
      )}

      {/* No search result */}
      {alerts.length > 0 && filtered.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-2">
          <Search size={32} className="text-gray-200" />
          <p className="text-gray-500 font-medium">Aucun résultat</p>
          <p className="text-gray-400 text-sm">Aucune alerte pour « {searchQuery} »</p>
        </div>
      )}

      {/* Alert list */}
      {filtered.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-400 pt-1">
            {filtered.length} alerte{filtered.length > 1 ? 's' : ''} en cours
          </p>
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
