"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

interface Props {
  onDone: () => void;
}

export default function AddTaskView({ onDone }: Props) {
  const { addTask } = useTaskStore();
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
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Donne un nom à ta task !");
      return;
    }
    if (!days.length) {
      setError("Sélectionne au moins un jour !");
      return;
    }

    setLoading(true);
    setError("");

    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await addTask({
      label: label.trim(),
      days,
      createdAt: new Date(),
      userId,
    });

    setLoading(false);
    onDone();
  };

  return (
    <div style={{ padding: "0 24px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>
          Nouvelle task
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Ajouter</div>
      </div>

      {/* Nom */}
      <div style={{
        background: "#111118", borderRadius: 20,
        padding: 20, border: "1px solid #1f1f30",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 8 }}>
          NOM DE LA TASK
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Lire 20 pages..."
          style={{
            width: "100%", background: "#0a0a0f",
            border: "1px solid #2d2d45", borderRadius: 12,
            padding: "12px 14px", color: "#e2e8f0",
            fontSize: 15, outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Jours */}
      <div style={{
        background: "#111118", borderRadius: 20,
        padding: 20, border: "1px solid #1f1f30",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 12 }}>
          JOURS
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.entries(presets).map(([name, presetDays]) => (
            <button key={name} onClick={() => setDays(presetDays)} style={{
              padding: "6px 12px", borderRadius: 8,
              border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: JSON.stringify([...days].sort()) === JSON.stringify([...presetDays].sort())
                ? "#7c3aed" : "#0f0f1a",
              color: JSON.stringify([...days].sort()) === JSON.stringify([...presetDays].sort())
                ? "#fff" : "#6b7280",
              transition: "all 0.2s",
            }}>
              {name}
            </button>
          ))}
        </div>

        {/* Sélection manuelle */}
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map((d, i) => (
            <button key={i} onClick={() => toggleDay(i)} style={{
              flex: 1, aspectRatio: "1",
              borderRadius: 10, border: "none",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: days.includes(i) ? "#7c3aed" : "#0f0f1a",
              color: days.includes(i) ? "#fff" : "#4b5563",
              transition: "all 0.2s",
            }}>
              {d.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "#2d1b1b", border: "1px solid #7c3a3a",
          color: "#f87171", fontSize: 14, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Bouton */}
      <button onClick={handleSubmit} disabled={loading} style={{
        width: "100%", padding: 18,
        borderRadius: 16, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 16, fontWeight: 700,
        background: loading ? "#2d2d45" : "linear-gradient(135deg, #7c3aed, #a855f7)",
        color: loading ? "#6b7280" : "#fff",
        boxShadow: loading ? "none" : "0 8px 32px rgba(124,58,237,0.4)",
        transition: "all 0.2s",
      }}>
        {loading ? "Ajout en cours..." : "Ajouter la task ✦"}
      </button>
    </div>
  );
}