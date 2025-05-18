import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { LogIn, Globe, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  const languages = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    zh: "中文",
    ja: "日本語",
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="font-bold text-2xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {t("general.appName")}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="transition-colors hover:text-foreground/80">
              {t("navigation.home")}
            </Link>
            <Link
              to="/pricing"
              className="transition-colors hover:text-foreground/80"
            >
              {t("navigation.pricing")}
            </Link>
            <a
              href="https://github.com/yourusername/pastesharecopy"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground/80"
            >
              {t("general.github")}
            </a>
            <Button
              variant="ghost"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80"
              onClick={onViewLinksClick}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              {t("navigation.dashboard")}
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">{t("general.language")}</span>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary-foreground">
                      {i18n.language.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 max-h-80 overflow-y-auto"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={
                      i18n.language.startsWith(code) ? "bg-accent" : ""
                    }
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
                {t("navigation.login")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
