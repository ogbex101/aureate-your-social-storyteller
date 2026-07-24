import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./AuthProvider";
import type { Platform } from "./store";
import type { PostRow, PostStatusRow, PlatformConnectionRow, ProfileRow, AssetRow } from "./database.types";

const ASSET_BUCKET = "assets";

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

export function useLogoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["logo-url", path],
    queryFn: async (): Promise<string | null> => {
      const { data } = await supabase.storage.from(ASSET_BUCKET).createSignedUrl(path!, 3600);
      return data?.signedUrl ?? null;
    },
    enabled: !!path,
  });
}

export function useUploadLogo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not signed in");
      const path = `${user.id}/logo-${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(ASSET_BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("profiles").upsert({ id: user.id, logo_url: path });
      if (error) throw error;
      return path;
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
    mutationFn: async (posts: { platform: Platform; caption: string; status: PostStatusRow; auto_post: boolean; scheduled_time: string; asset_id?: string | null }[]) => {
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

export function useRejectPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").update({ status: "draft" }).eq("id", postId);
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

export type AssetWithUrl = AssetRow & { url: string | null };

export function useAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.id],
    queryFn: async (): Promise<AssetWithUrl[]> => {
      const { data, error } = await supabase.from("assets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as AssetRow[];
      if (rows.length === 0) return [];
      const { data: signed } = await supabase.storage.from(ASSET_BUCKET).createSignedUrls(rows.map((r) => r.storage_path), 3600);
      return rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? null }));
    },
    enabled: !!user,
  });
}

export function useUploadAsset() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not signed in");
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(ASSET_BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      const { data, error } = await supabase
        .from("assets")
        .insert({ user_id: user.id, storage_path: path, file_name: file.name, file_type: file.type, tags: [] })
        .select()
        .single();
      if (error) throw error;
      return data as AssetRow;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets", user?.id] }),
  });
}

export function useDeleteAsset() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: AssetRow) => {
      const { error: storageError } = await supabase.storage.from(ASSET_BUCKET).remove([asset.storage_path]);
      if (storageError) throw storageError;
      const { error } = await supabase.from("assets").delete().eq("id", asset.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets", user?.id] }),
  });
}

export function useUpdateAssetTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
      const { error } = await supabase.from("assets").update({ tags }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets", user?.id] }),
  });
}

export function useUpdateConnectionDetails() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ platform, handle, profile_url }: { platform: Platform; handle: string; profile_url: string }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("platform_connections").upsert(
        { user_id: user.id, platform, handle, profile_url },
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
