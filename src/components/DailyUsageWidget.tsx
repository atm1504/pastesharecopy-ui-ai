import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDailyUsage, type DailyUsageResponse } from "@/lib/api";

interface DailyUsageWidgetProps {
  compact?: boolean;
  className?: string;
}

export const DailyUsageWidget: React.FC<DailyUsageWidgetProps> = ({
  compact = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const [dailyUsage, setDailyUsage] = useState<DailyUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDailyUsage();
      setDailyUsage(response);
    } catch (err) {
      console.error("Error fetching daily usage:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load usage data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const getUsagePercentage = () => {
    if (!dailyUsage || dailyUsage.dailyLimit === -1) return 0;
    return (dailyUsage.usedToday / dailyUsage.dailyLimit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Error loading usage</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchUsage}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyUsage) return null;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {dailyUsage.dailyLimit === -1
                  ? t("usage.unlimited")
                  : `${dailyUsage.usedToday}/${dailyUsage.dailyLimit}`}
              </span>
            </div>
            <Badge
              variant={
                dailyUsage.userType === "premium" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {t(`usage.userType.${dailyUsage.userType}`)}
            </Badge>
          </div>
          {dailyUsage.dailyLimit !== -1 && (
            <Progress value={getUsagePercentage()} className="h-1 mt-2" />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {t("usage.todayUsage")}
          <Badge
            variant={
              dailyUsage.userType === "premium" ? "default" : "secondary"
            }
          >
            {t(`usage.userType.${dailyUsage.userType}`)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            {dailyUsage.dailyLimit === -1
              ? t("usage.unlimited")
              : `${dailyUsage.usedToday}/${dailyUsage.dailyLimit}`}
          </span>
          <span className={`text-sm ${getUsageColor()}`}>
            {dailyUsage.dailyLimit === -1
              ? "∞"
              : `${dailyUsage.remainingToday} ${t(
                  "usage.remaining"
                ).toLowerCase()}`}
          </span>
        </div>

        {dailyUsage.dailyLimit !== -1 && (
          <Progress value={getUsagePercentage()} className="h-2" />
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
          <div>
            <div className="text-muted-foreground">
              {t("usage.totalCreated")}
            </div>
            <div className="font-medium">{dailyUsage.totalLinksCreated}</div>
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
  );
};
