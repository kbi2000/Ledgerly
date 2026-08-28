"use client";

import { useEffect, useState } from "react";
import { addWeeks, addMonths, addYears, format } from "date-fns";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { NewRecurringTransaction, RecurringFrequency, RecurringTransaction } from "@/lib/types";

function iso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function advance(dateIso: string, frequency: RecurringFrequency): string {
  const d = new Date(dateIso);
  if (frequency === "weekly") return iso(addWeeks(d, 1));
  if (frequency === "yearly") return iso(addYears(d, 1));
  return iso(addMonths(d, 1));
}

export function useRecurringTransactions() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the local mirror when auth signs out
      setRecurring([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "recurring"),
      orderBy("nextRunDate", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecurring(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringTransaction))
      );
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  async function addRecurring(input: NewRecurringTransaction) {
    if (!user || !db) throw new Error("Not signed in");
    await addDoc(collection(db, "users", user.uid, "recurring"), {
      ...input,
      createdAt: Date.now(),
    });
  }

  async function removeRecurring(id: string) {
    if (!user || !db) throw new Error("Not signed in");
    await deleteDoc(doc(db, "users", user.uid, "recurring", id));
  }

  async function setActive(id: string, active: boolean) {
    if (!user || !db) throw new Error("Not signed in");
    await updateDoc(doc(db, "users", user.uid, "recurring", id), { active });
  }

  /** Materializes every recurring item that's come due (possibly several occurrences at once) into real transactions. */
  async function runDue(today: string = iso(new Date())): Promise<number> {
    if (!user || !db) throw new Error("Not signed in");
    let created = 0;

    for (const r of recurring) {
      if (!r.active) continue;
      let nextRun = r.nextRunDate;
      const occurrences: string[] = [];

      while (nextRun <= today && (!r.endDate || nextRun <= r.endDate)) {
        occurrences.push(nextRun);
        nextRun = advance(nextRun, r.frequency);
      }
      if (occurrences.length === 0) continue;

      for (const occDate of occurrences) {
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          description: `${r.description} (recurring)`,
          amount: r.amount,
          type: r.type,
          category: r.category,
          date: occDate,
          createdAt: Date.now(),
        });
        created++;
      }

      const stillActive = !r.endDate || nextRun <= r.endDate;
      await updateDoc(doc(db, "users", user.uid, "recurring", r.id), {
        nextRunDate: nextRun,
        active: stillActive,
      });
    }

    return created;
  }

  return { recurring, loading, addRecurring, removeRecurring, setActive, runDue };
}
