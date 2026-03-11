import { RefreshCw } from 'lucide-react'

export default function Header({ onRefresh, loading, lastFetched, source }) {
  const timeStr = lastFetched
    ? lastFetched.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className="bg-tcl-red text-white px-4 pt-4 pb-3 flex items-center justify-between shadow-md flex-shrink-0 safe-top">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-tcl-red font-bold text-base leading-none">P</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Lyon Relais</h1>
        </div>
        {timeStr && (
          <p className="text-xs text-red-200 mt-0.5 ml-10">
            Mis à jour à {timeStr}
            {source && (
              <span className="ml-1 opacity-60">· {source}</span>
            )}
          </p>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        aria-label="Actualiser les données"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50"
      >
        <RefreshCw
          size={18}
          className={loading ? 'animate-spin' : ''}
        />
      </button>
    </header>
  )
}
