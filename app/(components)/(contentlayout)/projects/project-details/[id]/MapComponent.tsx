'use client';
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";

interface MapComponentProps {
  longitude: number;
  latitude: number;
}

export default function MapComponent({ longitude, latitude }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current || !longitude || !latitude) return;

    const buildMap = (isDark: boolean) => {
      const basemapUrl = isDark
        ? "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const mapInstance = new Map({
        target: mapRef.current!,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: basemapUrl,
              attributions:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
              crossOrigin: "anonymous",
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([longitude, latitude]),
          zoom: 5,
        }),
      });

      // Add marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([longitude - 0.07, latitude])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: "/assets/images/brand-logos/markerG.png",
            anchor: [0.5, 1],
            scale: 0.012,
          }),
        })
      );

      mapInstance.addLayer(
        new VectorLayer({
          source: new VectorSource({ features: [marker] }),
        })
      );

      return mapInstance;
    };

    // Initial map
    let mapInstance = buildMap(
      document.documentElement.classList.contains("dark")
    );

    // Watch for Tailwind dark: class toggle
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      if (mapInstance) mapInstance.setTarget(undefined);
      mapInstance = buildMap(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (mapInstance) mapInstance.setTarget(undefined);
      observer.disconnect();
    };
  }, [longitude, latitude]);

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} />;
}