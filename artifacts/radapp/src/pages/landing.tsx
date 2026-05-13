import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, Brain, Shield, Zap, FileText, MessageSquare, Volume2, ChevronRight, Star, Upload, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Nav } from "@/components/nav";

const DEMO_REPORTS = [
  {
    type: "Chest X-Ray",
    title: "Chest X-Ray — Annual Checkup",
    urgency: "low",
    preview: "Heart and lung fields appear normal. No consolidation or effusion.",
    icon: "🫁",
  },
  {
    type: "Brain MRI",
    title: "Brain MRI — Headache Evaluation",
    urgency: "moderate",
    preview: "Scattered T2/FLAIR hyperintensities in periventricular white matter.",
    icon: "🧠",
  },
  {
    type: "Knee MRI",
    title: "Right Knee MRI — Sports Injury",
    urgency: "moderate",
    preview: "Horizontal tear of the posterior horn of the medial meniscus.",
    icon: "🦵",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI translates complex medical jargon into plain language you can actually understand.",
  },
  {
    icon: Shield,
    title: "Urgency Detection",
    description: "Instantly know how urgent your findings are with Low, Moderate, and High urgency classifications.",
  },
  {
    icon: Volume2,
    title: "Voice Playback",
    description: "Listen to your report explanation with natural text-to-speech — ideal for accessibility.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Ask follow-up questions to our medical AI assistant and get clear, helpful answers.",
  },
  {
    icon: FileText,
    title: "Medical Terms Glossary",
    description: "Every complex term is broken down and explained in plain English.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Upload any radiology report and receive a comprehensive AI analysis within seconds.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Chen",
    role: "Radiologist, Stanford Medical",
    quote: "RADapp is exactly what patients need. It bridges the gap between complex findings and patient understanding beautifully.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Patient",
    quote: "I finally understood my MRI results after years of confusion. The AI explained everything in a way that made sense.",
    rating: 5,
  },
  {
    name: "Dr. Aisha Patel",
    role: "Internal Medicine, Cleveland Clinic",
    quote: "I recommend RADapp to all my patients. It reduces anxiety and helps them come to appointments better informed.",
    rating: 5,
  },
];

const STATS = [
  { value: "50K+", label: "Reports Analyzed" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "2.4s", label: "Avg. Analysis Time" },
  { value: "120+", label: "Partner Hospitals" },
];

const urgencyColors: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  moderate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background" />

        {/* Glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <Badge className="px-4 py-1.5 text-sm font-medium gap-2 border border-primary/30 bg-primary/10 text-primary">
                <Zap className="w-3 h-3" />
                AI-Powered Radiology Intelligence
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Understand Your{" "}
              <span className="gradient-text">Radiology Report</span>
              <br />
              <span className="text-foreground/80">In Plain English</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              RADapp uses advanced AI to transform complex medical imaging reports into clear, 
              actionable insights — so you never feel lost after a scan again.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" data-testid="button-hero-cta">
                  Start for Free
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="gap-2 px-8" data-testid="button-try-demo">
                  <Activity className="w-4 h-4" />
                  Try Demo Reports
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Dashboard preview card */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 relative"
          >
            <div className="glass dark:bg-card/60 bg-white/80 rounded-2xl border border-border shadow-2xl overflow-hidden max-w-4xl mx-auto">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">radapp.ai/dashboard</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Reports", value: "12", color: "text-primary" },
                    { label: "High Urgency", value: "1", color: "text-red-500" },
                    { label: "AI Insights", value: "47", color: "text-emerald-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/40 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Chest X-Ray", urgency: "low", date: "2 days ago" },
                    { title: "Brain MRI", urgency: "moderate", date: "1 week ago" },
                    { title: "Knee MRI", urgency: "moderate", date: "2 weeks ago" },
                  ].map((r) => (
                    <div key={r.title} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${urgencyColors[r.urgency]}`}>
                          {r.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to understand your health
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From complex jargon to clear insights, RADapp covers every step of the journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Reports */}
      <section id="demo" className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-3 py-1 text-sm bg-accent/10 text-accent border-accent/20">
              Try it now
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Test with real sample reports
            </h2>
            <p className="text-muted-foreground text-lg">
              Click any demo report to see RADapp in action — no account required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_REPORTS.map((report, i) => (
              <motion.div
                key={report.type}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/upload">
                  <div
                    data-testid={`card-demo-report-${i}`}
                    className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{report.icon}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${urgencyColors[report.urgency]}`}>
                        {report.urgency} urgency
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {report.type}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {report.preview}
                    </p>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Analyze this report
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by patients and professionals
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to understand your health?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of patients and healthcare professionals who use RADapp to demystify radiology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-10 shadow-lg shadow-primary/25" data-testid="button-cta-signup">
                  Get started for free
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="gap-2 px-10">
                  <Users className="w-4 h-4" />
                  Learn about us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg font-serif">
                RAD<span className="text-primary">app</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/about"><span className="hover:text-foreground transition-colors cursor-pointer">About</span></Link>
              <Link href="/chat"><span className="hover:text-foreground transition-colors cursor-pointer">AI Assistant</span></Link>
              <Link href="/upload"><span className="hover:text-foreground transition-colors cursor-pointer">Upload</span></Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>AI analysis — not a substitute for medical advice</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
