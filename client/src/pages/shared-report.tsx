import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, BookOpen, ListChecks, Clock, FileText, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSharedReport, type Report } from "@/lib/supabase";

const urgencyConfig: Record<string, { badge: string; icon: React.ElementType; label: string; description: string }> = {
  low: { badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: CheckCircle, label: "Low Urgency", description: "Routine follow-up with your primary care physician is recommended." },
  moderate: { badge: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: AlertTriangle, label: "Moderate Urgency", description: "Schedule an appointment with your doctor within the next 1-2 weeks." },
  high: { badge: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertTriangle, label: "High Urgency", description: "Seek medical attention as soon as possible. Contact your doctor today." },
};

export default function SharedReport() {
  const params = useParams<{ token: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSharedReport(params.token).then((r) => { setReport(r); setIsLoading(false); });
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-32 w-full mb-4" /><Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Report not found</h2>
        <p className="text-muted-foreground mb-6">This shared link may have expired or been removed.</p>
        <Link href="/"><Button>Go to MediNav</Button></Link>
      </div>
    );
  }

  const urgency = urgencyConfig[report.urgency] ?? urgencyConfig.low;
  const UrgencyIcon = urgency.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/10 border-b border-primary/20 py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Activity className="w-4 h-4" />
          <span>This report was shared via <strong>MediNav</strong> — AI Health & Affordability Platform</span>
          <Link href="/signup"><span className="underline cursor-pointer ml-2">Create your account →</span></Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {report.report_type && <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{report.report_type}</span>}
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{report.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(report.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm flex-shrink-0 ${urgency.badge}`}>
              <UrgencyIcon className="w-4 h-4" />{urgency.label}
            </div>
          </div>
          <div className={`mt-4 p-4 rounded-xl border ${urgency.badge}`}>
            <p className="text-sm font-medium">{urgency.description}</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {report.simplified_explanation && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                <h2 className="text-lg font-semibold">AI Summary</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{report.simplified_explanation}</p>
            </motion.div>
          )}

          {report.medical_terms_breakdown && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-accent" /></div>
                <h2 className="text-lg font-semibold">Medical Terms Explained</h2>
              </div>
              <div className="space-y-3">
                {report.medical_terms_breakdown.split(". ").filter(Boolean).map((term, i) => {
                  const parts = term.split(": ");
                  if (parts.length >= 2) return (
                    <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-sm font-semibold text-accent">{parts[0]}</span>
                      <span className="text-sm text-muted-foreground">: {parts.slice(1).join(": ")}</span>
                    </div>
                  );
                  return <p key={i} className="text-sm text-muted-foreground">{term}</p>;
                })}
              </div>
            </motion.div>
          )}

          {report.recommended_next_steps && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ListChecks className="w-4 h-4 text-emerald-500" /></div>
                <h2 className="text-lg font-semibold">Recommended Next Steps</h2>
              </div>
              <div className="space-y-2">
                {report.recommended_next_steps.split("\n").filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.replace(/^\d+\.\s*/, "")}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">Want to analyze your own radiology reports?</p>
          <Link href="/signup"><Button className="gap-2">Get started free with MediNav</Button></Link>
        </div>
      </div>
    </div>
  );
}
