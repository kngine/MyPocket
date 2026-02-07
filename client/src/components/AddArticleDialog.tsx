import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateArticle } from "@/hooks/use-articles";

export function AddArticleDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const createArticle = useCreateArticle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    createArticle.mutate(
      { url, title, description: description || undefined, content: content || undefined, isRead: false },
      {
        onSuccess: () => {
          setOpen(false);
          setUrl("");
          setTitle("");
          setDescription("");
          setContent("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Save Article</DialogTitle>
          <DialogDescription>
            Enter the URL and details. Paste content if you want to save it for offline reading.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">Article URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-xl border-border/60 focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              placeholder="Interesting read..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-border/60 focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Brief summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-border/60 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">Content (optional)</Label>
            <Textarea
              id="content"
              placeholder="Paste article content here for offline reading..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl border-border/60 focus:ring-primary/20 min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full rounded-xl"
              disabled={createArticle.isPending}
            >
              {createArticle.isPending ? "Saving..." : "Save to List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
