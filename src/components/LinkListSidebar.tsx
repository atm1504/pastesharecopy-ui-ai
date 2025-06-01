import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserSnippets, type UserSnippet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface LinkListSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const LinkListSidebar: React.FC<LinkListSidebarProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [snippets, setSnippets] = useState<UserSnippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSnippets = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const snippetsResponse = await getUserSnippets(page, 10);

      setSnippets(snippetsResponse.snippets);
      setCurrentPage(snippetsResponse.pagination.currentPage);
      setTotalPages(snippetsResponse.pagination.totalPages);
      setTotalCount(snippetsResponse.pagination.totalCount);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSnippets(1);

      // Debug logging for available links calculation
      if (process.env.NODE_ENV === "development" && profile) {
        console.log("LinkListSidebar: Profile data", {
          isAuthenticated: profile.isAuthenticated,
          subscription: profile.subscription,
          availableLinks: profile.availableLinks,
          dailyLimit: profile.dailyLimit,
          totalLinksCreated: profile.totalLinksCreated,
          usedToday: getUsedToday(),
          remaining: getRemaining(),
        });
      }
    }
  }, [open, profile]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchSnippets(page);
    }
  };

  const handleRetry = () => {
    fetchSnippets(currentPage);
  };

  const formatDate = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  const getUsagePercentage = () => {
    if (!profile || !profile.dailyLimit || profile.dailyLimit === -1) return 0;
    const usedToday =
      (profile.dailyLimit || 10) - (profile.availableLinks || 0);
    return (usedToday / (profile.dailyLimit || 10)) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getUserTypeLabel = () => {
    if (!profile) return t("usage.userType.anonymous");
    if (profile.subscription?.plan) return t("usage.userType.premium");
    if (profile.isAuthenticated) return t("usage.userType.free");
    return t("usage.userType.anonymous");
  };

  const getDailyLimit = () => {
    if (!profile || !profile.dailyLimit) return 10; // Default for free users
    if (profile.dailyLimit === -1) return -1; // Unlimited
    return profile.dailyLimit;
  };

  const getDailyLimitDisplay = () => {
    const limit = getDailyLimit();
    return limit === -1 ? "∞" : limit;
  };

  const getUsedToday = () => {
    if (!profile) return 0;
    const limit = profile.dailyLimit || 10;
    const available = profile.availableLinks || 0;
    return limit === -1 ? 0 : Math.max(0, limit - available);
  };

  const getRemaining = () => {
    if (!profile) return 0;
    return profile.availableLinks || 0;
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>{t("navigation.yourSharedLinks")}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
                <span className="sr-only">{t("general.close")}</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] py-4">
          <div className="space-y-4">
            {/* Daily Usage Card */}
            {profile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {t("usage.todayUsage")}
                  </CardTitle>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {getUserTypeLabel()}
                    </span>
                    <Badge
                      variant={
                        profile.subscription?.plan ? "default" : "secondary"
                      }
                    >
                      {profile.subscription?.plan
                        ? t("usage.unlimited")
                        : `${getUsedToday()}/${getDailyLimitDisplay()}`}
                    </Badge>
                  </div>

                  {/* Show gaming bonus if user has earned extra links */}
                  {!profile.subscription?.plan &&
                    getDailyLimit() > 10 &&
                    getDailyLimit() !== -1 && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        🎮 Gaming bonus: +{getDailyLimit() - 10} extra links!
                      </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.dailyLimit !== -1 && (
                    <div className="space-y-2">
                      <Progress value={getUsagePercentage()} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {t("usage.used")}: {getUsedToday()}
                        </span>
                        <span>
                          {t("usage.remaining")}: {getRemaining()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        {t("usage.totalCreated")}
                      </div>
                      <div className="font-medium">
                        {profile.totalLinksCreated}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("usage.availableLinks")}
                      </div>
                      <div className="font-medium">
                        {profile.availableLinks === -1
                          ? t("usage.unlimited")
                          : profile.availableLinks}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">
                  {t("links.loading")}
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{t("links.error")}</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t("links.retry")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && snippets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">{t("links.noLinks")}</div>
                <Button variant="outline" className="mt-3" onClick={onClose}>
                  {t("links.createFirst")}
                </Button>
              </div>
            )}

            {/* Snippets List */}
            {!loading && !error && snippets.length > 0 && (
              <>
                <div className="space-y-3">
                  {snippets.map((snippet) => (
                    <Card key={snippet.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-card-foreground truncate">
                              {snippet.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {snippet.language}
                              </Badge>
                              <span className="flex items-center">
                                <Eye size={10} className="mr-1" />
                                {snippet.viewCount}{" "}
                                {snippet.viewCount === 1
                                  ? t("links.view")
                                  : t("links.views")}
                              </span>
                              <span className="flex items-center">
                                <Calendar size={10} className="mr-1" />
                                {formatDate(snippet.createdAt)}
                              </span>
                              {snippet.isConfidential && (
                                <Badge variant="secondary" className="text-xs">
                                  <Shield size={8} className="mr-1" />
                                  {t("links.confidential")}
                                </Badge>
                              )}
                              {isExpired(snippet.expiresAt) && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <Clock size={8} className="mr-1" />
                                  {t("links.expired")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2"
                            asChild
                          >
                            <a
                              href={`${window.location.origin}/${snippet.shortUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={14} />
                              <span className="sr-only">
                                {t("navigation.openLink")}
                              </span>
                            </a>
                          </Button>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs bg-muted p-2 rounded font-mono truncate">
                            {window.location.host}/{snippet.shortUrl}
                          </div>
                          <div
                            className="text-xs text-muted-foreground mt-1 overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {snippet.contentPreview}
                          </div>
                          {snippet.expiresAt &&
                            !isExpired(snippet.expiresAt) && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {t("links.expiresOn")}:{" "}
                                {formatDate(snippet.expiresAt)}
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      {t("links.pagination.previous")}
                    </Button>

                    <span className="text-xs text-muted-foreground">
                      {t("links.pagination.page")} {currentPage}{" "}
                      {t("links.pagination.of")} {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t("links.pagination.next")}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Total Count */}
                <div className="text-center text-xs text-muted-foreground pt-2">
                  {totalCount} {totalCount === 1 ? "link" : "links"}{" "}
                  {t("links.viewAll").toLowerCase()}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
