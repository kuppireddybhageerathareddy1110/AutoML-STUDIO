"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell, Scatter, ScatterChart, ZAxis,
} from "recharts";

const API = "http://127.0.0.1:8000";

/* ─── Toast ─────────────────────────────────────────────────────────── */
type Toast = { id: number; msg: string; type: "success" | "error" | "info" };
let toastId = 0;

const Icon = {
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" /></svg>,
  brain: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.04-2.44V7.5a2.5 2.5 0 014.5-1.5M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.04-2.44V7.5a2.5 2.5 0 00-4.5-1.5" /></svg>,
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  zap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  scatter: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7.5" r="1.5" /><circle cx="18.5" cy="5.5" r="1.5" /><circle cx="11.5" cy="11.5" r="1.5" /><circle cx="7.5" cy="16.5" r="1.5" /><circle cx="17.5" cy="14.5" r="1.5" /></svg>,
  stats: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17l-6-6-4 4-5-5" /></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  logo: <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#lg1)" /><path d="M8 22l6-14 4 8 2-4 4 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="8" r="2" fill="white" opacity="0.7" /></svg>,
};

/* ─── Types ──────────────────────────────────────────────────────────── */
type Tab = "home" | "eda" | "eda_full" | "feature" | "stat" | "plot" | "model" | "explain" | "preview";
type Theme = "dark" | "light";

