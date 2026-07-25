"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState, MapMode, WorkspaceMode, TabKey, TraceEvent } from '@/types';
import { useTheme } from './useTheme';

interface WorkspaceCtx {
  theme: "light" | "dark";
  toggleTheme: () => void;
  mode: WorkspaceMode;
  setMode: (m: WorkspaceMode) => void;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  mapMode: MapMode;
  setMapMode: (m: MapMode) => void;
  selectedEvent: TraceEvent | null;
  setSelectedEvent: (e: TraceEvent | null) => void;
  filteredEvents: TraceEvent[];
  setFilteredEvents: (e: TraceEvent[]) => void;
}

const WorkspaceContext = createContext<WorkspaceCtx | null>(null);

const defaultFilters: FilterState = {
  query: '',
  dateFrom: '',
  dateTo: '',
  eventTypes: [],
  tags: [],
  overnight: [],
  minProbability: 0,
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorkspaceMode>('manual');
  const [tab, setTab] = useState<TabKey>('explore');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mapMode, setMapMode] = useState<MapMode>('pins');
  const [selectedEvent, setSelectedEvent] = useState<TraceEvent | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<TraceEvent[]>([]);
  const { theme, toggle } = useTheme();

  return (
    <WorkspaceContext.Provider value={{
      mode, setMode,
      tab, setTab,
      filters, setFilters,
      mapMode, setMapMode,
      selectedEvent, setSelectedEvent,
      filteredEvents, setFilteredEvents,
      theme, toggleTheme: toggle,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider');
  return ctx;
}
