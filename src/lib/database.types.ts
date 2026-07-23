// Hand-written row types (no `supabase gen types` access in this environment —
// that requires a linked Supabase CLI project). Keep in sync with
// supabase/migrations/20260718000000_init_schema.sql.

export type PlatformRow = "instagram" | "facebook" | "linkedin" | "tiktok" | "x" | "pinterest" | "youtube" | "threads";
export type PostStatusRow = "draft" | "pending_approval" | "approved" | "scheduled" | "posted" | "failed";
export type ConnectionStatusRow = "connected" | "disconnected";
export type TeamRoleRow = "drafter" | "approver";
export type ApprovalStatusRow = "pending" | "approved" | "rejected";

export type ProfileRow = {
  id: string;
  account_type: "individual" | "organization";
  brand_name: string;
  tone_words: string[];
  writing_sample: string;
  content_pillars: { name: string; desc: string }[];
  logo_url: string | null;
  phone_number: string | null;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformConnectionRow = {
  id: string;
  user_id: string;
  platform: PlatformRow;
  status: ConnectionStatusRow;
  access_token: string | null;
  refresh_token: string | null;
  connected_at: string | null;
  handle: string | null;
  profile_url: string | null;
};

export type AssetRow = {
  id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_type: string | null;
  tags: string[];
  created_at: string;
};

export type PostRow = {
  id: string;
  user_id: string;
  asset_id: string | null;
  platform: PlatformRow;
  caption: string;
  status: PostStatusRow;
  auto_post: boolean;
  scheduled_time: string | null;
  engagement: { likes: number; comments: number; shares: number } | null;
  created_at: string;
  updated_at: string;
};

export type TeamMemberRow = {
  id: string;
  owner_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: TeamRoleRow;
  created_at: string;
};

export type ApprovalRequestRow = {
  id: string;
  post_id: string;
  requested_by: string;
  approver_id: string | null;
  status: ApprovalStatusRow;
  created_at: string;
  resolved_at: string | null;
};
