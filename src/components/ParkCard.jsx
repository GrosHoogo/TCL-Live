import { Star } from 'lucide-react'

/**
 * Returns status display info: label, color classes.
 */
function getStatusInfo(etat) {
  switch (etat) {
    case 'OUVERT':
      return { label: 'Ouvert', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'COMPLET':
      return { label: 'Complet', bg: 'bg-red-100', text: 'text-red-600' }
    case 'FERME':
    case 'FERMÉ':
      return { label: 'Fermé', bg: 'bg-gray-100', text: 'text-gray-500' }
    default:
      return { label: 'Inconnu', bg: 'bg-yellow-100', text: 'text-yellow-600' }
  }
}

/**
 * Returns progress bar color based on fill ratio.
 * 0–50%  → green, 50–80% → orange, 80–100% → red
 */
function getBarColor(ratio) {
  if (ratio <= 0.5) return 'bg-emerald-500'
  if (ratio <= 0.8) return 'bg-orange-400'
  return 'bg-red-500'
}

export default function ParkCard({ parking, isFavorite, onToggleFavorite, compact = false }) {
  const { nom, etat, capacite, nb_pr } = parking
  const status = getStatusInfo(etat)

  const filled = capacite > 0 ? Math.max(0, capacite - nb_pr) : 0
  const ratio = capacite > 0 ? filled / capacite : 1
  const pct = Math.round(ratio * 100)
  const barColor = getBarColor(ratio)

  const isUnavailable = etat === 'FERME' || etat === 'FERMÉ' || etat === 'COMPLET'

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      {/* Top row: name + favorite */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm leading-snug truncate">{nom}</h2>
          <span
            className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
        </div>

        <button
          onClick={() => onToggleFavorite(parking.id)}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-gray-100"
        >
          <Star
            size={20}
            strokeWidth={1.8}
            className={isFavorite ? 'text-amber-400' : 'text-gray-300'}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Places disponibles */}
      {!compact && (
        <>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>
              {isUnavailable ? '–' : nb_pr}
            </span>
            <span className="text-sm text-gray-400">
              / {capacite} places disponibles
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${pct}% occupé`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{pct}% occupé</p>
          </div>
        </>
      )}

      {/* Compact mode (popup map): simple line */}
      {compact && (
        <p className={`text-sm ${isUnavailable ? 'text-gray-400' : 'text-gray-700'}`}>
          {isUnavailable
            ? 'Non disponible'
            : `${nb_pr} / ${capacite} places`}
        </p>
      )}
    </article>
  )
}
