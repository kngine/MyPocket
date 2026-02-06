import { Article } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Archive, Trash2, ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUpdateArticle, useDeleteArticle } from "@/hooks/use-articles";
import { Link } from "wouter";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const domain = new URL(article.url).hostname.replace('www.', '');

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateArticle.mutate({ id: article.id, isRead: !article.isRead });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticle.mutate(article.id);
    }
  };

  return (
    <div className="group relative">
      <Link href={`/article/${article.id}`} className="block h-full">
        <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/40 hover:border-primary/20 overflow-hidden bg-card cursor-pointer rounded-2xl">
          <CardHeader className="p-0">
            {/* Decorative top bar or image placeholder could go here */}
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span className="text-primary">{domain}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <h3 className="text-xl font-bold font-display leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {article.description || "No description available. Click to read more..."}
            </p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center border-t border-border/30 bg-muted/5">
             <div className="flex gap-1">
               <Button
                 variant="ghost"
                 size="sm"
                 className={`h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary ${article.isRead ? 'text-green-600 bg-green-50' : ''}`}
                 onClick={handleArchive}
                 title={article.isRead ? "Unarchive" : "Archive"}
               >
                 {article.isRead ? <Check className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
               </Button>
               
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                 onClick={handleDelete}
                 title="Delete"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
             </div>

             <a 
               href={article.url} 
               target="_blank" 
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
             >
               Original <ExternalLink className="w-3 h-3" />
             </a>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}
