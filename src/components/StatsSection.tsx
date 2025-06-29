import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Users,
  Code2,
  CheckCircle,
  Link,
  Eye,
  Share2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getPlatformStats, type PlatformStatsResponse } from "@/lib/api";

const StatsSection: React.FC = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [platformStats, setPlatformStats] = useState<PlatformStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getPlatformStats();
      setPlatformStats(stats);
    } catch (err) {
      console.error("Failed to fetch platform stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load statistics");
      // Set fallback data
      setPlatformStats({
        success: false,
        pastesCreated: "1M+",
        dailyUsers: "50K+",
        languages: 100,
        uptime: 99.9,
        linksToday: 158,
        viewsToday: "12.3K",
        totalShares: "4.7M+",
        lastUpdated: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Failed to load statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStats = () => {
    if (!platformStats) {
      // Loading state defaults
      return [
        {
          value: "...",
          label: t("stats.pastesCreated"),
          icon: <BarChart3 className="h-6 w-6 text-primary/80" />,
          color: "from-purple-500 to-primary",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.dailyUsers"),
          icon: <Users className="h-6 w-6 text-indigo-400" />,
          color: "from-indigo-500 to-blue-400",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.languages"),
          icon: <Code2 className="h-6 w-6 text-blue-400" />,
          color: "from-blue-500 to-sky-400",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.uptime"),
          icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
          color: "from-emerald-500 to-teal-400",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.linksToday"),
          icon: <Link className="h-6 w-6 text-fuchsia-400" />,
          color: "from-fuchsia-500 to-pink-400",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.viewsToday"),
          icon: <Eye className="h-6 w-6 text-violet-400" />,
          color: "from-violet-500 to-purple-400",
          percentage: 0,
        },
        {
          value: "...",
          label: t("stats.totalShares"),
          icon: <Share2 className="h-6 w-6 text-pink-400" />,
          color: "from-pink-500 to-rose-400",
          percentage: 0,
        },
      ];
    }

    // Calculate percentages based on relative values
    const getPercentageForValue = (value: string | number, max: number = 100): number => {
      if (typeof value === 'number') {
        return Math.min((value / max) * 100, 100);
      }
      
      const numStr = value.toString().replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      
      if (value.includes('M')) {
        return Math.min((num / 10) * 100, 100); // Assume 10M as max for percentage
      } else if (value.includes('K')) {
        return Math.min((num / 100) * 100, 100); // Assume 100K as max for percentage
      }
      
      return Math.min((num / max) * 100, 100);
    };

    return [
      {
        value: platformStats.pastesCreated,
        label: t("stats.pastesCreated"),
        icon: <BarChart3 className="h-6 w-6 text-primary/80" />,
        color: "from-purple-500 to-primary",
        percentage: getPercentageForValue(platformStats.pastesCreated),
      },
      {
        value: platformStats.dailyUsers,
        label: t("stats.dailyUsers"),
        icon: <Users className="h-6 w-6 text-indigo-400" />,
        color: "from-indigo-500 to-blue-400",
        percentage: getPercentageForValue(platformStats.dailyUsers),
      },
      {
        value: `${platformStats.languages}+`,
        label: t("stats.languages"),
        icon: <Code2 className="h-6 w-6 text-blue-400" />,
        color: "from-blue-500 to-sky-400",
        percentage: Math.min((platformStats.languages / 150) * 100, 100),
      },
      {
        value: `${platformStats.uptime}%`,
        label: t("stats.uptime"),
        icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
        color: "from-emerald-500 to-teal-400",
        percentage: platformStats.uptime,
      },
      {
        value: platformStats.linksToday.toString(),
        label: t("stats.linksToday"),
        icon: <Link className="h-6 w-6 text-fuchsia-400" />,
        color: "from-fuchsia-500 to-pink-400",
        percentage: Math.min((platformStats.linksToday / 500) * 100, 100),
      },
      {
        value: platformStats.viewsToday,
        label: t("stats.viewsToday"),
        icon: <Eye className="h-6 w-6 text-violet-400" />,
        color: "from-violet-500 to-purple-400",
        percentage: getPercentageForValue(platformStats.viewsToday),
      },
      {
        value: platformStats.totalShares,
        label: t("stats.totalShares"),
        icon: <Share2 className="h-6 w-6 text-pink-400" />,
        color: "from-pink-500 to-rose-400",
        percentage: getPercentageForValue(platformStats.totalShares),
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="py-16 relative overflow-hidden">
      <div className="container max-w-6xl relative z-10">
        <div className="flex items-center justify-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            {t("stats.title", "Our Impact in Numbers")}
          </h2>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center gap-2 mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              Statistics may not be current: {error}
            </span>
          </div>
        )}

        {/* Last updated info */}
        {platformStats?.lastUpdated && !loading && (
          <div className="text-center mb-8">
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date(platformStats.lastUpdated).toLocaleString()}
            </span>
          </div>
        )}

        {/* Abstract shapes in background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
        </div>

        <div
          ref={ref}
          className="relative z-10 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.slice(0, 4).map((stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                inView={inView && !loading}
                delay={index * 150}
                loading={loading}
              />
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.slice(4).map((stat, index) => (
              <StatCard
                key={index + 4}
                stat={stat}
                inView={inView && !loading}
                delay={(index + 4) * 150}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  stat: {
    value: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    percentage: number;
  };
  inView: boolean;
  delay: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ stat, inView, delay, loading = false }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/50 p-6 bg-card/50 backdrop-blur-sm transition-all duration-700 ease-out ${
        inView && !loading
          ? "opacity-100 transform translate-y-0"
          : "opacity-60 transform translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-background/80 border border-border/50">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              stat.icon
            )}
          </div>
          <h3 className="ml-3 text-base text-muted-foreground font-medium">
            {stat.label}
          </h3>
        </div>
      </div>

      <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
        {loading ? (
          <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
        ) : (
          stat.value
        )}
      </div>

      <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: inView && !loading ? `${stat.percentage}%` : "0%",
            transitionDelay: `${delay + 300}ms`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatsSection;
