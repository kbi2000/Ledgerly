"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { BusinessProfile } from "@/lib/types";

const DEFAULT_PROFILE: BusinessProfile = {
  businessType: "other",
  fiscalYearStartMonth: 1,
};

export function useBusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to defaults when auth signs out
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", user.uid, "profile", "business");
    const unsubscribe = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? { ...DEFAULT_PROFILE, ...(snap.data() as Partial<BusinessProfile>) } : DEFAULT_PROFILE);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  async function updateProfile(patch: Partial<BusinessProfile>) {
    if (!user || !db) throw new Error("Not signed in");
    const ref = doc(db, "users", user.uid, "profile", "business");
    await setDoc(ref, { ...profile, ...patch }, { merge: true });
  }

  return { profile, loading, updateProfile };
}
