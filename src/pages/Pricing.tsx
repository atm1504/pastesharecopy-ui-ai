
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Pricing: React.FC = () => {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgradeClick = (planName: string) => {
    setSelectedPlan(planName);
    setPaymentStep(1);
    setUpgradeDialogOpen(true);
  };

  const handlePaymentComplete = () => {
    setPaymentStep(3); // Success state
    toast({
      title: "Payment successful!",
      description: `You've successfully upgraded to the ${selectedPlan} plan.`
    });
    
    // Auto-close after 2 seconds
    setTimeout(() => {
      setUpgradeDialogOpen(false);
      setPaymentStep(1);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <PricingSection onUpgradeClick={handleUpgradeClick} />
        
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
        
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">See It In Action</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch our quick demo to see how easy it is to share code with pastesharecopy
              </p>
            </div>
            
            <div className="aspect-video bg-black/10 rounded-xl overflow-hidden border border-border/50 shadow-md">
              <iframe 
                className="w-full h-full" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="pastesharecopy Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      
      {/* Payment Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {paymentStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Upgrade to {selectedPlan}</DialogTitle>
                <DialogDescription>
                  Enter your payment details to upgrade your account
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardName" className="text-right">
                    Name on Card
                  </Label>
                  <Input id="cardName" className="col-span-3" placeholder="John Doe" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardNumber" className="text-right">
                    Card Number
                  </Label>
                  <Input id="cardNumber" className="col-span-3" placeholder="4242 4242 4242 4242" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiry
                  </Label>
                  <Input id="expiry" className="col-span-1" placeholder="MM/YY" />
                  
                  <Label htmlFor="cvc" className="text-right">
                    CVC
                  </Label>
                  <Input id="cvc" className="col-span-1" placeholder="123" />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setPaymentStep(2)}>
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}
          
          {paymentStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm your purchase</DialogTitle>
                <DialogDescription>
                  You're about to upgrade to {selectedPlan}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span>{selectedPlan} Plan</span>
                    <span className="font-bold">
                      {selectedPlan === "Premium" ? "$4.99" : "$14.99"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Billed monthly</span>
                    <span>+ Tax</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={handlePaymentComplete}>
                  Confirm Payment
                </Button>
              </DialogFooter>
            </>
          )}
          
          {paymentStep === 3 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">Payment Successful!</DialogTitle>
              </DialogHeader>
              
              <div className="py-8 flex flex-col items-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-center">
                  You've successfully upgraded to the {selectedPlan} plan.
                  <br />
                  Enjoy all the premium features!
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <FooterSection />
    </div>
  );
};

export default Pricing;
