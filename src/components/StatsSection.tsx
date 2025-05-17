
import React from "react";

const StatsSection: React.FC = () => {
  const stats = [
    { value: "1M+", label: "Pastes Created" },
    { value: "50K+", label: "Daily Users" },
    { value: "100+", label: "Languages" },
    { value: "99.9%", label: "Uptime" },
    { value: "158", label: "Links Today" },
    { value: "12.3K", label: "Views Today" },
    { value: "4.7M+", label: "Total Shares" }
  ];

  return (
    <div className="py-16">
      <div className="container max-w-6xl">
        <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
