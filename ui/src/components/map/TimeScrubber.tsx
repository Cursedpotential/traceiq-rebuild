"use client";
import { useMemo } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { TraceEvent } from '@/types';

export function TimeScrubber() {
  const { filteredEvents, filters, setFilters } = useWorkspace();
  const dates = useMemo(() => extractDateRange(filteredEvents), [filteredEvents]);

  const min = dates.min;
  const max = dates.max;
  const from = filters.dateFrom || min;
  const to = filters.dateTo || max;

  if (!min || !max) return null;

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 bg-surface/95 backdrop-blur border border-border rounded-[var(--r)] shadow-[var(--shadow)] px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted whitespace-nowrap">{from}</span>
        <div className="flex-1 relative h-6">
          <input
            type="range"
            min={0}
            max={daysBetween(min, max)}
            value={daysBetween(min, from)}
            onChange={e => setFilters({ ...filters, dateFrom: addDays(min, Number(e.target.value)) })}
            className="absolute w-full accent-signal h-1 top-2.5 opacity-70"
          />
          <input
            type="range"
            min={0}
            max={daysBetween(min, max)}
            value={daysBetween(min, to)}
            onChange={e => setFilters({ ...filters, dateTo: addDays(min, Number(e.target.value)) })}
            className="absolute w-full accent-signal h-1 top-2.5"
          />
        </div>
        <span className="text-[10px] font-mono text-muted whitespace-nowrap">{to}</span>
      </div>
    </div>
  );
}

function extractDateRange(events: TraceEvent[]) {
  if (!events.length) return { min: '', max: '' };
  const sorted = [...events].sort((a, b) => a.start_eastern.localeCompare(b.start_eastern));
  return { min: sorted[0].start_eastern.slice(0, 10), max: sorted[sorted.length - 1].end_eastern.slice(0, 10) };
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
