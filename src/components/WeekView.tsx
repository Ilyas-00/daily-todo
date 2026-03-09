"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Theme } from "@/lib/theme";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

interface Props { theme: Theme; }

export default function WeekView({ theme: t }: Props) {
  const { tasks, checked, history, loadHistory } = useTaskStore();

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const startOfWeek = new Date(today);
  const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
  startOfWeek.setDate(today.getDate() - diff);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = d.toISOString().split("T")[0];
    return { d, key, isToday: key === todayKey, dow: d.getDay() };
  });

  useEffect(() => {
    loadHistory(weekDays[0].key, weekDays[6].key);
  }, []);

  const getDayRate = (day: { key: string; isToday: boolean; dow: number }) => {
    const dayTasks = tasks.filter((t) => t.days.includes(day.dow));
    if (!dayTasks.length) return null;
    if (day.isToday) return { done: dayTasks.filter((t) => checked[t.id]).length, total: dayTasks.length };
    const dayHistory = history.filter((h) => h.date === day.key);
    return { done: dayHistory.filter((h) => h.done).length, total: dayTasks.length };
  };

  const weekStats = weekDays.reduce((acc, day) => {
    const rate = getDayRate(day);
    if (rate) { acc.done += rate.done; acc.total += rate.total; }
    return acc;
  }, { done: 0, total: 0 });
  const weekPct = weekStats.total ? Math.round((weekStats.done / weekStats.total) * 100) : 0;

  return (
    <div style={{ padding: "0 24px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Semaine en cours</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: t.text }}>Cette semaine</div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { value: `${weekPct}%`, label: "Taux semaine", color: t.accentLight },
          { value: weekStats.done, label: "Tasks faites", color: t.accent },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: 20, background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, transition: "background 0.3s ease" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, marginBottom: 24, transition: "background 0.3s ease" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 16 }}>Complétion par jour</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
          {weekDays.map((day, i) => {
            const rate = getDayRate(day);
            const pct = rate ? rate.done / rate.total : 0;
            const h = Math.max(8, pct * 80);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%", height: h, borderRadius: 6,
                  background: day.isToday ? t.accentLight : pct > 0 ? t.accent : t.progressBg,
                  transition: "height 0.5s ease", position: "relative",
                }}>
                  {day.isToday && (
                    <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: t.accentLight, boxShadow: `0 0 8px ${t.accentLight}` }} />
                  )}
                </div>
                <div style={{ fontSize: 11, color: day.isToday ? t.text : t.textMuted, fontWeight: day.isToday ? 700 : 400 }}>
                  {DAYS[day.dow].slice(0, 1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Par task */}
      <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 12 }}>Par task</div>
      {tasks.map((task) => {
        const taskDays = weekDays.filter((d) => task.days.includes(d.dow));
        const done = taskDays.filter((d) => {
          if (d.isToday) return checked[task.id];
          return history.some((h) => h.date === d.key && h.taskId === task.id && h.done);
        }).length;
        const total = taskDays.length;
        const r = total ? done / total : 0;
        return (
          <div key={task.id} style={{ marginBottom: 10, padding: "14px 16px", background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}`, transition: "background 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{task.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.accentLight }}>{done}/{total}</span>
            </div>
            <div style={{ height: 4, background: t.progressBg, borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${r * 100}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accentLight})`, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}