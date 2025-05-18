import React from "react";
import {
  ArrowRight,
  Clock,
  Code2,
  FileCode,
  Lock,
  Share2,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Code2 className="h-10 w-10 text-primary" />,
      title: t("features.syntaxHighlighting.title"),
      description: t("features.syntaxHighlighting.description"),
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: t("features.easySharing.title"),
      description: t("features.easySharing.description"),
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: t("features.flexibleExpiration.title"),
      description: t("features.flexibleExpiration.description"),
    },
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: t("features.passwordProtection.title"),
      description: t("features.passwordProtection.description"),
    },
    {
      icon: <FileCode className="h-10 w-10 text-primary" />,
      title: t("features.multipleThemes.title"),
      description: t("features.multipleThemes.description"),
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: t("features.lightningFast.title"),
      description: t("features.lightningFast.description"),
    },
  ];

  return (
    <div className="py-16 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
