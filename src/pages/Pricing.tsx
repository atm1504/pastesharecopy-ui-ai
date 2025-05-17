
import React from "react";
import NavBar from "@/components/NavBar";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <PricingSection />
        
        <section className="py-16 bg-secondary/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6 text-left">
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-lg mb-2">What is the paste limit for free users?</h3>
                <p className="text-muted-foreground">Free users can create up to 10 pastes per day. After that, you'll need to upgrade to continue creating pastes.</p>
              </div>
              
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-lg mb-2">How long can my pastes stay available?</h3>
                <p className="text-muted-foreground">Free users can set their pastes to expire between 1 and 7 days. Premium users can extend this up to 1 year, and Enterprise users can create permanent pastes.</p>
              </div>
              
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-lg mb-2">Can I make my pastes private?</h3>
                <p className="text-muted-foreground">All pastes can be shared via unique URLs. Premium and Enterprise users can add password protection for additional security.</p>
              </div>
              
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">Yes, we offer a 14-day money-back guarantee if you're not satisfied with your premium subscription.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Pricing;
