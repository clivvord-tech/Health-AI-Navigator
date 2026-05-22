import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">404 — Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button size="lg">Go back home</Button>
        </Link>
      </div>
    </div>
  );
}
