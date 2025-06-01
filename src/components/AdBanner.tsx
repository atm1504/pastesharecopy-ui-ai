import React from "react";

interface AdBannerProps {
  position: "sidebar" | "banner" | "floating" | "interstitial";
  size: "small" | "medium" | "large";
  className?: string;
  onClose?: () => void;
  gameScore?: number;
}

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "achievement" | "session_time" | "feature_limit";
}

const AdBanner: React.FC<AdBannerProps> = ({
  position,
  size,
  className = "",
  onClose,
  gameScore,
}) => {
  const getAdContent = () => {
    const ads = {
      sidebar: [
        {
          title: "🚀 Boost Your Productivity",
          description: "Premium coding tools for developers",
          cta: "Try Free",
          bgGradient:
            "from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900",
        },
        {
          title: "📊 Analytics Dashboard",
          description: "Track your paste performance",
          cta: "Learn More",
          bgGradient:
            "from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900",
        },
        {
          title: "🔒 Security Plus",
          description: "Enterprise-grade paste protection",
          cta: "Secure Now",
          bgGradient:
            "from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900",
        },
      ],
      banner: [
        {
          title: "💎 Premium Features Await",
          description:
            "Unlock unlimited pastes, advanced analytics, and priority support",
          cta: "Upgrade Today",
          bgGradient:
            "from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900",
        },
        {
          title: "🎯 Developer Tools",
          description:
            "API access, custom domains, and team collaboration features",
          cta: "Start Building",
          bgGradient:
            "from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900",
        },
      ],
      floating: [
        {
          title: "⚡ Speed Up Your Workflow",
          description: "Advanced shortcuts and automations",
          cta: "Try Now",
          bgGradient:
            "from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900",
        },
      ],
      interstitial: [
        {
          title: "🌟 Unlock Premium Experience",
          description:
            "Join thousands of developers who upgraded to Premium for unlimited features",
          cta: "Upgrade for $4.99/month",
          bgGradient: "from-gradient-to-r from-purple-500 to-pink-500",
        },
      ],
    };

    const adList = ads[position] || ads.sidebar;
    return adList[Math.floor(Math.random() * adList.length)];
  };

  const getSizeClasses = () => {
    if (position === "sidebar") {
      return {
        small: "w-full h-24 text-xs",
        medium: "w-full h-32 text-sm",
        large: "w-full h-40 text-base",
      }[size];
    }

    if (position === "banner") {
      return {
        small: "w-full h-16 text-xs",
        medium: "w-full h-20 text-sm",
        large: "w-full h-24 text-base",
      }[size];
    }

    if (position === "floating") {
      return {
        small: "w-64 h-20 text-xs",
        medium: "w-72 h-24 text-sm",
        large: "w-80 h-28 text-base",
      }[size];
    }

    // interstitial
    return "w-full max-w-md h-32 text-base";
  };

  const handleAdClick = () => {
    // Ad click tracking could go here
    console.log("Ad clicked:", position, size);
  };

  const ad = getAdContent();
  const sizeClasses = getSizeClasses();

  // Floating ad with close button
  if (position === "floating" && onClose) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div
          className={`
            bg-gradient-to-r ${ad.bgGradient} 
            border-2 border-gray-200 dark:border-gray-700 
            rounded-xl p-3 shadow-lg
            transition-all duration-300 cursor-pointer
            ${sizeClasses}
            ${className}
          `}
          onClick={handleAdClick}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-1 right-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ×
          </button>
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {ad.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {ad.description}
              </p>
              {gameScore && gameScore > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🎮 Great gaming! Score: {gameScore.toLocaleString()}
                </p>
              )}
            </div>
            <button className="mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs">
              {ad.cta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-gradient-to-r ${ad.bgGradient} 
        border-2 border-gray-200 dark:border-gray-700 
        rounded-xl p-3 shadow-md hover:shadow-lg 
        transition-all duration-300 cursor-pointer
        ${sizeClasses}
        ${className}
      `}
      onClick={handleAdClick}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {ad.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {ad.description}
          </p>
        </div>
        <button className="mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs">
          {ad.cta}
        </button>
      </div>
    </div>
  );
};

export const InterstitialAd: React.FC<InterstitialAdProps> = ({
  isOpen,
  onClose,
  trigger,
}) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (trigger) {
      case "achievement":
        return {
          title: "🎉 Congratulations on Your Achievement!",
          subtitle: "You're doing great! Ready to unlock even more?",
          description:
            "Premium users get unlimited pastes, advanced features, and ad-free experience",
          cta: "Upgrade to Premium - $4.99/month",
          bgGradient: "from-green-400 via-blue-500 to-purple-600",
        };
      case "session_time":
        return {
          title: "⏰ You've been coding for a while!",
          subtitle: "Take your productivity to the next level",
          description:
            "Join thousands of developers who upgraded for unlimited features and ad-free experience",
          cta: "Go Premium - $4.99/month",
          bgGradient: "from-purple-400 via-pink-500 to-red-500",
        };
      case "feature_limit":
        return {
          title: "🚀 Ready for More Features?",
          subtitle: "You've hit your daily limit",
          description:
            "Premium members get unlimited pastes, advanced analytics, and priority support",
          cta: "Unlock Everything - $4.99/month",
          bgGradient: "from-blue-400 via-purple-500 to-pink-500",
        };
      default:
        return {
          title: "💎 Upgrade to Premium",
          subtitle: "Unlock the full potential",
          description: "Get unlimited features and an ad-free experience",
          cta: "Try Premium - $4.99/month",
          bgGradient: "from-indigo-400 via-purple-500 to-pink-500",
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className={`bg-gradient-to-r ${content.bgGradient} p-6 text-white`}
        >
          <button
            onClick={onClose}
            className="float-right bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-2">{content.title}</h2>
          <p className="text-white/90 text-sm">{content.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {content.description}
          </p>

          {/* Benefits list */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Unlimited daily pastes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                No advertisements
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Advanced analytics
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Priority support
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              className={`w-full bg-gradient-to-r ${content.bgGradient} text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-transform duration-200 shadow-lg`}
              onClick={() => {
                console.log("Upgrade clicked from interstitial");
                // Handle upgrade logic here
                onClose();
              }}
            >
              {content.cta}
            </button>
            <button
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-2 text-sm transition-colors duration-200"
              onClick={onClose}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
