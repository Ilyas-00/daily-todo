"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function WeekView() {
  const { tasks, checked, history, loadHistory } = useTaskStore();

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  // Calcul du début de semaine (Lundi)
  const startOfWeek = new Date(today);
  const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
  startOfWeek.setDate(today.getDate() - diff);

  // Les 7 jours de la semaine
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const isToday = key === todayKey;
    return { d, key, isToday, dow: d.getDay() };
  });

  useEffect(() => {
    const start = weekDays[0].key;
    const end = weekDays[6].key;
    loadHistory(start, end);
  }, []);

  // Calcul du taux de complétion par jour
  const getDayRate = (day: { key: string; isToday: boolean; dow: number }) => {
    const dayTasks = tasks.filter((t) => t.days.includes(day.dow));
    if (!dayTasks.length) return null;

    if (day.isToday) {
      const done = dayTasks.filter((t) => checked[t.id]).length;
      return { done, total: dayTasks.length };
    }

    const dayHistory = history.filter((h) => h.date === day.key);
    const done = dayHistory.filter((h) => h.done).length;
    return { done, total: dayTasks.length };
  };

  // Taux global de la semaine
  const weekStats = weekDays.reduce(
    (acc, day) => {
      const rate = getDayRate(day);
      if (rate) {
        acc.done += rate.done;
        acc.total += rate.total;
      }
      return acc;
    },
    { done: 0, total: 0 }
  );
  const weekPct = weekStats.total
    ? Math.round((weekStats.done / weekStats.total) * 100)
    : 0;

  return (
    <div style={{ padding: "0 24px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>
          Semaine en cours
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Cette semaine</div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{
          flex: 1, padding: 20,
          background: "#111118", borderRadius: 20,
          border: "1px solid #1f1f30",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#a855f7" }}>{weekPct}%</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Taux semaine</div>
        </div>
        <div style={{
          flex: 1, padding: 20,
          background: "#111118", borderRadius: 20,
          border: "1px solid #1f1f30",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#7c3aed" }}>{weekStats.done}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Tasks faites</div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{
        background: "#111118", borderRadius: 20,
        padding: 20, border: "1px solid #1f1f30",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 16 }}>
          Complétion par jour
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
          {weekDays.map((day, i) => {
            const rate = getDayRate(day);
            const pct = rate ? rate.done / rate.total : 0;
            const h = Math.max(8, pct * 80);
            return (
              <div key={i} style={{
                flex: 1, display: "flex",
                flexDirection: "column", alignItems: "center", gap: 6,
              }}>
                <div style={{
                  width: "100%", height: h, borderRadius: 6,
                  background: day.isToday ? "#a855f7" : pct > 0 ? "#7c3aed" : "#1a1a2e",
                  transition: "height 0.5s ease",
                  position: "relative",
                }}>
                  {day.isToday && (
                    <div style={{
                      position: "absolute", top: -4, left: "50%",
                      transform: "translateX(-50%)",
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#a855f7",
                      boxShadow: "0 0 8px #a855f7",
                    }} />
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  color: day.isToday ? "#e2e8f0" : "#4b5563",
                  fontWeight: day.isToday ? 700 : 400,
                }}>
                  {DAYS[day.dow].slice(0, 1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Par task */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 12 }}>
        Par task
      </div>
      {tasks.map((task) => {
        const taskDays = weekDays.filter((d) => task.days.includes(d.dow));
        const done = taskDays.filter((d) => {
          if (d.isToday) return checked[task.id];
          return history.some((h) => h.date === d.key && h.taskId === task.id && h.done);
        }).length;
        const total = taskDays.length;
        const r = total ? done / total : 0;

        return (
          <div key={task.id} style={{
            marginBottom: 10, padding: "14px 16px",
            background: "#111118", borderRadius: 14,
            border: "1px solid #1f1f30",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{task.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#a855f7" }}>
                {done}/{total}
              </span>
            </div>
            <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2 }}>
              <div style={{
                height: "100%", width: `${r * 100}%`,
                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                borderRadius: 2, transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}