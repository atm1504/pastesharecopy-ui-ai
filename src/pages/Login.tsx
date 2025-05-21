import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Github, Mail } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 48 48"
    className="mr-2"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

const Login: React.FC = () => {
  const { user, loading, error, signInWithGoogle } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state if it exists
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (user && !loading) {
      // Redirect to the page they were trying to access or home page
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Error during Google sign in:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                Welcome to PasteShareCopy
              </CardTitle>
              <CardDescription>
                Sign in with your Google account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  <GoogleIcon />
                  {loading ? "Loading..." : "Continue with Google"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-2">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <FooterSection />
    </div>
  );
};

export default Login;
