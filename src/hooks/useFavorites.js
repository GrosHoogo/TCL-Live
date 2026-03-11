import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lyon-relais-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // localStorage not available (private browsing, quota exceeded)
    }
  }, [favorites])

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }, [])

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
