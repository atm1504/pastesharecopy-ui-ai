
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import PasteCodeEditor from "@/components/CodeEditor";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import FooterSection from "@/components/FooterSection";
import { LinkListSidebar } from "@/components/LinkListSidebar";

const Index: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onViewLinksClick={() => setSidebarOpen(true)} />
      
      <main className="flex-grow">
        <section id="paste" className="py-8">
          <div className="container">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Start Sharing Your Code</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your code below, customize your settings, and share it with the world.
              </p>
            </div>
            <PasteCodeEditor />
          </div>
        </section>
        
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
      </main>
      
      <LinkListSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <FooterSection />
    </div>
  );
};

export default Index;
