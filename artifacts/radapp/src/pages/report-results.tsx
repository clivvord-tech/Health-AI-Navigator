import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, AlertTriangle, CheckCircle, BookOpen, ListChecks, Clock, FileText, Loader2, Share2, Copy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetReport } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const urgencyConfig: Record<string, {
  badge: string;
  icon: React.ElementType;
  label: string;
  description: string;
  pulse?: boolean;
}> = {
  low: {
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: CheckCircle,
    label: "Low Urgency",
    description: "Routine follow-up with your primary care physician is recommended.",
    pulse: false,
  },
  moderate: {
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: AlertTriangle,
    label: "Moderate Urgency",
    description: "Schedule an appointment with your doctor within the next 1-2 weeks.",
    pulse: false,
  },
  high: {
    badge: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: AlertTriangle,
    label: "High Urgency",
    description: "Seek medical attention as soon as possible. Contact your doctor today.",
    pulse: true,
  },
};

export default function ReportResults() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const { data: report, isLoading } = useGetReport(id, {
    query: { enabled: !!id && !isNaN(id) },
  });

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch(`/api/reports/${id}/share`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      await navigator.clipboard.writeText(url);
      toast({ title: "Share link copied!", description: "Anyone with this link can view the report." });
    } catch {
      toast({ title: "Failed to generate share link", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const handleVoicePlayback = () => {
    if (!report?.simplifiedExplanation) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(report.simplifiedExplanation);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Report not found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const urgency = urgencyConfig[report.urgency] ?? urgencyConfig.low;
  const UrgencyIcon = urgency.icon;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-8 -ml-3" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {report.reportType && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    {report.reportType}
                  </span>
                )}
                {report.bodyPart && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    {report.bodyPart}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{report.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>

            {/* Urgency badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm flex-shrink-0 ${urgency.badge} ${urgency.pulse ? "urgency-pulse" : ""}`}>
              <UrgencyIcon className="w-4 h-4" />
              {urgency.label}
            </div>
          </div>

          {/* Urgency description */}
          <div className={`mt-4 p-4 rounded-xl border ${urgency.badge}`}>
            <p className="text-sm font-medium">{urgency.description}</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* AI Explanation */}
          {report.simplifiedExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">AI Summary</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleVoicePlayback}
                  data-testid="button-voice-playback"
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{report.simplifiedExplanation}</p>
            </motion.div>
          )}

          {/* Medical Terms */}
          {report.medicalTermsBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-lg font-semibold">Medical Terms Explained</h2>
              </div>
              <div className="space-y-3">
                {report.medicalTermsBreakdown.split(". ").filter(Boolean).map((term, i) => {
                  const parts = term.split(": ");
                  if (parts.length >= 2) {
                    return (
                      <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                        <span className="text-sm font-semibold text-accent">{parts[0]}</span>
                        <span className="text-sm text-muted-foreground">: {parts.slice(1).join(": ")}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-sm text-muted-foreground">{term}</p>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          {report.recommendedNextSteps && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold">Recommended Next Steps</h2>
              </div>
              <div className="space-y-2">
                {report.recommendedNextSteps.split("\n").filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Original Report */}
          {report.originalText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h2 className="text-lg font-semibold mb-4">Original Report</h2>
              <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-xl p-4 max-h-64 overflow-y-auto">
                {report.originalText}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border"
        >
          <Link href="/chat" className="flex-1">
            <Button variant="outline" className="w-full gap-2" data-testid="button-ask-ai">
              Ask AI Assistant about this report
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleShare} disabled={isSharing} data-testid="button-share-report">
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Share Report
          </Button>
          <Link href="/upload">
            <Button className="gap-2" data-testid="button-upload-another">
              <FileText className="w-4 h-4" />
              Upload Another
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
