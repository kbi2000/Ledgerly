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
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { Invoice, InvoiceStatus, NewInvoice } from "@/lib/types";

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the local mirror when auth signs out
      setInvoices([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "invoices"),
      orderBy("issueDate", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  async function addInvoice(input: NewInvoice) {
    if (!user || !db) throw new Error("Not signed in");
    await addDoc(collection(db, "users", user.uid, "invoices"), {
      ...input,
      createdAt: Date.now(),
    });
  }

  async function setInvoiceStatus(id: string, status: InvoiceStatus) {
    if (!user || !db) throw new Error("Not signed in");
    await updateDoc(doc(db, "users", user.uid, "invoices", id), { status });
  }

  async function removeInvoice(id: string) {
    if (!user || !db) throw new Error("Not signed in");
    await deleteDoc(doc(db, "users", user.uid, "invoices", id));
  }

  return { invoices, loading, addInvoice, setInvoiceStatus, removeInvoice };
}
