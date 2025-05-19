import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-bg"></div>

      <div className="relative z-10">
        <div className="container max-w-6xl py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                {t("hero.title")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                {t("hero.description")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/">
                    {t("actions.startPasting")}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/pricing">{t("actions.viewPlans")}</Link>
                </Button>
              </div>
            </div>
            <div className="w-full max-w-3xl mt-16">
              <div className="rounded-lg overflow-hidden shadow-xl border border-border/50">
                <img
                  src="/images/code-screenshot.svg"
                  alt={t("general.appName") + " " + t("general.tagline")}
                  className="w-full h-auto"
                />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
