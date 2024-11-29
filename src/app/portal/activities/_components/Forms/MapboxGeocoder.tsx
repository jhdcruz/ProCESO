import { useEffect, useRef, memo } from 'react';
import { Box } from '@mantine/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import MbGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export const MapboxGeocoder = memo(
  ({
    coordinates,
    setCoordinates,
  }: {
    /** lng, lat */
    coordinates: [number, number];
    setCoordinates: (coords: [number, number]) => void;
  }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
      if (!process.env.NEXT_PUBLIC_MAPBOX_PUBLIC) {
        console.error('Mapbox public token is required');
      } else {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC!;
      }

      if (mapContainerRef.current) {
        // Define the bounding box for the Philippines
        const philippinesBounds: [number, number, number, number] = [
          116.87, 4.59, 126.59, 21.12,
        ];

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          localFontFamily: 'Inter',
          zoom: 16,
          maxBounds: philippinesBounds,
          performanceMetricsCollection: false,
          respectPrefersReducedMotion: true,
        });

        const geocoder = new MbGeocoder({
          // @ts-expect-error - mapboxgl types are not updated
          mapboxgl: mapboxgl,
          accessToken: mapboxgl.accessToken,
          countries: 'ph',
        });

        mapRef.current.addControl(geocoder);

        // Add marker based on initial coordinates
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([coordinates[0], coordinates[1]])
          .addTo(mapRef.current);

        // Prevent map from panning when marker is dragged
        markerRef.current.on('dragstart', () => {
          mapRef.current!.dragPan.disable();
        });

        // Update coordinates when marker is dragged
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current!.getLngLat();
          setCoordinates([lngLat.lng, lngLat.lat]);
          mapRef.current!.dragPan.enable();
        });

        // Update marker position when coordinates prop changes
        mapRef.current.on('load', () => {
          mapRef.current!.setCenter([coordinates[0], coordinates[1]]);
        });
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Box
        className="rounded-md"
        h={340}
        id="editableMap"
        ref={mapContainerRef}
        w="100%"
      />
    );
  },
);
MapboxGeocoder.displayName = 'MapboxGeocoder';
