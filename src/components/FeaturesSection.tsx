
import React from "react";
import { ArrowRight, Clock, Code2, FileCode, Lock, Share2, Zap } from "lucide-react";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Code2 className="h-10 w-10 text-primary" />,
      title: "Syntax Highlighting",
      description: "Beautiful code formatting with support for over 100 programming languages."
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Easy Sharing",
      description: "Generate and share links instantly with anyone, anywhere."
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Flexible Expiration",
      description: "Set your paste to expire after a specific time, from 1 day to 1 year."
    },
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: "Password Protection",
      description: "Keep your sensitive code secure with optional password protection."
    },
    {
      icon: <FileCode className="h-10 w-10 text-primary" />,
      title: "Multiple Themes",
      description: "Choose from a variety of themes to make your code look just right."
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Lightning Fast",
      description: "Our optimized platform ensures your pastes load instantly, every time."
    }
  ];

  return (
    <div className="py-16 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to share your code snippets efficiently and securely.
            We've built the perfect tool for developers, by developers.
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
