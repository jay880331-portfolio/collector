import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface Collection {
  id: string
  name: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  imageUrl?: string
  description?: string
}

interface AppState {
  user: User | null
  collections: Collection[]
  selectedCategory: string
  isLoading: boolean
  setUser: (user: User | null) => void
  setCollections: (collections: Collection[]) => void
  addCollection: (collection: Collection) => void
  setSelectedCategory: (category: string) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  collections: [],
  selectedCategory: 'all',
  isLoading: false,
  setUser: (user) => set({ user }),
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => set((state) => ({ 
    collections: [...state.collections, collection] 
  })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setLoading: (loading) => set({ isLoading: loading }),
}))