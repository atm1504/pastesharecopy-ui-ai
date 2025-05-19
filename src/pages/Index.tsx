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
            <PasteCodeEditor />
          </div>
        </section>

        <HeroSection />
        <FeaturesSection />
        <StatsSection />
      </main>

      <LinkListSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <FooterSection />
    </div>
  );
};

export default Index;
