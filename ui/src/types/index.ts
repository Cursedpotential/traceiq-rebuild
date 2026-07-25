export interface TraceEvent {
  event_id: string;
  serial_display: string;
  raw_type: string;
  event_type: 'visit' | 'activity' | 'timeline_path';
  start_eastern: string;
  end_eastern: string;
  start_utc: string;
  end_utc: string;
  lat: number;
  lng: number;
  lat_r4: number;
  lng_r4: number;
  place_id: string;
  tags: string[];
  overnight_simple: 'overnight' | 'daytrip' | null;
  probability: number;
}

export interface FilterState {
  query: string;
  dateFrom: string;
  dateTo: string;
  eventTypes: TraceEvent['event_type'][];
  tags: string[];
  overnight: TraceEvent['overnight_simple'][];
  minProbability: number;
}

export type MapMode = 'pins' | 'paths' | 'heatmap' | 'time';
export type WorkspaceMode = 'manual' | 'agent';

export type TabKey = 'explore' | 'analytics' | 'tables' | 'export' | 'config';

export interface DataAdapter {
  listEvents(): Promise<TraceEvent[]>;
  searchEvents(filters: Partial<FilterState>): Promise<TraceEvent[]>;
  getEvent(id: string): Promise<TraceEvent | null>;
  askAgent(question: string, filters: Partial<FilterState>): Promise<{
    answer: string;
    receipts: string[];
  }>;
}

export interface LatLng { lat: number; lng: number; }
