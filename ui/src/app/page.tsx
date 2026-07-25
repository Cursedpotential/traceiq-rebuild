"use client";
import { WorkspaceProvider, useWorkspace } from '@/lib/WorkspaceContext';
import { AppTopBar } from '@/components/shell/AppTopBar';
import { QueryPanel } from '@/components/shell/QueryPanel';
import { MapView } from '@/components/map/MapView';
import { ResultsTable } from '@/components/table/ResultsTable';
import { ChatPane } from '@/components/chat/ChatPane';
import { useEffect } from 'react';
import { getAdapter } from '@/mock/adapter';

function ExplorePage() {
  const { tab, setFilteredEvents } = useWorkspace();

  useEffect(() => {
    getAdapter().searchEvents({}).then(setFilteredEvents);
  }, [setFilteredEvents]);

  if (tab !== 'explore') {
    return (
      <div className="flex flex-col h-full">
        <AppTopBar />
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <h2 className="text-lg font-medium text-ink mb-1">{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
            <p className="text-sm">Placeholder page for {tab} module.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppTopBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <QueryPanel />
            </div>
            <div className="h-[260px] shrink-0">
              <ChatPane />
            </div>
          </div>
        </div>
        <MapView />
        <ResultsTable />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <WorkspaceProvider>
      <ExplorePage />
    </WorkspaceProvider>
  );
}
