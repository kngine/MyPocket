import { useRoute, Link, useLocation } from "wouter";
import { useArticle, useUpdateArticle, useDeleteArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Share2, Globe, Clock, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ArticleView() {
  const [match, params] = useRoute("/article/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: article, isLoading } = useArticle(id);
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Mark as read when article is opened (persisted via API)
  useEffect(() => {
    if (article && !article.isRead) {
      updateArticle.mutate({ id: article.id, isRead: true });
    }
  }, [article?.id, article?.isRead]);

  if (isLoading) return <LoadingView />;
  if (!article) return <NotFoundView />;

  const handleArchive = () => {
    updateArticle.mutate({ id: article.id, isRead: !article.isRead });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    toast({ title: "Copied", description: "Link copied to clipboard" });
  };

  const handleEditContent = () => {
    setEditContent(article.content || "");
    setEditOpen(true);
  };

  const handleSaveContent = () => {
    updateArticle.mutate(
      { id: article.id, content: editContent },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast({ title: "Saved", description: "Article content updated." });
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticle.mutate(article.id, {
        onSuccess: () => setLocation("/?tab=all"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete}
              title="Delete"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEditContent}
              title="Edit Content"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              title="Copy Link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" title="Open Original">
                <Globe className="w-4 h-4" />
              </Button>
            </a>
            <Button 
              variant={article.archived ? "secondary" : "default"}
              size="sm" 
              onClick={handleArchive}
              className={`gap-2 ${article.archived ? 'text-green-600 bg-green-50' : 'bg-primary text-white'}`}
            >
              <Check className="w-4 h-4" />
              {article.archived ? "Archived" : article.isRead ? "Archive" : "Mark as Read"}
            </Button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {new URL(article.url).hostname.replace('www.', '')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(article.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
        </header>

        <div className="article-content max-w-none prose prose-lg prose-slate dark:prose-invert mx-auto">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50 p-8">
              <p className="text-muted-foreground mb-4">
                No content saved yet. Add content manually or read on the original site.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleEditContent}>
                  <Edit className="mr-2 w-4 h-4" /> Add Content
                </Button>
                <Button asChild variant="outline">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Original <Globe className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Edit Content Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article Content</DialogTitle>
            <DialogDescription>
              Paste or edit the article content for offline reading.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Paste article content here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent} disabled={updateArticle.isPending}>
              {updateArticle.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Skeleton className="h-8 w-24 mb-8" />
      <Skeleton className="h-12 w-3/4 mb-4 mx-auto" />
      <Skeleton className="h-12 w-1/2 mb-12 mx-auto" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Article not found</h1>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
