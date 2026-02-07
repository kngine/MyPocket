import { useState, useEffect } from "react";
import { useArticles } from "@/hooks/use-articles";
import { ArticleCard } from "@/components/ArticleCard";
import { AddArticleDialog } from "@/components/AddArticleDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Archive, BookOpen, Loader2, List } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: articles, isLoading, error } = useArticles();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  // Sync tab from URL when navigating after delete (/?tab=all)
  useEffect(() => {
    const search = location.includes("?") ? location.slice(location.indexOf("?")) : "";
    const params = new URLSearchParams(search);
    if (params.get("tab") === "all") setActiveTab("all");
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading your reading list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">Could not load articles. Please try again later.</p>
        </div>
      </div>
    );
  }

  const unreadArticles = articles?.filter(a => !a.isRead && !a.archived) || [];
  const archivedArticles = articles?.filter(a => a.archived) || [];
  const allArticles = articles?.filter(a => !a.archived) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-primary/20">
              P
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">My Pocket</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/settings" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">My Pocket</h1>
            <p className="text-muted-foreground text-lg">
              {activeTab === 'unread' 
                ? `${unreadArticles.length} unread articles` 
                : activeTab === 'all'
                ? `${allArticles.length} articles`
                : `${archivedArticles.length} archived articles`}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full mb-8 inline-flex">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200"
            >
              <List className="w-4 h-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Unread
            </TabsTrigger>
            <TabsTrigger 
              value="archive" 
              className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="all" className="mt-0">
              {allArticles.length === 0 ? (
                <EmptyState type="all" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              {unreadArticles.length === 0 ? (
                <EmptyState type="unread" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unreadArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archive" className="mt-0">
              {archivedArticles.length === 0 ? (
                <EmptyState type="archive" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archivedArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <AddArticleDialog />
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'unread' | 'archive' | 'all' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
        {type === 'unread' ? (
          <BookOpen className="w-10 h-10 text-muted-foreground/50" />
        ) : type === 'all' ? (
          <List className="w-10 h-10 text-muted-foreground/50" />
        ) : (
          <Archive className="w-10 h-10 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        {type === 'unread' ? "You're all caught up!" : type === 'all' ? "No articles yet" : "Archive is empty"}
      </h3>
      <p className="text-muted-foreground max-w-sm">
        {type === 'unread' 
          ? "Add interesting articles to your list to read them later in a distraction-free view."
          : type === 'all'
          ? "Add your first article to get started."
          : "When you're done reading, archive articles to keep your main list clean."}
      </p>
    </div>
  );
}
