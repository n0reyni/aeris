"use client";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AerisMap from "@/components/AerisMap";
import { API_BASE, CITY_COORDS, MAP_CENTER, LEVEL_COLOR, LEVEL_LABEL, levelForConcentration } from "@/lib/aerisConfig";

export default function CartePage() {
  const [status, setStatus] = useState("connecting");
  const [zoneAvgs, setZoneAvgs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const z = await fetch(`${API_BASE}/api/zones/avg`).then(r => r.json());
        if (cancelled) return;
        setZoneAvgs(z.map(zone => ({
          zone: zone.zone,
          avg: typeof zone.avgConcentration === "number" ? Math.round(zone.avgConcentration * 100) / 100 : 0,
        })));
        setStatus("live");
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    const poll = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(poll); };
  }, []);

  const cityLevel = (city) => {
    const match = zoneAvgs.find(z => z.zone === city);
    if (!match) return { avg: null, level: "nominal" };
    return { avg: match.avg, level: levelForConcentration(match.avg) };
  };

  const statusDot = status === "live" ? "bg-emerald-500" : status === "error" ? "bg-red-500" : "bg-gray-300";
  const statusText = status === "live" ? "Données à jour" : status === "error" ? "Données indisponibles" : "Connexion en cours…";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-6 py-6">

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">Carte des zones</h2>
            <p className="mt-1 text-sm text-gray-500">Diamniadio · Bargny · Sebikotane</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={`h-2 w-2 rounded-full ${statusDot}`} />
            {statusText}
          </div>
        </div>

        {/* Zone summary cards */}
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {Object.keys(CITY_COORDS).map(city => {
            const { avg, level } = cityLevel(city);
            const color = LEVEL_COLOR[level];
            return (
              <Card
                key={city}
                className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-3.5">
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{city}</p>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {avg !== null ? LEVEL_LABEL[level] : "en attente…"}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{avg !== null ? avg : "—"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Map */}
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
            <CardTitle className="text-lg text-gray-900">Emplacement des capteurs</CardTitle>
            <span className="text-xs text-gray-400">niveaux moyens sur 24h</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[380px] overflow-hidden rounded-xl border border-gray-100">
              <AerisMap
                center={MAP_CENTER}
                zoom={11}
                markers={Object.entries(CITY_COORDS).map(([city, coords]) => {
                  const { avg, level } = cityLevel(city);
                  return {
                    key: city,
                    coords,
                    color: LEVEL_COLOR[level],
                    label: {
                      tooltip: `${city} — ${avg !== null ? `moyenne ${avg}` : "pas de données"}`,
                      popup: (
                        <>
                          <strong>{city}</strong><br />
                          {avg !== null ? `Concentration moyenne : ${avg} (${LEVEL_LABEL[level]})` : "En attente de données"}
                        </>
                      ),
                    },
                  };
                })}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-5 text-xs text-gray-500">
              {["nominal", "warning", "critical"].map(lvl => (
                <span className="inline-flex items-center gap-1.5" key={lvl}>
                  <span className="h-2 w-2 rounded-full" style={{ background: LEVEL_COLOR[lvl] }} />
                  {LEVEL_LABEL[lvl]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
