import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateArticle } from "@/hooks/use-articles";
import { isStandalone } from "@/lib/api";
import { extractContentFromUrl } from "@/lib/extractContent";

export function AddArticleDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const createArticle = useCreateArticle();
  const standalone = isStandalone();
  const isPending = createArticle.isPending || extracting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    let finalTitle = title;
    let finalDescription = description;
    let finalContent = content;

    if (standalone && (!content || content.length < 100)) {
      setExtracting(true);
      try {
        const extracted = await extractContentFromUrl(url);
        if (extracted) {
          if (!finalTitle || finalTitle === url) finalTitle = extracted.title;
          if (!finalDescription) finalDescription = extracted.description;
          if (!finalContent) finalContent = extracted.content;
        }
      } catch {
        // keep user-entered values
      } finally {
        setExtracting(false);
      }
    }

    createArticle.mutate(
      { url, title: finalTitle, description: finalDescription || undefined, content: finalContent || undefined, isRead: false },
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
            {standalone 
              ? "Enter the URL, title, and paste content (no automatic extraction in standalone mode)."
              : "Enter the URL and details. The server will try to extract content automatically."}
          </DialogDescription>
        </DialogHeader>
        {standalone && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Standalone mode:</strong> Content extraction requires a server. Please paste title and content manually.
            </AlertDescription>
          </Alert>
        )}
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
              placeholder="Paste if extraction fails or for full control..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl border-border/60 focus:ring-primary/20 min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full rounded-xl"
              disabled={isPending}
            >
              {extracting ? "Extracting..." : isPending ? "Saving..." : "Save to List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
