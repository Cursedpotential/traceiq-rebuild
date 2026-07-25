"use client";
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import { DeckGL, ScatterplotLayer, PathLayer, HeatmapLayer } from 'deck.gl';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const MAP_STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function MapView() {
  const { filteredEvents, mapMode, selectedEvent, setSelectedEvent, theme } = useWorkspace() as any;
  const events = filteredEvents;
  const mapRef = useRef<any>(null);

  const initialView = useMemo(() => ({
    longitude: -84.5,
    latitude: 42.7,
    zoom: 6.5,
    pitch: 0,
    bearing: 0,
  }), []);

  useEffect(() => {
    if (selectedEvent && mapRef.current) {
      mapRef.current.flyTo({ center: [selectedEvent.lng, selectedEvent.lat], zoom: 10, duration: 700 });
    }
  }, [selectedEvent]);

  const layers: any[] = useMemo(() => {
    const commonProps = { id: 'events', data: events, pickable: true };
    if (mapMode === 'pins') {
      return [new ScatterplotLayer({
        ...commonProps,
        id: 'pins',
        getPosition: (d: any) => [d.lng, d.lat],
        getFillColor: (d: any) => d.event_id === selectedEvent?.event_id ? [37, 99, 235, 255] : d.overnight_simple === 'overnight' ? [124, 58, 237, 200] : [5, 150, 105, 200],
        getRadius: (d: any) => d.event_id === selectedEvent?.event_id ? 12 : 6,
        radiusMinPixels: 3,
        radiusMaxPixels: 30,
        onClick: (info: any) => setSelectedEvent(info.object || null),
      })];
    }
    if (mapMode === 'paths') {
      const sorted = [...events].sort((a, b) => new Date(a.start_utc).getTime() - new Date(b.start_utc).getTime());
      const path = sorted.map(e => [e.lng, e.lat]);
      return [
        new PathLayer({
          id: 'path',
          data: [{ path }],
          getPath: (d: any) => d.path,
          getColor: [37, 99, 235, 200],
          getWidth: 3,
          widthMinPixels: 2,
        }),
        new ScatterplotLayer({
          ...commonProps,
          id: 'path-pins',
          getPosition: (d: any) => [d.lng, d.lat],
          getFillColor: [37, 99, 235, 180],
          getRadius: 4,
          radiusMinPixels: 2,
          onClick: (info: any) => setSelectedEvent(info.object || null),
        }),
      ];
    }
    if (mapMode === 'heatmap') {
      return [new HeatmapLayer({
        ...commonProps,
        id: 'heat',
        getPosition: (d: any) => [d.lng, d.lat],
        getWeight: (d: any) => d.probability,
        radiusPixels: 25,
        intensity: 1,
        threshold: 0.05,
      })];
    }
    // time mode = pins colored by hour
    return [new ScatterplotLayer({
      ...commonProps,
      id: 'time',
      getPosition: (d: any) => [d.lng, d.lat],
      getFillColor: (d: any) => {
        const h = new Date(d.start_eastern).getHours();
        const night = h < 6 || h >= 20;
        return night ? [124, 58, 237, 220] : [245, 158, 11, 220];
      },
      getRadius: 6,
      radiusMinPixels: 3,
      radiusMaxPixels: 24,
      onClick: (info: any) => setSelectedEvent(info.object || null),
    })];
  }, [events, mapMode, selectedEvent, setSelectedEvent]);

  const getTooltip = useCallback(({ object }: any) => {
    if (!object) return null;
    return {
      text: `${object.serial_display} · ${object.event_type}\n${object.place_id}\n${object.start_eastern.slice(0, 16)}`,
    };
  }, []);

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <DeckGL
        initialViewState={initialView}
        controller
        layers={layers}
        getTooltip={getTooltip}
        style={{ position: 'absolute', inset: '0', zIndex: '1' }}
      >
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          mapStyle={theme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>
    </div>
  );
}
