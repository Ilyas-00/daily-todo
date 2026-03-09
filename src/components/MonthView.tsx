"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Theme } from "@/lib/theme";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_HEADER = ["L","M","M","J","V","S","D"];

interface Props { theme: Theme; }

export default function MonthView({ theme: t }: Props) {
  const { tasks, checked, history, loadHistory } = useTaskStore();

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDow = new Date(year, month, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  useEffect(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`;
    loadHistory(start, end);
  }, []);

  const getDayRate = (dayNum: number) => {
    const d = new Date(year, month, dayNum);
    const key = d.toISOString().split("T")[0];
    const dow = d.getDay();
    const isToday = key === todayKey;
    const dayTasks = tasks.filter((t) => t.days.includes(dow));
    if (!dayTasks.length) return null;
    if (isToday) return dayTasks.filter((t) => checked[t.id]).length / dayTasks.length;
    const dayHistory = history.filter((h) => h.date === key);
    if (!dayHistory.length) return null;
    return dayHistory.filter((h) => h.done).length / dayTasks.length;
  };

  const getColor = (rate: number | null) => {
    if (rate === null) return t.bgItem;
    if (rate === 0) return t.progressBg;
    if (rate < 0.4) return "#2d1b4e";
    if (rate < 0.7) return "#4a2080";
    if (rate < 1) return t.accent;
    return t.accentLight;
  };

  const monthDone = history.filter((h) => h.done).length;
  const monthTotal = history.length;
  const monthPct = monthTotal ? Math.round((monthDone / monthTotal) * 100) : 0;

  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startDow + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  return (
    <div style={{ padding: "0 24px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Vue mensuelle</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: t.text }}>{MONTHS[month]} {year}</div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { value: `${monthPct}%`, label: "Taux du mois", color: t.accentLight },
          { value: monthDone, label: "Tasks faites", color: t.accent },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: 20, background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, transition: "background 0.3s ease" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendrier */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, transition: "background 0.3s ease" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {DAYS_HEADER.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, color: t.textMuted, fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((dayNum, i) => {
            if (!dayNum) return <div key={i} />;
            const rate = getDayRate(dayNum);
            const d = new Date(year, month, dayNum);
            const isToday = d.toISOString().split("T")[0] === todayKey;
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 8,
                background: getColor(rate),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: isToday ? 800 : 500,
                color: isToday ? "#fff" : rate !== null ? "#e2e8f0" : t.textMuted,
                border: isToday ? `2px solid ${t.accentLight}` : "1px solid transparent",
                position: "relative",
              }}>
                {dayNum}
                {rate === 1 && <div style={{ position: "absolute", top: 2, right: 2, width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
              </div>
            );
          })}
        </div>
        {/* Légende */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: t.textMuted }}>Moins</span>
          {[null, 0, 0.35, 0.65, 0.85, 1].map((r, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: getColor(r), border: `1px solid ${t.border}` }} />
          ))}
          <span style={{ fontSize: 11, color: t.textMuted }}>Plus</span>
        </div>
      </div>
    </div>
  );
}