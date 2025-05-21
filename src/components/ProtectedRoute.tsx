import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 *
 * @param children The route content to render if authenticated
 * @param requireAuth Whether authentication is required (defaults to true)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { profile, loading } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && (!profile || !profile.isAuthenticated)) {
    // Redirect to login but save the location they were trying to access
    // so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required or user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
