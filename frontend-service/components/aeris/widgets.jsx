// components/aeris/widgets.jsx
"use client";

// ---------------------------------------------------------------
// Petits composants partagés par les pages Aeris (dashboard + carte),
// dans le même langage visuel que le reste de l'app : cartes blanches
// épurées, labels en police mono, accents teal/ambre/rouge.
// ---------------------------------------------------------------

export function StatusChip({ label, state }) {
  const dotClass =
    state === "live" ? "bg-teal-500" : state === "error" ? "bg-red-500" : "bg-amber-500";
  const text =
    state === "live" ? `${label} : en direct` :
    state === "error" ? `${label} : déconnecté` :
    `${label} : connexion…`;
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-[11px] text-slate-600 shadow-sm">
      <span className={`relative flex h-2 w-2 rounded-full ${dotClass}`}>
        {state === "live" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotClass} opacity-60`} />
        )}
      </span>
      {text}
    </div>
  );
}

export function KpiCard({ label, value, icon: Icon, accent = "teal" }) {
  const borderGradient = {
    teal: "from-teal-400 to-teal-500",
    amber: "from-amber-400 to-amber-500",
    "teal-light": "from-teal-300 to-teal-400",
  }[accent] ?? "from-teal-400 to-teal-500";
  const iconColor = {
    teal: "text-slate-300",
    amber: "text-amber-500",
    "teal-light": "text-teal-400",
  }[accent] ?? "text-slate-300";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${borderGradient}`} />
      <div className="mb-2.5 flex items-center justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2} />}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export function ChartPanel({ title, meta, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-slate-900">{title}</p>
        {meta && <span className="font-mono text-[10.5px] text-slate-400">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-mono shadow-md backdrop-blur">
      {label && <div className="mb-1 text-slate-400">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span>{p.name}:</span>
          <span className="font-medium text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// Grand état vide (occupe tout un panneau) — bordure pointillée.
export function EmptyPanel({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center font-mono text-[13px] text-slate-400">
      {children}
    </div>
  );
}

// Petit état vide (à l'intérieur d'un panneau déjà existant, ex: mini-graphique).
export function EmptyInline({ children }) {
  return <div className="py-4 font-mono text-xs text-slate-400">{children}</div>;
}

export function Badge({ level, children }) {
  const styles = {
    nominal: "text-teal-700 bg-teal-50 border-teal-200",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    critical: "text-red-700 bg-red-50 border-red-200",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${styles[level] || "text-slate-700 bg-slate-50 border-slate-200"}`}>
      {children}
    </span>
  );
}
