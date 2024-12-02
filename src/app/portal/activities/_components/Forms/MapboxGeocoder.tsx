import { useState, useEffect, useRef, memo } from 'react';
import { ActionIcon, Box } from '@mantine/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import MbGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { IconMap } from '@tabler/icons-react';

export const MapboxGeocoder = memo(
  ({
    coordinates,
    setCoordinates,
  }: {
    /** lng, lat */
    coordinates: [number, number] | null;
    setCoordinates: (coords: [number, number]) => void;
  }) => {
    const [style, setStyle] = useState<'streets' | 'sattelite'>('streets');

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const geocoderRef = useRef<MbGeocoder | null>(null);

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
          doubleClickZoom: false,
        });
        geocoderRef.current = new MbGeocoder({
          // @ts-expect-error wtf is wrong with this type
          mapboxgl: mapRef.current,
          accessToken: mapboxgl.accessToken,
          countries: 'ph',

          // manually update the marker because the built-in one
          // is ??? to control
          marker: false,
        });
        mapRef.current.addControl(geocoderRef.current);

        markerRef.current = new mapboxgl.Marker({
          draggable: true,
          color: 'red',
        })
          .setLngLat(coordinates ?? placeholder)
          .addTo(mapRef.current);

        // Set initial coordinates
        geocoderRef.current.setProximity({
          longitude: coordinates?.[0] ?? placeholder[0],
          latitude: coordinates?.[1] ?? placeholder[1],
        });

        // update marker position when search result is selected
        geocoderRef.current.on('result', (e) => {
          const result = e.result.geometry.coordinates;
          setCoordinates(result);
          markerRef.current!.setLngLat(result as [number, number]);
        });

        // Update coordinates when marker is dragged
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current!.getLngLat();
          setCoordinates([lngLat.lng, lngLat.lat]);
        });

        // Update marker position when coordinates prop changes
        mapRef.current.on('load', () => {
          mapRef.current!.setCenter(coordinates ?? placeholder);
          markerRef.current!.setLngLat(coordinates ?? placeholder);
        });

        // Update marker on double click
        mapRef.current.on('dblclick', (e) => {
          const lngLat = e.lngLat;
          setCoordinates([lngLat.lng, lngLat.lat]);
          markerRef.current!.setLngLat([lngLat.lng, lngLat.lat]);
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
        h={380}
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
MapboxGeocoder.displayName = 'MapboxGeocoder';
