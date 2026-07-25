"use client";
import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { getAdapter } from '@/mock/adapter';
import { MapMode } from '@/types';
import { Search, Calendar, Tag, Filter, MapPin, Route, Flame, Clock, X } from 'lucide-react';

const allTags = ['home', 'work', 'overnight', 'travel', 'sensitive', 'medical', 'commercial', 'social', 'repeated'];
const allTypes = [
  { key: 'visit', label: 'Visit' },
  { key: 'activity', label: 'Activity' },
  { key: 'timeline_path', label: 'Path' },
];
const mapModes: { key: MapMode; label: string; icon: any }[] = [
  { key: 'pins', label: 'Pins', icon: MapPin },
  { key: 'paths', label: 'Paths', icon: Route },
  { key: 'heatmap', label: 'Heat', icon: Flame },
  { key: 'time', label: 'Time', icon: Clock },
];

export function QueryPanel() {
  const { filters, setFilters, mapMode, setMapMode, setFilteredEvents } = useWorkspace();
  const [localQuery, setLocalQuery] = useState(filters.query);

  useEffect(() => {
    const t = setTimeout(() => {
      getAdapter().searchEvents(filters).then(setFilteredEvents);
    }, 150);
    return () => clearTimeout(t);
  }, [filters, setFilteredEvents]);

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag) ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag];
    setFilters({ ...filters, tags: next });
  };

  const toggleType = (type: string) => {
    const key = type as any;
    const next = filters.eventTypes.includes(key) ? filters.eventTypes.filter(t => t !== key) : [...filters.eventTypes, key];
    setFilters({ ...filters, eventTypes: next });
  };

  const activeCount = useMemo(() =>
    (filters.eventTypes.length ? 1 : 0) +
    (filters.tags.length ? 1 : 0) +
    (filters.overnight.length ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.minProbability > 0 ? 1 : 0),
  [filters]);

  const clearAll = () => setFilters({ query: '', dateFrom: '', dateTo: '', eventTypes: [], tags: [], overnight: [], minProbability: 0 });

  return (
    <div className="flex flex-col h-full w-full min-w-[280px] max-w-[340px] bg-surface border-r border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-ink"><Filter className="w-4 h-4" /> Filters</div>
        {activeCount > 0 && <button onClick={clearAll} className="text-xs text-signal hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Clear {activeCount}</button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted mb-2"><Search className="w-3 h-3" /> Search</label>
          <input
            value={localQuery}
            onChange={e => { setLocalQuery(e.target.value); setFilters({ ...filters, query: e.target.value }); }}
            placeholder="Event ID, type, tag..."
            className="w-full px-3 py-2 text-sm bg-surface-2 border border-border rounded-lg focus:outline-none focus:border-signal"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted mb-2"><Calendar className="w-3 h-3" /> Date range</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-surface-2 border border-border rounded-md focus:outline-none focus:border-signal"
            />
            <span className="text-muted">→</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-surface-2 border border-border rounded-md focus:outline-none focus:border-signal"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-2 block">Event type</label>
          <div className="flex flex-wrap gap-2">
            {allTypes.map(t => (
              <button
                key={t.key}
                onClick={() => toggleType(t.key)}
                className={`px-2.5 py-1 text-xs rounded-full border transition ${filters.eventTypes.includes(t.key as any) ? 'bg-signal-soft border-signal text-signal' : 'bg-surface-2 border-border text-muted hover:text-ink'}`}
              >{t.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted mb-2"><Tag className="w-3 h-3" /> Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 text-xs rounded-full border transition ${filters.tags.includes(tag) ? 'bg-signal-soft border-signal text-signal' : 'bg-surface-2 border-border text-muted hover:text-ink'}`}
              >{tag}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-2 block">Overnight</label>
          <div className="flex gap-2">
            {(['overnight', 'daytrip'] as const).map(o => (
              <button
                key={o}
                onClick={() => {
                  const next = filters.overnight.includes(o) ? filters.overnight.filter(x => x !== o) : [...filters.overnight, o];
                  setFilters({ ...filters, overnight: next });
                }}
                className={`px-2.5 py-1 text-xs rounded-full border capitalize transition ${filters.overnight.includes(o) ? 'bg-signal-soft border-signal text-signal' : 'bg-surface-2 border-border text-muted hover:text-ink'}`}
              >{o}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-2 block">Min probability: {filters.minProbability.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={filters.minProbability}
            onChange={e => setFilters({ ...filters, minProbability: Number(e.target.value) })}
            className="w-full accent-signal"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-2 block">Map mode</label>
          <div className="grid grid-cols-2 gap-2">
            {mapModes.map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMapMode(m.key)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded-lg border transition ${mapMode === m.key ? 'bg-signal-soft border-signal text-signal' : 'bg-surface-2 border-border text-muted hover:text-ink'}`}
                ><Icon className="w-3.5 h-3.5" />{m.label}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
