
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PricingProps {
  onUpgradeClick?: (planName: string) => void;
}

const PricingSection: React.FC<PricingProps> = ({ onUpgradeClick }) => {
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic features for individual users.",
      features: [
        "10 pastes per day",
        "Expiration up to 7 days",
        "Public pastes",
        "Syntax highlighting",
        "Basic themes",
      ],
      cta: "Get Started",
      popular: false,
      billing: "",
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "per month",
      description: "Everything you need for serious sharing.",
      features: [
        "Unlimited pastes",
        "Expiration up to 1 year",
        "Password protection",
        "Premium themes",
        "Advanced analytics",
        "No ads",
        "Email notifications",
      ],
      cta: "Upgrade Now",
      popular: true,
      billing: "Billed monthly",
    },
    {
      name: "Premium Plus",
      price: "$9.99",
      period: "per month",
      description: "For power users who need more features.",
      features: [
        "All Premium features",
        "Priority support",
        "Custom domain",
        "Advanced API access",
        "Paste versioning",
        "Enhanced security",
        "Private team sharing",
      ],
      cta: "Upgrade Now",
      popular: false,
      billing: "Billed monthly",
    },
    {
      name: "Enterprise",
      price: "$14.99",
      period: "per month",
      description: "Advanced features for teams.",
      features: [
        "All Premium features",
        "Team workspaces",
        "Custom branding",
        "Permanent pastes",
        "Full API access",
        "Priority support",
        "Advanced security",
      ],
      cta: "Contact Sales",
      popular: false,
      billing: "Billed annually",
    },
  ];

  return (
    <div className="py-16">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our core features.
            Upgrade anytime to unlock premium capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col border ${
                plan.popular 
                  ? "border-primary shadow-md shadow-primary/10" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.billing && (
                  <span className="text-xs text-muted-foreground">{plan.billing}</span>
                )}
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className={`w-full ${
                    plan.popular ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => onUpgradeClick && onUpgradeClick(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
