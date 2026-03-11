import { Clock, Zap } from 'lucide-react'

// ── Line badge colors ─────────────────────────────────────────────────────────
const METRO_COLORS = {
  A: 'bg-red-600',
  B: 'bg-blue-500',
  C: 'bg-orange-500',
  D: 'bg-green-600',
}
const MODE_COLORS = {
  Métro:       'bg-red-700',
  Tramway:     'bg-purple-700',
  Bus:         'bg-slate-700',
  Funiculaire: 'bg-amber-800',
}
const MODE_LABELS = {
  Métro:       { short: 'M' },
  Tramway:     { short: 'T' },
  Bus:         { short: 'B' },
  Funiculaire: { short: 'F' },
}

function getLineBadgeColor(ligne, mode) {
  if (mode === 'Métro') return METRO_COLORS[ligne?.toUpperCase()] ?? 'bg-red-700'
  return MODE_COLORS[mode] ?? 'bg-slate-700'
}

// ── Time-until logic ──────────────────────────────────────────────────────────
/**
 * Returns minutes until heurepassage from now.
 * heurepassage format: "2026-03-11 15:08:00"
 */
function minutesFromNow(heurepassage) {
  if (!heurepassage) return null
  const dep = new Date(heurepassage.replace(' ', 'T'))
  if (isNaN(dep)) return null
  return Math.round((dep - Date.now()) / 60000)
}

function TimeBadge({ heurepassage }) {
  const mins = minutesFromNow(heurepassage)

  // Build label + color
  let label, colorClass

  if (mins === null) {
    label = '—'
    colorClass = 'text-gray-400 bg-gray-100'
  } else if (mins <= 0) {
    label = 'Immédiat'
    colorClass = 'text-emerald-700 bg-emerald-100'
  } else if (mins <= 5) {
    label = `${mins} min`
    colorClass = 'text-emerald-700 bg-emerald-100'
  } else {
    label = `${mins} min`
    colorClass = 'text-orange-600 bg-orange-100'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold whitespace-nowrap ${colorClass}`}>
      <Clock size={13} strokeWidth={2.5} />
      {label}
    </span>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function ScheduleCard({ passage }) {
  const { ligne, direction, heurepassage, type, mode } = passage
  const badgeColor = getLineBadgeColor(ligne, mode)
  const modeInfo = MODE_LABELS[mode] ?? { short: '?' }
  const isRealTime = type === 'E'

  // Hour label ("15:08") shown under the countdown
  const hourLabel = heurepassage ? heurepassage.slice(11, 16) : null

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      {/* Line badge */}
      <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex flex-col items-center justify-center ${badgeColor}`}>
        <span className="text-white text-[10px] font-medium leading-none opacity-70">
          {modeInfo.short}
        </span>
        <span className="text-white text-base font-extrabold leading-tight tracking-tight">
          {ligne ?? '?'}
        </span>
      </div>

      {/* Direction + type */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">Vers</p>
        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
          {direction ?? 'Destination inconnue'}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {isRealTime ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <Zap size={10} fill="currentColor" />
              Temps réel
            </span>
          ) : (
            <span className="text-[10px] text-gray-400">Théorique</span>
          )}
          {hourLabel && (
            <span className="text-[10px] text-gray-300">· {hourLabel}</span>
          )}
        </div>
      </div>

      {/* Countdown badge */}
      <TimeBadge heurepassage={heurepassage} />
    </article>
  )
}
