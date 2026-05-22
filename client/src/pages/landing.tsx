import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity, Brain, MapPin, DollarSign, Shield, ChevronRight,
  Star, Zap, Upload, FileText, Volume2, MessageSquare,
  TrendingDown, CheckCircle, ArrowRight, Sparkles, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Nav } from "@/components/nav";

const STATS = [
  { value: "50K+", label: "Scans Analyzed" },
  { value: "98%", label: "AI Accuracy" },
  { value: "2.4s", label: "Analysis Time" },
  { value: "120+", label: "Partner Hospitals" },
];

const PILLARS = [
  {
    tag: "Pillar 01 — Radiology AI",
    heading: "Your scan, explained in plain English",
    body: "Upload any X-ray, MRI, or CT scan image or report. MediNav's Gemini Vision AI reads it instantly — breaking down every finding, flagging urgency, and telling you exactly what to do next. No medical degree required.",
    cta: "Upload Your Scan",
    href: "/upload",
    accent: "primary",
    features: [
      { icon: Upload, text: "X-ray, MRI, CT — image or text" },
      { icon: Brain, text: "Gemini Vision AI analysis" },
      { icon: Zap, text: "Urgency detection: Low / Moderate / High" },
      { icon: FileText, text: "Medical terms glossary" },
      { icon: Volume2, text: "Voice playback of your report" },
      { icon: MessageSquare, text: "AI chat for follow-up questions" },
    ],
    visual: (
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">medinav.ai/reports/42</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Brain MRI — Headache Evaluation</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">Moderate Urgency</span>
                <span className="text-xs text-muted-foreground">Jan 15, 2026</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Scattered white matter changes detected. These are non-specific findings often seen with migraines. No signs of stroke or tumor. A neurology follow-up is recommended within 2 weeks.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium">Medical Terms Explained</p>
            {[
              { term: "T2/FLAIR hyperintensities", def: "Bright spots on MRI — often harmless in young adults" },
              { term: "Periventricular", def: "Located near the fluid-filled spaces of the brain" },
            ].map((t) => (
              <div key={t.term} className="p-2 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-xs font-semibold text-accent">{t.term}: </span>
                <span className="text-xs text-muted-foreground">{t.def}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Volume2 className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Listen</p>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <MessageSquare className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Ask AI</p>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <FileText className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Share</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Pillar 02 — Health Finance",
    heading: "Affordable care, found in seconds",
    body: "Millions delay treatment because they don't know the cheapest hospital, what a procedure costs, or which insurance they qualify for. MediNav's AI solves every one of those problems — instantly.",
    cta: "Check Symptoms & Costs",
    href: "/symptom-checker",
    accent: "emerald",
    features: [
      { icon: Brain, text: "AI symptom checker + cost estimate" },
      { icon: DollarSign, text: "Treatment cost comparison" },
      { icon: MapPin, text: "Affordable clinic finder" },
      { icon: Shield, text: "NHIS & HMO insurance advisor" },
      { icon: TrendingDown, text: "0% interest payment plans" },
      { icon: MessageSquare, text: "24/7 health finance AI chat" },
    ],
    visual: (
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">medinav.ai/cost-estimator</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Malaria Treatment — Lagos</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "PHC / Public", value: "₦1,500", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Private Clinic", value: "₦8,000", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Teaching Hosp.", value: "₦3,200", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
              ].map((c) => (
                <div key={c.label} className={`p-2.5 rounded-xl border text-center ${c.bg}`}>
                  <div className={`text-base font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs font-medium text-emerald-500 mb-2">Nearby Affordable Clinics</p>
            {[
              { name: "Surulere PHC", dist: "0.8km", cost: "₦1,500", open: true },
              { name: "Lagos Island General", dist: "2.1km", cost: "₦3,200", open: true },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.dist}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-500">{c.cost}</span>
                  {c.open && <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Open</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs font-medium text-amber-500 mb-1">Insurance Match</p>
            <p className="text-xs text-muted-foreground">NHIS Basic Plan — <strong className="text-foreground">₦0/mo</strong> with govt subsidy. Covers malaria, antenatal, and outpatient care.</p>
          </div>
        </div>
      </div>
    ),
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Chen",
    role: "Radiologist, Lagos University Teaching Hospital",
    quote: "MediNav bridges the gap between complex radiology findings and patient understanding. I recommend it to every patient who leaves my office confused.",
    rating: 5,
  },
  {
    name: "Amaka O.",
    role: "Patient, Lagos",
    quote: "I finally understood my MRI results after years of confusion. The AI explained everything clearly — and then found me a clinic 2km away that charged ₦3,000 instead of ₦15,000.",
    rating: 5,
  },
  {
    name: "Ibrahim M.",
    role: "Small business owner, Kano",
    quote: "The insurance advisor found me a plan that covers my whole family for less than I was spending on a single hospital visit. This app changed how I think about healthcare.",
    rating: 5,
  },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background/60 to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} className="mb-6 flex justify-center">
              <Badge className="px-4 py-1.5 text-sm font-medium gap-2 border border-primary/30 bg-primary/10 text-primary rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by Gemini 2.5 Flash Vision AI
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6"
            >
              One AI platform.
              <br />
              <span className="gradient-text">Two life-changing tools.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
            >
              MediNav reads your radiology scans in plain English — and helps you afford the care you need.
              Upload a scan. Find a clinic. Understand your bill. All in one place.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-10">
              {[
                { icon: "🔬", text: "X-ray · MRI · CT scan analysis" },
                { icon: "💊", text: "Treatment cost comparison" },
                { icon: "🏥", text: "Affordable clinic finder" },
                { icon: "🛡️", text: "Insurance & payment plans" },
              ].map((chip) => (
                <span key={chip.text} className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 border border-border rounded-full px-3 py-1.5">
                  <span>{chip.icon}</span> {chip.text}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="gap-2 px-8 h-12 shadow-xl shadow-primary/20 hover:shadow-primary/35 transition-all text-base">
                  <Upload className="w-4 h-4" />
                  Upload Your Scan
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/symptom-checker">
                <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
                  <Brain className="w-4 h-4" />
                  Check Symptoms & Costs
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
                <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO PILLARS ── */}
      {PILLARS.map((pillar, idx) => (
        <section
          key={pillar.tag}
          className={`py-28 ${idx === 1 ? "bg-muted/20 border-y border-border/50" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${idx === 1 ? "lg:flex-row-reverse" : ""}`}>

              {/* Text side */}
              <motion.div
                initial={{ opacity: 0, x: idx === 0 ? -32 : 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={idx === 1 ? "lg:order-2" : ""}
              >
                <Badge className={`mb-5 text-xs font-semibold tracking-widest uppercase px-3 py-1 ${
                  idx === 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {pillar.tag}
                </Badge>

                <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
                  {pillar.heading}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  {pillar.body}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {pillar.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        idx === 0 ? "bg-primary/10" : "bg-emerald-500/10"
                      }`}>
                        <f.icon className={`w-3.5 h-3.5 ${idx === 0 ? "text-primary" : "text-emerald-500"}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{f.text}</span>
                    </div>
                  ))}
                </div>

                <Link href={pillar.href}>
                  <Button
                    size="lg"
                    className={`gap-2 px-8 h-12 ${
                      idx === 1
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0"
                        : "shadow-lg shadow-primary/20"
                    }`}
                  >
                    {pillar.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Visual side */}
              <motion.div
                initial={{ opacity: 0, x: idx === 0 ? 32 : -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`relative ${idx === 1 ? "lg:order-1" : ""}`}
              >
                <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-20 ${
                  idx === 0 ? "bg-primary/30" : "bg-emerald-500/30"
                }`} />
                <div className="relative">
                  {pillar.visual}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* ── HOW IT WORKS ── */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Up and running in 30 seconds</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">No setup. No medical knowledge required. Just upload and go.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Upload, title: "Upload your scan or describe symptoms", desc: "Drop an X-ray image, paste a report, or type what you're feeling. MediNav accepts it all.", color: "text-primary", bg: "bg-primary/10" },
              { step: "02", icon: Brain, title: "AI analyzes in under 3 seconds", desc: "Gemini Vision AI reads your scan, identifies findings, detects urgency, and explains every term.", color: "text-accent", bg: "bg-accent/10" },
              { step: "03", icon: CheckCircle, title: "Get your action plan + affordable options", desc: "Know exactly what to do next, where to go, what it costs, and how to pay for it.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative p-6 rounded-2xl border border-border bg-card">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">{s.step}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Trusted by patients and professionals</h2>
            <p className="text-muted-foreground">Real stories from real people who used MediNav to understand and afford their care.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-emerald-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge className="mb-6 gap-1.5 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Free to start. No credit card.
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              Your health deserves<br />
              <span className="gradient-text">clarity and affordability.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of patients and professionals using MediNav to understand their scans and navigate healthcare costs with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-10 h-12 shadow-xl shadow-primary/25 text-base">
                  Get started for free <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="gap-2 px-10 h-12 text-base">
                  <Users className="w-4 h-4" /> Our mission
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl font-serif">
                Medi<span className="text-primary">Nav</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/upload"><span className="hover:text-foreground transition-colors cursor-pointer">Upload Scan</span></Link>
              <Link href="/reports"><span className="hover:text-foreground transition-colors cursor-pointer">My Reports</span></Link>
              <Link href="/symptom-checker"><span className="hover:text-foreground transition-colors cursor-pointer">Symptom Checker</span></Link>
              <Link href="/clinic-finder"><span className="hover:text-foreground transition-colors cursor-pointer">Clinic Finder</span></Link>
              <Link href="/pricing"><span className="hover:text-foreground transition-colors cursor-pointer">Pricing</span></Link>
              <Link href="/about"><span className="hover:text-foreground transition-colors cursor-pointer">About</span></Link>
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right">
              AI analysis — not a substitute for medical advice
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
