"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/auth/password-reset/request", { email });
      
      toast({
        title: "Code Sent! 📧",
        description: "If an account exists, you will receive a verification code shortly.",
      });
      
      // Pass email to reset page to pre-fill
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.error || "Failed to send reset code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-2xl p-8">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm font-black uppercase tracking-tighter text-zinc-400 hover:text-black transition-colors mb-8 group font-montserrat"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-none border-2 border-black bg-black text-white mb-6">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter font-montserrat">Forgot Password?</h2>
            <p className="text-zinc-500 mt-2 font-medium">
              Enter your email and we'll send you a code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-black uppercase tracking-tighter text-black font-montserrat">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 border-2 border-zinc-100 focus:border-black transition-all rounded-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all font-black uppercase tracking-widest rounded-none shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
