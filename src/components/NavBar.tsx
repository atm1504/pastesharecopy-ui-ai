
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { LogIn, Globe, Link as LinkIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  onViewLinksClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onViewLinksClick }) => {
  const [language, setLanguage] = useState('en');
  
  const languages = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    zh: "中文",
    ja: "日本語",
  };
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // In a real implementation, this would update the app's language
    // using i18n or a similar localization library
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="font-bold text-2xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              pastesharecopy
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link to="/pricing" className="transition-colors hover:text-foreground/80">
              Pricing
            </Link>
            <a href="https://github.com/yourusername/pastesharecopy" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground/80">
              GitHub
            </a>
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 transition-colors hover:text-foreground/80"
              onClick={onViewLinksClick}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              My Links
            </Button>
          </nav>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(languages).map(([code, name]) => (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => handleLanguageChange(code)}
                    className={language === code ? "bg-accent" : ""}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ThemeToggle />
            
            <Button asChild variant="default" className="hidden md:flex">
              <Link to="/login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
