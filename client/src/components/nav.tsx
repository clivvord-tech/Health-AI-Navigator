import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, Heart, Crown, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const coreLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload Report" },
  { href: "/reports", label: "My Reports" },
  { href: "/chat", label: "AI Chat" },
];

const healthFinanceLinks = [
  { href: "/symptom-checker", label: "Symptom Checker" },
  { href: "/clinic-finder", label: "Find Clinics" },
  { href: "/cost-estimator", label: "Cost Estimator" },
  { href: "/insurance-plans", label: "Insurance" },
  { href: "/payment-plans", label: "Payment Plans" },
];

export function Nav() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === "dark";

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight font-serif">
              Medi<span className="text-primary">Nav</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Core links */}
            {coreLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}

            {/* Health Finance dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  healthFinanceLinks.some((l) => isActive(l.href))
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                  Affordability <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Health Finance Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {healthFinanceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>
                      <span className={`w-full cursor-pointer ${isActive(link.href) ? "text-primary" : ""}`}>
                        {link.label}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/pricing"><span className="w-full cursor-pointer flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-500" /> Pricing</span></Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about">
              <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive("/about") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                About
              </span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="rounded-lg"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 rounded-lg">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user.name.split(" ")[0]}</span>
                    {user.plan === "premium" && (
                      <Badge className="hidden sm:flex gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-1.5">
                        <Crown className="w-3 h-3" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge className="mt-1 text-xs capitalize" variant="outline">{user.plan} plan</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/reports">My Reports</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/upload">Upload Report</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/pricing"><span className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-500" /> Upgrade Plan</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started free</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Radiology</p>
              {coreLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
              <p className="px-4 py-1 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Affordability</p>
              {healthFinanceLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
              <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                <span className="block px-4 py-2 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 cursor-pointer">
                  💎 Pricing
                </span>
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)}>
                <span className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive("/about") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                  About
                </span>
              </Link>
              {!user && (
                <div className="flex gap-2 mt-3 px-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
