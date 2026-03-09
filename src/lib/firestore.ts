import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, DayHistory } from "@/types";

// ─── TASKS ───────────────────────────────────────────────

// Récupérer toutes les tasks d'un utilisateur
export async function getTasks(userId: string): Promise<Task[]> {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Task[];
}

// Ajouter une task
export async function addTask(
  task: Omit<Task, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, "tasks"), task);
  return docRef.id;
}

// Supprimer une task
export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", taskId));
}

// Modifier une task
export async function updateTask(
  taskId: string,
  data: Partial<Task>
): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), data);
}

// ─── HISTORY ─────────────────────────────────────────────

// Sauvegarder l'état d'une task pour un jour donné
export async function saveHistory(entry: Omit<DayHistory, "id">): Promise<void> {
  // On utilise une clé unique date_taskId pour éviter les doublons
  const id = `${entry.date}_${entry.taskId}`;
  await setDoc(doc(db, "history", id), entry);
}

// Récupérer l'historique d'un utilisateur entre deux dates
export async function getHistory(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DayHistory[]> {
  const q = query(
    collection(db, "history"),
    where("userId", "==", userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DayHistory[];
}

/*
```
getTasks()     → charge les tasks depuis Firestore
addTask()      → crée une nouvelle task dans Firestore
deleteTask()   → supprime une task
updateTask()   → modifie une task existante

saveHistory()  → sauvegarde si une task était cochée ou non ce jour
getHistory()   → récupère l'historique entre deux dates pour les graphiques

*/