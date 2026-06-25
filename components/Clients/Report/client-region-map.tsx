"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import MapLibreGL from "maplibre-gl";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef } from "react";

type RegionPoint = { uf: string; total: number };

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AC: [-70.55, -9.02],
  AL: [-36.78, -9.62],
  AM: [-63.9, -4.15],
  AP: [-51.77, 1.41],
  BA: [-41.7, -12.48],
  CE: [-39.32, -5.2],
  DF: [-47.86, -15.78],
  ES: [-40.31, -19.57],
  GO: [-49.64, -15.98],
  MA: [-45.27, -5.42],
  MG: [-44.55, -18.51],
  MS: [-54.55, -20.51],
  MT: [-55.92, -12.68],
  PA: [-52.96, -3.79],
  PB: [-36.83, -7.12],
  PE: [-37.99, -8.38],
  PI: [-42.97, -7.72],
  PR: [-51.56, -24.89],
  RJ: [-42.67, -22.25],
  RN: [-36.59, -5.84],
  RO: [-63.58, -10.83],
  RR: [-61.33, 2.05],
  RS: [-53.32, -30.17],
  SC: [-50.49, -27.45],
  SE: [-37.45, -10.57],
  SP: [-48.75, -22.19],
  TO: [-48.2, -10.25],
};

export default function ClientRegionMap({ regions }: { regions: RegionPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const { resolvedTheme } = useTheme();
  const points = useMemo(
    () =>
      regions.flatMap((region) => {
        const coordinates = STATE_CENTROIDS[region.uf];
        return coordinates ? [{ ...region, coordinates }] : [];
      }),
    [regions],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style:
        resolvedTheme === "dark"
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-51.5, -14.3],
      zoom: 3,
      minZoom: 2.5,
      maxZoom: 9,
      dragRotate: false,
      pitchWithRotate: false,
      cooperativeGestures: true,
      attributionControl: { compact: true },
    });
    map.addControl(new MapLibreGL.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [resolvedTheme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: MapLibreGL.Marker[] = [];
    const max = Math.max(1, ...points.map((point) => point.total));
    const bounds = new MapLibreGL.LngLatBounds();

    for (const point of points) {
      const size = Math.round(18 + 30 * Math.sqrt(point.total / max));
      const element = document.createElement("button");
      element.type = "button";
      element.className = "client-region-marker";
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.setAttribute(
        "aria-label",
        `${point.uf}: ${point.total.toLocaleString("pt-BR")} clientes`,
      );
      const popup = new MapLibreGL.Popup({
        offset: Math.ceil(size / 2),
        closeButton: false,
      }).setHTML(
        `<div class="client-region-popup"><strong>${point.uf}</strong><span>${point.total.toLocaleString("pt-BR")} clientes</span></div>`,
      );
      const marker = new MapLibreGL.Marker({ element })
        .setLngLat(point.coordinates)
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
      bounds.extend(point.coordinates);
    }

    if (points.length === 1 && points[0])
      map.easeTo({ center: points[0].coordinates, zoom: 5.5, duration: 500 });
    else if (points.length > 1) map.fitBounds(bounds, { padding: 56, maxZoom: 5.5, duration: 500 });
    else map.easeTo({ center: [-51.5, -14.3], zoom: 3, duration: 500 });

    return () => markers.forEach((marker) => marker.remove());
  }, [points]);

  return (
    <div className="relative h-[390px] w-full overflow-hidden rounded-lg bg-muted/30">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Mapa de distribuição de clientes por estado"
      />
    </div>
  );
}
