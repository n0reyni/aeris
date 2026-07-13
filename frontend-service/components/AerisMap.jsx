"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const TooltipL     = dynamic(() => import("react-leaflet").then(m => m.Tooltip), { ssr: false });

/**
 * React 18 Strict Mode monte, démonte puis remonte chaque composant en dev.
 * Leaflet initialise le DOM node dans un effet et marque ce node avec un
 * `_leaflet_id` interne ; au remontage immédiat, react-leaflet réutilise le
 * même node mais son ancien état interne est déjà détruit, d'où l'erreur
 * "Cannot read properties of undefined (reading 'appendChild')".
 *
 * Fix : à l'unmount, on efface ce `_leaflet_id` du node et on détruit
 * proprement l'instance Leaflet, pour forcer une initialisation propre
 * au remontage suivant.
 */
export default function AerisMap({ center, zoom = 11, markers }) {
  const mapRef = useRef(null);

  useEffect(() => {
    return () => {
      const map = mapRef.current;
      if (map) {
        const container = map.getContainer?.();
        if (container) container._leaflet_id = null;
        map.remove();
      }
    };
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map(({ key, coords, color, label }) => (
        <CircleMarker key={key} center={coords} radius={12} pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}>
          <TooltipL direction="top" offset={[0, -8]} opacity={1} permanent={false}>
            {label.tooltip}
          </TooltipL>
          <Popup>{label.popup}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
