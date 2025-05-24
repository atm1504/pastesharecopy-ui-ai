import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Eye,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Download,
} from "lucide-react";
import { getSnippet, GetSnippetResponse } from "@/lib/api";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useTheme } from "@/hooks/useTheme";
import { format } from "date-fns";

const SnippetView: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const [snippet, setSnippet] = useState<GetSnippetResponse["snippet"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const loadSnippet = async () => {
      if (!shortUrl) {
        setError("Invalid snippet URL");
        setLoading(false);
        return;
      }

      try {
        const response = await getSnippet(shortUrl);
        setSnippet(response.snippet);
      } catch (err: any) {
        console.error("Error loading snippet:", err);
        setError(err.message || "Failed to load snippet");
      } finally {
        setLoading(false);
      }
    };

    loadSnippet();
  }, [shortUrl]);

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: message,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const shareSnippet = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: snippet?.title || "Code Snippet",
          text: "Check out this code snippet",
          url: url,
        });
      } else {
        await copyToClipboard(url, "Snippet URL copied to clipboard");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const downloadSnippet = () => {
    if (!snippet) return;

    const fileExtensions: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      jsx: "jsx",
      tsx: "tsx",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      css: "css",
      html: "html",
      json: "json",
      markdown: "md",
      yaml: "yml",
      xml: "xml",
      sql: "sql",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      kotlin: "kt",
      swift: "swift",
    };

    const extension = fileExtensions[snippet.language] || "txt";
    const filename = `snippet.${extension}`;

    const blob = new Blob([snippet.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading snippet...</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Snippet Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error ||
                "The requested snippet could not be found. It may have expired or been removed."}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Create New Snippet
              </Button>
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{snippet.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {snippet.createdBy}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(
                    new Date(snippet.createdAt?.seconds * 1000 || Date.now()),
                    "MMM d, yyyy"
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {snippet.viewCount} views
                </div>
                {snippet.expiresAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Expires{" "}
                    {format(
                      new Date(snippet.expiresAt.seconds * 1000),
                      "MMM d, yyyy"
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{snippet.language}</Badge>
              {snippet.isConfidential && (
                <Badge variant="destructive">Confidential</Badge>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      snippet.content,
                      "Code copied to clipboard!"
                    )
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadSnippet}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={shareSnippet}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <CodeEditor
                value={snippet.content}
                language={snippet.language}
                readOnly
                data-color-mode={isDarkMode ? "dark" : "light"}
                style={{
                  fontSize: 14,
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <FooterSection />
    </div>
  );
};

export default SnippetView;
