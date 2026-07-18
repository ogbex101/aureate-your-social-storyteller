import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./AuthProvider";
import type { Platform } from "./store";
import type { PostRow, PostStatusRow, PlatformConnectionRow, ProfileRow } from "./database.types";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
    enabled: !!user,
  });
}

export function useUpsertProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}

export function usePosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["posts", user?.id],
    queryFn: async (): Promise<PostRow[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("scheduled_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
    enabled: !!user,
  });
}

export function useCreatePosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (posts: { platform: Platform; caption: string; status: PostStatusRow; auto_post: boolean; scheduled_time: string }[]) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("posts").insert(posts.map((p) => ({ ...p, user_id: user.id })));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", user?.id] }),
  });
}

export function useApprovePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").update({ status: "scheduled" }).eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", user?.id] }),
  });
}

export function useConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    queryFn: async (): Promise<PlatformConnectionRow[]> => {
      const { data, error } = await supabase.from("platform_connections").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as PlatformConnectionRow[];
    },
    enabled: !!user,
  });
}

export function useSetConnections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platforms: Platform[]) => {
      if (!user) throw new Error("Not signed in");
      if (platforms.length === 0) return;
      const { error } = await supabase.from("platform_connections").upsert(
        platforms.map((platform) => ({
          user_id: user.id,
          platform,
          status: "connected" as const,
          connected_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,platform" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections", user?.id] }),
  });
}

export function useToggleConnection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ platform, connect }: { platform: Platform; connect: boolean }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("platform_connections").upsert(
        {
          user_id: user.id,
          platform,
          status: connect ? "connected" : "disconnected",
          connected_at: connect ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,platform" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections", user?.id] }),
  });
}
