"use client";

import { useEffect, useRef, useState } from "react";

interface LiveMapProps {
  origin: { name: string; location: { lat: number; lng: number } };
  destination?: { name: string; location: { lat: number; lng: number } } | null;
  currentLocation?: { lat: number; lng: number } | null;
  routePoints?: { lat: number; lng: number }[];
  status?: string;
  reroute?: { name: string; location: { lat: number; lng: number } } | null;
  otherTrucks?: any[];
}

export default function LiveMap({
  origin,
  destination,
  currentLocation,
  routePoints,
  status,
  reroute,
  otherTrucks = [],
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!origin?.location?.lat) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !mapRef.current) return;

        // Initialize map only once
        if (!mapInstanceRef.current) {
          const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
          });
          mapInstanceRef.current = map;

          // Use OpenStreetMap tiles (fastest, most reliable)
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            { maxZoom: 18 }
          ).addTo(map);
        }

        const map = mapInstanceRef.current;
        
        // Remove old dynamic layers if we tracked them (or we can just track a single LayerGroup)
        if (!map.dynamicLayers) {
            map.dynamicLayers = L.layerGroup().addTo(map);
        }
        const layers = map.dynamicLayers;
        layers.clearLayers();

        const makeIcon = (color: string, sz = 10) =>
          L.divIcon({
            className: "",
            html: `<div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 6px ${color}80"></div>`,
            iconSize: [sz, sz],
            iconAnchor: [sz / 2, sz / 2],
          });

        // Origin (green)
        L.marker([origin.location.lat, origin.location.lng], { icon: makeIcon("#34C759") })
          .addTo(layers)
          .bindTooltip(origin.name, { permanent: true, direction: "top", className: "lm-tip", offset: [0, -8] as any });

        // Destination (blue)
        if (destination?.location?.lat) {
          L.marker([destination.location.lat, destination.location.lng], { icon: makeIcon("#007AFF") })
            .addTo(layers)
            .bindTooltip(destination.name, { permanent: true, direction: "top", className: "lm-tip", offset: [0, -8] as any });
        }

        // Route
        const pts: [number, number][] =
          routePoints && routePoints.length > 1
            ? routePoints.map((p) => [p.lat, p.lng])
            : destination?.location?.lat 
              ? [[origin.location.lat, origin.location.lng], [destination.location.lat, destination.location.lng]]
              : [[origin.location.lat, origin.location.lng]];

        if (pts.length > 1) {
          L.polyline(pts, { color: "#34C759", weight: 3, opacity: 0.8 }).addTo(layers);
        }

        // Remaining route dashed
        if (currentLocation?.lat && pts.length > 1) {
          let ni = 0, nd = Infinity;
          pts.forEach(([lat, lng], i) => {
            const d = (lat - currentLocation.lat) ** 2 + (lng - currentLocation.lng) ** 2;
            if (d < nd) { nd = d; ni = i; }
          });
          const rem = pts.slice(ni);
          if (rem.length > 1) L.polyline(rem, { color: "#007AFF", weight: 2, opacity: 0.5, dashArray: "8 6" }).addTo(layers);
        }

        // Reroute
        if (reroute?.location?.lat) {
          L.marker([reroute.location.lat, reroute.location.lng], { icon: makeIcon("#FF3B30", 12) })
            .addTo(layers)
            .bindTooltip(reroute.name, { permanent: true, direction: "right", className: "lm-tip-red", offset: [8, 0] as any });
          if (currentLocation?.lat)
            L.polyline([[currentLocation.lat, currentLocation.lng], [reroute.location.lat, reroute.location.lng]], { color: "#FF3B30", weight: 3 }).addTo(layers);
        }

        // Truck
        if (currentLocation?.lat) {
          L.marker([currentLocation.lat, currentLocation.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="width:14px;height:14px;background:${status === "emergency" ? "#FF3B30" : "#007AFF"};border-radius:50%;border:3px solid white;box-shadow:0 0 10px ${status === "emergency" ? "#FF3B30" : "#007AFF"}"></div>`,
              iconSize: [14, 14], iconAnchor: [7, 7],
            }),
          }).addTo(layers);
        }

        // Other Trucks
        otherTrucks.forEach((truck: any) => {
          if (truck.currentLocation?.lat) {
            const isWarning = truck.status === "warning" || truck.status === "emergency";
            const tColor = isWarning ? "#FF9500" : "#34C759";
            L.marker([truck.currentLocation.lat, truck.currentLocation.lng], {
              icon: L.divIcon({
                className: "",
                html: `<div style="width:10px;height:10px;background:${tColor};border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${tColor}"></div>`,
                iconSize: [10, 10], iconAnchor: [5, 5],
              }),
            })
            .addTo(layers)
            .bindTooltip(truck.truckPlate, { className: "lm-tip", offset: [0, -5] as any });
          }
        });

        // Fit
        const all: [number, number][] = [
          [origin.location.lat, origin.location.lng],
        ];
        if (destination?.location?.lat) all.push([destination.location.lat, destination.location.lng]);
        if (currentLocation?.lat) all.push([currentLocation.lat, currentLocation.lng]);
        if (reroute?.location?.lat) all.push([reroute.location.lat, reroute.location.lng]);
        otherTrucks.forEach((t: any) => {
          if (t.currentLocation?.lat) all.push([t.currentLocation.lat, t.currentLocation.lng]);
        });
        map.fitBounds(L.latLngBounds(all), { padding: [30, 30] });

        setLoading(false);
      } catch (err) {
        console.error("Map error:", err);
        setLoading(false);
      }
    };

    initMap();

  }, [origin?.location?.lat, origin?.location?.lng, destination?.location?.lat, destination?.location?.lng, currentLocation?.lat, status, reroute?.location?.lat, otherTrucks]);

  // Clean up map only on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#1c1c1e] rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-[#8E8E93] font-mono">Loading map...</span>
          </div>
        </div>
      )}
      <style>{`
        .lm-tip{background:rgba(0,0,0,.85)!important;border:1px solid rgba(255,255,255,.15)!important;color:#fff!important;font:10px ui-monospace,monospace!important;padding:3px 8px!important;border-radius:6px!important;box-shadow:0 2px 8px rgba(0,0,0,.4)!important}
        .lm-tip::before{display:none!important}
        .lm-tip-red{background:rgba(255,59,48,.9)!important;border:1px solid rgba(255,255,255,.3)!important;color:#fff!important;font:bold 10px ui-monospace,monospace!important;padding:3px 8px!important;border-radius:6px!important}
        .lm-tip-red::before{display:none!important}
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </div>
  );
}
