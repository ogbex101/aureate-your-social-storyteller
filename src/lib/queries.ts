import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./AuthProvider";
import type { Platform } from "./store";
import type { PostRow, PostStatusRow, PlatformConnectionRow } from "./database.types";

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
