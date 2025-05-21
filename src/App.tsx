import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DynamicBackground from "@/components/DynamicBackground";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy-loaded dashboard route
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

const queryClient = new QueryClient();

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-lg">Loading Dashboard...</span>
  </div>
);

const App = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    console.log("App: Rendering with DynamicBackground, theme:", resolvedTheme);
  }, [resolvedTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            {/* Background is rendered outside of BrowserRouter to ensure it's always visible */}
            <DynamicBackground />

            <Toaster />
            <Sonner />

            <BrowserRouter>
              <div
                className={`min-h-screen font-sans antialiased relative ${
                  isDarkMode ? "bg-background/70" : "bg-background/60"
                }`}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard sub-routes example */}
                  <Route
                    path="/dashboard/links"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard view="links" />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard view="settings" />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
