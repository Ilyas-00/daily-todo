"use client";

import { useRef, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Theme } from "@/lib/theme";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

interface Props { theme: Theme; }

function TaskItem({ task, checked, onToggle, onDelete, t }: {
  task: { id: string; label: string };
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
  t: Theme;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const swiped = swipeX <= -70;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setSwipeX(Math.max(diff, -70));
    else setSwipeX(Math.min(swipeX + diff, 0));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (swipeX < -35) setSwipeX(-70);
    else setSwipeX(0);
  };

  return (
    <div style={{ position: "relative", marginBottom: 8, borderRadius: 16, overflow: "hidden" }}>

      {/* Bouton derrière */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: 70, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <button onClick={onDelete} style={{
          width: 42, height: 42, borderRadius: 12,
          border: "1.5px solid rgba(239,68,68,0.3)",
          background: "rgba(239,68,68,0.1)",
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {/* Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (swiped) setSwipeX(0); else onToggle(); }}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: 16, borderRadius: 16,
          background: checked ? t.bgItemChecked : t.bgItem,
          border: `1px solid ${checked ? t.borderChecked : t.border}`,
          cursor: "pointer",
          transform: `translateX(${swipeX}px)`,
          transition: isDragging.current ? "none" : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0,
          border: `2px solid ${checked ? t.accent : t.borderInput}`,
          background: checked ? t.accent : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{
          fontSize: 15, fontWeight: 500, flex: 1,
          color: checked ? t.textChecked : t.text,
          textDecoration: checked ? "line-through" : "none",
          transition: "all 0.25s",
        }}>
          {task.label}
        </span>
      </div>
    </div>
  );
}
export default function TodayView({ theme: t }: Props) {
  const { tasks, checked, toggleTask, deleteTask, loading } = useTaskStore();

  const today = new Date();
  const todayDow = today.getDay();
  const todayTasks = tasks.filter((task) => task.days.includes(todayDow));
  const doneCount = todayTasks.filter((task) => checked[task.id]).length;
  const progress = todayTasks.length ? doneCount / todayTasks.length : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div style={{ color: t.textMuted }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>
          {DAYS[todayDow]} · {today.getDate()} {MONTHS[today.getMonth()]}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: t.text }}>Aujourd'hui</div>
      </div>

      {/* Progress ring */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        marginBottom: 28, padding: 20,
        background: t.bgCard, borderRadius: 20,
        border: `1px solid ${t.border}`,
      }}>
        <svg width={72} height={72} style={{ flexShrink: 0 }}>
          <circle cx={36} cy={36} r={28} fill="none" stroke={t.progressBg} strokeWidth={6} />
          <circle cx={36} cy={36} r={28} fill="none"
            stroke={t.accent} strokeWidth={6}
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset 0.5s ease" }}
          />
          <text x={36} y={41} textAnchor="middle" fill={t.text} fontSize={15} fontWeight={700}>
            {Math.round(progress * 100)}%
          </text>
        </svg>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>
            {doneCount}/{todayTasks.length} faites
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
            {progress === 1 ? "🔥 Journée parfaite !" : progress > 0.5 ? "Continue !" : "C'est parti !"}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ marginBottom: 24 }}>
        {todayTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            checked={!!checked[task.id]}
            onToggle={() => toggleTask(task.id)}
            onDelete={() => deleteTask(task.id)}
            t={t}
          />
        ))}
      </div>

      {todayTasks.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: t.textMuted, fontSize: 15 }}>
          Aucune task pour aujourd'hui 🎉<br />
          <span style={{ fontSize: 13 }}>Appuie sur "+ Add" pour en ajouter</span>
        </div>
      )}

      {/* Barre bas */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, padding: "12px 24px 28px",
        background: `linear-gradient(to top, ${t.bg} 60%, transparent)`,
      }}>
        <div style={{ height: 4, background: t.progressBg, borderRadius: 2 }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${t.accent}, ${t.accentLight})`,
            borderRadius: 2, transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: t.textMuted, marginTop: 6 }}>
          Reset automatique à minuit
        </div>
      </div>
    </div>
  );
}