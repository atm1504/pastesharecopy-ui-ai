import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Plus,
  Clock,
  Link,
  Settings,
  User,
  Eye,
  Calendar,
  Shield,
  ExternalLink,
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

interface DashboardProps {
  view?: "links" | "settings";
}

const Dashboard: React.FC<DashboardProps> = ({ view = "links" }) => {
  const { profile, loading: authLoading, refreshProfile } = useAuthContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(view);

  // State for snippets and usage data
  const [snippets, setSnippets] = useState<UserSnippet[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Set active tab based on prop
  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "links" | "settings");
    navigate(`/dashboard/${value === "links" ? "" : value}`);
  };

  // Fetch data function
  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both snippets and daily usage in parallel
      const [snippetsResponse, usageResponse] = await Promise.all([
        getUserSnippets(page, 5), // Show 5 snippets on dashboard
        getDailyUsage(),
      ]);

      setSnippets(snippetsResponse.snippets);
      setCurrentPage(snippetsResponse.pagination.currentPage);
      setTotalPages(snippetsResponse.pagination.totalPages);
      setTotalCount(snippetsResponse.pagination.totalCount);
      setDailyUsage(usageResponse);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

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

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.displayName || "User"}
            </p>
          </div>
          <Button onClick={() => navigate("/")}>
            <Plus className="mr-2 h-4 w-4" /> Create New Link
          </Button>
        </div>

        {/* Daily Usage Stats */}
        {dailyUsage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t("usage.todayUsage")}
                </CardTitle>
                <CardDescription>
                  {t(`usage.userType.${dailyUsage.userType}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {dailyUsage.dailyLimit === -1
                        ? t("usage.unlimited")
                        : `${dailyUsage.usedToday}/${dailyUsage.dailyLimit}`}
                    </span>
                    <Badge
                      variant={
                        dailyUsage.userType === "premium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {dailyUsage.userType}
                    </Badge>
                  </div>
                  {dailyUsage.dailyLimit !== -1 && (
                    <Progress value={getUsagePercentage()} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t("usage.availableLinks")}
                </CardTitle>
                <CardDescription>Your remaining quota</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dailyUsage.availableLinks === -1
                    ? t("usage.unlimited")
                    : dailyUsage.availableLinks}
                  {dailyUsage.availableLinks !== -1 && (
                    <span className="text-lg text-muted-foreground ml-2">
                      links
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {t("usage.upgradeForMore")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t("usage.totalCreated")}
                </CardTitle>
                <CardDescription>Links created so far</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dailyUsage.totalLinksCreated}
                  <span className="text-lg text-muted-foreground ml-2">
                    links
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("links")}
                >
                  {t("links.viewAll")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Game Points</CardTitle>
                <CardDescription>Play to earn more links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {profile?.gamePoints || 0}
                  <span className="text-lg text-muted-foreground ml-2">
                    points
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Play Game
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="links">
              <Link className="mr-2 h-4 w-4" /> {t("links.title")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>{t("links.title")}</CardTitle>
                <CardDescription>{t("links.description")}</CardDescription>
              </CardHeader>
              <CardContent>
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
                  <div className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-lg p-4">
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
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && snippets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">{t("links.noLinks")}</div>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => navigate("/")}
                    >
                      {t("links.createFirst")}
                    </Button>
                  </div>
                )}

                {/* Snippets List */}
                {!loading && !error && snippets.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {snippets.map((snippet) => (
                      <div key={snippet.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {snippet.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {snippet.language}
                              </Badge>
                              <span className="flex items-center">
                                <Eye size={12} className="mr-1" />
                                {snippet.viewCount}{" "}
                                {snippet.viewCount === 1
                                  ? t("links.view")
                                  : t("links.views")}
                              </span>
                              <span className="flex items-center">
                                <Calendar size={12} className="mr-1" />
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
                        <div className="mt-2 text-xs bg-muted p-2 rounded font-mono truncate">
                          pastesharecopy.com/{snippet.shortUrl}
                        </div>
                        {snippet.expiresAt && !isExpired(snippet.expiresAt) && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {t("links.expiresOn")}:{" "}
                            {formatDate(snippet.expiresAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              {/* Pagination and View All */}
              {!loading && !error && snippets.length > 0 && (
                <CardFooter className="flex flex-col space-y-4">
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between w-full">
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

                  {/* Total count and view all */}
                  <div className="text-center text-xs text-muted-foreground">
                    Showing {snippets.length} of {totalCount} total links
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <User className="h-8 w-8" />
                    <div>
                      <h3 className="font-medium">
                        {profile?.displayName || "User"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Settings panel coming soon...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <FooterSection />
    </div>
  );
};

export default Dashboard;
