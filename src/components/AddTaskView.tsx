"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";
import { Theme } from "@/lib/theme";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

interface Props { theme: Theme; onDone: () => void; }

export default function AddTaskView({ theme: t, onDone }: Props) {
  const { addTask, tasks, deleteTask } = useTaskStore();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const presets: Record<string, number[]> = {
    "Lun - Ven": [1, 2, 3, 4, 5],
    "Tous les jours": [0, 1, 2, 3, 4, 5, 6],
    "Week-end": [0, 6],
    "Lun - Jeu": [1, 2, 3, 4],
  };

  const toggleDay = (d: number) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const handleSubmit = async () => {
    if (!label.trim()) { setError("Donne un nom à ta task !"); return; }
    if (!days.length) { setError("Sélectionne au moins un jour !"); return; }
    setLoading(true);
    setError("");
    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addTask({ label: label.trim(), days, createdAt: new Date(), userId });
    setLoading(false);
    setLabel("");
    setDays([1, 2, 3, 4, 5]);
  };

  return (
    <div style={{ padding: "0 24px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Gérer</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: t.text }}>Mes Tasks</div>
      </div>

  

      {/* Formulaire ajout */}
      <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 12, letterSpacing: 2 }}>
        NOUVELLE TASK
      </div>

      {/* Nom */}
      <div style={{
        background: t.bgCard, borderRadius: 20,
        padding: 20, border: `1px solid ${t.border}`,
        marginBottom: 16, transition: "background 0.3s ease",
      }}>
        <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 8 }}>NOM</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Lire 20 pages..."
          style={{
            width: "100%", background: t.bgInput,
            border: `1px solid ${t.borderInput}`, borderRadius: 12,
            padding: "12px 14px", color: t.text,
            fontSize: 15, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Jours */}
      <div style={{
        background: t.bgCard, borderRadius: 20,
        padding: 20, border: `1px solid ${t.border}`,
        marginBottom: 16, transition: "background 0.3s ease",
      }}>
        <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 12 }}>JOURS</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.entries(presets).map(([name, presetDays]) => {
            const isActive = JSON.stringify([...days].sort()) === JSON.stringify([...presetDays].sort());
            return (
              <button key={name} onClick={() => setDays(presetDays)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: isActive ? t.accent : t.bgInput,
                color: isActive ? "#fff" : t.textMuted,
                transition: "all 0.2s",
              }}>{name}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map((d, i) => (
            <button key={i} onClick={() => toggleDay(i)} style={{
              flex: 1, aspectRatio: "1", borderRadius: 10, border: "none",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: days.includes(i) ? t.accent : t.bgInput,
              color: days.includes(i) ? "#fff" : t.textMuted,
              transition: "all 0.2s",
            }}>{d.slice(0, 1)}</button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "#2d1b1b", border: "1px solid #7c3a3a",
          color: "#f87171", fontSize: 14, marginBottom: 16,
        }}>{error}</div>
      )}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: "100%", padding: 18, borderRadius: 16, border: "none",
        cursor: loading ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 700,
        background: loading ? t.progressBg : `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
        color: loading ? t.textMuted : "#fff",
        boxShadow: loading ? "none" : `0 8px 32px rgba(124,58,237,0.4)`,
        transition: "all 0.2s",
      }}>
        {loading ? "Ajout en cours..." : "Ajouter la task ✦"}
      </button>
      <div style={{
        marginBottom: 24, marginTop: 24, transition: "background 0.3s ease",
      }}></div>

          {/* Liste des tasks existantes */}
      <div style={{
        background: t.bgCard, borderRadius: 20,
        padding: 20, border: `1px solid ${t.border}`,
        marginBottom: 24, transition: "background 0.3s ease",
      }}>
        <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, marginBottom: 12 }}>
          TASKS EXISTANTES ({tasks.length})
        </div>
        {tasks.length === 0 && (
          <div style={{ color: t.textMuted, fontSize: 14 }}>Aucune task pour l'instant</div>
        )}
        {tasks.map((task) => (
          <div key={task.id} style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{task.label}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                {task.days.map(d => DAYS[d]).join(", ")}
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} style={{
              background: "transparent", border: "none",
              cursor: "pointer", fontSize: 18, padding: 4,
              flexShrink: 0,
            }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}