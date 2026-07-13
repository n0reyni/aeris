// lib/aerisConfig.js
// Réglages partagés par les pages Aeris. Ces valeurs viennent de
// l'environnement (voir .env.local), pas d'un panneau de réglages.

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8086";
export const MQTT_URL = process.env.NEXT_PUBLIC_MQTT_URL || "ws://localhost:8083/mqtt";
export const MQTT_TOPIC = process.env.NEXT_PUBLIC_MQTT_TOPIC || "aeris/alerts";

export const PARTICLE_META = {
  CO2: { label: "Dioxyde de carbone", color: "#0d9488" },
  N2:  { label: "Azote",               color: "#2563eb" },
  CO:  { label: "Monoxyde de carbone", color: "#ea580c" },
  SO2: { label: "Dioxyde de soufre",   color: "#9333ea" },
  NH3: { label: "Ammoniac",            color: "#ca8a04" },
};
export const PARTICLE_ORDER = Object.keys(PARTICLE_META);

export const CITY_COORDS = {
  Diamniadio: [14.7256, -17.1875],
  Bargny:     [14.6997, -17.2372],
  Sebikotane: [14.7517, -17.1358],
};
export const MAP_CENTER = [14.719, -17.187];

export const LEVEL_COLOR = {
  nominal: "#0d9488",
  warning: "#d97706",
  critical: "#dc2626",
};

export const LEVEL_LABEL = {
  nominal: "nominal",
  warning: "alerte",
  critical: "critique",
};

export function levelForConcentration(v) {
  if (v >= 80) return "critical";
  if (v >= 55) return "warning";
  return "nominal";
}
