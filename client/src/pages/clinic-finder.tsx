import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, Star, Phone, Clock, CheckCircle, DollarSign, Shield } from "lucide-react";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { findClinics, type ClinicResult } from "@/lib/supabase";

const BUDGET_OPTIONS = ["Under ₦2,000", "₦2,000 - ₦5,000", "₦5,000 - ₦15,000", "Any budget"];

export default function ClinicFinder() {
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [budget, setBudget] = useState("Any budget");
  const [isLoading, setIsLoading] = useState(false);
  const [clinics, setClinics] = useState<ClinicResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({ title: "Please enter your location", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setClinics([]);
    try {
      const data = await findClinics(location, condition || "general", budget);
      setClinics(data);
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
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Affordable Clinic Finder</h1>
              <p className="text-muted-foreground text-sm">Find clinics, hospitals & pharmacies that fit your budget</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="p-6 rounded-2xl border border-border bg-card mb-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Location *</Label>
              <Input placeholder="e.g. Surulere, Lagos" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Condition / Service (optional)</Label>
              <Input placeholder="e.g. malaria, antenatal, dental" value={condition} onChange={(e) => setCondition(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    budget === b
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><MapPin className="w-4 h-4" /> Find Clinics</>}
          </Button>
        </motion.form>

        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="font-medium">Finding affordable clinics near you...</p>
            </motion.div>
          )}

          {!isLoading && searched && clinics.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-muted-foreground">No clinics found. Try a different location or budget.</p>
            </motion.div>
          )}

          {!isLoading && clinics.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">{clinics.length} clinics found near {location}</p>
              {clinics.map((clinic, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{clinic.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{clinic.type}</span>
                        {clinic.openNow && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Open Now</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < Math.floor(clinic.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{clinic.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {clinic.distance} away</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {clinic.phone}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {clinic.address}</span>
                      </div>
                      {clinic.acceptsInsurance.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Shield className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-muted-foreground">Accepts: {clinic.acceptsInsurance.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-500">{clinic.estimatedCost}</div>
                        <div className="text-xs text-muted-foreground">consultation fee</div>
                      </div>
                      {clinic.paymentPlans && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <CheckCircle className="w-3 h-3" /> Payment plans available
                        </span>
                      )}
                      <a href={`https://www.google.com/maps/search/${encodeURIComponent(clinic.name + " " + clinic.address)}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Get Directions
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
