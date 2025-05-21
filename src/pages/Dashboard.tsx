import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Clock, Link, Settings, User } from "lucide-react";

interface DashboardProps {
  view?: "links" | "settings";
}

const Dashboard: React.FC<DashboardProps> = ({ view = "links" }) => {
  const { profile, loading, refreshProfile } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(view);

  // Set active tab based on prop
  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "links" | "settings");
    navigate(`/dashboard/${value === "links" ? "" : value}`);
  };

  // Mock data for links
  const mockLinks = [
    {
      id: "link1",
      title: "React Documentation",
      shortUrl: "psc.com/abc123",
      createdAt: new Date().toISOString(),
      views: 42,
    },
    {
      id: "link2",
      title: "TypeScript Handbook",
      shortUrl: "psc.com/def456",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      views: 28,
    },
    {
      id: "link3",
      title: "Firebase Auth Guide",
      shortUrl: "psc.com/ghi789",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      views: 15,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.displayName || "User"}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Link
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Available Links</CardTitle>
              <CardDescription>Your remaining quota</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.availableLinks || 0}
                <span className="text-lg text-muted-foreground ml-2">
                  links
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Upgrade for more
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Links</CardTitle>
              <CardDescription>Links created so far</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.totalLinksCreated || 0}
                <span className="text-lg text-muted-foreground ml-2">
                  links
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Links
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Game Points</CardTitle>
              <CardDescription>Play to earn more links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.gamePoints || 0}
                <span className="text-lg text-muted-foreground ml-2">
                  points
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Play Game
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="links">
              <Link className="mr-2 h-4 w-4" /> My Links
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>
                  Manage and track your shared content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y">
                  {mockLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{link.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Link className="h-3 w-3 mr-1" />
                          {link.shortUrl}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mr-4">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </div>
                      <div className="w-16 text-right">{link.views} views</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Links
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {profile?.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.displayName}
                          className="h-20 w-20 rounded-full"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {profile?.displayName}
                      </h3>
                      <p className="text-muted-foreground">{profile?.email}</p>
                      <p className="text-sm mt-1">
                        Subscription:{" "}
                        <span className="font-medium">
                          {profile?.subscription?.plan || "Free"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Sign Out</Button>
                <Button>Upgrade Plan</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <FooterSection />
    </div>
  );
};

export default Dashboard;
