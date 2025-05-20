import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser, SignInOrUpForm } from "app/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user) {
      console.log("[LoginPage] User is logged in, navigating to / from useEffect.");
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log("[LoginPage] Loading user state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is present (and loading is false), useEffect will handle navigation.
  // Return null to prevent rendering the form while that effect is pending or has just run.
  if (user) {
    console.log("[LoginPage] User is present post-loading, navigation handled by useEffect. Rendering null.");
    return null;
  }
  
  console.log("[LoginPage] No user, rendering login form.");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-4">
      <Card className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-purple-500/50 shadow-2xl rounded-xl">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 drop-shadow-sm">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-slate-300 pt-2">
            Sign in to continue to LearnSphere.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          {/* SignInOrUpForm will have its own internal styling, we are theming around it */}
          <SignInOrUpForm 
            signInOptions={{
              emailAndPassword: true,
              google: false, // Explicitly keeping google off for this specific page as per original
              facebook: false,
              github: false,
              twitter: false,
              magicLink: false
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-8">
          <p className="mt-4 text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link to="/register-page" className="font-semibold text-pink-400 hover:text-pink-300 hover:underline transition-colors duration-150">
              Sign up here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
