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
  Crown,
  Zap,
  TrendingUp,
  Target,
  Gift,
  Timer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getUserSnippets,
  getDailyUsage,
  type UserSnippet,
  type DailyUsageResponse,
} from "@/lib/api";
import AdBanner from "@/components/AdBanner";

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

        {/* Stats Overview with psychological elements */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Available Links - with urgency for free users */}
            <Card
              className={
                profile.subscription?.plan
                  ? "border-green-200 dark:border-green-800"
                  : "border-orange-200 dark:border-orange-800"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Available Links
                  {!profile.subscription?.plan &&
                    profile.availableLinks <= 3 && (
                      <Badge variant="destructive" className="text-xs">
                        Low!
                      </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                  {profile.subscription?.plan
                    ? "Unlimited usage"
                    : "Daily limit resets in 24h"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {profile.subscription?.plan ? "∞" : profile.availableLinks}
                  {!profile.subscription?.plan && (
                    <span className="text-lg text-muted-foreground ml-2">
                      / {profile.dailyLimit || 10} today
                    </span>
                  )}
                </div>

                {/* Show gaming bonus if user has earned extra links */}
                {!profile.subscription?.plan &&
                  (profile.dailyLimit || 10) > 10 && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      🎮 Gaming bonus: +{(profile.dailyLimit || 10) - 10} extra
                      daily links!
                    </div>
                  )}

                {/* Progress bar for free users */}
                {!profile.subscription?.plan && (
                  <div className="mt-2">
                    <Progress
                      value={
                        (((profile.dailyLimit || 10) - profile.availableLinks) /
                          (profile.dailyLimit || 10)) *
                        100
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>
                        Used:{" "}
                        {(profile.dailyLimit || 10) - profile.availableLinks}
                      </span>
                      <span>Remaining: {profile.availableLinks}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              {!profile.subscription?.plan && profile.availableLinks <= 3 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" size="sm">
                    <Crown className="mr-2 h-4 w-4" />
                    Get Unlimited
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Total Links Created - social proof */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Created
                </CardTitle>
                <CardDescription>Your productivity stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {profile.totalLinksCreated}
                  <span className="text-lg text-muted-foreground ml-2">
                    links
                  </span>
                </div>
                {/* Achievement badges */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {profile.totalLinksCreated >= 100 && (
                    <Badge variant="secondary" className="text-xs">
                      💯 Century Maker
                    </Badge>
                  )}
                  {profile.totalLinksCreated >= 50 && (
                    <Badge variant="secondary" className="text-xs">
                      🎯 Power User
                    </Badge>
                  )}
                  {profile.totalLinksCreated >= 10 && (
                    <Badge variant="secondary" className="text-xs">
                      🚀 Regular
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Game Points - enhanced engagement */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Game Points
                  {(profile?.gamePoints || 0) > 1000 && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                      🔥 Hot Streak!
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Play to unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(profile?.gamePoints || 0).toLocaleString()}
                  <span className="text-lg text-muted-foreground ml-2">
                    points
                  </span>
                </div>

                {/* Next unlock preview */}
                {(() => {
                  const nextUnlockThresholds = [
                    500, 1000, 2000, 4000, 7000, 12000, 20000,
                  ];
                  const currentPoints = profile?.gamePoints || 0;
                  const nextThreshold = nextUnlockThresholds.find(
                    (threshold) => currentPoints < threshold
                  );

                  if (nextThreshold) {
                    const progress = (currentPoints / nextThreshold) * 100;
                    const remaining = nextThreshold - currentPoints;

                    return (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Next unlock</span>
                          <span>{remaining.toLocaleString()} more</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  }
                  return null;
                })()}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Play Game
                </Button>
              </CardFooter>

              {/* Animated background for high scorers */}
              {(profile?.gamePoints || 0) > 5000 && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 pointer-events-none" />
              )}
            </Card>

            {/* Subscription Status - psychological framing */}
            <Card
              className={
                profile.subscription?.plan
                  ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                  : "border-purple-200 dark:border-purple-800"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {profile.subscription?.plan ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Premium Active
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5" />
                      Free Plan
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {profile.subscription?.plan
                    ? "Enjoying unlimited features"
                    : "Upgrade for unlimited access"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.subscription?.plan ? (
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ✅ Premium
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      All features unlocked
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      $4.99
                      <span className="text-lg text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Join{" "}
                      {Math.floor(
                        Math.random() * 5000 + 10000
                      ).toLocaleString()}{" "}
                      premium users
                    </div>

                    {/* Limited time offer psychological trigger */}
                    <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900 rounded text-xs">
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span className="font-semibold">
                          Limited Time: 30% Off First Month!
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {profile.subscription?.plan ? (
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Strategic ad placement for free users */}
        {!profile?.subscription?.plan && (
          <div className="mb-8">
            <AdBanner
              position="banner"
              size="large"
              className="max-w-4xl mx-auto"
            />
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
              {!profile?.subscription?.plan &&
                profile &&
                profile.availableLinks <= 3 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {profile.availableLinks} left
                  </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
            {/* Free user limitations with upgrade prompts */}
            {!profile?.subscription?.plan &&
              profile &&
              profile.availableLinks <= 1 && (
                <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                  <CardHeader>
                    <CardTitle className="text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      Almost at your daily limit!
                    </CardTitle>
                    <CardDescription>
                      You have {profile.availableLinks} paste
                      {profile.availableLinks === 1 ? "" : "s"} remaining today.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Options to continue:</strong>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-semibold mb-1">🎮 Play Game</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Earn {10 - profile.availableLinks} more pastes by
                            playing our fun game!
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Start Gaming
                          </Button>
                        </div>
                        <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
                          <h4 className="font-semibold mb-1">👑 Go Premium</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Get unlimited pastes + ad-free experience
                          </p>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                          >
                            Upgrade $4.99/mo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {activeTab === "links" && (
              <div className="space-y-4">
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
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
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
                            <div className="mt-2 text-xs bg-muted p-2 rounded font-mono truncate">
                              {window.location.host}/{snippet.shortUrl}
                            </div>
                            {snippet.expiresAt &&
                              !isExpired(snippet.expiresAt) && (
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

                {/* Strategic ad after content for free users */}
                {!profile?.subscription?.plan && (
                  <div className="flex justify-center py-6">
                    <AdBanner
                      position="banner"
                      size="medium"
                      className="max-w-2xl"
                    />
                  </div>
                )}
              </div>
            )}
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
