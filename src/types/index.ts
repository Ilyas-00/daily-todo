export type Frequency = "daily" | "weekly" | "monthly" | "custom";


export interface Task {
  id: string;
  label: string;
  days: number[]; // 0 = Dim, 1 = Lun, ..., 6 = Sam
  createdAt: Date;
  userId: string;
}

export interface DayHistory {
  id: string;
  date: string;
  taskId: string;
  done: boolean;
  userId: string;
}
/*
### Ce que chaque type représente

Task 
│
├── id          → identifiant unique généré par Firestore
├── label       → "Study algorithms (LeetCode)"
├── days        → [1,2,3,4] = Lundi au Jeudi
├── createdAt   → date de création
└── userId      → l'utilisateur à qui appartient la task

DayHistory → l'historique d'une task pour un jour donné
│
├── id          → identifiant unique
├── date        → "2026-03-09"
├── taskId      → référence vers la Task
├── done        → true si cochée ce jour là
└── userId      → l'utilisateur

*/