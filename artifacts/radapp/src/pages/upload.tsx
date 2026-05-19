import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, Loader2, ChevronRight, Image, FileImage } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getGetRecentReportsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const DEMO_TEXTS: Record<string, { title: string; type: string; text: string }> = {
  chest: {
    title: "Chest X-Ray — Annual Checkup",
    type: "X-Ray",
    text: `EXAMINATION: PA and lateral chest radiograph\nDATE: ${new Date().toLocaleDateString()}\n\nCLINICAL INDICATION: Annual checkup, screening\n\nFINDINGS:\nThe heart is normal in size and configuration. The cardiothoracic ratio is within normal limits. The mediastinum is unremarkable with no widening or shift.\n\nThe lungs are clear without evidence of focal consolidation, effusion, or pneumothorax. No mass or nodule is identified. The pulmonary vasculature appears normal.\n\nThe visualized osseous structures are intact. No acute rib fracture or bony abnormality is identified.\n\nIMPRESSION:\nNo acute cardiopulmonary abnormality.`,
  },
  brain: {
    title: "Brain MRI — Headache Evaluation",
    type: "MRI",
    text: `EXAMINATION: MRI brain without and with contrast\nDATE: ${new Date().toLocaleDateString()}\n\nCLINICAL INDICATION: Chronic headaches, rule out intracranial pathology\n\nFINDINGS:\nThere are a few scattered T2/FLAIR hyperintensities in the periventricular and subcortical white matter, nonspecific but may represent sequelae of chronic small vessel ischemic disease or demyelinating plaques.\n\nNo acute infarct is identified on diffusion-weighted imaging. No hemorrhage, mass lesion, or abnormal enhancement is identified.\n\nIMPRESSION:\n1. Nonspecific white matter changes as described above.\n2. No acute intracranial abnormality.\nClinical correlation recommended. Consider neurology referral.`,
  },
  knee: {
    title: "Right Knee MRI — Sports Injury",
    type: "MRI",
    text: `EXAMINATION: MRI right knee without contrast\nDATE: ${new Date().toLocaleDateString()}\n\nCLINICAL INDICATION: Pain and swelling following sports activity\n\nFINDINGS:\nMENISCI: There is a horizontal tear of the posterior horn of the medial meniscus extending to the inferior articular surface.\n\nLIGAMENTS: The anterior cruciate ligament is intact. The posterior cruciate ligament is intact.\n\nARTICULAR CARTILAGE: Mild chondromalacia of the medial femoral condyle consistent with grade II changes.\n\nJOINT: Moderate joint effusion is present.\n\nIMPRESSION:\n1. Medial meniscus posterior horn horizontal tear.\n2. Mild articular cartilage loss, medial compartment.\n3. Moderate joint effusion.`,
  },
};

type UploadMode = "file" | "text";

