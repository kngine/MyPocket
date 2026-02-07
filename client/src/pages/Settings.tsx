import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Upload, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@shared/routes";
import { apiUrl, isStandalone } from "@/lib/api";
import * as local from "@/lib/localArticles";
import { useImportArticles } from "@/hooks/use-articles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
  const importArticles = useImportArticles();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    window.location.href = apiUrl(api.articles.export.path);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      if (!Array.isArray(json)) throw new Error("File must contain an array of articles");
      // Normalize to insert shape (exported backup may include id, createdAt)
      const articles = json.map((a: Record<string, unknown>) => ({
        url: a.url,
        title: a.title,
        description: a.description ?? null,
        content: a.content ?? null,
        isRead: a.isRead ?? false,
        archived: a.archived ?? false,
        tags: Array.isArray(a.tags) ? a.tags : [],
      }));

      importArticles.mutate({ articles }, {
        onSuccess: () => {
          setImportStatus('success');
          // Reset file input
          e.target.value = '';
        },
        onError: () => {
          setImportStatus('error');
        }
      });
    } catch (err) {
      console.error(err);
      setImportStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-display font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Download className="w-5 h-5 text-primary" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download all your saved articles as a JSON file. Useful for backups or migrating to another device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <FileJson className="w-4 h-4" />
              Download JSON Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Upload className="w-5 h-5 text-primary" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore your articles from a JSON backup file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file-upload">Select JSON File</Label>
              <Input 
                id="file-upload" 
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                disabled={importArticles.isPending}
                className="cursor-pointer"
              />
            </div>

            {importArticles.isPending && (
              <p className="text-sm text-muted-foreground animate-pulse">Importing articles...</p>
            )}

            {importStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your articles have been imported successfully.
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to import file. Please ensure it is a valid JSON backup.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">
            My Pocket v1.0 • {isStandalone() ? "Data stored on this device" : "Connected to server"}
          </p>
        </div>
      </main>
    </div>
  );
}
