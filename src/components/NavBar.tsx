
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

const NavBar: React.FC = () => {
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
          </nav>
          
          <div className="flex items-center gap-2">
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
