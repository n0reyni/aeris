"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mqtt from "mqtt";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { API_BASE, MQTT_URL, MQTT_TOPIC, PARTICLE_META, PARTICLE_ORDER, levelForConcentration } from "@/lib/aerisConfig";

const HISTORY_LIMIT = 200;
const LEVEL_COLORS = { nominal: "#22c55e", warning: "#f59e0b", critical: "#ef4444" };
const LEVEL_LABELS = { nominal: "Nominal", warning: "Alerte", critical: "Critique" };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("connecting");
  const [mqttStatus, setMqttStatus] = useState("connecting");
  const [kpis, setKpis] = useState(null);
  const [zoneAvgs, setZoneAvgs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const esRef = useRef(null);
  const mqttRef = useRef(null);

  const loadSnapshot = useCallback(async (base) => {
    try {
      const [k, z] = await Promise.all([
        fetch(`${base}/api/kpis`).then(r => r.json()),
        fetch(`${base}/api/zones/avg`).then(r => r.json()),
      ]);
      setKpis(k);
      setZoneAvgs(z.map(zone => ({
        zone: zone.zone,
        avg: typeof zone.avgConcentration === "number" ? Math.round(zone.avgConcentration * 100) / 100 : 0,
      })));
    } catch (e) {
      console.error("Error fetching Aeris snapshot:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot(API_BASE);
    const poll = setInterval(() => loadSnapshot(API_BASE), 8000);

    setStatus("connecting");
    const es = new EventSource(`${API_BASE}/api/readings/stream`);
    esRef.current = es;
    es.onopen = () => setStatus("live");
    es.onerror = () => setStatus("error");
    es.addEventListener("reading", (evt) => {
      setStatus("live");
      const reading = JSON.parse(evt.data);
      setHistory(prev => [reading, ...prev].slice(0, HISTORY_LIMIT));
    });

    return () => { es.close(); clearInterval(poll); };
  }, [loadSnapshot]);

  useEffect(() => {
    setMqttStatus("connecting");
    const client = mqtt.connect(MQTT_URL, { reconnectPeriod: 3000, connectTimeout: 8000 });
    mqttRef.current = client;
    client.on("connect", () => {
      setMqttStatus("live");
      client.subscribe(MQTT_TOPIC, (err) => { if (err) setMqttStatus("error"); });
    });
    client.on("reconnect", () => setMqttStatus("connecting"));
    client.on("close", () => setMqttStatus("error"));
    client.on("error", () => setMqttStatus("error"));
    client.on("message", (_topic, payload) => {
      try {
        const alert = JSON.parse(payload.toString());
        setAlerts(prev => [{ ...alert, _id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }, ...prev].slice(0, 8));
      } catch (e) { /* payload d'alerte invalide ignoré */ }
    });
    return () => client.end(true);
  }, []);

  // Stats du même style que les pages student/teacher (Total/Best/Average)
  const totalReadings = kpis?.activeSensors ?? "N/A";
  const alerts24h = kpis?.alerts24h ?? "N/A";
  const avgConcentration = typeof kpis?.avgConcentration === "number" ? kpis.avgConcentration.toFixed(1) : "N/A";

  // Données du graphique principal (toutes les lignes, chronologique)
  const mainChartData = useMemo(() => {
    const chrono = [...history].reverse();
    const byTimestamp = new Map();
    chrono.forEach(r => {
      const key = r.timestamp ?? String(r.recordId);
      if (!byTimestamp.has(key)) byTimestamp.set(key, { label: key.slice(11, 19) });
      byTimestamp.get(key)[r.notation] = r.concentration;
    });
    return Array.from(byTimestamp.values());
  }, [history]);

  const mainSeriesKeys = useMemo(
    () => PARTICLE_ORDER.filter(k => history.some(r => r.notation === k)),
    [history]
  );

  const perParticleData = useMemo(() => {
    const out = {};
    for (const key of PARTICLE_ORDER) {
      out[key] = history.filter(r => r.notation === key).slice().reverse()
        .map(r => ({ label: r.timestamp?.slice(11, 19) ?? "", concentration: r.concentration }));
    }
    return out;
  }, [history]);

  // Répartition des lectures par niveau — même idée que le Pass/Fail Ratio du teacher
  const levelPieData = useMemo(() => {
    const counts = { nominal: 0, warning: 0, critical: 0 };
    history.forEach(r => { counts[levelForConcentration(r.concentration)] += 1; });
    return Object.entries(counts).map(([level, value]) => ({ name: LEVEL_LABELS[level], level, value }));
  }, [history]);

  return (
    <div>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">📡 Tableau de bord </h2>
          <div className="flex gap-4 text-sm text-gray-500">
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Zones actives</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{totalReadings}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Alertes (24h)</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{alerts24h}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Concentration moyenne</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{avgConcentration}</CardContent>
          </Card>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* Main concentration chart */}
            <Card className="mb-8 p-4">
              <CardHeader><CardTitle className="text-lg">Concentration dans le temps</CardTitle></CardHeader>
              <CardContent className="h-72">
                {mainChartData.length < 2 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    Collecte des lectures en cours…
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mainChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {mainSeriesKeys.map(key => (
                        <Line key={key} type="monotone" dataKey={key} name={PARTICLE_META[key]?.label ?? key}
                          stroke={PARTICLE_META[key]?.color ?? "#3b82f6"} strokeWidth={2} dot={false} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Bar chart for zones + Pie chart for level distribution */}
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-4">
                <CardHeader><CardTitle className="text-lg">Moyennes par zone</CardTitle></CardHeader>
                <CardContent className="h-64">
                  {zoneAvgs.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">Aucune donnée de zone.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={zoneAvgs}>
                        <XAxis dataKey="zone" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avg" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader><CardTitle className="text-lg">Répartition des niveaux</CardTitle></CardHeader>
                <CardContent className="flex h-64 justify-center">
                  {history.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">Pas encore de lectures.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={levelPieData} dataKey="value" outerRadius={80} label>
                          {levelPieData.map((entry) => (
                            <Cell key={entry.level} fill={LEVEL_COLORS[entry.level]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Per-pollutant charts */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PARTICLE_ORDER.map(key => {
                const meta = PARTICLE_META[key];
                const data = perParticleData[key];
                return (
                  <Card key={key} className="p-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40">
                      {data.length < 2 ? (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">En attente…</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <XAxis dataKey="label" fontSize={9} />
                            <YAxis fontSize={9} width={28} />
                            <Tooltip />
                            <Line type="monotone" dataKey="concentration" stroke={meta.color} strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Alerts */}
            <Card className="p-4">
              <CardHeader><CardTitle className="text-lg">Alertes actives</CardTitle></CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-sm text-gray-400">Aucune alerte reçue pour le moment.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {alerts.map(a => (
                      <div key={a._id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-700">{a.zone} · {a.particule}</span>
                        <span className="text-gray-400">{a.concentration}</span>
                        <span className="font-medium" style={{ color: LEVEL_COLORS[a.level] ?? "#64748b" }}>{a.level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
