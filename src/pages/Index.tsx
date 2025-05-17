
import React from "react";
import NavBar from "@/components/NavBar";
import PasteCodeEditor from "@/components/CodeEditor";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import FooterSection from "@/components/FooterSection";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <HeroSection />
        
        <section id="paste" className="py-16">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Start Sharing Your Code</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your code below, customize your settings, and share it with the world.
              </p>
            </div>
            <PasteCodeEditor />
          </div>
        </section>
        
        <FeaturesSection />
        <StatsSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