export default function Upload() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<UploadMode>("file");
  const [title, setTitle] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setMode("file");
    } else if (file.type === "application/pdf") {
      setImagePreview(null);
      setMode("file");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") setReportText(e.target.result);
      };
      reader.readAsText(file);
      setImagePreview(null);
    }
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const loadDemo = (key: string) => {
    const demo = DEMO_TEXTS[key];
    if (demo) {
      setTitle(demo.title);
      setReportType(demo.type);
      setReportText(demo.text);
      setUploadedFile(null);
      setImagePreview(null);
      setMode("text");
      toast({ title: "Demo report loaded", description: "Click 'Analyze Report' to see AI results." });
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setImagePreview(null);
    setReportText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Please provide a report title", variant: "destructive" });
      return;
    }
    if (!uploadedFile && !reportText.trim()) {
      toast({ title: "Please upload a file or paste report text", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const stored = localStorage.getItem("radapp_user");
      const userId = stored ? JSON.parse(stored).id : null;

      let response: Response;

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("title", title.trim());
        if (reportType) formData.append("reportType", reportType);
        response = await fetch("/api/reports", {
          method: "POST",
          headers: userId ? { "x-user-id": userId } : {},
          body: formData,
        });
      } else {
        response = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId ? { "x-user-id": userId } : {}),
          },
          body: JSON.stringify({ title: title.trim(), originalText: reportText.trim(), reportType: reportType || undefined }),
        });
      }

      if (!response.ok) throw new Error("Failed");
      const report = await response.json();

      queryClient.invalidateQueries({ queryKey: getGetRecentReportsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      toast({ title: "Report analyzed successfully!" });
      setLocation(`/reports/${report.id}`);
    } catch {
      toast({ title: "Failed to analyze report. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  const isImage = uploadedFile?.type.startsWith("image/");
  const isPdf = uploadedFile?.type === "application/pdf";

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Radiology Report</h1>
          <p className="text-muted-foreground">Upload an X-ray/MRI image, PDF report, text file, or paste your report — AI will analyze it instantly</p>
        </motion.div>

        {/* Supported formats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2 mb-6">
          {[
            { icon: "🖼️", label: "X-Ray / MRI Image", sub: "JPG, PNG, WEBP" },
            { icon: "📄", label: "PDF Report", sub: "Scanned or digital" },
            { icon: "📝", label: "Text Report", sub: "TXT file or paste" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm">
              <span>{f.icon}</span>
              <div>
                <div className="font-medium text-xs">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Demo chips */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Or try a demo report:</p>
          <div className="flex flex-wrap gap-2">
            {[{ key: "chest", label: "🫁 Chest X-Ray" }, { key: "brain", label: "🧠 Brain MRI" }, { key: "knee", label: "🦵 Knee MRI" }].map((demo) => (
              <button key={demo.key} onClick={() => loadDemo(demo.key)} data-testid={`button-demo-${demo.key}`}
                className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                {demo.label}
              </button>
            ))}
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploadedFile && fileInputRef.current?.click()}
              data-testid="zone-drop-upload"
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver ? "border-primary bg-primary/5 scale-[1.02]" :
                uploadedFile ? "border-emerald-500/50 bg-emerald-500/5" :
                "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".txt,.pdf,.text,image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileSelect} data-testid="input-file-upload" />

              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative mb-4">
                        <img src={imagePreview} alt="Preview" className="max-h-64 max-w-full rounded-xl object-contain border border-border shadow-md" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">AI Vision Ready</div>
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isPdf ? "bg-red-500/10" : "bg-primary/10"}`}>
                        {isPdf ? <FileText className="w-8 h-8 text-red-500" /> : <FileImage className="w-8 h-8 text-primary" />}
                      </div>
                    )}
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isImage ? "Image will be analyzed by Gemini Vision AI" : isPdf ? "PDF text will be extracted and analyzed" : "Text file loaded"}
                    </p>
                    <button type="button" onClick={clearFile} className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" /> Remove file
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <UploadIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium mb-1">Drop your file here</p>
                    <p className="text-sm text-muted-foreground">X-ray/MRI images, PDF reports, or TXT files</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Text paste (shown when no image file) */}
          {!isImage && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or paste report text</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                <Label htmlFor="report-text">Report Text</Label>
                <Textarea id="report-text" placeholder="Paste your radiology report findings here..." value={reportText} onChange={(e) => setReportText(e.target.value)} data-testid="input-report-text" className="min-h-52 resize-y font-mono text-sm" />
              </motion.div>
            </>
          )}

          {/* Title + Type */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input id="title" placeholder="e.g. Chest X-Ray — Annual Checkup" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-report-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type (optional)</Label>
              <Input id="type" placeholder="e.g. MRI, X-Ray, CT Scan" value={reportType} onChange={(e) => setReportType(e.target.value)} data-testid="input-report-type" />
            </div>
          </motion.div>

          {isImage && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Image className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">Gemini Vision AI will analyze your image</p>
                <p className="text-muted-foreground text-xs mt-1">The AI will examine the actual imaging findings, identify abnormalities, assess urgency, and explain results in plain language — just like a radiologist would.</p>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full gap-2 shadow-md shadow-primary/20" disabled={isSubmitting} data-testid="button-analyze-report">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI{isImage ? " Vision" : ""}...</>
            ) : (
              <><FileText className="w-4 h-4" />Analyze Report<ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
