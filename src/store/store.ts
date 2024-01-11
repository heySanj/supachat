import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface UserState {
  currentUser: Session | null;
  setUser: (user: Session | null) => void;
  clearUser: () => void;
}

export const userStore = create<UserState>()((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
}));
