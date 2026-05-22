import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, Loader2, CheckCircle, Crown, ChevronRight, DollarSign } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPaymentPlans, type PaymentPlanOption } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const CREDIT_OPTIONS = ["Excellent (750+)", "Good (650-749)", "Fair (550-649)", "Poor (below 550)", "No credit history"];

export default function PaymentPlans() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [billAmount, setBillAmount] = useState("");
  const [creditScore, setCreditScore] = useState("No credit history");
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<PaymentPlanOption[]>([]);
  const [searched, setSearched] = useState(false);

  const isLocked = !user || user.plan === "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const amount = parseFloat(billAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Please enter a valid bill amount", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setPlans([]);
    try {
      const data = await getPaymentPlans(amount, creditScore);
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medical Payment Plans</h1>
              <p className="text-muted-foreground text-sm">Find 0% interest plans, charity care, and financing for your medical bills</p>
            </div>
          </div>
        </motion.div>

        {isLocked ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Upgrade to Access Payment Plans</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The Payment Plan Finder is available on Basic and Premium plans. Find 0% interest financing, hospital payment plans, and charity care programs.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="gap-2 bg-purple-500 hover:bg-purple-600 text-white border-0">
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
                  <Label>Medical Bill Amount (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150000"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit History</Label>
                  <div className="flex flex-wrap gap-2">
                    {CREDIT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCreditScore(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          creditScore === opt
                            ? "bg-purple-500 text-white border-purple-500"
                            : "border-border text-muted-foreground hover:border-purple-500/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding plans...</> : <><TrendingDown className="w-4 h-4" /> Find Payment Plans</>}
              </Button>
            </motion.form>

            <AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <TrendingDown className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
                  <p className="font-medium">Finding payment options for your bill...</p>
                </motion.div>
              )}

              {!isLoading && plans.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plans.length} payment options found</p>
                  {plans.map((plan, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-purple-500/30 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{plan.planName}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{plan.provider}</span>
                            {plan.interestRate === "0%" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">0% Interest</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-muted-foreground">
                            <div><span className="text-foreground font-medium">Interest Rate:</span> {plan.interestRate}</div>
                            <div><span className="text-foreground font-medium">Term:</span> {plan.term}</div>
                            <div><span className="text-foreground font-medium">Min Amount:</span> ₦{plan.minAmount.toLocaleString()}</div>
                            <div><span className="text-foreground font-medium">Requirements:</span> {plan.requirements}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xl font-bold text-purple-500">₦{plan.monthlyPayment.toLocaleString()}/mo</div>
                            <div className="text-xs text-muted-foreground">estimated monthly</div>
                          </div>
                          <a href={plan.applyUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-1.5 bg-purple-500 hover:bg-purple-600 text-white border-0">
                              Apply Now <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isLoading && searched && plans.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-muted-foreground">No plans found. Try a different bill amount.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
