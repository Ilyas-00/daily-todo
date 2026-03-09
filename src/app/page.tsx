"use client";

import { useState } from "react";
import TodayView from "@/components/TodayView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import AddTaskView from "@/components/AddTaskView";
import { useTaskStore } from "@/store/taskStore";
import { themes } from "@/lib/theme";

export type View = "today" | "week" | "month" | "add";

export default function Home() {
  const [view, setView] = useState<View>("today");
  const { theme, toggleTheme } = useTaskStore();
  const t = themes[theme];

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      transition: "background 0.3s ease, color 0.3s ease",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: -100, right: -100,
        width: 400, height: 400,
        background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Nav tabs */}
        <div style={{
          display: "flex", gap: 8,
          padding: "56px 24px 16px",
          position: "sticky", top: 0,
          background: t.bg,
          zIndex: 10,
          transition: "background 0.3s ease",
        }}>
          {([
            ["today", "Today"],
            ["week", "Week"],
            ["month", "Month"],
            ["add", "+ Add"],
          ] as [View, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: v === "add" ? "0 0 auto" : 1,
              padding: "8px 12px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: view === v ? t.accent : theme === "dark" ? "#1a1a2e" : "#ede9fe",
              color: view === v ? "#fff" : t.textMuted,
              transition: "all 0.2s",
            }}>{label}</button>
          ))}

          {/* Toggle thème */}
          <button onClick={toggleTheme} style={{
            width: 36, height: 36,
            borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 16,
            background: theme === "dark" ? "#1a1a2e" : "#ede9fe",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Views */}
        {view === "today" && <TodayView theme={t} />}
        {view === "week" && <WeekView theme={t} />}
        {view === "month" && <MonthView theme={t} />}
        {view === "add" && <AddTaskView theme={t} onDone={() => setView("today")} />}
      </div>
    </div>
  );
}