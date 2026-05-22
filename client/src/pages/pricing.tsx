import { motion } from "framer-motion";
import { CheckCircle, Crown, Zap, Heart, ChevronRight, X } from "lucide-react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Plan } from "@/hooks/use-auth";

const PLANS = [
  {
    id: "free" as Plan,
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Get started with basic healthcare navigation",
    color: "border-border",
    buttonVariant: "outline" as const,
    buttonText: "Current Plan",
    icon: Heart,
    iconColor: "text-muted-foreground",
    features: [
      { text: "5 AI symptom checks per month", included: true },
      { text: "Basic clinic finder (5 results)", included: true },
      { text: "Treatment cost estimates", included: true },
      { text: "AI health chat (10 messages/mo)", included: true },
      { text: "Insurance advisor", included: false },
      { text: "Payment plan finder", included: false },
      { text: "Unlimited AI consultations", included: false },
      { text: "Telemedicine access", included: false },
      { text: "Personal health advisor", included: false },
      { text: "Bill negotiation support", included: false },
    ],
  },
  {
    id: "basic" as Plan,
    name: "Basic",
    price: "₦500",
    period: "per month",
    description: "Everything you need to afford healthcare",
    color: "border-primary/60",
    buttonVariant: "default" as const,
    buttonText: "Upgrade to Basic",
    badge: "Most Popular",
    icon: Zap,
    iconColor: "text-primary",
    features: [
      { text: "Unlimited AI symptom checks", included: true },
      { text: "Full clinic finder (unlimited results)", included: true },
      { text: "Detailed cost comparisons", included: true },
      { text: "Unlimited AI health chat", included: true },
      { text: "Insurance advisor", included: true },
      { text: "Payment plan finder", included: true },
      { text: "Unlimited AI consultations", included: true },
      { text: "Telemedicine access", included: false },
      { text: "Personal health advisor", included: false },
      { text: "Bill negotiation support", included: false },
    ],
  },
  {
    id: "premium" as Plan,
    name: "Premium",
    price: "₦1,500",
    period: "per month",
    description: "Complete healthcare affordability suite",
    color: "border-amber-500/60",
    buttonVariant: "default" as const,
    buttonText: "Upgrade to Premium",
    badge: "Best Value",
    icon: Crown,
    iconColor: "text-amber-500",
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Telemedicine access (2 sessions/mo)", included: true },
      { text: "Personal AI health advisor", included: true },
      { text: "Hospital bill negotiation support", included: true },
      { text: "Priority clinic matching", included: true },
      { text: "Family health profiles (up to 5)", included: true },
      { text: "Medication price tracker", included: true },
      { text: "Health spending analytics", included: true },
      { text: "Emergency health fund guidance", included: true },
      { text: "24/7 priority AI support", included: true },
    ],
  },
];

const REVENUE_STREAMS = [
  { title: "Subscription Revenue", desc: "₦500–₦1,500/mo per user. Target: 10,000 users = ₦5M–₦15M/mo", icon: "💳" },
  { title: "Clinic Partnership Fees", desc: "Clinics pay ₦5,000–₦20,000/mo to be featured and get patient referrals", icon: "🏥" },
  { title: "Insurance Commission", desc: "5–15% commission on insurance plans sold through the platform", icon: "🛡️" },
  { title: "Telemedicine Revenue Share", desc: "30% revenue share on telemedicine consultations booked via MediNav", icon: "📱" },
  { title: "Pharmacy Partnerships", desc: "Drug price comparison with affiliate commissions from partner pharmacies", icon: "💊" },
  { title: "B2B / Employer Plans", desc: "Corporate health benefit packages for SMEs and large employers", icon: "🏢" },
];

export default function Pricing() {
  const { user, upgradePlan } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = (plan: Plan) => {
    if (!user) return;
    if (plan === user.plan) return;
    upgradePlan(plan);
    toast({
      title: `Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`,
      description: "Your new features are now unlocked.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="mb-4 gap-1 bg-primary/10 text-primary border-primary/20">
            <Crown className="w-3 h-3" /> Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Affordable plans for <span className="gradient-text">affordable healthcare</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime. Every plan helps you save more than it costs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = user?.plan === plan.id;
            const isPremiumPlan = plan.id === "premium";
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border-2 ${plan.color} bg-card ${isPremiumPlan ? "bg-gradient-to-b from-amber-500/5 to-card" : ""}`}
              >
                {plan.badge && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs border-0 ${isPremiumPlan ? "bg-amber-500" : "bg-primary"} text-white`}>
                    {plan.badge}
                  </Badge>
                )}

                <div className={`w-12 h-12 rounded-xl ${isPremiumPlan ? "bg-amber-500/10" : "bg-primary/10"} flex items-center justify-center mb-4`}>
                  <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-bold ${isPremiumPlan ? "text-amber-500" : "text-primary"}`}>{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full mb-6" disabled>
                    ✓ Current Plan
                  </Button>
                ) : user ? (
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full mb-6 gap-2 ${isPremiumPlan ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}`}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plan.buttonText} <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Link href="/signup">
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full mb-6 gap-2 ${isPremiumPlan ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}`}
                    >
                      {plan.id === "free" ? "Get Started Free" : plan.buttonText} <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue model section */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="text-center mb-10">
            <Badge className="mb-4 gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              💰 Revenue Model
            </Badge>
            <h2 className="text-3xl font-bold mb-3">How MediNav Generates Revenue</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Multiple revenue streams ensure sustainability and allow us to keep the free tier genuinely useful.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVENUE_STREAMS.map((stream, i) => (
              <motion.div
                key={stream.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-border bg-card"
              >
                <div className="text-2xl mb-3">{stream.icon}</div>
                <h3 className="font-semibold mb-2">{stream.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{stream.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center p-10 rounded-2xl border border-border bg-card">
          <h2 className="text-2xl font-bold mb-3">Every plan pays for itself</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            The average MediNav user saves ₦47,000 on their first healthcare interaction. Even our Premium plan at ₦1,500/mo delivers 30x ROI.
          </p>
          {!user && (
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-10">
                Start Free Today <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
