import { DataAdapter, FilterState, TraceEvent } from '@/types';

function toParams(filters: Partial<FilterState>): string {
  const p = new URLSearchParams();
  if (filters.query) p.set('query', filters.query);
  if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) p.set('dateTo', filters.dateTo);
  (filters.eventTypes ?? []).forEach(t => p.append('eventType', t));
  if (filters.overnight?.length === 1 && filters.overnight[0] === 'overnight') p.set('overnight', 'true');
  return p.toString();
}

async function fetchEvents(filters: Partial<FilterState>): Promise<TraceEvent[]> {
  const res = await fetch(`/api/events?${toParams(filters)}`);
  if (!res.ok) throw new Error(`events API ${res.status}`);
  const data = await res.json();
  return data.events as TraceEvent[];
}

// Live adapter: her real corpus over analysis.latest_events. Same interface as the mock,
// so the whole UI is unchanged — only the data source swaps (ADR-0001 adapter seam).
export const pgAdapter: DataAdapter = {
  async listEvents() {
    return fetchEvents({});
  },
  async searchEvents(filters) {
    return fetchEvents(filters);
  },
  async getEvent(id) {
    const all = await fetchEvents({});
    return all.find(e => e.event_id === id) ?? null;
  },
  async askAgent(question, filters) {
    // Agent backend (Claude SDK + AgentOS) is a later phase. Until then, deterministic
    // retrieval over the real data with real receipts — no fabricated narration.
    const relevant = await fetchEvents(filters);
    const top = relevant.slice(0, 10);
    const answer = top.length
      ? `${relevant.length} real events match. First: ${top[0].event_type} ${top[0].serial_display} at ${top[0].place_id || 'unnamed place'} (${top[0].start_eastern}).`
      : 'No events match the current filters.';
    return { answer, receipts: top.map(e => e.event_id).slice(0, 6) };
  },
};
