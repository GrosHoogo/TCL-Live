import { useState, useMemo } from 'react'
import { Search, X, ArrowLeft, Bus, ChevronRight } from 'lucide-react'
import { getTransportMode } from '../hooks/useSchedules'
import ScheduleCard from './ScheduleCard'

// ── Line badge colors (same as ScheduleCard) ──────────────────────────────────
const METRO_COLORS  = { A: 'bg-red-600', B: 'bg-blue-500', C: 'bg-orange-500', D: 'bg-green-600' }
const MODE_BG       = { Métro: 'bg-red-700', Tramway: 'bg-purple-700', Bus: 'bg-slate-700', Funiculaire: 'bg-amber-800' }
const MODE_LIGHT_BG = { Métro: 'bg-red-50',  Tramway: 'bg-purple-50',  Bus: 'bg-slate-50',  Funiculaire: 'bg-amber-50'  }
const MODE_TEXT     = { Métro: 'text-red-700', Tramway: 'text-purple-700', Bus: 'text-slate-700', Funiculaire: 'text-amber-700' }

function getLineBg(ligne) {
  const mode = getTransportMode(ligne)
  if (mode === 'Métro') return METRO_COLORS[ligne?.toUpperCase()] ?? 'bg-red-700'
  return MODE_BG[mode] ?? 'bg-slate-700'
}

// Mode sections order
const MODE_ORDER = ['Métro', 'Tramway', 'Funiculaire', 'Bus']

