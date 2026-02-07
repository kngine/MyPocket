import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ArticleResponse, type CreateArticleRequest, type UpdateArticleRequest, type BulkImportRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useArticles() {
  return useQuery({
    queryKey: [api.articles.list.path],
    queryFn: async () => {
      const res = await fetch(api.articles.list.path);
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
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
      const res = await fetch(api.articles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.articles.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create article");
      }
      return api.articles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({ title: "Saved!", description: "Article added to your list." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save article", 
        variant: "destructive" 
      });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateArticleRequest) => {
      const url = buildUrl(api.articles.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update article");
      return api.articles.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.articles.get.path, data.id] });
      
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
      const url = buildUrl(api.articles.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({ title: "Deleted", description: "Article removed from your list." });
    },
  });
}

export function useImportArticles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BulkImportRequest) => {
      const res = await fetch(api.articles.import.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.articles.import.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to import");
      }
      return api.articles.import.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({ 
        title: "Import Successful", 
        description: `Successfully imported ${data.count} articles.` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Import Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
