import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  FileText, Upload, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Trash2, ChevronRight, Activity, Brain, MapPin,
  DollarSign, Shield, TrendingDown, MessageSquare, Crown, Zap
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getRecentReports, getDashboardStats, deleteReport, type Report } from "@/lib/supabase";

const urgencyColors: Record<string, { badge: string }> = {
  low: { badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  moderate: { badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  high: { badge: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const HEALTH_TOOLS = [
  { icon: Brain, title: "Symptom Checker", desc: "AI diagnosis + cost estimate", href: "/symptom-checker", color: "text-primary", bg: "bg-primary/10" },
  { icon: DollarSign, title: "Cost Estimator", desc: "Compare treatment prices", href: "/cost-estimator", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: MapPin, title: "Clinic Finder", desc: "Affordable clinics nearby", href: "/clinic-finder", color: "text-accent", bg: "bg-accent/10" },
  { icon: Shield, title: "Insurance Advisor", desc: "Find plans for your budget", href: "/insurance-plans", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: TrendingDown, title: "Payment Plans", desc: "0% interest bill financing", href: "/payment-plans", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: MessageSquare, title: "AI Health Chat", desc: "Ask anything 24/7", href: "/chat", color: "text-rose-500", bg: "bg-rose-500/10" },
];

function StatCard({ label, value, icon: Icon, color, isLoading }: {
  label: string; value: number | string; icon: React.ElementType; color: string; isLoading: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [recent, setRecent] = useState<Report[]>([]);
  const [stats, setStats] = useState({ totalReports: 0, urgencyBreakdown: { low: 0, moderate: 0, high: 0 }, recentActivity: 0 });
  const [recentLoading, setRecentLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  const load = useCallback(async () => {
    if (!user) return;
    setRecentLoading(true);
    setStatsLoading(true);
    try {
      const [r, s] = await Promise.all([getRecentReports(user.id), getDashboardStats(user.id)]);
      setRecent(r);
      setStats(s);
    } catch {
      toast({ title: "Failed to load dashboard", variant: "destructive" });
    } finally {
      setRecentLoading(false);
      setStatsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!user) return;
    try {
      await deleteReport(id, user.id);
      toast({ title: "Report deleted" });
      load();
    } catch {
      toast({ title: "Failed to delete report", variant: "destructive" });
    }
  };

  if (authLoading) return null;

  const isPremium = user?.plan === "premium";
  const isBasic = user?.plan === "basic" || isPremium;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">Your AI-powered health & affordability hub</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize gap-1">
              <Activity className="w-3 h-3" /> {user?.plan} plan
            </Badge>
            {!isPremium && (
              <Link href="/pricing">
                <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0">
                  <Crown className="w-3.5 h-3.5" /> Upgrade
                </Button>
              </Link>
            )}
            <Link href="/upload">
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Upload className="w-4 h-4" /> Upload Report
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Radiology Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Reports" value={stats.totalReports} icon={FileText} color="text-primary" isLoading={statsLoading} />
          <StatCard label="Low Urgency" value={stats.urgencyBreakdown.low} icon={CheckCircle} color="text-emerald-500" isLoading={statsLoading} />
          <StatCard label="Moderate Urgency" value={stats.urgencyBreakdown.moderate} icon={AlertTriangle} color="text-amber-500" isLoading={statsLoading} />
          <StatCard label="High Urgency" value={stats.urgencyBreakdown.high} icon={TrendingUp} color="text-red-500" isLoading={statsLoading} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Recent Reports */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-8">

            {/* Recent Reports */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Reports</h2>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    View all <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card">
                      <Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-4 w-24" />
                    </div>
                  ))
                ) : recent.length > 0 ? (
                  recent.map((report) => (
                    <motion.div key={report.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/reports/${report.id}`}>
                          <span className="font-medium text-sm hover:text-primary transition-colors cursor-pointer truncate block">
                            {report.title}
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                          {report.report_type && (
                            <span className="text-xs text-muted-foreground">· {report.report_type}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize flex-shrink-0 ${urgencyColors[report.urgency]?.badge}`}>
                          {report.urgency}
                        </span>
                        <Button variant="ghost" size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(report.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-border">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No reports yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload your first X-ray or MRI report</p>
                    <Link href="/upload">
                      <Button size="sm" className="gap-2"><Upload className="w-3.5 h-3.5" />Upload Report</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Health Finance Tools */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Affordability Tools</h2>
                <Badge variant="outline" className="text-xs">AI-Powered</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HEALTH_TOOLS.map((tool) => {
                  const locked = !isBasic && (tool.href === "/insurance-plans" || tool.href === "/payment-plans");
                  return (
                    <div key={tool.title} className="relative">
                      {locked && (
                        <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm z-10 flex items-center justify-center">
                          <Link href="/pricing">
                            <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs h-7 px-2">
                              <Crown className="w-3 h-3" /> Unlock
                            </Button>
                          </Link>
                        </div>
                      )}
                      <Link href={tool.href}>
                        <div className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                          <div className={`w-9 h-9 rounded-lg ${tool.bg} flex items-center justify-center mb-2`}>
                            <tool.icon className={`w-4 h-4 ${tool.color}`} />
                          </div>
                          <div className="font-medium text-xs mb-0.5 group-hover:text-primary transition-colors">{tool.title}</div>
                          <div className="text-xs text-muted-foreground">{tool.desc}</div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: Sidebar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">

            {/* Activity */}
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Recent Activity</span>
              </div>
              {statsLoading ? <Skeleton className="h-6 w-12" /> : (
                <div className="text-2xl font-bold text-primary">{stats.recentActivity}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">reports in the last 7 days</p>
            </div>

            {/* Urgency breakdown */}
            {!statsLoading && stats.totalReports > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium">Urgency Breakdown</span>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Low", value: stats.urgencyBreakdown.low, color: "bg-emerald-500" },
                    { label: "Moderate", value: stats.urgencyBreakdown.moderate, color: "bg-amber-500" },
                    { label: "High", value: stats.urgencyBreakdown.high, color: "bg-red-500" },
                  ].map((item) => {
                    const pct = Math.round((item.value / (stats.totalReports || 1)) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {!isPremium && (
              <div className="p-5 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-sm text-amber-500">Upgrade to Premium</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Unlock insurance advisor, payment plans, telemedicine, and unlimited AI consultations.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> See Plans from ₦500/mo
                  </Button>
                </Link>
              </div>
            )}

            {/* Emergency contacts */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Emergency Contacts</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div>🚑 Emergency: <strong className="text-foreground">112</strong></div>
                <div>🏥 NEMA: <strong className="text-foreground">0800-CALL-NEMA</strong></div>
                <div>💊 NAFDAC: <strong className="text-foreground">0800-162-3322</strong></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
