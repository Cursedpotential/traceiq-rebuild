"use client";
import { useState, useMemo } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { TraceEvent } from '@/types';
import { ArrowUpDown, MapPin, Calendar, Hash, Tag, AlertCircle } from 'lucide-react';

type SortKey = 'start_eastern' | 'event_type' | 'probability' | 'place_id';

export function ResultsTable() {
  const { filteredEvents, selectedEvent, setSelectedEvent, filters } = useWorkspace();
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'start_eastern', dir: 'desc' });

  const sorted = useMemo(() => {
    const out = [...filteredEvents];
    out.sort((a, b) => {
      let va: any = a[sort.key];
      let vb: any = b[sort.key];
      if (sort.key === 'start_eastern') {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return out;
  }, [filteredEvents, sort]);

  const Header = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => setSort({ key: k, dir: sort.key === k && sort.dir === 'asc' ? 'desc' : 'asc' })}
      className="flex items-center gap-1 text-left text-xs font-medium text-muted hover:text-ink"
    >
      {children} <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full min-w-[280px] max-w-[420px] bg-surface border-l border-border">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="text-sm font-medium text-ink flex items-center gap-2"><Hash className="w-4 h-4" /> Results</div>
        <span className="text-xs text-muted">{filteredEvents.length} events</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface z-10">
            <tr className="border-b border-border text-xs">
              <th className="px-3 py-2 font-medium"><Header k="start_eastern"><Calendar className="w-3 h-3" /></Header></th>
              <th className="px-3 py-2 font-medium"><Header k="event_type">Type</Header></th>
              <th className="px-3 py-2 font-medium"><Header k="place_id">Place</Header></th>
              <th className="px-3 py-2 font-medium text-right"><Header k="probability">Prob</Header></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(e => {
              const active = selectedEvent?.event_id === e.event_id;
              return (
                <tr
                  key={e.event_id}
                  onClick={() => setSelectedEvent(e)}
                  className={`text-xs border-b border-border cursor-pointer transition ${active ? 'bg-signal-soft' : 'hover:bg-surface-2'}`}
                >
                  <td className="px-3 py-2 font-mono text-muted">{e.start_eastern.slice(0, 10)}<br/><span className="text-[10px]">{e.start_eastern.slice(11, 16)}</span></td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${e.event_type === 'visit' ? 'bg-[var(--signal-soft)] text-signal border-signal/20' : e.event_type === 'activity' ? 'bg-[#fff7ed] text-concerning border-concerning/20' : 'bg-surface-2 text-muted border-border'}`}>{e.event_type.replace('_', ' ')}</span></td>
                  <td className="px-3 py-2 max-w-[140px] truncate" title={e.place_id}>{e.place_id}</td>
                  <td className="px-3 py-2 text-right font-mono">{Math.round(e.probability * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted text-sm gap-2">
            <AlertCircle className="w-5 h-5" /> No events match filters.
          </div>
        )}
      </div>
    </div>
  );
}
