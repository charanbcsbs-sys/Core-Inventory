"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Zap, BarChart3, Users } from "lucide-react";

const testAccounts = {
  "guest-user": {
    email: "admin@test.com",
    password: "password123",
  },
  "guest-supplier": {
    email: "supplier@tech.com",
    password: "password123",
  },
  "guest-client": {
    email: "test@client.com",
    password: "password123",
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigatingToHome, setIsNavigatingToHome] = useState(false);
  const { login, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const navigatingFromSubmitRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn && !navigatingFromSubmitRef.current) {
      const dest =
        user?.role === "client"
          ? "/client"
          : user?.role === "supplier"
            ? "/supplier"
            : "/";
      window.location.href = dest;
    }
  }, [isLoggedIn, user]);

  // Handle OAuth errors from callback
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      let errorMessage = "An error occurred during Google sign-in.";

      switch (error) {
        case "oauth_not_configured":
          errorMessage = "Google OAuth is not configured. Please contact support.";
          break;
        case "oauth_secret_missing":
          errorMessage = "Google Client Secret is missing in server configuration. Please check .env file.";
          break;
        case "oauth_failed":
          errorMessage = "Google sign-in was cancelled or failed. Please try again.";
          break;
        case "invalid_state":
          errorMessage = "Invalid OAuth state. Please try again.";
          break;
        case "no_code":
          errorMessage = "OAuth authorization code missing. Please try again.";
          break;
        case "token_exchange_failed":
          errorMessage = "Failed to exchange OAuth token. Please try again.";
          break;
        case "fetch_user_failed":
          errorMessage = "Failed to fetch user information from Google. Please try again.";
          break;
        case "no_email":
          errorMessage = "Google account email is required. Please try again.";
          break;
        default:
          errorMessage = `OAuth error: ${error}. Please try again.`;
      }

      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up URL
      router.replace("/login");
    }
  }, [searchParams, router, toast]);

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = searchParams.get("redirect") || "/";
      const oauthUrl = `/api/auth/oauth/google?callback=${encodeURIComponent(redirectUrl)}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      toast({
        title: "OAuth Error",
        description: "Failed to initiate Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      const userName = userData.name || userData.email.split("@")[0] || "User";

      navigatingFromSubmitRef.current = true;
      setIsNavigatingToHome(true);

      toast({
        title: `Welcome back, ${userName}! 👋`,
        description: "Authentication successful. Accessing your dashboard...",
      });

      const dest =
        userData.role === "client"
          ? "/client"
          : userData.role === "supplier"
            ? "/supplier"
            : "/";
      window.location.href = dest;
    } catch (error: any) {
      const serverMessage = error.response?.data?.error;
      toast({
        title: "Login Failed",
        description: serverMessage || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!navigatingFromSubmitRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      <div className="relative z-10 w-full">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left Side - Brand & Features */}
          <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-zinc-50 border-r border-zinc-200">
            <div className="relative z-10 max-w-lg w-full space-y-12">
              <div className="space-y-4">
                <h1 className="text-6xl font-black text-black uppercase tracking-tighter font-montserrat leading-[0.8] mb-6">
                  Manage<br />
                  <span className="text-zinc-300">Inventory</span><br />
                  Like a Pro.
                </h1>
                <p className="text-xl text-zinc-500 font-medium max-w-md">
                  The ultimate hub for warehouse logistics, supplier relations, and real-time stock tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 pt-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter font-montserrat">Live Insights</h3>
                    <p className="text-zinc-500 text-sm">Monitor turnover rates and stock levels with instant data.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter font-montserrat">Role Based</h3>
                    <p className="text-zinc-500 text-sm">Dedicated portals for Admins, Suppliers, and Clients.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter font-montserrat">Sign In</h2>
                <p className="text-zinc-500 font-medium">Access your industrial stockly dashboard.</p>
              </div>

              {/* Demo Selection */}
              <div className="space-y-2 bg-zinc-50 border border-zinc-200 p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-montserrat px-1">Quick Access (Demo)</label>
                <Select onValueChange={handleRoleSelect} value={selectedRole}>
                  <SelectTrigger className="w-full h-12 border-2 border-zinc-100 focus:ring-0 bg-white rounded-none font-black uppercase tracking-tighter font-montserrat">
                    <SelectValue placeholder="CHOOSE A ROLE" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-black">
                    <SelectItem value="guest-user" className="font-bold uppercase tracking-tighter">Admin Account</SelectItem>
                    <SelectItem value="guest-supplier" className="font-bold uppercase tracking-tighter">Supplier Account</SelectItem>
                    <SelectItem value="guest-client" className="font-bold uppercase tracking-tighter">Client Account</SelectItem>
                    <SelectItem value="clear" className="font-bold uppercase tracking-tighter text-red-500">Clear Fields</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Password</label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 hover:text-black transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isNavigatingToHome}
                  className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all font-black uppercase tracking-widest rounded-none shadow-none mt-4"
                >
                  {isNavigatingToHome ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : "Enterprise Login"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-zinc-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-black font-montserrat tracking-widest bg-white px-4 text-zinc-300">
                  Or use social login
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isNavigatingToHome}
                className="w-full h-12 border-2 border-zinc-100 hover:border-black hover:bg-transparent text-black transition-all rounded-none font-black uppercase tracking-tighter font-montserrat"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <p className="text-zinc-500 font-medium">
                  New to Stockly?{" "}
                  <Link
                    href="/register"
                    className="text-black hover:underline font-black uppercase tracking-tighter font-montserrat"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
