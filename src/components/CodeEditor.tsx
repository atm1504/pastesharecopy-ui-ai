import React, { useState, useEffect } from "react";
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
  FileText
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
SELECT * FROM users WHERE email LIKE '%@example.com';`
};

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "jsx", label: "React JSX" },
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

// AI services to directly paste to
const aiServices = [
  { id: "gpt", name: "ChatGPT", url: "https://chat.openai.com/" },
  { id: "claude", name: "Claude", url: "https://claude.ai/" },
  { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/" },
  { id: "grok", name: "Grok", url: "https://grok.x.ai/" },
];

// Statistics for this paste (would be fetched from backend in real app)
const pasteStats = {
  views: 0,
  created: new Date().toISOString(),
  expiresAt: null,
};

const PasteCodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("editor");

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expiration: "2d",
      isPasswordProtected: false,
      password: "",
    },
  });

  // Set sample code when language changes
  useEffect(() => {
    if (code === "" || Object.values(languageSamples).includes(code)) {
      const sample = languageSamples[language as keyof typeof languageSamples] || "";
      setCode(sample);
    }
  }, [language, code]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleGenerateLink = (values: FormValues) => {
    setIsGeneratingLink(true);
    
    // Simulate API call
    setTimeout(() => {
      const uniqueId = Math.random().toString(36).substring(2, 10);
      setGeneratedLink(`https://pastesharecopy.com/${uniqueId}`);
      setIsGeneratingLink(false);
      
      toast({
        title: "Link generated successfully!",
        description: "The link will expire based on your selected timeframe.",
      });
    }, 1000);
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
  
  const handleAIPaste = async (service: { id: string, name: string, url: string }) => {
    // First, copy the code to clipboard
    try {
      await navigator.clipboard.writeText(code);
      
      // Then open the AI service in a new tab
      const aiWindow = window.open(service.url, '_blank');
      if (aiWindow) {
        toast({
          title: `Code copied for ${service.name}!`,
          description: "Just paste it (Ctrl+V/Cmd+V) in the chat",
        });
      } else {
        toast({
          title: `Code copied for ${service.name}!`,
          description: "Popup blocked, but you can still paste the code manually",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to copy code",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
      console.error("Error copying code:", err);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Tabs defaultValue="editor" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Languages</SelectLabel>
                  {languageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          <TabsContent value="editor" className="mt-0">
            <div className="code-header flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{language}</span>
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
                          <span className="text-xs font-semibold">{service.name}</span>
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
                  onClick={() => copyToClipboard(code, "Code copied to clipboard!")}
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
            <ScrollArea className="h-[500px]">
              <div className="relative">
                <CodeEditor
                  value={code}
                  language={language}
                  placeholder="Paste your code or start typing..."
                  onChange={(e) => setCode(e.target.value)}
                  padding={15}
                  style={{
                    fontSize: "1rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    backgroundColor: "#151520",
                    minHeight: "500px",
                    height: "100%",
                  }}
                  className="w-full outline-none resize-none"
                  data-color-mode="dark"
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="code-header flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">Preview</span>
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
            <ScrollArea className="h-[500px]">
              <div className="p-4 bg-[#151520]">
                <pre className="text-white font-mono text-sm">
                  <code>{code}</code>
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
        
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">Share Options</h3>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateLink)} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="expiration"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-1/2">
                          <FormLabel className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Expiration
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expiration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="1d">1 day</SelectItem>
                                  <SelectItem value="2d">2 days</SelectItem>
                                  <SelectItem value="3d">3 days</SelectItem>
                                  <SelectItem value="7d">7 days</SelectItem>
                                  <SelectItem value="30d" disabled>30 days (Premium)</SelectItem>
                                  <SelectItem value="never" disabled>Never (Premium)</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPasswordProtected"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 w-full sm:w-1/2 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={true}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 cursor-not-allowed text-muted-foreground">
                              <Lock size={16} />
                              Password protect (Premium)
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="gap-2"
                      disabled={isGeneratingLink || !code.trim()}
                    >
                      <LinkIcon size={16} />
                      {isGeneratingLink ? "Generating..." : "Generate link"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Eye size={14} className="mr-2" />
                    Views
                  </span>
                  <span className="font-medium">{pasteStats.views}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <FileText size={14} className="mr-2" />
                    Language
                  </span>
                  <span className="font-medium">{languageOptions.find(l => l.value === language)?.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock size={14} className="mr-2" />
                    Created
                  </span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Share2 size={14} className="mr-2" />
                    Total Shares
                  </span>
                  <span className="font-medium">4.7M+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {generatedLink && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">Generated Link</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-sm font-mono bg-secondary/50 p-2 rounded w-full overflow-x-auto whitespace-nowrap">
                  {generatedLink}
                </div>
                <div className="flex gap-2 whitespace-nowrap">
                  <Button 
                    onClick={() => copyToClipboard(generatedLink, "Link copied to clipboard!")} 
                    className="gap-2"
                  >
                    <Copy size={16} />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={shareLink}
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 size={16} />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
};

export default PasteCodeEditor;
