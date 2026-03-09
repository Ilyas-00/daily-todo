"use client";

import { useTaskStore } from "@/store/taskStore";
import { Theme } from "@/lib/theme";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

interface Props { theme: Theme; }

export default function TodayView({ theme: t }: Props) {
  const { tasks, checked, toggleTask, loading } = useTaskStore();

  const today = new Date();
  const todayDow = today.getDay();
  const todayTasks = tasks.filter((t) => t.days.includes(todayDow));
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
        transition: "background 0.3s ease",
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
          <div key={task.id} onClick={() => toggleTask(task.id)} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: 16, marginBottom: 8, borderRadius: 16,
            background: checked[task.id] ? t.bgItemChecked : t.bgItem,
            border: `1px solid ${checked[task.id] ? t.borderChecked : t.border}`,
            cursor: "pointer", transition: "all 0.25s",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 8, flexShrink: 0,
              border: `2px solid ${checked[task.id] ? t.accent : t.borderInput}`,
              background: checked[task.id] ? t.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.25s",
            }}>
              {checked[task.id] && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{
              fontSize: 15, fontWeight: 500,
              color: checked[task.id] ? t.textChecked : t.text,
              textDecoration: checked[task.id] ? "line-through" : "none",
              transition: "all 0.25s",
            }}>
              {task.label}
            </span>
          </div>
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