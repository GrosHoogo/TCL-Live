import { Star } from 'lucide-react'
import ParkCard from './ParkCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="w-9 h-9 bg-gray-100 rounded-full" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-1/3" />
      <div className="h-2 bg-gray-100 rounded-full" />
    </div>
  )
}

export default function ParkList({ parkings, loading, error, isFavorite, onToggleFavorite, emptyMode }) {
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <p className="text-gray-700 font-medium">Erreur de chargement</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (parkings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
          <Star size={28} className="text-amber-300" />
        </div>
        <p className="text-gray-700 font-semibold">
          {emptyMode === 'favorites'
            ? 'Aucun favori enregistré'
            : 'Aucun parc disponible'}
        </p>
        <p className="text-gray-400 text-sm">
          {emptyMode === 'favorites'
            ? 'Appuyez sur l\'étoile d\'un parc pour l\'ajouter ici.'
            : 'Les données sont temporairement indisponibles.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {parkings.map((park) => (
        <ParkCard
          key={park.id}
          parking={park}
          isFavorite={isFavorite(park.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
