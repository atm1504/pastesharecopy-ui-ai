import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import PasteCodeEditor from "@/components/CodeEditor";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import FooterSection from "@/components/FooterSection";
import { LinkListSidebar } from "@/components/LinkListSidebar";
import AdBanner, { InterstitialAd } from "@/components/AdBanner";
import { useAuth } from "@/hooks/useAuth";

const Index: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [interstitialAd, setInterstitialAd] = useState<{
    isOpen: boolean;
    trigger: "achievement" | "session_time" | "feature_limit";
  }>({
    isOpen: false,
    trigger: "session_time",
  });
  const [floatingAdVisible, setFloatingAdVisible] = useState(false);
  const { profile } = useAuth();

  // Session tracking for strategic ad timing
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const sessionDuration = Math.floor((currentTime - startTime) / 1000);
      setSessionTime(sessionDuration);

      // Show floating ad after 2 minutes for free users
      if (sessionDuration === 120 && !profile?.subscription?.plan) {
        setFloatingAdVisible(true);
      }

      // Show interstitial ad after 5 minutes, then every 10 minutes
      if (
        sessionDuration === 300 ||
        (sessionDuration > 300 && sessionDuration % 600 === 0)
      ) {
        if (!profile?.subscription?.plan) {
          setInterstitialAd({
            isOpen: true,
            trigger: "session_time",
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.subscription?.plan]);

  // Achievement-based interstitial trigger
  useEffect(() => {
    const handleGameAchievement = (event: CustomEvent) => {
      if (!profile?.subscription?.plan && event.detail.milestone) {
        setTimeout(() => {
          setInterstitialAd({
            isOpen: true,
            trigger: "achievement",
          });
        }, 2000); // Show after celebration
      }
    };

    window.addEventListener(
      "gameAchievement",
      handleGameAchievement as EventListener
    );
    return () =>
      window.removeEventListener(
        "gameAchievement",
        handleGameAchievement as EventListener
      );
  }, [profile?.subscription?.plan]);

  const closeInterstitialAd = () => {
    setInterstitialAd((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onViewLinksClick={() => setSidebarOpen(true)} />

      <main className="flex-grow">
        {/* Strategic banner ad placement - after user engagement */}
        {sessionTime > 60 && !profile?.subscription?.plan && (
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <AdBanner position="banner" size="medium" className="mb-4" />
          </div>
        )}

        <section id="paste" className="py-8">
          <div className="container">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main content - takes full width on smaller screens */}
              <div className="xl:col-span-3">
                <PasteCodeEditor />
              </div>

              {/* Sidebar ads for free users - only on extra large screens */}
              {!profile?.subscription?.plan && (
                <div className="xl:col-span-1 hidden xl:block">
                  <div className="sticky top-24 space-y-6">
                    <AdBanner position="sidebar" size="medium" />

                    {sessionTime > 180 && (
                      <AdBanner position="sidebar" size="small" />
                    )}

                    {/* Premium upsell after showing value */}
                    {sessionTime > 240 && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-900 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                        <div className="text-center">
                          <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                            👑 Tired of Ads?
                          </h3>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                            Get ad-free experience + unlimited features!
                          </p>
                          <div className="text-xs text-purple-500 dark:text-purple-400 mb-3">
                            💰 Support the platform & unlock everything
                          </div>
                          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform shadow-md">
                            Upgrade for $4.99/month
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile/Tablet ads for free users */}
            {!profile?.subscription?.plan && (
              <div className="xl:hidden mt-8 space-y-6">
                <AdBanner
                  position="banner"
                  size="medium"
                  className="max-w-2xl mx-auto"
                />

                {sessionTime > 240 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-900 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700 max-w-md mx-auto text-center shadow-lg">
                    <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">
                      👑 Go Ad-Free Premium!
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                      Unlimited pastes + no ads + premium features
                    </p>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-md">
                      Upgrade Now - $4.99/mo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <HeroSection />
        <FeaturesSection />

        {/* Another strategic ad placement before stats */}
        {sessionTime > 300 && !profile?.subscription?.plan && (
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <AdBanner position="banner" size="large" className="my-6" />
          </div>
        )}

        <StatsSection />
      </main>

      {/* Floating ad for engaged users */}
      {floatingAdVisible && !profile?.subscription?.plan && (
        <AdBanner
          position="floating"
          size="medium"
          onClose={() => setFloatingAdVisible(false)}
          gameScore={profile?.gamePoints || 0}
        />
      )}

      {/* Strategic interstitial ads */}
      <InterstitialAd
        isOpen={interstitialAd.isOpen}
        onClose={closeInterstitialAd}
        trigger={interstitialAd.trigger}
      />

      <LinkListSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <FooterSection />
    </div>
  );
};

export default Index;
