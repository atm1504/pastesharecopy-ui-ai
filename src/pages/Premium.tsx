import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
  Clock,
  ArrowLeft,
  Crown,
} from "lucide-react";

const Premium: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited Snippets",
      description:
        "Create as many code snippets as you need without any limits",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Confidential Snippets",
      description: "Create private snippets that only you can access",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Advanced Analytics",
      description: "Detailed views, engagement metrics, and visitor insights",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Extended Expiration",
      description: "Set custom expiration times up to 1 year or never expire",
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Priority Support",
      description: "Get faster responses and dedicated support",
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Premium Badge",
      description: "Show off your premium status with a special badge",
    },
  ];

  const handleUpgrade = () => {
    // This would integrate with your payment provider (Stripe, etc.)
    alert(
      "Payment integration would go here. This would redirect to a checkout page."
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Upgrade to Premium
            </h1>
          </div>

          <p className="text-xl text-muted-foreground mb-2">
            Unlock unlimited code sharing and advanced features
          </p>
          <Badge variant="secondary" className="mb-6">
            Special Launch Pricing - Limited Time!
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Free Plan</span>
                <Badge variant="outline">Current</Badge>
              </CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">
                Perfect for getting started
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>10 snippets per account</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic syntax highlighting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Public snippets only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Standard expiration times</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic view counts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Premium Plan</span>
              </CardTitle>
              <div className="text-3xl font-bold">
                $9.99
                <span className="text-lg font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <p className="text-muted-foreground">
                Everything you need for serious development
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature.title}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black font-semibold"
                size="lg"
                onClick={handleUpgrade}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Details */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your premium
                features will remain active until the end of your billing
                period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What happens to my snippets if I downgrade?
              </h3>
              <p className="text-muted-foreground">
                Your existing snippets will remain accessible, but you'll be
                limited to creating 10 new snippets per day on the free plan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-muted-foreground">
                Yes! Contact our support team with your student email for a 50%
                discount on your premium subscription.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there an annual plan?</h3>
              <p className="text-muted-foreground">
                Coming soon! We're working on an annual plan that will offer
                significant savings compared to monthly billing.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Premium;
