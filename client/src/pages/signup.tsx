import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    login(email, name, "free");
    toast({ title: "Account created!", description: "Welcome to MediNav. Start finding affordable care." });
    setLocation("/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <Link href="/">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </Link>
          <span className="font-bold text-xl font-serif">Medi<span className="text-primary">Nav</span></span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground mb-8">Start finding affordable healthcare today — free forever</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 shadow-md shadow-primary/20" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create free account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login"><span className="text-primary font-medium hover:underline cursor-pointer">Sign in</span></Link>
        </p>

        <p className="mt-6 text-xs text-center text-muted-foreground leading-relaxed">
          By creating an account you agree that MediNav provides informational guidance only and is not a substitute for professional medical advice.
        </p>
      </motion.div>
    </div>
  );
}
