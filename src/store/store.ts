import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import supabase from "../supabaseClient";

interface UserState {
  currentUser: Session | null;
  setUser: (user: Session | null) => void;
  clearUser: () => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ data: {}; error: Error | null }>;
}

export const userStore = create<UserState>()((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ currentUser: data.session });
    return { data, error };
  },
}));
