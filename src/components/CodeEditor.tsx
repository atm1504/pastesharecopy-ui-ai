import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Copy,
  Download,
  Link as LinkIcon,
  Lock,
  Share2,
  ExternalLink,
  Eye,
  FileText,
  Save,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { createSnippet, CreateSnippetRequest, updateSnippet, getSnippet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useLocation } from "react-router-dom";

// Import light theme for hljs
import "highlight.js/styles/github.css";

const formSchema = z.object({
  expiration: z.string().min(1),
  isPasswordProtected: z.boolean().default(false),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Sample code for different languages
const languageSamples = {
  javascript: `function greet(name) {
  const message = 'Hello, ' + name + '!';
  console.log(message);
  return message;
}

// Call the greeting function
greet('World');`,

  typescript: `function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

// Call the greeting function
greet('World');`,

  python: `def greet(name):
    message = f"Hello, {name}!"
    print(message)
    return message

# Call the greeting function
greet("World")`,

  jsx: `import React from 'react';

const Greeting = ({ name }) => {
  const message = \`Hello, \${name}!\`;
  
  return (
    <div className="greeting">
      <h1>{message}</h1>
      <p>Welcome to our application.</p>
    </div>
  );
};

export default Greeting;`,

  tsx: `import React from 'react';

interface GreetingProps {
  name: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  const message = \`Hello, \${name}!\`;
  
  return (
    <div className="greeting">
      <h1>{message}</h1>
      <p>Welcome to our application.</p>
    </div>
  );
};

export default Greeting;`,

  css: `/* Modern card component */
.card {
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333333;
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <nav>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <p>This is a sample HTML page.</p>
  </main>
</body>
</html>`,

  json: `{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "roles": ["user", "editor"]
  },
  "settings": {
    "language": "en",
    "timezone": "UTC-5"
  }
}`,

  markdown: `# Getting Started with Markdown

## Introduction

Markdown is a lightweight markup language with plain-text formatting syntax.
Its design allows it to be converted to many output formats, but the original
tool by the same name only supports HTML.

## Basic Syntax

### Headers

# H1
## H2
### H3

### Emphasis

*italic* or _italic_
**bold** or __bold__
**_bold and italic_**

### Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item
  - Nested item
  - Another nested item`,

  java: `public class HelloWorld {
    public static void main(String[] args) {
        String name = "World";
        String message = "Hello, " + name + "!";
        System.out.println(message);
    }
}`,

  go: `package main

import "fmt"

func greet(name string) string {
    message := fmt.Sprintf("Hello, %s!", name)
    fmt.Println(message)
    return message
}

func main() {
    greet("World")
}`,

  rust: `fn greet(name: &str) -> String {
    let message = format!("Hello, {}!", name);
    println!("{}", message);
    message
}

fn main() {
    greet("World");
}`,

  ruby: `def greet(name)
  message = "Hello, #{name}!"
  puts message
  return message
end

# Call the greeting function
greet("World")`,

  php: `<?php
function greet($name) {
    $message = "Hello, " . $name . "!";
    echo $message;
    return $message;
}

// Call the greeting function
greet("World");
?>`,

  swift: `func greet(name: String) -> String {
    let message = "Hello, \\(name)!"
    print(message)
    return message
}

// Call the greeting function
greet(name: "World")`,

  csharp: `using System;

class Program {
    static string Greet(string name) {
        string message = $"Hello, {name}!";
        Console.WriteLine(message);
        return message;
    }

    static void Main() {
        Greet("World");
    }
}`,

  sql: `-- Create a table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (username, email) VALUES 
('johndoe', 'john@example.com'),
('janedoe', 'jane@example.com');

-- Query data
SELECT * FROM users WHERE email LIKE '%@example.com';`,
};

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "jsx", label: "React JSX" },
  { value: "tsx", label: "React TSX" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "csharp", label: "C#" },
  { value: "sql", label: "SQL" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "dart", label: "Dart" },
  { value: "kotlin", label: "Kotlin" },
  { value: "scala", label: "Scala" },
  { value: "haskell", label: "Haskell" },
  { value: "bash", label: "Bash" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "graphql", label: "GraphQL" },
  { value: "r", label: "R" },
  { value: "powershell", label: "PowerShell" },
];

