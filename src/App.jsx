import { useState, useMemo } from 'react'
import { useParkings } from './hooks/useParkings'
import { useFavorites } from './hooks/useFavorites'
import Header from './components/Header'
import Navigation from './components/Navigation'
import ParkList from './components/ParkList'
import MapView from './components/MapView'

export default function App() {
  const [activeTab, setActiveTab] = useState('list')

  const { parkings, loading, error, source, lastFetched, refresh } = useParkings()
  const { isFavorite, toggleFavorite } = useFavorites()

  const favoriteParkings = useMemo(
    () => parkings.filter((p) => isFavorite(p.id)),
    [parkings, isFavorite]
  )

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-gray-50">
      <Header
        onRefresh={refresh}
        loading={loading}
        lastFetched={lastFetched}
        source={source}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'list' && (
          <ParkList
            parkings={parkings}
            loading={loading}
            error={error}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {activeTab === 'favorites' && (
          <ParkList
            parkings={favoriteParkings}
            loading={loading}
            error={error}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            emptyMode="favorites"
          />
        )}

        {/* Map is always mounted to avoid re-init, hidden when inactive */}
        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === 'map' ? '' : 'hidden'}`}>
          <MapView
            parkings={parkings}
            loading={loading}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isActive={activeTab === 'map'}
          />
        </div>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
