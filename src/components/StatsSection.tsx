import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Users,
  Code2,
  CheckCircle,
  Link,
  Eye,
  Share2,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

const StatsSection: React.FC = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const stats = [
    {
      value: "1M+",
      label: t("stats.pastesCreated"),
      icon: <BarChart3 className="h-6 w-6 text-primary/80" />,
      color: "from-purple-500 to-primary",
      percentage: 85,
    },
    {
      value: "50K+",
      label: t("stats.dailyUsers"),
      icon: <Users className="h-6 w-6 text-indigo-400" />,
      color: "from-indigo-500 to-blue-400",
      percentage: 70,
    },
    {
      value: "100+",
      label: t("stats.languages"),
      icon: <Code2 className="h-6 w-6 text-blue-400" />,
      color: "from-blue-500 to-sky-400",
      percentage: 60,
    },
    {
      value: "99.9%",
      label: t("stats.uptime"),
      icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
      color: "from-emerald-500 to-teal-400",
      percentage: 99.9,
    },
    {
      value: "158",
      label: t("stats.linksToday"),
      icon: <Link className="h-6 w-6 text-fuchsia-400" />,
      color: "from-fuchsia-500 to-pink-400",
      percentage: 40,
    },
    {
      value: "12.3K",
      label: t("stats.viewsToday"),
      icon: <Eye className="h-6 w-6 text-violet-400" />,
      color: "from-violet-500 to-purple-400",
      percentage: 75,
    },
    {
      value: "4.7M+",
      label: t("stats.totalShares"),
      icon: <Share2 className="h-6 w-6 text-pink-400" />,
      color: "from-pink-500 to-rose-400",
      percentage: 92,
    },
  ];

  return (
    <div className="py-16 relative overflow-hidden">
      <div className="container max-w-6xl relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
          {t("stats.title", "Our Impact in Numbers")}
        </h2>

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
                inView={inView}
                delay={index * 150}
              />
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.slice(4).map((stat, index) => (
              <StatCard
                key={index + 4}
                stat={stat}
                inView={inView}
                delay={(index + 4) * 150}
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
}

const StatCard: React.FC<StatCardProps> = ({ stat, inView, delay }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/50 p-6 bg-card/50 backdrop-blur-sm transition-all duration-700 ease-out ${
        inView
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-background/80 border border-border/50">
            {stat.icon}
          </div>
          <h3 className="ml-3 text-base text-muted-foreground font-medium">
            {stat.label}
          </h3>
        </div>
      </div>

      <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
        {stat.value}
      </div>

      <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: inView ? `${stat.percentage}%` : "0%",
            transitionDelay: `${delay + 300}ms`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatsSection;
