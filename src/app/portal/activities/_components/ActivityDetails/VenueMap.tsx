import { useState, useEffect, useRef, memo } from 'react';
import { ActionIcon, Box } from '@mantine/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { IconMap } from '@tabler/icons-react';

export const VenueMap = memo(
  ({
    coordinates,
  }: {
    /** lng, lat */
    coordinates: [number, number] | null;
  }) => {
    const [style, setStyle] = useState<'streets' | 'sattelite'>('streets');

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    // default coordinates (TIP Manila)
    const placeholder: [number, number] = [
      120.98851163771423, 14.595059433301486,
    ];

    const toggleStyle = () => {
      if (style === 'streets') {
        mapRef.current!.setStyle(
          'mapbox://styles/mapbox/satellite-streets-v12',
        );
        setStyle('sattelite');
      } else {
        mapRef.current!.setStyle('mapbox://styles/mapbox/streets-v12');
        setStyle('streets');
      }
    };

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
          zoom: 18,
          maxBounds: philippinesBounds,
          performanceMetricsCollection: false,
        });

        markerRef.current = new mapboxgl.Marker({
          draggable: false,
          color: 'red',
        })
          .setLngLat(coordinates ?? placeholder)
          .addTo(mapRef.current);

        // Update marker position when coordinates prop changes
        mapRef.current.on('load', () => {
          mapRef.current!.setCenter(coordinates ?? placeholder);
          markerRef.current!.setLngLat(coordinates ?? placeholder);
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
        className="relative"
        h={640}
        id="editableMap"
        mt={8}
        ref={mapContainerRef}
        w="100%"
      >
        <Box className="absolute left-3 top-3 z-10">
          <ActionIcon
            aria-label={`Toggle map style to ${style}.`}
            c="black"
            onClick={toggleStyle}
            variant="white"
          >
            <IconMap size={18} stroke={1.5} />
          </ActionIcon>
        </Box>
      </Box>
    );
  },
);
VenueMap.displayName = 'VenueMap';
