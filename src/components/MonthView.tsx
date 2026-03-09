"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_HEADER = ["L","M","M","J","V","S","D"];

export default function MonthView() {
  const { tasks, checked, history, loadHistory } = useTaskStore();

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Début semaine = Lundi → on décale
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  useEffect(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`;
    loadHistory(start, end);
  }, []);

  // Calcul du taux pour un jour donné
  const getDayRate = (dayNum: number) => {
    const d = new Date(year, month, dayNum);
    const key = d.toISOString().split("T")[0];
    const dow = d.getDay();
    const isToday = key === todayKey;
    const dayTasks = tasks.filter((t) => t.days.includes(dow));
    if (!dayTasks.length) return null;

    if (isToday) {
      const done = dayTasks.filter((t) => checked[t.id]).length;
      return done / dayTasks.length;
    }

    const dayHistory = history.filter((h) => h.date === key);
    if (!dayHistory.length) return null;
    const done = dayHistory.filter((h) => h.done).length;
    return done / dayTasks.length;
  };

  const getColor = (rate: number | null) => {
    if (rate === null) return "#0f0f1a";
    if (rate === 0) return "#1a1a2e";
    if (rate < 0.4) return "#2d1b4e";
    if (rate < 0.7) return "#4a2080";
    if (rate < 1) return "#7c3aed";
    return "#a855f7";
  };

  // Stats du mois
  const monthDone = history.filter((h) => h.done).length;
  const monthTotal = history.length;
  const monthPct = monthTotal ? Math.round((monthDone / monthTotal) * 100) : 0;

  // Cellules du calendrier (42 cases = 6 semaines)
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startDow + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  return (
    <div style={{ padding: "0 24px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>
          Vue mensuelle
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
          {MONTHS[month]} {year}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{
          flex: 1, padding: 20,
          background: "#111118", borderRadius: 20,
          border: "1px solid #1f1f30",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#a855f7" }}>{monthPct}%</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Taux du mois</div>
        </div>
        <div style={{
          flex: 1, padding: 20,
          background: "#111118", borderRadius: 20,
          border: "1px solid #1f1f30",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#7c3aed" }}>{monthDone}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Tasks faites</div>
        </div>
      </div>

      {/* Calendrier */}
      <div style={{
        background: "#111118", borderRadius: 20,
        padding: 20, border: "1px solid #1f1f30",
      }}>
        {/* Headers jours */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4, marginBottom: 8,
        }}>
          {DAYS_HEADER.map((d, i) => (
            <div key={i} style={{
              textAlign: "center",
              fontSize: 11, color: "#4b5563", fontWeight: 600,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cellules */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}>
          {cells.map((dayNum, i) => {
            if (!dayNum) return <div key={i} />;
            const rate = getDayRate(dayNum);
            const d = new Date(year, month, dayNum);
            const key = d.toISOString().split("T")[0];
            const isToday = key === todayKey;

            return (
              <div key={i} style={{
                aspectRatio: "1",
                borderRadius: 8,
                background: getColor(rate),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: isToday ? 800 : 500,
                color: isToday ? "#fff" : rate !== null ? "#e2e8f0" : "#2d2d45",
                border: isToday ? "2px solid #a855f7" : "1px solid transparent",
                position: "relative",
              }}>
                {dayNum}
                {rate === 1 && (
                  <div style={{
                    position: "absolute", top: 2, right: 2,
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#fff",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div style={{
          display: "flex", gap: 8,
          marginTop: 16, alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#4b5563" }}>Moins</span>
          {[null, 0, 0.35, 0.65, 0.85, 1].map((r, i) => (
            <div key={i} style={{
              width: 14, height: 14,
              borderRadius: 4,
              background: getColor(r),
              border: "1px solid #2d2d45",
            }} />
          ))}
          <span style={{ fontSize: 11, color: "#4b5563" }}>Plus</span>
        </div>
      </div>
    </div>
  );
}