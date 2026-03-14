"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Shield, Zap, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignUp = async () => {
    try {
      const oauthUrl = `/api/auth/oauth/google?callback=/`;
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

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        toast({
          title: "Account Created! 🎉",
          description: `Welcome, ${name}! Redirecting to login...`,
        });

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.error;
      toast({
        title: "Registration Failed",
        description: serverMessage || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      <div className="relative z-10 w-full">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left Side - Values & Brand */}
          <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-zinc-50 border-r border-zinc-200">
            <div className="relative z-10 max-w-lg w-full space-y-12">
              <div className="space-y-4">
                <h1 className="text-6xl font-black text-black uppercase tracking-tighter font-montserrat leading-[0.8] mb-6">
                  Build Your<br />
                  <span className="text-zinc-300">Warehouse</span><br />
                  Smarter.
                </h1>
                <p className="text-xl text-zinc-500 font-medium max-w-md">
                  Join the industrial standard in stock management and inventory automation.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 pt-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter font-montserrat">Lightning Fast</h3>
                    <p className="text-zinc-500 text-sm">Real-time sync across all your warehouse locations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter font-montserrat">Secure Ops</h3>
                    <p className="text-zinc-500 text-sm">Enterprise-grade protection for your business data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter font-montserrat">Create Account</h2>
                <p className="text-zinc-500 font-medium">Get started with your pro inventory dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">FullName</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
                  />
                </div>

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

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">Confirm Password</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full h-12 border-2 border-zinc-100 focus:border-black rounded-none"
                        />
                    </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all font-black uppercase tracking-widest rounded-none shadow-none mt-4"
                >
                  {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                  ) : "Register Account"}
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-12 border-2 border-zinc-100 hover:border-black hover:bg-transparent text-black transition-all rounded-none font-black uppercase tracking-tighter font-montserrat"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </Button>

              <div className="text-center text-sm">
                <p className="text-zinc-500 font-medium">
                  Already on Stockly?{" "}
                  <Link
                    href="/login"
                    className="text-black hover:underline font-black uppercase tracking-tighter font-montserrat"
                  >
                    Sign in
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
