import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateArticleRequest, type UpdateArticleRequest, type BulkImportRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, isStandalone } from "@/lib/api";
import * as local from "@/lib/localArticles";

const LIST_KEY = ["articles"] as const;
const getKey = (id: number) => ["articles", id] as const;

export function useArticles() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async () => {
      if (isStandalone()) return local.getArticles();
      const res = await fetch(apiUrl(api.articles.list.path));
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: getKey(id),
    enabled: !!id,
    queryFn: async () => {
      if (isStandalone()) return local.getArticle(id);
      const url = apiUrl(buildUrl(api.articles.get.path, { id }));
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch article");
      return api.articles.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateArticleRequest) => {
      if (isStandalone()) return local.createArticle(data);
      const res = await fetch(apiUrl(api.articles.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.articles.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create article");
      }
      return api.articles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toast({ title: "Saved!", description: "Article added to your list." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateArticleRequest) => {
      if (isStandalone()) return local.updateArticle(id, updates);
      const url = apiUrl(buildUrl(api.articles.update.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update article");
      return api.articles.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: getKey(data.id) });
      if (data.archived) {
        toast({ title: "Archived", description: "Article moved to archive." });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update article", variant: "destructive" });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      if (isStandalone()) return local.deleteArticle(id);
      const url = apiUrl(buildUrl(api.articles.delete.path, { id }));
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toast({ title: "Deleted", description: "Article removed from your list." });
    },
  });
}

export function useImportArticles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BulkImportRequest) => {
      if (isStandalone()) return local.importArticles(data.articles);
      const res = await fetch(apiUrl(api.articles.import.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.articles.import.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to import");
      }
      return api.articles.import.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.count} articles.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
