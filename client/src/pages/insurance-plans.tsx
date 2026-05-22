import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, CheckCircle, Star, Crown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getInsurancePlans, type InsurancePlan } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function InsurancePlans() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [income, setIncome] = useState("");
  const [familySize, setFamilySize] = useState("");
  const [location, setLocation] = useState("");
  const [conditions, setConditions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [searched, setSearched] = useState(false);

  const isLocked = !user || user.plan === "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!income.trim()) {
      toast({ title: "Please enter your monthly income", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setPlans([]);
    try {
      const data = await getInsurancePlans(income, familySize || "1", location || "Nigeria", conditions);
      setPlans(data);
      setSearched(true);
    } catch {
      toast({ title: "Search failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Health Insurance Advisor</h1>
              <p className="text-muted-foreground text-sm">Find the most affordable insurance plan for your income and family</p>
            </div>
          </div>
        </motion.div>

        {isLocked ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Upgrade to Access Insurance Advisor</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The Insurance Advisor is available on Basic and Premium plans. It compares NHIS, HMO, and private insurance plans based on your income and needs.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0">
                <Crown className="w-4 h-4" /> Upgrade Now — from ₦500/mo
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="p-6 rounded-2xl border border-border bg-card mb-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Income (₦) *</Label>
                  <Input placeholder="e.g. 50000" value={income} onChange={(e) => setIncome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Family Size</Label>
                  <Input placeholder="e.g. 4 (including yourself)" value={familySize} onChange={(e) => setFamilySize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State / Location</Label>
                  <Input placeholder="e.g. Lagos, Kano" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pre-existing Conditions (optional)</Label>
                  <Input placeholder="e.g. diabetes, hypertension" value={conditions} onChange={(e) => setConditions(e.target.value)} />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding plans...</> : <><Shield className="w-4 h-4" /> Find Insurance Plans</>}
              </Button>
            </motion.form>

            <AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                  <p className="font-medium">Comparing insurance plans for your profile...</p>
                </motion.div>
              )}

              {!isLoading && plans.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plans.length} plans found for your profile</p>
                  {plans.map((plan, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-amber-500/30 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{plan.provider}</span>
                            {plan.govtSubsidy && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Govt Subsidy Available</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`w-3 h-3 ${j < Math.floor(plan.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">Best for: {plan.bestFor}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.coverage.map((c) => (
                              <span key={c} className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xl font-bold text-amber-500">₦{plan.monthlyPremium.toLocaleString()}/mo</div>
                            <div className="text-xs text-muted-foreground">Deductible: ₦{plan.deductible.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Copay: ₦{plan.copay.toLocaleString()}</div>
                          </div>
                          <Button size="sm" className="gap-1.5">
                            Apply Now <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isLoading && searched && plans.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-muted-foreground">No plans found. Try adjusting your income or location.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
