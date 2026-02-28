'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  GestureHandling,
  Map3D,
  MapMode,
  Marker3D,
  useMap3D,
} from '@vis.gl/react-google-maps';
import type { FlightData } from '@/lib/types';
import { getCurrentPosition } from '@/lib/flight-data';
import { AlertCircle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightGlobeProps {
  flight: FlightData;
  charizardMode: boolean;
  onToggleCharizard: () => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBlr5NkfAp84YskenrxJbi3_HNQcUsYdcE';

interface FlightMap3DProps {
  flight: FlightData;
  charizardMode: boolean;
}

function FlightMap3D({ flight, charizardMode }: FlightMap3DProps) {
  const center = useMemo(
    () => ({
      lat: (flight.departure.lat + flight.arrival.lat) / 2,
      lng: (flight.departure.lng + flight.arrival.lng) / 2,
      altitude: 0,
    }),
    [flight],
  );

  return (
    <Map3D
      defaultCenter={center}
      defaultHeading={0}
      defaultTilt={0}
      defaultRoll={0}
      defaultRange={9_000_000}
      mode={MapMode.SATELLITE}
      gestureHandling={GestureHandling.GREEDY}
      className="h-full w-full"
    >
      <FlightRoute flight={flight} />

      <Marker3D
        position={{
          lat: flight.departure.lat,
          lng: flight.departure.lng,
          altitude: 150_000,
        }}
        label={`🛫 ${flight.departure.code}`}
        title={`${flight.departure.city} (${flight.departure.code})`}
        sizePreserved
        drawsWhenOccluded
      />

      <Marker3D
        position={{
          lat: flight.arrival.lat,
          lng: flight.arrival.lng,
          altitude: 150_000,
        }}
        label={`🛬 ${flight.arrival.code}`}
        title={`${flight.arrival.city} (${flight.arrival.code})`}
        sizePreserved
        drawsWhenOccluded
      />

      <MovingFlightMarker flight={flight} charizardMode={charizardMode} />
    </Map3D>
  );
}

function MovingFlightMarker({
  flight,
  charizardMode,
}: {
  flight: FlightData;
  charizardMode: boolean;
}) {
  const [position, setPosition] = useState(() => {
    const [lat, lng] = getCurrentPosition(flight);
    return { lat, lng };
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      const [lat, lng] = getCurrentPosition(flight);
      setPosition({ lat, lng });
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [flight]);

  return (
    <Marker3D
      position={{ lat: position.lat, lng: position.lng, altitude: 200_000 }}
      label={charizardMode ? '🔥' : '✈️'}
      sizePreserved
      drawsWhenOccluded
    />
  );
}

function FlightRoute({ flight }: { flight: FlightData }) {
  const map3d = useMap3D();

  const routePath = useMemo(() => {
    return [
      { lat: flight.departure.lat, lng: flight.departure.lng },
      { lat: flight.arrival.lat, lng: flight.arrival.lng },
    ];
  }, [flight]);

  useEffect(() => {
    const googleMaps = (window as unknown as { google?: any }).google;

    if (!map3d || !googleMaps?.maps?.maps3d?.Polyline3DElement) return;

    const polyline = new googleMaps.maps.maps3d.Polyline3DElement({
      path: routePath,
      altitudeMode: googleMaps.maps.maps3d.AltitudeMode.CLAMP_TO_GROUND,
      geodesic: true,
      drawsOccludedSegments: true,
      zIndex: 9999,
      strokeColor: '#ff00ff',
      strokeWidth: 12,
      outerColor: '#111111',
      outerWidth: 0.5,
    });

    map3d.append(polyline);

    return () => {
      polyline.remove();
    };
  }, [map3d, routePath]);

  return null;
}

export function FlightGlobe({
  flight,
  charizardMode,
  onToggleCharizard,
}: FlightGlobeProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative h-full w-full">
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <div className="mx-4 flex max-w-sm items-start gap-3 rounded-lg border border-border bg-card/90 p-4 text-sm backdrop-blur-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <div className="font-medium text-foreground">
                Google Maps key missing
              </div>
              <div className="text-muted-foreground">
                Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the live flight
                globe.
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant={charizardMode ? 'default' : 'secondary'}
            size="sm"
            onClick={onToggleCharizard}
            className="gap-1.5 text-xs"
          >
            <Flame className="h-3.5 w-3.5" />
            {charizardMode ? 'Glurak Mode ON' : 'Glurak Mode'}
          </Button>
        </div>

        <div className="absolute left-4 top-4 z-10 rounded-lg bg-card/80 px-3 py-2 text-xs backdrop-blur-sm">
          <div className="text-muted-foreground">Altitude</div>
          <div className="font-mono text-sm font-semibold text-foreground">
            35,000 ft
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <FlightMap3D flight={flight} charizardMode={charizardMode} />
      </APIProvider>

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant={charizardMode ? 'default' : 'secondary'}
          size="sm"
          onClick={onToggleCharizard}
          className="gap-1.5 text-xs"
        >
          <Flame className="h-3.5 w-3.5" />
          {charizardMode ? 'Glurak Mode ON' : 'Glurak Mode'}
        </Button>
      </div>

      <div className="absolute left-4 top-4 z-10 rounded-lg bg-card/80 px-3 py-2 text-xs backdrop-blur-sm">
        <div className="text-muted-foreground">Altitude</div>
        <div className="font-mono text-sm font-semibold text-foreground">
          35,000 ft
        </div>
      </div>
    </div>
  );
}
