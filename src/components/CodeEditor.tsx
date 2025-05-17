
import React, { useState } from "react";
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
  Share2
} from "lucide-react";

const formSchema = z.object({
  expiration: z.string().min(1),
  isPasswordProtected: z.boolean().default(false),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PasteCodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>(`function greet(name) {
  const message = 'Hello, ' + name + '!';
  console.log(message);
}`);
  const [language, setLanguage] = useState<string>("javascript");
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expiration: "2d",
      isPasswordProtected: false,
      password: "",
    },
  });

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

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link copied to clipboard!",
        description: "Share it with others to view this paste.",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid gap-6">
        {/* Language selector */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="w-full sm:w-40">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Languages</SelectLabel>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="jsx">React JSX</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Code editor */}
        <div className="relative">
          <div className="code-display rounded-lg overflow-hidden border border-border">
            <div className="code-header">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{language}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  <Copy size={14} className="mr-1" />
                  <span className="text-xs">Copy</span>
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  <Download size={14} className="mr-1" />
                  <span className="text-xs">Download</span>
                </Button>
              </div>
            </div>
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
                borderRadius: "0 0 0.5rem 0.5rem",
              }}
              className="min-h-[300px] w-full outline-none"
              data-color-mode="dark"
            />
          </div>
        </div>

        {/* Share options */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateLink)} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
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
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full sm:w-auto px-8 gap-2"
                disabled={isGeneratingLink}
              >
                <LinkIcon size={16} />
                {isGeneratingLink ? "Generating..." : "Generate link"}
              </Button>
            </div>
          </form>
        </Form>
        
        {generatedLink && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-mono bg-background/80 p-2 rounded w-full overflow-x-auto whitespace-nowrap">
                {generatedLink}
              </div>
              <Button onClick={copyToClipboard} className="whitespace-nowrap gap-2">
                <Copy size={16} />
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasteCodeEditor;
