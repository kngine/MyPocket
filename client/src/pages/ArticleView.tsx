import { useRoute, Link } from "wouter";
import { useArticle, useUpdateArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Share2, Globe, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ArticleView() {
  const [match, params] = useRoute("/article/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: article, isLoading } = useArticle(id);
  const updateArticle = useUpdateArticle();
  const { toast } = useToast();

  if (isLoading) return <LoadingView />;
  if (!article) return <NotFoundView />;

  const handleArchive = () => {
    updateArticle.mutate({ id: article.id, isRead: !article.isRead });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    toast({ title: "Copied", description: "Link copied to clipboard" });
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
              variant={article.isRead ? "secondary" : "default"}
              size="sm" 
              onClick={handleArchive}
              className={`gap-2 ${article.isRead ? 'text-green-600 bg-green-50' : 'bg-primary text-white'}`}
            >
              <Check className="w-4 h-4" />
              {article.isRead ? "Archived" : "Mark as Read"}
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
                We couldn't extract the full content for this article automatically.
              </p>
              <Button asChild variant="outline">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read on Original Site <Globe className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </article>
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
