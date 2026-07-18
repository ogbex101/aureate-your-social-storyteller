import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccountType = "individual" | "organization";
export type Platform = "instagram" | "facebook" | "linkedin" | "tiktok" | "x" | "pinterest" | "youtube" | "threads";

type State = {
  accountType: AccountType;
  onboarded: boolean;
  connected: Record<Platform, boolean>;
  requireApprovalDefault: boolean;
  brandName: string;
  toneWords: string[];
  setAccountType: (t: AccountType) => void;
  setOnboarded: (v: boolean) => void;
  toggleConnection: (p: Platform) => void;
  setRequireApproval: (v: boolean) => void;
  setBrandName: (v: string) => void;
  setToneWords: (v: string[]) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set) => ({
      accountType: "organization",
      onboarded: true,
      connected: {
        instagram: true,
        facebook: true,
        linkedin: true,
        tiktok: false,
        x: true,
        pinterest: false,
        youtube: false,
        threads: true,
      },
      requireApprovalDefault: false,
      brandName: "Meridian Coffee Co.",
      toneWords: ["Warm", "Considered", "Playful", "Confident"],
      setAccountType: (t) => set({ accountType: t }),
      setOnboarded: (v) => set({ onboarded: v }),
      toggleConnection: (p) => set((s) => ({ connected: { ...s.connected, [p]: !s.connected[p] } })),
      setRequireApproval: (v) => set({ requireApprovalDefault: v }),
      setBrandName: (v) => set({ brandName: v }),
      setToneWords: (v) => set({ toneWords: v }),
    }),
    { name: "aureate-store" },
  ),
);