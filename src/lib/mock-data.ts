import type { Platform } from "./store";

export type PostStatus = "draft" | "pending_approval" | "approved" | "scheduled" | "posted" | "failed";

export const platformMeta: Record<Platform, { label: string; hue: string }> = {
  instagram: { label: "Instagram", hue: "oklch(0.65 0.2 20)" },
  facebook: { label: "Facebook", hue: "oklch(0.55 0.15 260)" },
  linkedin: { label: "LinkedIn", hue: "oklch(0.5 0.12 240)" },
  tiktok: { label: "TikTok", hue: "oklch(0.7 0.15 180)" },
  x: { label: "X", hue: "oklch(0.85 0.02 85)" },
  pinterest: { label: "Pinterest", hue: "oklch(0.55 0.2 25)" },
  youtube: { label: "YouTube", hue: "oklch(0.6 0.22 25)" },
  threads: { label: "Threads", hue: "oklch(0.75 0.03 85)" },
};

export const team = [
  { id: "u1", name: "Ana Reyes", role: "Approver", email: "ana@meridiancoffee.co", avatar: "AR" },
  { id: "u2", name: "Jordan Kim", role: "Drafter", email: "jordan@meridiancoffee.co", avatar: "JK" },
  { id: "u3", name: "Priya Shah", role: "Drafter", email: "priya@meridiancoffee.co", avatar: "PS" },
  { id: "u4", name: "Marcus Vale", role: "Approver", email: "marcus@meridiancoffee.co", avatar: "MV" },
] as const;

export const analytics = {
  weekly: [
    { week: "W-5", engagement: 3.2, posts: 8 },
    { week: "W-4", engagement: 3.9, posts: 11 },
    { week: "W-3", engagement: 4.1, posts: 9 },
    { week: "W-2", engagement: 4.7, posts: 12 },
    { week: "W-1", engagement: 5.3, posts: 14 },
    { week: "This", engagement: 6.1, posts: 13 },
  ],
  perPlatform: [
    { platform: "Instagram", engagement: 6.4, reach: 24800 },
    { platform: "LinkedIn", engagement: 4.1, reach: 8200 },
    { platform: "X", engagement: 2.7, reach: 15300 },
    { platform: "Threads", engagement: 5.2, reach: 6100 },
    { platform: "Facebook", engagement: 1.9, reach: 11200 },
  ],
  topPost: {
    caption: "Behind the bar with Priya — 6am prep, one shot at a time.",
    platform: "Instagram",
    likes: 3812,
    comments: 214,
    shares: 96,
    posted: "3 days ago",
  },
};

