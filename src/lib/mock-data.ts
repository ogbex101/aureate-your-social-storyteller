import type { Platform } from "./store";

export type PostStatus = "auto" | "approval" | "posted" | "draft";

export type ScheduledPost = {
  id: string;
  platform: Platform;
  caption: string;
  time: string; // HH:mm
  date: string; // yyyy-MM-dd
  status: PostStatus;
  engagement?: { likes: number; comments: number; shares: number };
};

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const shift = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return iso(d);
};

export const scheduledPosts: ScheduledPost[] = [
  { id: "p1", platform: "instagram", caption: "The Ethiopia Yirgacheffe just landed. Blueberry, jasmine, a finish like honey on toast. Available Saturday.", time: "08:30", date: shift(0), status: "auto" },
  { id: "p2", platform: "linkedin", caption: "Three years in: what running a specialty roaster taught me about slow product cycles.", time: "11:15", date: shift(0), status: "approval" },
  { id: "p3", platform: "x", caption: "Hot take: the espresso martini renaissance is actually good for coffee culture. Change my mind.", time: "16:45", date: shift(0), status: "posted", engagement: { likes: 412, comments: 38, shares: 27 } },
  { id: "p4", platform: "instagram", caption: "Behind the bar with Priya — 6am prep, one shot at a time.", time: "07:00", date: shift(1), status: "auto" },
  { id: "p5", platform: "threads", caption: "Kept a notebook of every drink we pulled this month. Here are the five that surprised us.", time: "13:00", date: shift(1), status: "approval" },
  { id: "p6", platform: "facebook", caption: "Saturday cupping is back — 12 seats, one origin, free coffee for anyone brave enough to guess the country.", time: "10:00", date: shift(2), status: "auto" },
  { id: "p7", platform: "instagram", caption: "New merch drop: the Origin Series tote. Undyed canvas, quiet gold thread.", time: "09:00", date: shift(3), status: "draft" },
  { id: "p8", platform: "linkedin", caption: "We're hiring a head of retail. Small team, big room to shape.", time: "14:30", date: shift(4), status: "auto" },
  { id: "p9", platform: "x", caption: "Reminder that overextraction tastes like regret.", time: "17:00", date: shift(5), status: "auto" },
  { id: "p10", platform: "instagram", caption: "Sunday matinée: latte art throwdown at the flagship. Winner gets a bag of anything on the shelf.", time: "11:30", date: shift(6), status: "approval" },
  { id: "p11", platform: "instagram", caption: "The Colombia Huila is back. Milk chocolate, orange peel, brown sugar finish.", time: "08:00", date: shift(8), status: "auto" },
  { id: "p12", platform: "pinterest", caption: "Fall menu moodboard — cardamom, oat, dark cherry.", time: "15:00", date: shift(9), status: "draft" },
  { id: "p13", platform: "youtube", caption: "How we cup a new lot — a 4-minute walkthrough from the roasting floor.", time: "12:00", date: shift(11), status: "auto" },
  { id: "p14", platform: "instagram", caption: "Farmer profile: Doña Elena, third-generation grower in Antigua.", time: "10:30", date: shift(14), status: "approval" },
];

export const pendingApprovals = scheduledPosts.filter((p) => p.status === "approval");

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

export const contentPillars = [
  { name: "Behind the bar", desc: "The people, the craft, the 6am prep." },
  { name: "Origin stories", desc: "Growers, farms, and the countries we work with." },
  { name: "Weekend rituals", desc: "Slow mornings, cupping days, latte art nights." },
  { name: "New arrivals", desc: "Roast drops, seasonal menus, merch." },
];

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

export const quickStats = {
  postsThisWeek: 13,
  engagementRate: 6.1,
  connectedPlatforms: 5,
  scheduled: 22,
};

export const weekStrip = () => {
  const days: { date: string; label: string; day: number; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = iso(d);
    days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      count: scheduledPosts.filter((p) => p.date === dateStr).length,
    });
  }
  return days;
};