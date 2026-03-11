import { useState, useMemo } from 'react'
import { useParkings } from './hooks/useParkings'
import { useFavorites } from './hooks/useFavorites'
import { useTraffic } from './hooks/useTraffic'
import { useSchedules } from './hooks/useSchedules'
import Header from './components/Header'
import Navigation from './components/Navigation'
import ParkList from './components/ParkList'
import MapView from './components/MapView'
import TrafficList from './components/TrafficList'
import ScheduleView from './components/ScheduleView'

export default function App() {
  const [activeTab, setActiveTab] = useState('list')

  const { parkings, loading, error, source, lastFetched, refresh: refreshParkings } = useParkings()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { alerts, loading: trafficLoading, error: trafficError, refresh: refreshTraffic } = useTraffic()
  const { passages, loading: schedulesLoading, error: schedulesError, refresh: refreshSchedules } = useSchedules()

  const favoriteParkings = useMemo(
    () => parkings.filter((p) => isFavorite(p.id)),
    [parkings, isFavorite]
  )

  function handleRefresh() {
    refreshParkings()
    refreshTraffic()
    refreshSchedules()
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-gray-50">
      <Header
        onRefresh={handleRefresh}
        loading={loading || trafficLoading || schedulesLoading}
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

        {activeTab === 'traffic' && (
          <TrafficList
            alerts={alerts}
            loading={trafficLoading}
            error={trafficError}
          />
        )}

        {activeTab === 'schedules' && (
          <ScheduleView
            passages={passages}
            loading={schedulesLoading}
            error={schedulesError}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
