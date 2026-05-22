import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  FileText, Upload, Trash2, Clock, Search, Filter,
  ChevronRight, AlertTriangle, CheckCircle, Activity
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getAllReports, deleteReport, type Report } from "@/lib/supabase";

const urgencyColors: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  moderate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

const urgencyIcons: Record<string, React.ElementType> = {
  low: CheckCircle,
  moderate: AlertTriangle,
  high: AlertTriangle,
};

type FilterType = "all" | "low" | "moderate" | "high";

export default function Reports() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getAllReports(user.id);
      setReports(data);
    } catch {
      toast({ title: "Failed to load reports", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!user) return;
    setDeletingId(id);
    try {
      await deleteReport(id, user.id);
      toast({ title: "Report deleted" });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast({ title: "Failed to delete report", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.report_type?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.urgency === filter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">My Reports</h1>
            <p className="text-muted-foreground mt-1">
              {reports.length} radiology report{reports.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2 shadow-md shadow-primary/20">
              <Upload className="w-4 h-4" /> Upload New Report
            </Button>
          </Link>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by title or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {(["all", "low", "moderate", "high"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                  filter === f
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats row */}
        {!isLoading && reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-4 gap-3 mb-6"
          >
            {[
              { label: "Total", value: reports.length, color: "text-foreground" },
              { label: "Low", value: reports.filter((r) => r.urgency === "low").length, color: "text-emerald-500" },
              { label: "Moderate", value: reports.filter((r) => r.urgency === "moderate").length, color: "text-amber-500" },
              { label: "High", value: reports.filter((r) => r.urgency === "high").length, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl border border-border bg-card text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Reports list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card">
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {filtered.map((report, i) => {
              const UrgencyIcon = urgencyIcons[report.urgency] ?? CheckCircle;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/reports/${report.id}`}>
                      <span className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer block truncate">
                        {report.title}
                      </span>
                    </Link>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                      {report.report_type && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {report.report_type}
                        </span>
                      )}
                      {report.body_part && (
                        <span className="text-xs text-muted-foreground">{report.body_part}</span>
                      )}
                    </div>
                    {report.simplified_explanation && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                        {report.simplified_explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${urgencyColors[report.urgency]}`}>
                      <UrgencyIcon className="w-3 h-3" />
                      {report.urgency}
                    </span>
                    <Link href={`/reports/${report.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center rounded-2xl border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Upload your first X-ray, MRI, or CT scan report and get an instant AI analysis
            </p>
            <Link href="/upload">
              <Button className="gap-2">
                <Upload className="w-4 h-4" /> Upload Your First Report
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No reports match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
