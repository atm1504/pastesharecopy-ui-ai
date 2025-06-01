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
  Save,
  Edit,
} from "lucide-react";
import { getSnippet, GetSnippetResponse, TimestampType } from "@/lib/api";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useTheme } from "@/hooks/useTheme";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

// Simple code display component as fallback
const SimpleCodeDisplay: React.FC<{
  code: string;
  language: string;
  isDarkMode: boolean;
}> = ({ code, language, isDarkMode }) => {
  return (
    <div
      className={`relative ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } rounded-lg overflow-hidden`}
    >
      <div
        className={`px-3 py-2 text-xs border-b ${
          isDarkMode
            ? "bg-gray-800 text-gray-300 border-gray-700"
            : "bg-gray-100 text-gray-600 border-gray-200"
        }`}
      >
        {language}
      </div>
      <pre
        className={`p-4 text-sm overflow-auto max-h-96 ${
          isDarkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

const SnippetView: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [snippet, setSnippet] = useState<GetSnippetResponse["snippet"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeEditorFailed, setCodeEditorFailed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp: TimestampType): string => {
    if (!timestamp) return "Unknown";

    try {
      let date: Date;

      // Handle Firestore timestamp format
      if (
        timestamp &&
        typeof timestamp === "object" &&
        "seconds" in timestamp
      ) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle ISO string format
      else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      }
      // Handle timestamp number
      else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      }
      // Handle Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Unknown";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown";
      }

      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return "Unknown";
    }
  };

  useEffect(() => {
    const loadSnippet = async () => {
      if (!shortUrl) {
        setError("Invalid snippet URL");
        setLoading(false);
        return;
      }

      try {
        console.log("Loading snippet for shortUrl:", shortUrl);
        const response = await getSnippet(shortUrl);
        console.log("Received snippet response:", response);

        if (response && response.snippet) {
          setSnippet(response.snippet);
          console.log("Snippet content:", response.snippet.content);
          console.log(
            "Snippet content length:",
            response.snippet.content?.length
          );
        } else {
          setError("No snippet data received");
        }
      } catch (err: unknown) {
        console.error("Error loading snippet:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load snippet";
        setError(errorMessage);
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

  // Function to handle edit button click
  const handleEditClick = () => {
    console.log("Edit button clicked", { snippet, user, shortUrl });

    if (!snippet) {
      console.error("No snippet data available for editing");
      toast({
        title: "Error",
        description: "Snippet data is not available for editing",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.error("User not authenticated");
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit this snippet",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Navigating to editor with edit state", {
        editMode: true,
        snippetId: snippet.id,
        shortUrl: shortUrl,
        code: snippet.content,
        language: snippet.language,
        title: snippet.title,
        expiresAt: snippet.expiresAt,
        isConfidential: snippet.isConfidential,
      });

      // Navigate to editor with the snippet data
      navigate("/", {
        state: {
          editMode: true,
          snippetId: snippet.id,
          shortUrl: shortUrl,
          code: snippet.content,
          language: snippet.language,
          title: snippet.title,
          expiresAt: snippet.expiresAt,
          isConfidential: snippet.isConfidential,
        },
        replace: false,
      });

      // Add success feedback
      toast({
        title: "Opening Editor",
        description: "Redirecting to editor with your snippet...",
      });
    } catch (error) {
      console.error("Error navigating to editor:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to open editor. Please try again.",
        variant: "destructive",
      });
    }
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
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold mb-2 break-words">
                {snippet.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <User className="h-4 w-4" />
                  <span className="truncate">{snippet.createdBy}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-4 w-4" />
                  {formatTimestamp(snippet.createdAt)}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Eye className="h-4 w-4" />
                  {snippet.viewCount} views
                </div>
                {snippet.expiresAt && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-4 w-4" />
                    Expires {formatTimestamp(snippet.expiresAt)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <Badge variant="secondary">{snippet.language}</Badge>
              {snippet.isConfidential && (
                <Badge variant="destructive">Confidential</Badge>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg">Code</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {/* Debug info in development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    User: {user ? "Authenticated" : "Anonymous"} | Snippet:{" "}
                    {snippet?.id ? "Loaded" : "Missing"}
                  </div>
                )}

                {/* Edit button with improved logic */}
                {user ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditClick}
                    className="flex-shrink-0"
                    disabled={!snippet || !snippet.id}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    title="Sign in to edit this snippet"
                    className="flex-shrink-0 opacity-50"
                    onClick={() => {
                      toast({
                        title: "Authentication Required",
                        description: "Please sign in to edit snippets",
                        variant: "destructive",
                      });
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit (Sign in required)
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      snippet.content,
                      "Code copied to clipboard!"
                    )
                  }
                  className="flex-shrink-0"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSnippet}
                  className="flex-shrink-0"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareSnippet}
                  className="flex-shrink-0"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {snippet.content ? (
                !codeEditorFailed ? (
                  <div
                    onError={() => {
                      console.warn(
                        "CodeEditor failed to render, falling back to simple display"
                      );
                      setCodeEditorFailed(true);
                    }}
                  >
                    <CodeEditor
                      value={snippet.content}
                      language={snippet.language}
                      readOnly
                      data-color-mode={isDarkMode ? "dark" : "light"}
                      padding={16}
                      style={{
                        fontSize: 14,
                        backgroundColor: isDarkMode ? "#1e1e2e" : "#ffffff",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        minHeight: "200px",
                        lineHeight: 1.5,
                      }}
                    />
                  </div>
                ) : (
                  <SimpleCodeDisplay
                    code={snippet.content}
                    language={snippet.language}
                    isDarkMode={isDarkMode}
                  />
                )
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No content available</p>
                  <p className="text-xs mt-2">
                    Content length: {snippet.content?.length || 0}
                  </p>
                </div>
              )}
            </div>

            {/* Debug info (remove in production) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-2 bg-muted rounded text-xs">
                <details>
                  <summary>Debug Info</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Content length:</strong>{" "}
                      {snippet.content?.length || 0}
                    </div>
                    <div>
                      <strong>Language:</strong> {snippet.language}
                    </div>
                    <div>
                      <strong>Code Editor Failed:</strong>{" "}
                      {codeEditorFailed ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Content preview:</strong>
                    </div>
                    <pre className="overflow-auto max-h-40 bg-gray-100 p-2 rounded text-xs">
                      {JSON.stringify(snippet, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <FooterSection />
    </div>
  );
};

export default SnippetView;
