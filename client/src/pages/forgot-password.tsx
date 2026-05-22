import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-10">
          <Link href="/">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </Link>
          <span className="font-bold text-xl font-serif">
            Medi<span className="text-primary">Nav</span>
          </span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !email}
                data-testid="button-submit-reset"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check your email</h2>
            <p className="text-muted-foreground mb-8">
              If an account exists for <strong className="text-foreground">{email}</strong>, you'll receive a password reset link shortly.
            </p>
          </motion.div>
        )}

        <div className="mt-8">
          <Link href="/login">
            <Button variant="ghost" className="gap-2 w-full" data-testid="button-back-to-login">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