/* ─── Sub components ─────────────────────────────────────────────────── */
function MetricCard({ title, value, color = "purple", icon, suffix = "" }: any) {
  const num = typeof value === "number" ? value : parseFloat(value);
  const display = isNaN(num) ? String(value ?? "—") : (num < 1 ? (num * 100).toFixed(2) + (suffix || "%") : num.toFixed(2) + suffix);
  const colorMap: any = {
    purple: { bar: "var(--neon-purple)", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
    cyan: { bar: "var(--neon-cyan)", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)" },
    green: { bar: "var(--neon-green)", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
    orange: { bar: "var(--neon-orange)", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
  };
  const c = colorMap[color] || colorMap.purple;
  return (
    <div className="metric-card animate-fade-in" style={{ borderColor: c.border, background: c.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</span>
        <span style={{ color: c.bar }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{display}</div>
      <div style={{ marginTop: 12, height: 4, borderRadius: 4, background: "rgba(124,58,237,0.05)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: isNaN(num) ? "50%" : `${Math.min(Math.abs(num % 100), 100)}%`, background: c.bar, borderRadius: 4, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function Tab({ label, active, onClick, icon }: any) {
  return (
    <button className={`tab-btn ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
        {badge && <span className="badge badge-purple">{badge}</span>}
      </div>
      {subtitle && <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{subtitle}</p>}
    </div>
  );
}

function ModelComparisonBar({ models, best, problemType }: any) {
  const entries = Object.entries(models || {}) as [string, number][];
  if (!entries.length) return null;
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {entries.sort(([, a], [, b]) => b - a).map(([name, score]) => {
        const pct = ((score / max) * 100).toFixed(1);
        const isBest = name === best;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 140, fontSize: 13, color: isBest ? "#a78bfa" : "var(--text-secondary)", fontWeight: isBest ? 700 : 400, whiteSpace: "nowrap" }}>
              {isBest && "★ "}{name}
            </div>
            <div style={{ flex: 1, height: 32, background: "rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
              <div
                className={`model-bar ${isBest ? "best" : ""}`}
                style={{ width: `${pct}%` }}
              >
                {score.toFixed(4)}
              </div>
            </div>
            <div style={{ width: 60, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
              {problemType === "regression" ? `R²` : "ACC"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConfusionMatrix({ cm }: { cm: number[][] }) {
  if (!cm?.length) return null;
  const labels = cm.map((_, i) => `C${i}`);
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        <div style={{ width: 64 }} />
        {labels.map(l => (
          <div key={l} style={{ width: 64, textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Pred {l}</div>
        ))}
      </div>
      {cm.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
          <div style={{ width: 64, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textAlign: "right", paddingRight: 8 }}>Act {labels[i]}</div>
          {row.map((val, j) => (
            <div key={j} className={`cm-cell ${i === j ? "correct" : "wrong"}`}>{val}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CorrelationHeatmap({ correlation }: { correlation: Record<string, Record<string, number>> }) {
  if (!correlation) return null;
  const cols = Object.keys(correlation);
  const getColor = (val: number) => {
    const v = Math.max(-1, Math.min(1, val));
    if (v > 0) return `rgba(124,58,237,${Math.abs(v).toFixed(2)})`;
    return `rgba(239,68,68,${Math.abs(v).toFixed(2)})`;
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <div style={{ width: 80, minWidth: 80 }} />
        {cols.map(c => (
          <div key={c} style={{ minWidth: 44, width: 44, fontSize: 9, color: "var(--text-muted)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</div>
        ))}
      </div>
      {cols.map(row => (
        <div key={row} style={{ display: "flex", gap: 2, marginBottom: 2, alignItems: "center" }}>
          <div style={{ width: 80, minWidth: 80, fontSize: 9, color: "var(--text-muted)", textAlign: "right", paddingRight: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row}</div>
          {cols.map(col => {
            const v = correlation[row]?.[col] ?? 0;
            const rounded = Math.round(v * 100) / 100;
            return (
              <div key={col} className="heatmap-cell" style={{ background: getColor(v), color: Math.abs(v) > 0.5 ? "white" : "var(--text-muted)" }} title={`${row} ↔ ${col}: ${rounded}`}>
                {rounded.toFixed(1)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [eda, setEda] = useState<any>(null);
  const [edaFull, setEdaFull] = useState<any>(null);
  const [featureStats, setFeatureStats] = useState<any>(null);
  const [statResult, setStatResult] = useState<any>(null);
  const [plotImg, setPlotImg] = useState("");
  const [modelResult, setModelResult] = useState<any>(null);
  const [shap, setShap] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [step, setStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme to :root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--bg-primary", "#f9fafb");
      root.style.setProperty("--bg-secondary", "#f3f4f6");
      root.style.setProperty("--bg-card", "#ffffff");
      root.style.setProperty("--bg-glass", "rgba(0,0,0,0.02)");
      root.style.setProperty("--bg-glass-hover", "rgba(0,0,0,0.04)");
      root.style.setProperty("--text-primary", "#111827");
      root.style.setProperty("--text-secondary", "#4b5563");
      root.style.setProperty("--text-muted", "#9ca3af");
      root.style.setProperty("--text-accent", "#7c3aed");
      root.style.setProperty("--border-subtle", "rgba(0,0,0,0.08)");
      root.style.setProperty("--border-glow", "rgba(124,58,237,0.3)");
      root.style.setProperty("--shadow-md", "0 4px 12px rgba(0,0,0,0.05)");
      root.style.setProperty("--shadow-lg", "0 10px 30px rgba(0,0,0,0.08)");
      root.style.setProperty("--neon-purple", "#7c3aed");
      root.style.setProperty("--neon-cyan", "#0891b2");
      root.style.setProperty("--neon-green", "#059669");
      root.style.setProperty("--neon-orange", "#ea580c");
    } else {
      root.style.setProperty("--bg-primary", "#050510");
      root.style.setProperty("--bg-secondary", "#0a0a1a");
      root.style.setProperty("--bg-card", "rgba(15,15,35,0.85)");
      root.style.setProperty("--bg-glass", "rgba(255,255,255,0.04)");
      root.style.setProperty("--bg-glass-hover", "rgba(255,255,255,0.08)");
      root.style.setProperty("--text-primary", "#f0f0ff");
      root.style.setProperty("--text-secondary", "#a0a0c0");
      root.style.setProperty("--text-muted", "#606080");
      root.style.setProperty("--text-accent", "#a78bfa");
      root.style.setProperty("--border-subtle", "rgba(124, 58, 237, 0.2)");
      root.style.setProperty("--border-glow", "rgba(124, 58, 237, 0.5)");
      root.style.setProperty("--shadow-md", "0 8px 24px rgba(0,0,0,0.5)");
      root.style.setProperty("--shadow-lg", "0 16px 48px rgba(0,0,0,0.6)");
      root.style.setProperty("--neon-purple", "#7c3aed");
      root.style.setProperty("--neon-cyan", "#06b6d4");
      root.style.setProperty("--neon-green", "#10b981");
      root.style.setProperty("--neon-orange", "#f97316");
    }
    document.body.style.background = "var(--bg-primary)";
  }, [theme]);

  const addToast = useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
      addToast(`File "${f.name}" selected`, "info");
    } else {
      addToast("Only CSV or XLSX files are supported", "error");
    }
  }, [addToast]);

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/upload`, formData);
      const cols = res.data.dataset_info?.column_names || [];
      setColumns(cols);
      setStep(1);
      addToast(`Dataset uploaded: ${res.data.dataset_info?.rows} rows, ${cols.length} columns`, "success");
      // auto load preview
      try {
        const prev = await axios.get(`${API}/preview`);
        setPreview(prev.data);
      } catch { }
      setActiveTab("eda");
    } catch (err: any) {
      addToast(err.response?.data?.detail || "Upload failed", "error");
    }
    setLoading(false);
  };

  const loadEDA = async () => {
    try {
      const res = await axios.get(`${API}/eda`);
      setEda(res.data);
      setStep(s => Math.max(s, 2));
      setActiveTab("eda");
      addToast("Basic EDA complete", "success");
    } catch (err: any) { addToast(err.response?.data?.detail || "EDA failed", "error"); }
  };

  const loadEdaFull = async () => {
    try {
      const res = await axios.get(`${API}/eda_full`);
      setEdaFull(res.data);
      setActiveTab("eda_full");
    } catch (err: any) { addToast(err.response?.data?.detail || "EDA Full failed", "error"); }
  };

  const loadFeatureStats = async () => {
    try {
      const res = await axios.get(`${API}/feature_analysis`);
      setFeatureStats(res.data);
      setActiveTab("feature");
    } catch (err: any) { addToast(err.response?.data?.detail || "Feature analysis failed", "error"); }
  };

  const runStatTest = async (col1: string, col2: string) => {
    try {
      const res = await axios.get(`${API}/stat_test?col1=${col1}&col2=${col2}`);
      setStatResult(res.data);
      addToast("🔬 Statistical test complete", "success");
    } catch (err: any) { addToast(err.response?.data?.detail || "Stat test failed", "error"); }
  };

  const loadPlot = async (type: string, col1: string, col2?: string) => {
    try {
      let url = `${API}/plot/${type}?col=${col1}`;
      if (type === "scatter" && col2) url = `${API}/plot/scatter?col1=${col1}&col2=${col2}`;
      const res = await axios.get(url);
      setPlotImg(res.data.image);
      setActiveTab("plot");
    } catch (err: any) { addToast(err.response?.data?.detail || "Plot failed", "error"); }
  };

  const trainModel = async () => {
    if (!target) return addToast("Select a target column first", "error");
    setLoading(true);
    addToast("🚀 Training models... this may take a moment", "info");
    try {
      const res = await axios.post(`${API}/train?target=${target}`);
      setModelResult(res.data.result ?? res.data);
      setStep(s => Math.max(s, 3));
      setActiveTab("model");
      addToast(`Best model: ${res.data.result?.best_model ?? res.data.best_model}`, "success");
    } catch (err: any) { addToast(err.response?.data?.detail || "Training failed", "error"); }
    setLoading(false);
  };

  const loadShap = async () => {
    try {
      const res = await axios.get(`${API}/shap`);
      const data = res.data.features.map((f: string, i: number) => ({
        feature: f, importance: res.data.importance[i],
      })).sort((a: any, b: any) => b.importance - a.importance).slice(0, 15);
      setShap(data);
      setActiveTab("explain");
      addToast("💡 SHAP values computed", "success");
    } catch (err: any) { addToast(err.response?.data?.detail || "SHAP failed", "error"); }
  };

  const STEPS = ["Upload", "EDA", "Train", "Explain"];
  const isDark = theme === "dark";
  const sidebarBg = isDark
    ? "linear-gradient(180deg, rgba(10,5,30,0.98) 0%, rgba(5,5,20,0.98) 100%)"
    : "linear-gradient(180deg, rgba(240,238,255,0.98) 0%, rgba(248,248,255,0.98) 100%)";
  const logoColor = isDark ? "white" : "#1a1a2e";

  /* ─── render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1, background: "var(--bg-primary)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="sidebar animate-slide-in-left"
        style={{
          width: sidebarOpen ? "var(--sidebar-width)" : "0",
          minWidth: sidebarOpen ? "var(--sidebar-width)" : "0",
          overflow: "hidden",
          transition: "all 0.3s ease",
          background: sidebarBg,
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* scrollable inner wrapper */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: sidebarOpen ? "20px 16px 60px" : "0", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "thin" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexShrink: 0 }}>
            {Icon.logo}
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: logoColor }}>AutoML</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>STUDIO</div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="glass-card sidebar-card" style={{ padding: "16px 12px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Pipeline Progress</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={`step-circle ${i < step ? "done" : i === step ? "active" : "pending"}`} style={{ width: 28, height: 28, fontSize: 11 }}>
                    {i < step ? Icon.check : i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: i < step ? "#6ee7b7" : i === step ? "#a78bfa" : "var(--text-muted)", fontWeight: i <= step ? 600 : 400 }}>{s}</span>
                  {i < step && <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: 9, padding: "2px 6px" }}>Done</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="glass-card sidebar-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Dataset</div>
            <div
              className={`drop-zone ${dragging ? "dragging" : ""}`}
              style={{ padding: "20px 16px", marginBottom: 12 }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); addToast(`📂 "${f.name}" selected`, "info"); } }} />
              <div style={{ color: "var(--neon-purple)", marginBottom: 8 }}>{Icon.upload}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{file ? file.name : "Drop CSV / XLSX here"}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>or click to browse</div>
            </div>
            <button className="btn-primary" onClick={uploadFile} disabled={!file || loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? <span className="spinner" /> : Icon.upload}
              {loading ? "Uploading…" : "Upload & Analyze"}
            </button>
          </div>

          {/* Target & Train */}
          <div className="glass-card sidebar-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Model Training</div>
            <select className="input-field" value={target} onChange={e => setTarget(e.target.value)} style={{ marginBottom: 12 }}>
              <option value="">Select target column</option>
              {columns.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="btn-primary btn-success" onClick={trainModel} disabled={!target || loading} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
              {loading ? <span className="spinner" /> : Icon.zap}
              {loading ? "Training…" : "Auto-Train"}
            </button>
            <button className="btn-ghost" onClick={loadShap} disabled={!modelResult} style={{ width: "100%", justifyContent: "center" }}>
              {Icon.sparkle} SHAP Explain
            </button>
          </div>

          {/* Quick EDA buttons */}
          <div className="glass-card sidebar-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Analysis</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Run Basic EDA", fn: loadEDA, disabled: !columns.length },
                { label: "Advanced EDA+", fn: loadEdaFull, disabled: !columns.length },
                { label: "Feature Stats", fn: loadFeatureStats, disabled: !columns.length },
                { label: "Data Preview", fn: () => { if (preview) setActiveTab("preview"); else addToast("Upload a dataset first", "error"); }, disabled: !columns.length },
              ].map(b => (
                <button key={b.label} className="btn-ghost" onClick={b.fn} disabled={b.disabled} style={{ width: "100%", justifyContent: "flex-start", opacity: b.disabled ? 0.4 : 1, padding: "8px 12px", fontSize: 13 }}>
                  {Icon.chart} {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download model */}
          {modelResult && (
            <a
              href={`${API}/download_model`}
              className="btn-ghost"
              style={{ width: "100%", justifyContent: "center", textDecoration: "none", padding: "10px 12px", fontSize: 13, color: "var(--neon-green)" }}
            >
              {Icon.download} Download Best Model
            </a>
          )}

        </div>{/* end scrollable inner */}
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>

        {/* Top Bar */}
        <header style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid var(--border-subtle)", background: isDark ? "rgba(5,5,16,0.92)" : "rgba(248,248,255,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 20 }}>
          <button className="btn-ghost" onClick={() => setSidebarOpen(o => !o)} style={{ padding: "6px 10px", flexShrink: 0 }}>≡</button>
          <div className="tab-container" style={{ flex: 1, overflowX: "auto", flexWrap: "nowrap" }}>
            <Tab label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={Icon.logo} />
            <Tab label="EDA" active={activeTab === "eda"} onClick={() => setActiveTab("eda")} icon={Icon.chart} />
            <Tab label="EDA+" active={activeTab === "eda_full"} onClick={loadEdaFull} icon={Icon.grid} />
            <Tab label="Features" active={activeTab === "feature"} onClick={loadFeatureStats} icon={Icon.stats} />
            <Tab label="Preview" active={activeTab === "preview"} onClick={() => preview ? setActiveTab("preview") : addToast("Upload a dataset first", "error")} icon={Icon.grid} />
            <Tab label="Stat Test" active={activeTab === "stat"} onClick={() => setActiveTab("stat")} icon={Icon.info} />
            <Tab label="Plot" active={activeTab === "plot"} onClick={() => setActiveTab("plot")} icon={Icon.scatter} />
            <Tab label="Model" active={activeTab === "model"} onClick={() => setActiveTab("model")} icon={Icon.brain} />
            <Tab label="Explain" active={activeTab === "explain"} onClick={() => setActiveTab("explain")} icon={Icon.sparkle} />
          </div>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="theme-toggle-btn"
            style={{ flexShrink: 0, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: 20, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s ease", color: "var(--text-primary)" }}
            title="Toggle theme"
          >
            {isDark ? Icon.sun : Icon.moon}
          </button>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-accent)", flexShrink: 0 }}>
              <span className="spinner" /> Processing…
            </div>
          )}
        </header>

        <div style={{ flex: 1, padding: "32px 36px", overflow: "auto" }} className="animate-fade-in">

          {/* ── HOME TAB ── */}
          {activeTab === "home" && (
            <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <div className="hero-visual">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="wave-bar" />)}
                </div>
              </div>
              <h1 className="gradient-text animate-glow" style={{ fontSize: 56, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.04em", marginBottom: 20 }}>
                Next-Gen AutoML Studio
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 48, lineHeight: 1.8, maxWidth: 640, margin: "0 auto 48px" }}>
                Transform raw data into production-ready models. Experience automated insights, advanced visualizations, and state-of-the-art model selection in one premium platform.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
                {[
                  { icon: Icon.chart, title: "Deep Insights", accent: "var(--neon-purple)", desc: "Automated EDA with advanced correlation analysis and missing value tracking." },
                  { icon: Icon.brain, title: "Auto-Pilot ML", accent: "var(--neon-cyan)", desc: "Automated model selection across Random Forest, XGBoost, and Gradient Boosting." },
                  { icon: Icon.sparkle, title: "Explainable AI", accent: "var(--neon-green)", desc: "Deep interpretability with SHAP value importance for transparent decision making." },
                  { icon: Icon.scatter, title: "Visual Analytics", accent: "var(--neon-orange)", desc: "Interactive scatter, distribution, and box plots with granular column control." },
                ].map(f => (
                  <div key={f.title} className="glass-card animate-hover" style={{
                    padding: 28,
                    textAlign: "left",
                    borderTop: `4px solid ${f.accent}`,
                  }}>
                    <div style={{ color: f.accent, marginBottom: 16 }}>{f.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{f.title}</div>
                    <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 56 }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>SUPPORTED FORMATS</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {["CSV", "XLSX", "Classification", "Regression", "SHAP", "EDA+"].map(tag => (
                    <span key={tag} className="badge badge-purple" style={{ padding: "6px 16px", borderRadius: 20, fontSize: 11 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EDA TAB ── */}
          {activeTab === "eda" && eda && (
            <div className="animate-fade-in">
              <SectionHeader title="Dataset Overview" subtitle="Basic exploratory data analysis" badge="EDA" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }} className="stagger-children">
                <MetricCard title="Rows" value={eda.shape?.rows} color="purple" icon={Icon.chart} suffix="" />
                <MetricCard title="Columns" value={eda.shape?.columns} color="cyan" icon={Icon.grid} suffix="" />
                <MetricCard title="Missing Values" value={Object.values(eda.missing || {}).reduce((a: any, b: any) => a + b, 0)} color="orange" icon={Icon.info} suffix="" />
                <MetricCard title="Numeric Cols" value={Object.keys(eda.describe || {}).length} color="green" icon={Icon.stats} suffix="" />
              </div>
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Missing Values per Column</h3>
                <table className="data-table">
                  <thead><tr><th>Column</th><th>Missing Count</th><th>Status</th></tr></thead>
                  <tbody>
                    {Object.entries(eda.missing || {}).map(([col, cnt]: any) => (
                      <tr key={col}>
                        <td style={{ color: "var(--text-primary)" }}>{col}</td>
                        <td>{cnt}</td>
                        <td><span className={`badge ${cnt === 0 ? "badge-green" : "badge-orange"}`}>{cnt === 0 ? "✓ Clean" : "⚠ Has Missing"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Descriptive Statistics</h3>
                <pre>{JSON.stringify(eda.describe, null, 2)}</pre>
              </div>
            </div>
          )}
          {activeTab === "eda" && !eda && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ color: "var(--text-muted)", marginBottom: 16, opacity: 0.5 }}>{Icon.chart}</div>
              <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Upload a dataset then click <strong style={{ color: "var(--neon-purple)" }}>Run Basic EDA</strong></p>
            </div>
          )}

          {/* ── PREVIEW TAB ── */}
          {activeTab === "preview" && (
            <div className="animate-fade-in">
              <SectionHeader title="Data Preview" subtitle="First 10 rows of your raw dataset" badge="Preview" />
              {preview ? (
                <div className="glass-card" style={{ padding: 24, overflowX: "auto" }}>
                  <table className="data-table" style={{ minWidth: 600 }}>
                    <thead>
                      <tr>
                        {preview.columns?.map((col: string) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows?.map((row: any[], ri: number) => (
                        <tr key={ri}>
                          {row.map((cell: any, ci: number) => (
                            <td key={ci}>{String(cell ?? "—")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    {Icon.info} Showing top 10 rows for inspection
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", paddingTop: 80 }}>
                  <div style={{ color: "var(--text-muted)", marginBottom: 16, opacity: 0.5 }}>{Icon.eye}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Upload a dataset to see the preview</p>
                </div>
              )}
            </div>
          )}

          {/* ── EDA+ TAB ── */}
          {activeTab === "eda_full" && edaFull && (
            <div className="animate-fade-in">
              <SectionHeader title="Advanced EDA" subtitle="Correlation matrix and feature distributions" badge="EDA+" />
              {edaFull.correlation && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Correlation Heatmap</h3>
                  <CorrelationHeatmap correlation={edaFull.correlation} />
                </div>
              )}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Histogram Data</h3>
                <pre>{JSON.stringify(edaFull.histograms, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* ── FEATURE TAB ── */}
          {activeTab === "feature" && featureStats && (
            <div className="animate-fade-in">
              <SectionHeader title="Feature Analysis" subtitle="Detailed per-column statistics" badge="Features" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Missing Values</h3>
                  <table className="data-table">
                    <thead><tr><th>Column</th><th>Missing</th></tr></thead>
                    <tbody>{Object.entries(featureStats.missing || {}).map(([k, v]: any) => <tr key={k}><td style={{ color: "var(--text-primary)" }}>{k}</td><td>{v}</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Unique Values</h3>
                  <table className="data-table">
                    <thead><tr><th>Column</th><th>Unique Count</th></tr></thead>
                    <tbody>{Object.entries(featureStats.unique || {}).map(([k, v]: any) => <tr key={k}><td style={{ color: "var(--text-primary)" }}>{k}</td><td>{v}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STAT TEST TAB ── */}
          {activeTab === "stat" && (
            <div className="animate-fade-in">
              <SectionHeader title="Statistical Tests" subtitle="Auto-selects the appropriate statistical test based on data type" badge="Stats" />
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <form onSubmit={e => { e.preventDefault(); const t = e.target as any; runStatTest(t.col1.value, t.col2.value); }} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Column 1</div>
                    <select name="col1" className="input-field">{columns.map(c => <option key={c}>{c}</option>)}</select>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Column 2</div>
                    <select name="col2" className="input-field">{columns.map(c => <option key={c}>{c}</option>)}</select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>{Icon.stats} Run Test</button>
                </form>
              </div>
              {statResult && (
                <div className="glass-card animate-scale-in" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 12 }}>Results</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
                    {Object.entries(statResult).map(([k, v]: any) => (
                      <div key={k} style={{ background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{k}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-accent)", fontFamily: "'JetBrains Mono',monospace" }}>{typeof v === "number" ? v.toFixed(4) : String(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PLOT TAB ── */}
          {activeTab === "plot" && (
            <div className="animate-fade-in">
              <SectionHeader title="Data Visualization" subtitle="Generate beautiful plots for any column combination" badge="Plots" />
              <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                <form onSubmit={e => { e.preventDefault(); const t = e.target as any; loadPlot(t.type.value, t.col1.value, t.col2?.value); }} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Plot Type</div>
                    <select name="type" className="input-field">
                      <option value="distribution">Distribution</option>
                      <option value="box">Boxplot</option>
                      <option value="scatter">Scatter</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Column 1</div>
                    <select name="col1" className="input-field">{columns.map(c => <option key={c}>{c}</option>)}</select>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Column 2 (scatter)</div>
                    <select name="col2" className="input-field"><option value="">None</option>{columns.map(c => <option key={c}>{c}</option>)}</select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>{Icon.scatter} Generate</button>
                </form>
              </div>
              {plotImg && (
                <div className="glass-card animate-scale-in" style={{ padding: 24, textAlign: "center" }}>
                  <img src={`data:image/png;base64,${plotImg}`} alt="Plot" style={{ maxWidth: "100%", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }} />
                </div>
              )}
            </div>
          )}

          {/* ── MODEL TAB ── */}
          {activeTab === "model" && modelResult && (
            <div className="animate-fade-in">
              <SectionHeader title="Model Performance" badge={modelResult.best_model} subtitle={`Problem type: ${modelResult.problem_type}`} />

              {"accuracy" in (modelResult.metrics || {}) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }} className="stagger-children">
                  <MetricCard title="Accuracy" value={modelResult.metrics.accuracy} color="purple" icon={Icon.brain} />
                  <MetricCard title="F1 Score" value={modelResult.metrics.f1_score} color="cyan" icon={Icon.sparkle} />
                  <MetricCard title="Precision" value={modelResult.metrics.precision} color="green" icon={Icon.chart} />
                  <MetricCard title="Recall" value={modelResult.metrics.recall} color="orange" icon={Icon.stats} />
                </div>
              )}

              {"r2" in (modelResult.metrics || {}) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }} className="stagger-children">
                  <MetricCard title="R² Score" value={modelResult.metrics.r2} color="purple" icon={Icon.brain} suffix="" />
                  <MetricCard title="RMSE" value={modelResult.metrics.rmse} color="orange" icon={Icon.stats} suffix="" />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {modelResult.scores && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Model Comparison</h3>
                    <ModelComparisonBar models={modelResult.scores} best={modelResult.best_model} problemType={modelResult.problem_type} />
                  </div>
                )}
                {modelResult.metrics?.confusion_matrix && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Confusion Matrix</h3>
                    <ConfusionMatrix cm={modelResult.metrics.confusion_matrix} />
                  </div>
                )}
              </div>

              {modelResult.metrics?.roc_curve && (
                <div className="glass-card" style={{ padding: 24, height: 360 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-accent)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    ROC Curve — AUC: {modelResult.metrics.roc_curve.auc?.toFixed(4)}
                  </h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={modelResult.metrics.roc_curve.fpr.map((f: number, i: number) => ({ fpr: parseFloat(f.toFixed(3)), tpr: parseFloat(modelResult.metrics.roc_curve.tpr[i].toFixed(3)) }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fpr" label={{ value: "FPR", position: "insideBottom", offset: -4, fill: "#606080" }} tick={{ fill: "#606080", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#606080", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#0f0f2a", border: "1px solid #7c3aed33", borderRadius: 8, color: "#f0f0ff" }} />
                      <Line type="monotone" dataKey="tpr" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="TPR" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
          {activeTab === "model" && !modelResult && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ color: "var(--text-muted)", marginBottom: 16, opacity: 0.5 }}>{Icon.brain}</div>
              <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Select a target column and click <strong style={{ color: "var(--neon-purple)" }}>Auto-Train</strong></p>
            </div>
          )}

          {/* ── EXPLAIN TAB ── */}
          {activeTab === "explain" && shap && (
            <div className="animate-fade-in">
              <SectionHeader title="Feature Importance" subtitle="SHAP values — which features drive model decisions" badge="Explainability" />
              <div className="glass-card" style={{ padding: 24, height: 480 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shap} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fill: "#a0a0c0", fontSize: 11 }} />
                    <YAxis dataKey="feature" type="category" width={160} tick={{ fill: "#a0a0c0", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f2a", border: "1px solid #7c3aed33", borderRadius: 8, color: "#f0f0ff" }} />
                    <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                      {shap.map((_: any, i: number) => {
                        const colors = ["#7c3aed", "#6d28d9", "#5b21b6", "#06b6d4", "#0891b2", "#10b981", "#059669", "#f97316", "#ea580c", "#ef4444"];
                        return <Cell key={i} fill={colors[i % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeTab === "explain" && !shap && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ color: "var(--text-muted)", marginBottom: 16, opacity: 0.5 }}>{Icon.sparkle}</div>
              <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Train a model first, then click <strong style={{ color: "var(--neon-purple)" }}>SHAP Explain</strong></p>
            </div>
          )}

        </div>
      </main>

      {/* ── Toast Notifications ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.msg}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.7, fontSize: 16 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}