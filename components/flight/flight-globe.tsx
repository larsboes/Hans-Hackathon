'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  APIProvider,
  GestureHandling,
  Map3D,
  MapMode,
  Marker3D,
  useMap3D,
} from '@vis.gl/react-google-maps';
import type { FlightData } from '@/lib/types';
import { getCurrentPosition, interpolateGreatCircle } from '@/lib/flight-data';
import { AlertCircle, Flame, Bird } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PlaneModel = 'default' | 'glurak' | 'duck';

interface FlightGlobeProps {
  flight: FlightData;
  planeModel: PlaneModel;
  onCyclePlaneModel: () => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBlr5NkfAp84YskenrxJbi3_HNQcUsYdcE';

/* ── 3D model configs ────────────────────────────────────── */

const MODEL_3D_CONFIG: Record<
  PlaneModel,
  { src: string; scale: number; tilt: number; headingOffset: number }
> = {
  default: {
    src: '/api/model/plane.glb',
    scale: 250,
    tilt: -90,
    headingOffset: 180,
  },
  glurak: {
    src: '/assets/3d/glurak.glb',
    scale: 80_000,
    tilt: -90,
    headingOffset: 180,
  },
  duck: {
    src: '/assets/3d/duck.glb',
    scale: 80_000,
    tilt: -90,
    headingOffset: 270,
  },
};

const MODEL_LABELS: Record<
  PlaneModel,
  { label: string; icon: 'flame' | 'bird' | 'plane' }
> = {
  default: { label: 'Plane', icon: 'plane' },
  glurak: { label: 'Glurak', icon: 'flame' },
  duck: { label: 'Duck', icon: 'bird' },
};

/* ── Helpers ─────────────────────────────────────────────── */

function getHeadingDegrees(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

function getFlightDistanceMeters(flight: FlightData): number {
  const EARTH_RADIUS_METERS = 6_371_000;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const lat1 = toRad(flight.departure.lat);
  const lat2 = toRad(flight.arrival.lat);
  const deltaLat = toRad(flight.arrival.lat - flight.departure.lat);
  const deltaLng = toRad(flight.arrival.lng - flight.departure.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/* ── Map sub-components ──────────────────────────────────── */

interface FlightMap3DProps {
  flight: FlightData;
  planeModel: PlaneModel;
}

function FlightMap3D({ flight, planeModel }: FlightMap3DProps) {
  const center = useMemo(
    () => ({
      lat: (flight.departure.lat + flight.arrival.lat) / 2,
      lng: (flight.departure.lng + flight.arrival.lng) / 2,
      altitude: 0,
    }),
    [flight],
  );

  const cameraRange = useMemo(() => {
    const MIN_RANGE = 4_500_000;
    const MAX_RANGE = 12_000_000;
    const distanceRange = getFlightDistanceMeters(flight) * 1.4;
    return Math.max(MIN_RANGE, Math.min(MAX_RANGE, distanceRange));
  }, [flight]);

  return (
    <Map3D
      key={flight.id}
      defaultCenter={center}
      defaultHeading={0}
      defaultTilt={45}
      defaultRoll={0}
      defaultRange={cameraRange}
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
        label={flight.departure.code}
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
        label={flight.arrival.code}
        title={`${flight.arrival.city} (${flight.arrival.code})`}
        sizePreserved
        drawsWhenOccluded
      />

      <MovingFlightMarker flight={flight} planeModel={planeModel} />
    </Map3D>
  );
}

/** 3D .glb model placed on the map via Model3DElement */
function Model3DMarker({
  flight,
  src,
  scale,
  tilt,
  headingOffset,
}: {
  flight: FlightData;
  src: string;
  scale: number;
  tilt: number;
  headingOffset: number;
}) {
  const map3d = useMap3D();
  const modelRef = useRef<any>(null);
  const headingOffsetRef = useRef(headingOffset);
  const tiltRef = useRef(tilt);

  useEffect(() => {
    headingOffsetRef.current = headingOffset;
    tiltRef.current = tilt;

    if (!modelRef.current) return;

    const [lat, lng] = getCurrentPosition(flight);
    const heading = getHeadingDegrees(
      { lat, lng },
      { lat: flight.arrival.lat, lng: flight.arrival.lng },
    );

    modelRef.current.position = { lat, lng, altitude: 350_000 };
    modelRef.current.orientation = {
      heading: (heading + headingOffsetRef.current) % 360,
      tilt: tiltRef.current,
      roll: 0,
    };
  }, [flight, headingOffset, tilt]);

  useEffect(() => {
    const googleMaps = (window as unknown as { google?: any }).google;
    const Model3DElement = googleMaps?.maps?.maps3d?.Model3DElement;
    const AltitudeMode = googleMaps?.maps?.maps3d?.AltitudeMode;

    if (!map3d || !Model3DElement) return;

    const [initialLat, initialLng] = getCurrentPosition(flight);
    const initialHeading = getHeadingDegrees(
      { lat: initialLat, lng: initialLng },
      { lat: flight.arrival.lat, lng: flight.arrival.lng },
    );

    const model = new Model3DElement({
      src,
      position: { lat: initialLat, lng: initialLng, altitude: 350_000 },
      altitudeMode: AltitudeMode.ABSOLUTE,
      scale,
      orientation: {
        heading: (initialHeading + headingOffsetRef.current) % 360,
        tilt: tiltRef.current,
        roll: 0,
      },
    });

    map3d.append(model);
    modelRef.current = model;

    const interval = window.setInterval(() => {
      if (!modelRef.current) return;

      const [lat, lng] = getCurrentPosition(flight);
      const heading = getHeadingDegrees(
        { lat, lng },
        { lat: flight.arrival.lat, lng: flight.arrival.lng },
      );

      modelRef.current.position = { lat, lng, altitude: 350_000 };
      modelRef.current.orientation = {
        heading: (heading + headingOffsetRef.current) % 360,
        tilt: tiltRef.current,
        roll: 0,
      };
    }, 30_000);

    return () => {
      window.clearInterval(interval);
      model.remove();
      if (modelRef.current === model) {
        modelRef.current = null;
      }
    };
    // Only create/destroy when map or model source changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map3d, src, flight]);

  return null;
}

function MovingFlightMarker({
  flight,
  planeModel,
}: {
  flight: FlightData;
  planeModel: PlaneModel;
}) {
  const config = MODEL_3D_CONFIG[planeModel];
  return (
    <Model3DMarker
      flight={flight}
      src={config.src}
      scale={config.scale}
      tilt={config.tilt}
      headingOffset={config.headingOffset}
    />
  );
}

function FlightRoute({ flight }: { flight: FlightData }) {
  const map3d = useMap3D();

  // Build an arc of points along the great circle, elevated like a real flight path
  const routePath = useMemo(() => {
    const NUM_POINTS = 60;
    const CRUISE_ALTITUDE = 350_000; // meters – matches the plane model altitude
    const points: { lat: number; lng: number; altitude: number }[] = [];

    for (let i = 0; i <= NUM_POINTS; i++) {
      const t = i / NUM_POINTS;
      const [lat, lng] = interpolateGreatCircle(
        flight.departure.lat,
        flight.departure.lng,
        flight.arrival.lat,
        flight.arrival.lng,
        t,
      );
      // Sine curve: 0 at endpoints, peaks at midpoint
      const altitude = Math.sin(t * Math.PI) * CRUISE_ALTITUDE;
      points.push({ lat, lng, altitude });
    }

    return points;
  }, [flight]);

  useEffect(() => {
    const googleMaps = (window as unknown as { google?: any }).google;

    if (!map3d || !googleMaps?.maps?.maps3d?.Polyline3DElement) return;

    const polyline = new googleMaps.maps.maps3d.Polyline3DElement({
      path: routePath,
      altitudeMode: googleMaps.maps.maps3d.AltitudeMode.ABSOLUTE,
      geodesic: false, // we already interpolated the great circle ourselves
      drawsOccludedSegments: true,
      zIndex: 9999,
      strokeColor: '#00ff88',
      strokeWidth: 4,
      outerColor: '#00ff88',
      outerWidth: 0,
    });

    map3d.append(polyline);

    return () => {
      polyline.remove();
    };
  }, [map3d, routePath]);

  return null;
}

/* ── Main component ──────────────────────────────────────── */

export function FlightGlobe({
  flight,
  planeModel,
  onCyclePlaneModel,
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
            variant={planeModel !== 'default' ? 'default' : 'secondary'}
            size="sm"
            onClick={onCyclePlaneModel}
            className="gap-1.5 text-xs"
          >
            {planeModel === 'glurak' ? (
              <Flame className="h-3.5 w-3.5" />
            ) : planeModel === 'duck' ? (
              <Bird className="h-3.5 w-3.5" />
            ) : (
              <Flame className="h-3.5 w-3.5" />
            )}
            {planeModel === 'default'
              ? 'Fun Mode'
              : MODEL_LABELS[planeModel].label + ' Mode'}
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
        <FlightMap3D flight={flight} planeModel={planeModel} />
      </APIProvider>

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant={planeModel !== 'default' ? 'default' : 'secondary'}
          size="sm"
          onClick={onCyclePlaneModel}
          className="gap-1.5 text-xs"
        >
          {planeModel === 'glurak' ? (
            <Flame className="h-3.5 w-3.5" />
          ) : planeModel === 'duck' ? (
            <Bird className="h-3.5 w-3.5" />
          ) : (
            <Flame className="h-3.5 w-3.5" />
          )}
          {planeModel === 'default'
            ? 'Fun Mode'
            : MODEL_LABELS[planeModel].label + ' Mode'}
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
