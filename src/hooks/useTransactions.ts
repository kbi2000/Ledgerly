"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { NewTransaction, Transaction } from "@/lib/types";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the local mirror when auth signs out
      setTransactions([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
      );
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  async function addTransaction(input: NewTransaction) {
    if (!user || !db) throw new Error("Not signed in");
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      ...input,
      createdAt: Date.now(),
    });
  }

  async function removeTransaction(id: string) {
    if (!user || !db) throw new Error("Not signed in");
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  }

  return { transactions, loading, addTransaction, removeTransaction };
}
