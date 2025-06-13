import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { LogIn, LogOut, Globe, Link as LinkIcon, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavBarProps {
  onViewLinksClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onViewLinksClick }) => {
  const { t, i18n } = useTranslation();
  const { profile, loading, signOut } = useAuthContext();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <Link to="/" className="text-2xl font-bold">
          PasteShareCopy
        </Link>
        <span className="ml-2 px-1.5 py-0.5 text-xs dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded">
          Beta
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {onViewLinksClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewLinksClick}
            className="hidden md:flex"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {t("navigation.viewYourLinks")}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => changeLanguage("en")}
              className="cursor-pointer"
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage("es")}
              className="cursor-pointer"
            >
              Español
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage("fr")}
              className="cursor-pointer"
            >
              Français
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />

        {profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {profile.isAuthenticated ? (
                  <Avatar className="h-8 w-8">
                    {profile.photoURL ? (
                      <AvatarImage
                        src={profile.photoURL}
                        alt={profile.displayName}
                      />
                    ) : (
                      <AvatarFallback>
                        {profile.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
                {profile.availableLinks > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {profile.availableLinks > 99
                            ? "99+"
                            : profile.availableLinks}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("navigation.availableLinksTooltip")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-semibold">
                {profile.displayName}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {profile.isAuthenticated ? profile.email : "Anonymous User"}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">Links:</span> {profile.availableLinks}{" "}
                available
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {profile.isAuthenticated ? (
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/login">
              <LogIn className="h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
