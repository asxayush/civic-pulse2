"use client";

import { useEffect, useRef } from "react";

interface Props {
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  readonly?: boolean;
  markers?: { lat: number; lng: number; title: string; status?: string }[];
}

export default function MapPicker({
  onLocationChange,
  initialLat = 28.6139,
  initialLng = 77.209,
  readonly = false,
  markers = [],
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      // If the DOM node already has a Leaflet instance, destroy it first
      if ((mapRef.current as any)._leaflet_id) {
        // Already initialised - nothing to do, map was preserved
        return;
      }

      // Fix Leaflet default icon issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      mapInstance.current = map;

      // Add existing markers (for admin map view)
      markers.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:28px;height:28px;
            background:linear-gradient(135deg,#6366f1,#a855f7);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid white;
            box-shadow:0 2px 8px rgba(99,102,241,0.5);
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${m.title}</b><br/>${m.status ?? ""}`);
      });

      if (!readonly) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          onLocationChange(lat, lng);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const customIcon = L.divIcon({
              className: "",
              html: `<div style="
                width:32px;height:32px;
                background:linear-gradient(135deg,#6366f1,#a855f7);
                border-radius:50%;
                border:3px solid white;
                box-shadow:0 0 20px rgba(99,102,241,0.7);
              "></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, []);


  return <div ref={mapRef} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />;
}
