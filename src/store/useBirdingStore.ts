import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Observation, Species, Trip, WishlistItem, UserProfile, MonthlyStats } from '@/types';
import { mockObservations } from '@/data/mockObservations';
import { mockSpeciesList } from '@/data/mockSpecies';
import { mockTrips } from '@/data/mockTrips';
import { mockWishlist, mockUserProfile, mockMonthlyStats } from '@/data/mockStats';

interface BirdingState {
  observations: Observation[];
  species: Species[];
  trips: Trip[];
  wishlist: WishlistItem[];
  user: UserProfile;
  monthlyStats: MonthlyStats;
  filters: {
    dateRange?: [number, number];
    speciesIds?: string[];
  };
}

interface BirdingActions {
  addObservation: (obs: Observation) => void;
  updateObservation: (id: string, patch: Partial<Observation>) => void;
  deleteObservation: (id: string) => void;
  addTrip: (trip: Trip) => void;
  addToWishlist: (item: WishlistItem) => void;
  toggleWishlistObserved: (speciesId: string) => void;
  removeFromWishlist: (speciesId: string) => void;
  updateWishlistPriority: (speciesId: string, priority: WishlistItem['priority']) => void;
}

type BirdingStore = BirdingState & { actions: BirdingActions };

export const useBirdingStore = create<BirdingStore>()(
  persist(
    (set) => ({
      observations: mockObservations,
      species: mockSpeciesList,
      trips: mockTrips,
      wishlist: mockWishlist,
      user: mockUserProfile,
      monthlyStats: mockMonthlyStats,
      filters: {},
      actions: {
        addObservation: (obs) => set(s => ({
          observations: [obs, ...s.observations],
        })),
        updateObservation: (id, patch) => set(s => ({
          observations: s.observations.map(o => o.id === id ? { ...o, ...patch } : o),
        })),
        deleteObservation: (id) => set(s => ({
          observations: s.observations.filter(o => o.id !== id),
        })),
        addTrip: (trip) => set(s => ({ trips: [trip, ...s.trips] })),
        addToWishlist: (item) => set(s => ({ wishlist: [item, ...s.wishlist] })),
        toggleWishlistObserved: (speciesId) => set(s => ({
          wishlist: s.wishlist.map(w => w.speciesId === speciesId
            ? { ...w, observed: !w.observed, observedAt: !w.observed ? Date.now() : undefined }
            : w),
        })),
        removeFromWishlist: (speciesId) => set(s => ({
          wishlist: s.wishlist.filter(w => w.speciesId !== speciesId),
        })),
        updateWishlistPriority: (speciesId, priority) => set(s => ({
          wishlist: s.wishlist.map(w => w.speciesId === speciesId ? { ...w, priority } : w),
        })),
      },
    }),
    {
      name: 'birding-app-storage',
      partialize: (state) => ({
        observations: state.observations,
        trips: state.trips,
        wishlist: state.wishlist,
        user: state.user,
        monthlyStats: state.monthlyStats,
        filters: state.filters,
      }),
      version: 1,
    }
  )
);
