import { create } from "zustand";
import { Task, DayHistory } from "@/types";
import {
  getTasks,
  addTask,
  deleteTask,
  saveHistory,
  getHistory,
} from "@/lib/firestore";

interface TaskStore {
  // ─── State ───────────────────────────────
  tasks: Task[];
  checked: Record<string, boolean>; // { taskId: true/false }
  history: DayHistory[];
  loading: boolean;
  userId: string | null;
  theme: "dark" | "light";


  // ─── Actions ─────────────────────────────
  setUserId: (id: string) => void;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;  
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  loadHistory: (startDate: string, endDate: string) => Promise<void>;
  resetIfNewDay: () => Promise<void>;
  toggleTheme: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  checked: {},
  history: [],
  loading: false,
  userId: null,

  setUserId: (id) => set({ userId: id }),

  theme: "dark",
    toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    localStorage.setItem("theme", newTheme);
    },
  // Charger les tasks depuis Firestore
loadTasks: async () => {
  const { userId } = get();
  if (!userId) return;
  set({ loading: true });

  const today = new Date().toISOString().split("T")[0];

  // Charge les tasks ET l'historique du jour en parallèle
  const [tasks, todayHistory] = await Promise.all([
    getTasks(userId),
    getHistory(userId, today, today),
  ]);

  // Reconstruit le state checked depuis l'historique du jour
  const checked: Record<string, boolean> = {};
  todayHistory.forEach((entry) => {
    checked[entry.taskId] = entry.done;
  });

  set({ tasks, checked, loading: false });
},

  // Ajouter une task
  addTask: async (task) => {
    const id = await addTask(task);
    const newTask = { ...task, id };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  // Supprimer une task
  deleteTask: async (taskId) => {
    await deleteTask(taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },

  // Cocher / décocher une task
  toggleTask: async (taskId) => {
    const { checked, userId } = get();
    const newValue = !checked[taskId];
    const today = new Date().toISOString().split("T")[0];

    // Mise à jour locale immédiate → l'UI réagit instantanément
    set((state) => ({
      checked: { ...state.checked, [taskId]: newValue },
    }));

    // Sauvegarde dans Firestore en arrière plan
    if (userId) {
      await saveHistory({
        date: today,
        taskId,
        done: newValue,
        userId,
      });
    }
  },

  // Charger l'historique pour les graphiques
  loadHistory: async (startDate, endDate) => {
    const { userId } = get();
    if (!userId) return;
    const history = await getHistory(userId, startDate, endDate);
    set({ history });
  },

  // Reset automatique à minuit
  resetIfNewDay: async () => {
    const lastReset = localStorage.getItem("lastReset");
    const today = new Date().toISOString().split("T")[0];
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) set({ theme: savedTheme });

    if (lastReset !== today) {
      // Nouveau jour → on décoche tout
      set({ checked: {} });
      localStorage.setItem("lastReset", today);
    }
  },
}));
/*

Avec Zustand ✅
→ Un seul store central
→ N'importe quel composant accède aux tasks directement
→ useTaskStore() 

resetIfNewDay() vérifie :
│
├── lastReset = "2026-03-09" (hier)
├── today     = "2026-03-10" (aujourd'hui)
│
└── C'est différent → on décoche tout + on met à jour lastReset

*/