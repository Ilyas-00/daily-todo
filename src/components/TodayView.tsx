"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function TodayView() {
  const { tasks, checked, toggleTask, loading } = useTaskStore();

  const today = new Date();
  const todayDow = today.getDay();
  const todayTasks = tasks.filter((t) => t.days.includes(todayDow));
  const doneCount = todayTasks.filter((t) => checked[t.id]).length;
  const progress = todayTasks.length ? doneCount / todayTasks.length : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div style={{ color: "#6b7280" }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 100px" }}>
      {/* Date */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>
          {DAYS[todayDow]} · {today.getDate()} {MONTHS[today.getMonth()]}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Aujourd'hui</div>
      </div>

      {/* Progress ring */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        marginBottom: 28, padding: 20,
        background: "#111118", borderRadius: 20,
        border: "1px solid #1f1f30",
      }}>
        <svg width={72} height={72} style={{ flexShrink: 0 }}>
          <circle cx={36} cy={36} r={28} fill="none" stroke="#1a1a2e" strokeWidth={6} />
          <circle
            cx={36} cy={36} r={28} fill="none"
            stroke="#7c3aed" strokeWidth={6}
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
            strokeLinecap="round"
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
          <text x={36} y={41} textAnchor="middle" fill="#e2e8f0" fontSize={15} fontWeight={700}>
            {Math.round(progress * 100)}%
          </text>
        </svg>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {doneCount}/{todayTasks.length} faites
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {progress === 1 ? "🔥 Journée parfaite !" : progress > 0.5 ? "Continue !" : "C'est parti !"}
          </div>
        </div>
      </div>

      {/* Tasks par fréquence */}
      <div style={{ marginBottom: 24 }}>
            {todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: 16, marginBottom: 8,
                  borderRadius: 16,
                  background: checked[task.id] ? "#111118" : "#0f0f1a",
                  border: `1px solid ${checked[task.id] ? "#7c3aed40" : "#1f1f30"}`,
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                  border: `2px solid ${checked[task.id] ? "#7c3aed" : "#2d2d45"}`,
                  background: checked[task.id] ? "#7c3aed" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s",
                }}>
                  {checked[task.id] && (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 15, fontWeight: 500,
                  color: checked[task.id] ? "#4b5563" : "#e2e8f0",
                  textDecoration: checked[task.id] ? "line-through" : "none",
                  transition: "all 0.25s",
                }}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>

      {/* Aucune task */}
      {todayTasks.length === 0 && (
        <div style={{
          textAlign: "center", padding: 60,
          color: "#4b5563", fontSize: 15,
        }}>
          Aucune task pour aujourd'hui 🎉<br />
          <span style={{ fontSize: 13 }}>Appuie sur "+ Add" pour en ajouter</span>
        </div>
      )}

      {/* Barre de progression bas */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        padding: "12px 24px 28px",
        background: "linear-gradient(to top, #0a0a0f 60%, transparent)",
      }}>
        <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2 }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #7c3aed, #a855f7)",
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", marginTop: 6 }}>
          Reset automatique à minuit
        </div>
      </div>
    </div>
  );
}