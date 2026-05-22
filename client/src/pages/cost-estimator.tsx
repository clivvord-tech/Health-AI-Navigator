import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Loader2, TrendingDown, CheckCircle, MapPin, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { estimateCost, type CostEstimate } from "@/lib/supabase";
import { Link } from "wouter";

const COMMON_PROCEDURES = [
  "Malaria treatment", "Blood test (full panel)", "Antenatal care visit",
  "Appendix surgery", "Dental extraction", "Eye examination",
  "Typhoid treatment", "Caesarean section", "Kidney dialysis",
];

export default function CostEstimator() {
  const { toast } = useToast();
  const [procedure, setProcedure] = useState("");
  const [location, setLocation] = useState("");
  const [hasInsurance, setHasInsurance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedure.trim()) {
      toast({ title: "Please enter a procedure or treatment", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setEstimate(null);
    try {
      const data = await estimateCost(procedure, location || "Nigeria", hasInsurance);
      setEstimate(data);
    } catch {
      toast({ title: "Estimation failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Treatment Cost Estimator</h1>
              <p className="text-muted-foreground text-sm">Compare costs across hospitals and find the most affordable option</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Procedure or Treatment *</Label>
                <Input
                  placeholder="e.g. malaria treatment, blood test, surgery"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {COMMON_PROCEDURES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProcedure(p)}
                      className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input placeholder="e.g. Abuja, Port Harcourt" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={hasInsurance}
                  onChange={(e) => setHasInsurance(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="insurance" className="text-sm cursor-pointer">
                  I have health insurance (show costs with insurance)
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Estimating costs...</>
                ) : (
                  <><DollarSign className="w-4 h-4" /> Get Cost Estimate</>
                )}
              </Button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <DollarSign className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
                <p className="font-medium">Comparing costs across hospitals...</p>
              </motion.div>
            )}

            {estimate && !isLoading && (
              <motion.div key="result" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <h3 className="font-semibold mb-4">{estimate.procedure} — Cost Range</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Cheapest", value: `₦${estimate.lowCost.toLocaleString()}`, color: "text-emerald-500" },
                      { label: "Average", value: `₦${estimate.avgCost.toLocaleString()}`, color: "text-amber-500" },
                      { label: "Expensive", value: `₦${estimate.highCost.toLocaleString()}`, color: "text-red-500" },
                    ].map((c) => (
                      <div key={c.label} className="text-center p-3 rounded-xl bg-muted/40">
                        <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
                        <div className="text-xs text-muted-foreground">{c.label}</div>
                      </div>
                    ))}
                  </div>
                  {hasInsurance && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">With Insurance: <span className="text-primary font-bold">₦{estimate.withInsurance.toLocaleString()}</span></span>
                      </div>
                    </div>
                  )}
                </div>

                {estimate.savingsTips.length > 0 && (
                  <div className="p-4 rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h3 className="font-semibold text-sm">Money-Saving Tips</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {estimate.savingsTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {estimate.cheaperAlternatives.length > 0 && (
                  <div className="p-4 rounded-2xl border border-border bg-card">
                    <h3 className="font-semibold text-sm mb-3">Cheaper Alternatives</h3>
                    <ul className="space-y-1.5">
                      {estimate.cheaperAlternatives.map((alt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href="/clinic-finder">
                  <Button className="w-full gap-2">
                    <MapPin className="w-4 h-4" /> Find Affordable Clinics Nearby
                  </Button>
                </Link>
              </motion.div>
            )}

            {!estimate && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Enter a procedure to get cost estimates</p>
                <p className="text-sm text-muted-foreground">We'll compare prices across public, private, and mission hospitals</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
