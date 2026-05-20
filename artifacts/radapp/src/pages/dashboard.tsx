import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, Upload, TrendingUp, AlertTriangle, CheckCircle, Clock, Trash2, ChevronRight, Activity } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getRecentReports, getDashboardStats, deleteReport, type Report } from "@/lib/supabase";

const urgencyColors: Record<string, { badge: string }> = {
  low: { badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  moderate: { badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  high: { badge: "bg-red-500/10 text-red-500 border-red-500/20" },
};

function StatCard({ label, value, icon: Icon, color, isLoading }: {
  label: string; value: number | string; icon: React.ElementType; color: string; isLoading: boolean;
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{value}</div>}
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

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your radiology reports</p>
          </div>
          <Link href="/upload">
            <Button className="gap-2 shadow-md shadow-primary/20" data-testid="button-upload-new">
              <Upload className="w-4 h-4" /> Upload Report
            </Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Reports" value={stats.totalReports} icon={FileText} color="bg-primary/10 text-primary" isLoading={statsLoading} />
          <StatCard label="Low Urgency" value={stats.urgencyBreakdown.low} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-500" isLoading={statsLoading} />
          <StatCard label="Moderate Urgency" value={stats.urgencyBreakdown.moderate} icon={AlertTriangle} color="bg-amber-500/10 text-amber-500" isLoading={statsLoading} />
          <StatCard label="High Urgency" value={stats.urgencyBreakdown.high} icon={TrendingUp} color="bg-red-500/10 text-red-500" isLoading={statsLoading} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Recent Reports</h2>
              <Link href="/upload">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">View all <ChevronRight className="w-3 h-3" /></Button>
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
                    data-testid={`card-report-${report.id}`}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/reports/${report.id}`}>
                        <span className="font-medium text-sm hover:text-primary transition-colors cursor-pointer truncate block">{report.title}</span>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</span>
                        {report.report_type && <span className="text-xs text-muted-foreground">· {report.report_type}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize flex-shrink-0 ${urgencyColors[report.urgency]?.badge}`}>
                        {report.urgency}
                      </span>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(report.id)} data-testid={`button-delete-report-${report.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center rounded-2xl border border-dashed border-border">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No reports yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Upload your first radiology report to get started</p>
                  <Link href="/upload">
                    <Button className="gap-2" data-testid="button-upload-first"><Upload className="w-4 h-4" />Upload your first report</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-semibold mb-5">AI Insights</h2>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Recent Activity</span></div>
                {statsLoading ? <Skeleton className="h-6 w-12" /> : <div className="text-2xl font-bold text-primary">{stats.recentActivity}</div>}
                <p className="text-xs text-muted-foreground mt-1">reports in the last 7 days</p>
              </div>
              <div className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Avg. Analysis Time</span></div>
                <div className="text-2xl font-bold text-accent">2.4s</div>
                <p className="text-xs text-muted-foreground mt-1">per report</p>
              </div>
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
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.6 }} className={`h-full rounded-full ${item.color}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
                <p className="text-sm font-medium text-primary mb-2">Chat with AI</p>
                <p className="text-xs text-muted-foreground mb-4">Have questions about your reports? Ask our AI medical assistant.</p>
                <Link href="/chat">
                  <Button size="sm" className="w-full gap-2" data-testid="button-open-chat">Open AI Chat <ChevronRight className="w-3 h-3" /></Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
