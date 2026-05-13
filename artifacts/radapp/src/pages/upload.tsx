import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport, getGetRecentReportsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const DEMO_TEXTS: Record<string, { title: string; type: string; text: string }> = {
  chest: {
    title: "Chest X-Ray — Annual Checkup",
    type: "X-Ray",
    text: `EXAMINATION: PA and lateral chest radiograph
DATE: ${new Date().toLocaleDateString()}

CLINICAL INDICATION: Annual checkup, screening

FINDINGS:
The heart is normal in size and configuration. The cardiothoracic ratio is within normal limits. The mediastinum is unremarkable with no widening or shift.

The lungs are clear without evidence of focal consolidation, effusion, or pneumothorax. No mass or nodule is identified. The pulmonary vasculature appears normal.

The visualized osseous structures are intact. No acute rib fracture or bony abnormality is identified. The soft tissues are unremarkable.

IMPRESSION:
No acute cardiopulmonary abnormality.`,
  },
  brain: {
    title: "Brain MRI — Headache Evaluation",
    type: "MRI",
    text: `EXAMINATION: MRI brain without and with contrast
DATE: ${new Date().toLocaleDateString()}

CLINICAL INDICATION: Chronic headaches, rule out intracranial pathology

TECHNIQUE: Multiplanar multisequence MRI of the brain was performed without and with intravenous gadolinium contrast.

FINDINGS:
There are a few scattered T2/FLAIR hyperintensities in the periventricular and subcortical white matter, nonspecific but may represent sequelae of chronic small vessel ischemic disease or demyelinating plaques. 

No acute infarct is identified on diffusion-weighted imaging. No hemorrhage, mass lesion, or abnormal enhancement is identified. The ventricles and sulci are normal in size and configuration. The cerebellopontine angle cisterns are symmetric. No extra-axial collection is present.

IMPRESSION:
1. Nonspecific white matter changes as described above.
2. No acute intracranial abnormality.
Clinical correlation recommended. Consider neurology referral.`,
  },
  knee: {
    title: "Right Knee MRI — Sports Injury",
    type: "MRI",
    text: `EXAMINATION: MRI right knee without contrast
DATE: ${new Date().toLocaleDateString()}

CLINICAL INDICATION: Pain and swelling following sports activity, rule out ligament or meniscal injury

TECHNIQUE: Multiplanar multisequence MRI of the right knee without intravenous contrast.

FINDINGS:
MENISCI: There is a horizontal tear of the posterior horn of the medial meniscus extending to the inferior articular surface. The anterior horn of the medial meniscus is intact. The lateral meniscus is intact bilaterally.

LIGAMENTS: The anterior cruciate ligament is intact without evidence of tear or sprain. The posterior cruciate ligament is intact. The medial and lateral collateral ligaments are intact.

ARTICULAR CARTILAGE: There is mild chondromalacia of the medial femoral condyle and medial tibial plateau consistent with grade II changes.

JOINT: Moderate joint effusion is present.

IMPRESSION:
1. Medial meniscus posterior horn horizontal tear with inferior articular surface extension.
2. Mild articular cartilage loss, medial compartment.
3. Moderate joint effusion.`,
  },
};

export default function Upload() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createReport = useCreateReport();

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setReportText(ev.target.result);
        }
      };
      reader.readAsText(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") setReportText(ev.target.result);
      };
      reader.readAsText(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const loadDemo = (key: string) => {
    const demo = DEMO_TEXTS[key];
    if (demo) {
      setTitle(demo.title);
      setReportType(demo.type);
      setReportText(demo.text);
      setUploadedFileName(null);
      toast({ title: "Demo report loaded", description: "Click 'Analyze Report' to see AI results." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reportText.trim()) {
      toast({ title: "Please provide a title and report text", variant: "destructive" });
      return;
    }
    createReport.mutate(
      { data: { title: title.trim(), originalText: reportText.trim(), reportType: reportType || undefined } },
      {
        onSuccess: (report) => {
          queryClient.invalidateQueries({ queryKey: getGetRecentReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          toast({ title: "Report analyzed successfully!" });
          setLocation(`/reports/${report.id}`);
        },
        onError: () => {
          toast({ title: "Failed to analyze report", variant: "destructive" });
        },
      }
    );
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">Upload Radiology Report</h1>
          <p className="text-muted-foreground">Upload a PDF, text file, or paste your report text for instant AI analysis</p>
        </motion.div>

        {/* Demo report chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-sm text-muted-foreground mb-3">Or try a demo report:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "chest", label: "Chest X-Ray" },
              { key: "brain", label: "Brain MRI" },
              { key: "knee", label: "Knee MRI" },
            ].map((demo) => (
              <button
                key={demo.key}
                onClick={() => loadDemo(demo.key)}
                data-testid={`button-demo-${demo.key}`}
                className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              data-testid="zone-drop-upload"
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.text"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />

              <AnimatePresence mode="wait">
                {uploadedFileName ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                    <p className="font-medium text-emerald-500">{uploadedFileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">File loaded successfully</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUploadedFileName(null); setReportText(""); }}
                      className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <UploadIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium mb-1">Drop your report here</p>
                    <p className="text-sm text-muted-foreground">or click to browse — PDF or TXT files</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or paste report text</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Report text */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="report-text">Report Text</Label>
            <Textarea
              id="report-text"
              placeholder="Paste your radiology report findings here..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              data-testid="input-report-text"
              className="min-h-52 resize-y font-mono text-sm"
            />
          </motion.div>

          {/* Title + Type */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                placeholder="e.g. Chest X-Ray — Annual Checkup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-report-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type (optional)</Label>
              <Input
                id="type"
                placeholder="e.g. MRI, X-Ray, CT Scan"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                data-testid="input-report-type"
              />
            </div>
          </motion.div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 shadow-md shadow-primary/20"
            disabled={createReport.isPending}
            data-testid="button-analyze-report"
          >
            {createReport.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze Report
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