// ── Sort unique lines: Métro → Tramway → Funiculaire → Bus ────────────────────
function sortLines(lines) {
  return [...lines].sort((a, b) => {
    const mA = getTransportMode(a)
    const mB = getTransportMode(b)
    const pA = MODE_ORDER.indexOf(mA)
    const pB = MODE_ORDER.indexOf(mB)
    if (pA !== pB) return pA - pB

    if (mA === 'Métro') {
      const ORDER = ['A', 'B', 'C', 'D']
      return ORDER.indexOf(a?.toUpperCase()) - ORDER.indexOf(b?.toUpperCase())
    }
    if (mA === 'Tramway') {
      return (parseInt(a?.slice(1)) || 0) - (parseInt(b?.slice(1)) || 0)
    }
    // Natural sort for buses
    return String(a).localeCompare(String(b), 'fr', { numeric: true })
  })
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
          <div className="w-16 h-8 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ── Step 1 : line selection ───────────────────────────────────────────────────
function StepSelectLine({ passages, loading, onSelect }) {
  const [search, setSearch] = useState('')

  const allLines = useMemo(
    () => sortLines([...new Set(passages.map((p) => p.ligne).filter(Boolean))]),
    [passages]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? allLines.filter((l) => l.toLowerCase().includes(q)) : allLines
  }, [allLines, search])

  // Group by mode
  const byMode = useMemo(() => {
    const groups = {}
    for (const l of filtered) {
      const m = getTransportMode(l)
      if (!groups[m]) groups[m] = []
      groups[m].push(l)
    }
    return groups
  }, [filtered])

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      {/* Search */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 bg-gray-50">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ligne (ex: C9)…"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-tcl-red focus:ring-2 focus:ring-red-100 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
          <Search size={32} className="text-gray-200" />
          <p className="text-gray-500 font-medium">Aucune ligne trouvée</p>
          <p className="text-gray-400 text-sm">Aucun résultat pour « {search} »</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
          {MODE_ORDER.filter((m) => byMode[m]?.length > 0).map((mode) => (
            <div key={mode}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${MODE_TEXT[mode]}`}>
                {mode} · {byMode[mode].length} ligne{byMode[mode].length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {byMode[mode].map((ligne) => (
                  <button
                    key={ligne}
                    onClick={() => onSelect(ligne)}
                    className={`
                      h-12 rounded-xl flex items-center justify-center
                      text-white font-extrabold text-sm tracking-tight
                      active:opacity-80 transition-opacity
                      ${getLineBg(ligne)}
                    `}
                  >
                    {ligne}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step 2 : direction selection ──────────────────────────────────────────────
function StepSelectDirection({ passages, selectedLine, onSelect, onBack }) {
  const mode = getTransportMode(selectedLine)
  const lightBg = MODE_LIGHT_BG[mode] ?? 'bg-gray-50'
  const textColor = MODE_TEXT[mode] ?? 'text-gray-700'
  const lineBg = getLineBg(selectedLine)

  const directions = useMemo(() => {
    const dirs = passages
      .filter((p) => p.ligne === selectedLine)
      .map((p) => p.direction)
      .filter(Boolean)
    return [...new Set(dirs)].sort()
  }, [passages, selectedLine])

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      {/* Sub-header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 bg-gray-50 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 active:text-gray-700 mb-2"
        >
          <ArrowLeft size={15} />
          Retour aux lignes
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lineBg}`}>
            <span className="text-white font-extrabold text-sm">{selectedLine}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">Choisissez la direction</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {directions.map((dir) => (
          <button
            key={dir}
            onClick={() => onSelect(dir)}
            className={`
              w-full flex items-center justify-between gap-3
              px-4 py-4 rounded-2xl border text-left
              active:opacity-80 transition-opacity
              ${lightBg} border-gray-200
            `}
          >
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Direction</p>
              <p className={`text-base font-bold ${textColor}`}>{dir}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 3 : next 5 passages ──────────────────────────────────────────────────
function StepPassages({ passages, selectedLine, selectedDirection, onBack }) {
  const lineBg = getLineBg(selectedLine)

  const next5 = useMemo(() => {
    return passages
      .filter((p) => p.ligne === selectedLine && p.direction === selectedDirection)
      .sort((a, b) => {
        if (!a.heurepassage) return 1
        if (!b.heurepassage) return -1
        return a.heurepassage < b.heurepassage ? -1 : 1
      })
      .slice(0, 5)
  }, [passages, selectedLine, selectedDirection])

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      {/* Sub-header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 bg-gray-50 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 active:text-gray-700 mb-2"
        >
          <ArrowLeft size={15} />
          Retour aux directions
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lineBg}`}>
            <span className="text-white font-extrabold text-sm">{selectedLine}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400">Vers</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">{selectedDirection}</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {next5.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <Bus size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Aucun passage trouvé</p>
          <p className="text-gray-400 text-sm">Les données ne sont pas disponibles pour cette direction.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <p className="text-xs text-gray-400">
            {next5.length} prochain{next5.length > 1 ? 's' : ''} départ{next5.length > 1 ? 's' : ''}
          </p>
          {next5.map((passage) => (
            <ScheduleCard key={passage.id} passage={passage} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function ScheduleView({ passages, loading, error }) {
  const [step, setStep] = useState(1)
  const [selectedLine, setSelectedLine] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState(null)

  function handleSelectLine(ligne) {
    setSelectedLine(ligne)
    setStep(2)
  }

  function handleSelectDirection(dir) {
    setSelectedDirection(dir)
    setStep(3)
  }

  function handleBackToLines() {
    setSelectedLine(null)
    setSelectedDirection(null)
    setStep(1)
  }

  function handleBackToDirections() {
    setSelectedDirection(null)
    setStep(2)
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">⚠️</div>
        <p className="text-gray-700 font-medium">Erreur de chargement</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  if (step === 1) {
    return (
      <StepSelectLine
        passages={passages}
        loading={loading}
        onSelect={handleSelectLine}
      />
    )
  }

  if (step === 2) {
    return (
      <StepSelectDirection
        passages={passages}
        selectedLine={selectedLine}
        onSelect={handleSelectDirection}
        onBack={handleBackToLines}
      />
    )
  }

  return (
    <StepPassages
      passages={passages}
      selectedLine={selectedLine}
      selectedDirection={selectedDirection}
      onBack={handleBackToDirections}
    />
  )
}
