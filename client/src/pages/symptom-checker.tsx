import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, AlertTriangle, CheckCircle, DollarSign, ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeSymptoms, type SymptomResult } from "@/lib/supabase";
import { Link } from "wouter";

const urgencyConfig = {
  low: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle, label: "Low Urgency", advice: "Monitor at home. Visit a clinic within 1-2 weeks if symptoms persist." },
  moderate: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, label: "Moderate Urgency", advice: "Visit a clinic or doctor within 2-3 days." },
  high: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/30", icon: AlertTriangle, label: "High Urgency", advice: "Seek medical attention today. Go to the nearest clinic or emergency room." },
};

const EXAMPLE_SYMPTOMS = [
  "Fever, headache, and body aches for 3 days",
  "Chest pain and shortness of breath",
  "Persistent cough for 2 weeks",
  "Stomach pain and vomiting after eating",
];

export default function SymptomChecker() {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast({ title: "Please describe your symptoms", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeSymptoms(symptoms, age || "adult", location || "Nigeria");
      setResult(data);
    } catch {
      toast({ title: "Analysis failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const urgency = result ? urgencyConfig[result.urgency] : null;
  const UrgencyIcon = urgency?.icon;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
              <p className="text-muted-foreground text-sm">Get possible conditions, urgency level & estimated treatment costs</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
            ⚠️ This is for informational purposes only. Always consult a qualified healthcare professional for diagnosis and treatment.
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Describe your symptoms *</Label>
                <Textarea
                  placeholder="e.g. I have had a fever of 38.5°C for 2 days, with headache, body aches, and chills..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_SYMPTOMS.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setSymptoms(ex)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input id="age" placeholder="e.g. 25" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input id="location" placeholder="e.g. Lagos, Abuja" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing symptoms...</>
                ) : (
                  <><Brain className="w-4 h-4" /> Analyze Symptoms</>
                )}
              </Button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="font-medium mb-1">AI is analyzing your symptoms...</p>
                <p className="text-sm text-muted-foreground">Checking conditions, urgency & costs</p>
              </motion.div>
            )}

            {result && !isLoading && (
              <motion.div key="result" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Urgency */}
                <div className={`p-4 rounded-2xl border-2 ${urgency?.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {UrgencyIcon && <UrgencyIcon className={`w-5 h-5 ${urgency?.color}`} />}
                    <span className={`font-bold ${urgency?.color}`}>{urgency?.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{urgency?.advice}</p>
                  {result.urgency === "high" && (
                    <a href="https://www.google.com/maps/search/hospital+near+me" target="_blank" rel="noopener noreferrer" className="mt-3 block">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-1.5 w-full">
                        <MapPin className="w-3.5 h-3.5" /> Find Nearest Hospital
                      </Button>
                    </a>
                  )}
                </div>

                {/* Cost estimate */}
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-sm">Estimated Treatment Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">{result.estimatedCostRange}</div>
                  <p className="text-xs text-muted-foreground mt-1">Varies by clinic type and location</p>
                </div>

                {/* Possible conditions */}
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <h3 className="font-semibold text-sm mb-3">Possible Conditions</h3>
                  <div className="space-y-2">
                    {result.possibleConditions.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/40">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                        <div>
                          <div className="text-sm font-medium">{c.name} <span className="text-xs text-muted-foreground">({c.likelihood})</span></div>
                          <div className="text-xs text-muted-foreground">{c.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-care */}
                {result.selfCareAdvice.length > 0 && (
                  <div className="p-4 rounded-2xl border border-border bg-card">
                    <h3 className="font-semibold text-sm mb-3">Self-Care While You Wait</h3>
                    <ul className="space-y-1.5">
                      {result.selfCareAdvice.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link href="/clinic-finder" className="flex-1">
                    <Button variant="outline" className="w-full gap-1.5 text-sm">
                      <MapPin className="w-3.5 h-3.5" /> Find Affordable Clinics
                    </Button>
                  </Link>
                  <Link href="/cost-estimator" className="flex-1">
                    <Button className="w-full gap-1.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5" /> Get Cost Estimate <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {!result && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Describe your symptoms</p>
                <p className="text-sm text-muted-foreground">AI will analyze and provide possible conditions, urgency level, and estimated costs</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