// AI services configuration type
interface AIService {
  id: string;
  name: string;
  url: string;
  waitBeforeOpen?: boolean;
  inputSelector?: string;
  setupScript?: () => void;
}

// AI services to directly paste to
const aiServices: AIService[] = [
  { 
    id: "gpt", 
    name: "ChatGPT", 
    url: "https://chat.openai.com/chat",
    waitBeforeOpen: true,
    inputSelector: 'textarea[placeholder*="Send a message"]'
  },
  { 
    id: "claude", 
    name: "Claude", 
    url: "https://claude.ai/chats",
    waitBeforeOpen: true,
    inputSelector: '[role="textbox"], .ProseMirror, [contenteditable="true"]',
    setupScript: () => {
      // Claude specific setup - try to focus and trigger input events
      const input = document.querySelector('[role="textbox"], .ProseMirror, [contenteditable="true"]') as HTMLElement;
      if (input) {
        input.focus();
        input.click();
        // Trigger input events to ensure Claude recognizes the paste
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  { 
    id: "deepseek", 
    name: "DeepSeek", 
    url: "https://chat.deepseek.com/",
    inputSelector: 'textarea'
  },
  { 
    id: "grok", 
    name: "Grok", 
    url: "https://grok.x.ai/",
    inputSelector: 'textarea, [contenteditable="true"]'
  },
];

// Statistics for this paste (would be fetched from backend in real app)
const pasteStats = {
  views: 0,
  created: new Date().toISOString(),
  expiresAt: null,
};

// Code validation helper functions
const validateCode = (
  code: string,
  language: string
): { isValid: boolean; error?: string } => {
  // Simple validation for various languages
  try {
    switch (language) {
      case "javascript":
        // Basic JS validation by attempting to parse
        new Function(code);
        return { isValid: true };

      case "typescript":
        // For TypeScript, we can do a basic syntax check
        // But we'll skip type-checking as it would require a full TS compiler
        try {
          new Function(code.replace(/:\s*\w+/g, "")); // Remove type annotations
          return { isValid: true };
        } catch (e) {
          return {
            isValid: false,
            error: e instanceof Error ? e.message : "Invalid TypeScript syntax",
          };
        }

      case "jsx":
      case "tsx":
        // For JSX/TSX, we need to handle the special syntax
        // We'll do a basic check for balanced tags and other common issues
        try {
          // Check for balanced JSX tags (basic check)
          const jsxTagsOpen = (code.match(/<[a-zA-Z][^<>]*>/g) || []).length;
          const jsxTagsClose = (code.match(/<\/[a-zA-Z][^<>]*>/g) || []).length;

          if (jsxTagsOpen !== jsxTagsClose) {
            return { isValid: false, error: "Unbalanced JSX tags" };
          }

          // Remove JSX syntax and try to evaluate as regular JS
          const jsxRemoved = code
            .replace(/<[^>]*>/g, '"JSX_ELEMENT"') // Replace JSX tags with strings
            .replace(/import\s+.*?from\s+['"].*?['"]/g, "") // Remove import statements
            .replace(/export\s+default\s+/g, "") // Remove export default
            .replace(/\/\/.*$/gm, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments

          // Only try to parse if there's actual code left after removing JSX
          if (jsxRemoved.trim().length > 0) {
            try {
              new Function(jsxRemoved);
            } catch (error) {
              // Even if this fails, JSX could still be valid, so we'll just warn
              return {
                isValid: true,
                error:
                  "JSX syntax looks valid, but there might be other issues",
              };
            }
          }

          return { isValid: true };
        } catch (error) {
          return {
            isValid: false,
            error:
              error instanceof Error ? error.message : "Invalid JSX syntax",
          };
        }

      case "json":
        // JSON validation
        JSON.parse(code);
        return { isValid: true };

      case "html":
        // Basic HTML validation (very simple check)
        if (code.includes("<html") && !code.includes("</html>")) {
          return { isValid: false, error: "Missing closing HTML tag" };
        }
        return { isValid: true };

      case "css": {
        // Basic CSS validation (checking for matching braces and semicolons)
        if (
          (code.match(/{/g) || []).length !== (code.match(/}/g) || []).length
        ) {
          return { isValid: false, error: "Mismatched braces in CSS" };
        }

        // Check for property declarations without semicolons (simplified)
        const cssPropertyRegex = /([a-z-]+)\s*:\s*[^;{}]+(?=[}])/g;
        const missingSemicolons = code.match(cssPropertyRegex);

        if (missingSemicolons && missingSemicolons.length > 0) {
          return {
            isValid: false,
            error: "Missing semicolons in some CSS properties",
          };
        }

        return { isValid: true };
      }

      default:
        // For other languages, just return valid as we don't have simple validators
        return { isValid: true };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Custom hook for dark mode detection
const useIsDarkMode = () => {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if it's dark mode based on theme setting
    const dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(dark);

    // Add listener for system theme changes if using system setting
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return isDarkMode;
};

// Calculate consistent heights for editor and preview
const EDITOR_HEIGHT = "71vh";
const CONTENT_HEIGHT = "66vh"; // Slightly smaller to account for header

// Preview renderer based on language - takes isDarkMode as a parameter
const renderPreview = (
  code: string,
  language: string,
  validation: { isValid: boolean; error?: string },
  isDarkMode: boolean
) => {
  if (!code) return null;

  let sanitizedHtml = "";
  let formattedJson = "";
  let highlightedCode = "";

  // Use appropriate highlight.js theme based on mode
  document.documentElement.classList.toggle("light-code", !isDarkMode);
  document.documentElement.classList.toggle("dark-code", isDarkMode);

  switch (language) {
    case "markdown":
      // Render markdown using react-markdown with plugins
      try {
        return (
          <div className="markdown-preview h-full">
            <div className="border-b border-border mb-4 pb-2 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center">
                <FileText size={12} className="mr-1.5" /> Markdown Preview
              </span>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>

            <div
              style={{
                backgroundColor: isDarkMode ? "#1e1e2d" : "#fcfcfc",
                height: CONTENT_HEIGHT,
              }}
              className={`p-4 rounded shadow-sm overflow-auto ${
                !isDarkMode ? "border border-gray-200" : ""
              }`}
            >
              <div
                className={`${
                  isDarkMode ? "prose-invert" : "prose"
                } prose prose-headings:mt-4 prose-headings:mb-3 prose-p:my-2 prose-a:no-underline hover:prose-a:underline prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:p-4 prose-li:my-1 max-w-none ${
                  isDarkMode
                    ? "prose-a:text-indigo-400 prose-code:bg-black/30 prose-code:text-pink-300 prose-pre:bg-[#0d0d17]"
                    : "prose-a:text-indigo-600 prose-code:bg-gray-100 prose-code:text-violet-700 prose-pre:bg-gray-100 prose-headings:text-gray-900 prose-p:text-gray-700"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {code}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/30">
            <div className="font-semibold mb-1">Error rendering Markdown:</div>
            <div className="text-sm font-mono">{String(error)}</div>
          </div>
        );
      }

    case "html":
      // Render HTML with sanitization
      try {
        sanitizedHtml = DOMPurify.sanitize(code);
        return (
          <div className="html-preview h-full">
            <div className="border-b border-border mb-4 pb-2 text-xs text-muted-foreground flex justify-between items-center">
              <span>HTML Preview (sanitized)</span>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>
            <div
              className={`html-render border p-4 bg-white text-black rounded shadow-md overflow-auto ${
                !isDarkMode && "border-gray-200"
              }`}
              style={{ height: CONTENT_HEIGHT }}
            >
              {parse(sanitizedHtml)}
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-500">
            Error rendering HTML: {String(error)}
          </div>
        );
      }

    case "css":
      // CSS preview with live styling
      try {
        // Generate a few sample elements to demonstrate the CSS
        const sampleHtml = `
          <div class="css-preview-container">
            <div class="sample-element sample-box">Box Element</div>
            <div class="sample-element sample-text">Text Element</div>
            <div class="sample-element sample-btn">Button Element</div>
            <div class="sample-element sample-card">
              <div class="card-header">Card Header</div>
              <div class="card-body">Card content goes here</div>
            </div>
          </div>
        `;

        return (
          <div className="css-preview h-full">
            <div className="border-b border-border mb-4 pb-2 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center">
                <FileText size={12} className="mr-1.5" /> CSS Preview
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  validation.isValid
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {validation.isValid ? "Valid CSS" : "CSS Errors"}
              </span>
            </div>

            <div
              className="flex flex-col bg-white text-black p-6 rounded overflow-auto border shadow-sm"
              style={{ height: CONTENT_HEIGHT }}
            >
              <div className="text-xs text-gray-600 mb-4 border-b border-gray-200 pb-2">
                <Eye size={12} className="mr-1.5 inline-block" /> Visual Preview
              </div>
              <style dangerouslySetInnerHTML={{ __html: code }} />
              <div dangerouslySetInnerHTML={{ __html: sampleHtml }} />
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/30">
            <div className="font-semibold mb-1">Error rendering CSS:</div>
            <div className="text-sm font-mono">{String(error)}</div>
          </div>
        );
      }

    case "json":
      // Pretty-print JSON
      try {
        formattedJson = JSON.stringify(JSON.parse(code), null, 2);
        // Use highlight.js for JSON syntax highlighting
        const highlightedJson = hljs.highlight(formattedJson, {
          language: "json",
        }).value;

        return (
          <div className="json-preview h-full">
            <div className="border-b border-border mb-4 pb-2 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center">
                <FileText size={12} className="mr-1.5" /> Formatted JSON
              </span>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                Validated
              </span>
            </div>
            <pre
              className={`font-mono text-sm overflow-auto p-4 rounded ${
                isDarkMode
                  ? "bg-[#1e1e2d] text-white"
                  : "bg-[#fcfcfc] text-[#333333] border border-gray-200"
              }`}
              style={{ height: CONTENT_HEIGHT }}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightedJson,
                }}
                className="language-json hljs"
              />
            </pre>
          </div>
        );
      } catch (error) {
        return (
          <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/30">
            <div className="font-semibold mb-1">Error formatting JSON:</div>
            <div className="text-sm font-mono">{String(error)}</div>
          </div>
        );
      }

    default:
      // For other languages, use syntax highlighting
      try {
        highlightedCode = language
          ? hljs.highlight(code, { language: language }).value
          : hljs.highlightAuto(code).value;

        const languageLabel =
          languageOptions.find((l) => l.value === language)?.label || language;

        return (
          <div className="code-preview h-full">
            <div className="border-b border-border mb-4 pb-2 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center">
                <FileText size={12} className="mr-1.5" /> {languageLabel} Syntax
                Highlighting
              </span>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">
                {validation.isValid ? "Valid Syntax" : "Syntax Error"}
              </span>
            </div>
            <pre
              className={`font-mono text-sm overflow-auto p-4 rounded ${
                isDarkMode
                  ? "bg-[#1e1e2d] text-white"
                  : "bg-[#fcfcfc] text-[#333333] border border-gray-200"
              }`}
              style={{ height: CONTENT_HEIGHT }}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightedCode,
                }}
                className={`language-${language} hljs`}
              />
            </pre>
          </div>
        );
      } catch (error) {
        // Fallback to regular code display
        return (
          <pre
            className={`font-mono text-sm overflow-auto p-4 rounded ${
              isDarkMode
                ? "bg-[#1e1e2d] text-white"
                : "bg-[#fcfcfc] text-[#333333] border border-gray-200"
            }`}
            style={{ height: CONTENT_HEIGHT }}
          >
            <code>{code}</code>
          </pre>
        );
      }
  }
};

const PasteCodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [snippetId, setSnippetId] = useState<string | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({
    isValid: true,
  });
  const [remainingLinks, setRemainingLinks] = useState<number | null>(null);

  const isDarkMode = useIsDarkMode();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const location = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expiration: "2d",
      isPasswordProtected: false,
      password: "",
    },
  });

  // Track if user has edited the code
  const userHasEditedCode = useRef(false);

  // Set sample code when language changes, but not when user intentionally clears the editor
  useEffect(() => {
    // Only set sample code if the code is empty and it's the initial load
    // or if the current code is from another language sample (from the samples dictionary)
    const isCurrentCodeASample = Object.values(languageSamples).includes(code);
    const isEmptyEditor = code === "";

    if ((isEmptyEditor && !userHasEditedCode.current) || isCurrentCodeASample) {
      const sample =
        languageSamples[language as keyof typeof languageSamples] || "";
      setCode(sample);
    }
  }, [language, code]);

  // Add validation when code changes
  useEffect(() => {
    if (code.trim()) {
      const result = validateCode(code, language);
      setValidation(result);
    } else {
      setValidation({ isValid: true });
    }
  }, [code, language]);

  // Update remaining links when profile changes
  useEffect(() => {
    if (profile) {
      setRemainingLinks(profile.availableLinks);
    }
  }, [profile]);

  // Handle edit mode from snippet view
  useEffect(() => {
    const state = location.state as { editMode: boolean; snippetId: string; code: string; language: string } | null;
    if (state?.editMode) {
      setIsEditing(true);
      setSnippetId(state.snippetId);
      setCode(state.code);
      setLanguage(state.language);
      // Clear the location state to avoid re-applying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    userHasEditedCode.current = true;
    setCode(e.target.value);
  };

  const handleGenerateLink = async (values: FormValues) => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please add some code before generating a link.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingLink(true);

    try {
      const snippetData: CreateSnippetRequest = {
        code: code,
        language: language,
        title: `${language} snippet`, // You could make this configurable
        expiration: values.expiration,
        isConfidential: false, // For now, no confidential snippets in free version
      };

      const result = await createSnippet(snippetData);
      
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/${result.shortUrl}`;
      setGeneratedLink(fullUrl);
      setRemainingLinks(result.remainingLinks);

      toast({
        title: "Link generated successfully!",
        description: `Your code snippet is now shareable. ${
          result.remainingLinks >= 0
            ? `You have ${result.remainingLinks} snippets remaining.`
            : "You have unlimited snippets."
        }`,
      });
    } catch (error) {
      console.error("Error generating link:", error);

      // Handle specific error cases
      if (error.message.includes("snippet limit")) {
        toast({
          title: "Snippet Limit Reached",
          description:
            "You've reached your snippet limit. Upgrade to premium for unlimited snippets!",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Redirect to premium page
                window.location.href = "/premium";
              }}
            >
              Upgrade
            </Button>
          ),
        });
      } else if (error.message.includes("Confidential snippets")) {
        toast({
          title: "Premium Feature",
          description:
            "Confidential snippets are only available for premium users.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error generating link",
          description: error.message || "Please try again in a moment.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

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

  const shareLink = async () => {
    if (!generatedLink) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Code shared via pastesharecopy",
          text: "Check out this code snippet I shared",
          url: generatedLink,
        });
      } else {
        await copyToClipboard(
          generatedLink,
          "Link copied to clipboard as sharing is not supported on this browser"
        );
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleAIPaste = async (service: AIService) => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(code);
      
      toast({
        title: `Opening ${service.name}...`,
        description: "Attempting automatic paste",
      });

      // Function to attempt automatic paste
      const attemptAutoPaste = async (targetWindow: Window) => {
        try {
          // Wait for the input element to be available
          const maxAttempts = 10;
          let attempts = 0;
          
          const tryPaste = async () => {
            if (attempts >= maxAttempts) return false;
            attempts++;

            try {
              // Try to find the input element using the service-specific selector
              const input = service.inputSelector 
                ? targetWindow.document.querySelector(service.inputSelector)
                : targetWindow.document.querySelector('textarea, [contenteditable="true"]');

              if (!input) {
                // If input not found, wait and retry
                await new Promise(resolve => setTimeout(resolve, 500));
                return await tryPaste();
              }

              // Run any service-specific setup
              if (service.setupScript) {
                service.setupScript.call(targetWindow.document);
              }

              // Focus the input
              (input as HTMLElement).focus();
              
              // Try multiple paste methods
              const pasteMethods = [
                // Method 1: execCommand
                () => document.execCommand('paste'),
                
                // Method 2: Clipboard API
                async () => {
                  const text = await navigator.clipboard.readText();
                  if (input instanceof HTMLTextAreaElement) {
                    input.value = text;
                  } else {
                    input.textContent = text;
                  }
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                },
                
                // Method 3: Keyboard simulation
                () => {
                  const isMac = navigator.platform.includes('Mac');
                  input.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'v',
                    code: 'KeyV',
                    ctrlKey: !isMac,
                    metaKey: isMac,
                    bubbles: true
                  }));
                }
              ];

              // Try each paste method until one works
              for (const method of pasteMethods) {
                try {
                  await method();
                  // Check if paste was successful
                  if (input instanceof HTMLTextAreaElement && input.value.length > 0) {
                    return true;
                  } else if (input.textContent && input.textContent.length > 0) {
                    return true;
                  }
                } catch (e) {
                  console.warn('Paste method failed:', e);
                  continue;
                }
              }

              // If we got here, none of the methods worked
              return false;
            } catch (err) {
              console.warn('Paste attempt failed:', err);
              await new Promise(resolve => setTimeout(resolve, 500));
              return await tryPaste();
            }
          };

          return await tryPaste();
        } catch (err) {
          console.error('Auto-paste attempt failed:', err);
          return false;
        }
      };

      // Function to open the AI service
      const openAIService = async () => {
        const targetUrl = service.url;
        const aiWindow = window.open(targetUrl, "_blank");
        
        if (!aiWindow) {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups and try again, or open the service manually",
            variant: "destructive",
          });
          return;
        }

        // Wait for window to load
        try {
          aiWindow.onload = async () => {
            // Give extra time for the UI to be fully ready
            await new Promise(resolve => setTimeout(resolve, service.id === 'claude' ? 2000 : 1000));
            
            // Attempt automatic paste
            const success = await attemptAutoPaste(aiWindow);
            
            if (success) {
              toast({
                title: "Success!",
                description: "Code automatically pasted",
              });
            } else {
              // Fallback to manual paste
              toast({
                description: `Please paste manually (${navigator.platform.includes('Mac') ? '⌘+V' : 'Ctrl+V'})`,
              });
            }
          };
        } catch (err) {
          console.error('Error during auto-paste:', err);
          // Fallback to manual paste
          toast({
            description: `Please paste manually (${navigator.platform.includes('Mac') ? '⌘+V' : 'Ctrl+V'})`,
          });
        }
      };

      // Add a small delay for services that need it
      if (service.waitBeforeOpen) {
        setTimeout(openAIService, 500);
      } else {
        openAIService();
      }
    } catch (err) {
      console.error("Error handling AI paste:", err);
      toast({
        title: "Failed to copy code",
        description: "Please try copying manually",
        variant: "destructive",
      });
    }
  };

  // Function to handle snippet updates
  const handleUpdateSnippet = async () => {
    if (!snippetId || !code.trim() || !user) {
      return;
    }

    try {
      const result = await updateSnippet({
        snippetId,
        code,
        language,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Snippet updated successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error updating snippet",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  // Function to load a snippet for editing
  const loadSnippetForEdit = async (shortUrl: string) => {
    try {
      const result = await getSnippet(shortUrl);
      if (result.success) {
        setCode(result.snippet.content);
        setLanguage(result.snippet.language);
        setSnippetId(result.snippet.id);
        setIsEditing(true);
      }
    } catch (err) {
      toast({
        title: "Error loading snippet",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  // Check if current user can edit
  const canEdit = user && snippetId;

  return (
    <div className="space-y-4">
      <div className="w-full mx-auto">
        <Tabs
          defaultValue="editor"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between mb-1">
            <TabsList className="h-10">
              <TabsTrigger value="editor" className="text-sm">
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-sm">
                Preview
              </TabsTrigger>
            </TabsList>

            <h1 className="text-xl font-bold text-center bg-gradient-to-r from-primary via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
              Start Sharing Your Code
            </h1>

            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Languages</SelectLabel>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border rounded-lg shadow-sm overflow-hidden mb-2">
            <TabsContent value="editor" className="mt-0">
              <div className="h-[71vh] flex flex-col">
                <div className="code-header flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{language}</span>
                    {/* Show validation status */}
                    {code.trim() && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          validation.isValid
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {validation.isValid ? "Valid" : "Invalid"}
                      </span>
                    )}
                    {!validation.isValid && (
                      <span className="text-xs text-red-400">
                        {validation.error}
                      </span>
                    )}
                    {isEditing && (
                      <Button
                        onClick={handleUpdateSnippet}
                        disabled={!canEdit}
                        variant="outline"
                        className="gap-2 ml-2"
                        size="sm"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    )}
                    {!user && isEditing && (
                      <div className="text-sm text-muted-foreground ml-2">
                        Sign in to edit this snippet
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {aiServices.map((service) => (
                      <TooltipProvider key={service.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => handleAIPaste(service)}
                            >
                              <span className="text-xs font-semibold">
                                {service.name}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy & open in {service.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() =>
                        copyToClipboard(code, "Code copied to clipboard!")
                      }
                    >
                      <Copy size={14} className="mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Download size={14} className="mr-1" />
                      <span className="text-xs">Download</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-1 relative">
                  <div
                    className={`py-4 text-muted-foreground text-right select-none font-mono text-xs w-[3.5rem] overflow-y-hidden flex flex-col ${
                      isDarkMode ? "bg-[#181824]" : "bg-gray-100"
                    }`}
                  >
                    {code.split("\n").map((_, i) => (
                      <div
                        key={i}
                        className="px-2 h-[1.5rem] flex items-center justify-end"
                        style={{ lineHeight: "1.5rem" }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <div
                    className={`flex-1 relative ${
                      !isDarkMode ? "border-l border-gray-200" : ""
                    }`}
                  >
                    <CodeEditor
                      value={code}
                      language={language}
                      placeholder="Paste your code or start typing..."
                      onChange={handleCodeChange}
                      padding={15}
                      style={{
                        fontSize: "1rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: isDarkMode ? "#151520" : "#fcfcfc",
                        color: isDarkMode ? "#ffffff" : "#333333",
                        height: "100%",
                        borderRadius: "0",
                        lineHeight: "1.5rem",
                      }}
                      className="w-full outline-none resize-none h-full"
                      data-color-mode={isDarkMode ? "dark" : "light"}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="h-[71vh] flex flex-col">
                <div className="code-header flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">Preview</span>
                    <span className="text-xs text-muted-foreground">
                      {language === "markdown"
                        ? "Rendered Markdown"
                        : language === "html"
                        ? "Rendered HTML"
                        : language === "css"
                        ? "Styled Elements"
                        : language === "json"
                        ? "Formatted JSON"
                        : "Syntax Highlighted"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => setActiveTab("editor")}
                  >
                    <span className="text-xs">Edit</span>
                  </Button>
                </div>
                <div
                  style={{
                    backgroundColor: isDarkMode ? "#151520" : "#fcfcfc",
                    boxShadow: isDarkMode
                      ? "none"
                      : "inset 0 1px 2px rgba(0,0,0,0.05)",
                    flex: 1,
                  }}
                  className="p-4 overflow-auto"
                >
                  {/* Language-specific preview */}
                  {renderPreview(code, language, validation, isDarkMode)}
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <div className="mb-2 pb-2 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold">
                  {t("editor.shareOptions")}
                </h3>
                {generatedLink && (
                  <div className="flex items-center ml-2">
                    <a 
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded max-w-[280px] overflow-x-auto whitespace-nowrap mr-2 hover:bg-secondary/70 transition-colors"
                    >
                      {generatedLink}
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(generatedLink, t("actions.copy"))
                      }
                    >
                      <Copy size={13} />
                    </Button>
                    {!user && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 ml-1 flex-shrink-0"
                        disabled
                        title="Sign in to edit this snippet"
                      >
                        <Save size={13} className="mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleGenerateLink)}
                  className="flex flex-wrap items-center gap-3"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 bg-secondary/20 hover:bg-secondary/30 rounded-md p-1 pl-2 transition-colors">
                      <FormField
                        control={form.control}
                        name="expiration"
                        render={({ field }) => (
                          <FormItem className="w-auto flex-shrink-0">
                            <div className="flex items-center">
                              <Clock size={15} className="text-primary mr-1.5" />
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="h-9 text-sm border-0 bg-transparent hover:bg-secondary/10 w-32 pl-0 rounded-none focus:ring-0 focus:ring-offset-0">
                                  <SelectValue
                                    placeholder={t("editor.expiration.1d")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1d">
                                    {t("editor.expiration.1d")}
                                  </SelectItem>
                                  <SelectItem value="2d">
                                    {t("editor.expiration.2d")}
                                  </SelectItem>
                                  <SelectItem value="3d">
                                    {t("editor.expiration.3d")}
                                  </SelectItem>
                                  <SelectItem value="7d">
                                    {t("editor.expiration.7d")}
                                  </SelectItem>
                                  <SelectItem value="30d" disabled>
                                    30 days (Premium)
                                  </SelectItem>
                                  <SelectItem value="never" disabled>
                                    Never (Premium)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center bg-secondary/20 hover:bg-secondary/30 rounded-md p-1 pl-2 transition-colors">
                      <FormField
                        control={form.control}
                        name="isPasswordProtected"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-1.5 mt-0">
                            <div className="flex items-center gap-1.5">
                              <Lock size={15} className="text-primary" />
                              <FormLabel className="text-sm cursor-not-allowed text-muted-foreground m-0">
                                {t("editor.password", "Password")}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={true}
                                className="h-4 w-4 ml-0.5 text-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="gap-1.5 bg-primary hover:bg-primary/90 text-sm h-9"
                    size="sm"
                    disabled={isGeneratingLink || !code.trim()}
                  >
                    <LinkIcon size={15} />
                    {isGeneratingLink
                      ? t("actions.generating", "Generating...")
                      : t("actions.generateLink", "Generate link")}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-2 pb-2 border-b">
                {t("editor.stats")}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Eye size={15} className="mr-1.5" /> {t("editor.views")}
                  </span>
                  <span className="text-sm font-medium">{pasteStats.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <FileText size={15} className="mr-1.5" />{" "}
                    {t("general.language")}
                  </span>
                  <span className="text-sm font-medium">
                    {languageOptions.find((l) => l.value === language)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock size={15} className="mr-1.5" /> {t("editor.justNow")}
                  </span>
                  <span className="text-sm font-medium">
                    {t("editor.justNow")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Share2 size={15} className="mr-1.5" />{" "}
                    {t("editor.shares", "Shares")}
                  </span>
                  <span className="text-sm font-medium">4.7M+</span>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PasteCodeEditor;
