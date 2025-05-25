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
import {
  getUserSnippets,
  getDailyUsage,
  type UserSnippet,
  type DailyUsageResponse,
} from "@/lib/api";

interface LinkListSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const LinkListSidebar: React.FC<LinkListSidebarProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [snippets, setSnippets] = useState<UserSnippet[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both snippets and daily usage in parallel
      const [snippetsResponse, usageResponse] = await Promise.all([
        getUserSnippets(page, 10),
        getDailyUsage(),
      ]);

      setSnippets(snippetsResponse.snippets);
      setCurrentPage(snippetsResponse.pagination.currentPage);
      setTotalPages(snippetsResponse.pagination.totalPages);
      setTotalCount(snippetsResponse.pagination.totalCount);
      setDailyUsage(usageResponse);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getUsagePercentage = () => {
    if (!dailyUsage || dailyUsage.dailyLimit === -1) return 0;
    return (dailyUsage.usedToday / dailyUsage.dailyLimit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
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
            {dailyUsage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {t("usage.todayUsage")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {t(`usage.userType.${dailyUsage.userType}`)}
                    </span>
                    <Badge
                      variant={
                        dailyUsage.userType === "premium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {dailyUsage.userType === "premium"
                        ? t("usage.unlimited")
                        : `${dailyUsage.usedToday}/${dailyUsage.dailyLimit}`}
                    </Badge>
                  </div>

                  {dailyUsage.dailyLimit !== -1 && (
                    <div className="space-y-2">
                      <Progress value={getUsagePercentage()} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {t("usage.used")}: {dailyUsage.usedToday}
                        </span>
                        <span>
                          {t("usage.remaining")}: {dailyUsage.remainingToday}
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
                        {dailyUsage.totalLinksCreated}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("usage.availableLinks")}
                      </div>
                      <div className="font-medium">
                        {dailyUsage.availableLinks === -1
                          ? t("usage.unlimited")
                          : dailyUsage.availableLinks}
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
                    onClick={() => fetchData(currentPage)}
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
                              href={`https://pastesharecopy.com/${snippet.shortUrl}`}
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
                            pastesharecopy.com/{snippet.shortUrl}
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
