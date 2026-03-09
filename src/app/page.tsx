"use client";

import { useState } from "react";
import TodayView from "@/components/TodayView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import AddTaskView from "@/components/AddTaskView";

export type View = "today" | "week" | "month" | "add";

export default function Home() {
  const [view, setView] = useState<View>("today");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: -100, right: -100,
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Nav tabs */}
        <div style={{
          display: "flex", gap: 8,
          padding: "56px 24px 16px",
          position: "sticky", top: 0,
          background: "#0a0a0f",
          zIndex: 10,
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
              background: view === v ? "#7c3aed" : "#1a1a2e",
              color: view === v ? "#fff" : "#6b7280",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Views */}
        {view === "today" && <TodayView />}
        {view === "week" && <WeekView />}
        {view === "month" && <MonthView />}
        {view === "add" && <AddTaskView onDone={() => setView("today")} />}
      </div>
    </div>
  );
}