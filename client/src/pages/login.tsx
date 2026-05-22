import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    login(email, name, "free");
    toast({ title: "Welcome back!", description: "You have been signed in." });
    setLocation("/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-emerald-500/10">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl font-serif">Medi<span className="text-primary">Nav</span></span>
          </Link>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Affordable healthcare<br />starts with information</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
            Find the cheapest clinics, compare treatment costs, and discover insurance plans that fit your budget.
          </p>
          <div className="mt-12 space-y-4">
            {["Find clinics under ₦2,000 near you", "Save up to 60% on treatment costs", "Free NHIS insurance guidance"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Link href="/">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </Link>
            <span className="font-bold text-xl font-serif">Medi<span className="text-primary">Nav</span></span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to access your healthcare tools</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 shadow-md shadow-primary/20" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup"><span className="text-primary font-medium hover:underline cursor-pointer">Create one free</span></Link>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-muted/40 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-foreground">Demo:</strong> Use any email and password to explore MediNav
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
