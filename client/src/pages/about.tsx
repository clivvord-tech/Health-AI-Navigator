import { motion } from "framer-motion";
import { Heart, Target, Shield, Zap, Users, Globe, Award, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";

const TEAM = [
  { name: "Chidebe Chikamso", role: "Chief Medical Officer", bio: "Medical doctor with 10 years in community health. Passionate about making healthcare accessible to low-income Nigerians." },
  { name: "Clivvord Nnamani", role: "CEO & Co-Founder", bio: "Health tech entrepreneur. Previously built fintech solutions for underserved communities across West Africa." },
  { name: "Emmy White", role: "Head of AI", bio: "AI/ML engineer specializing in healthcare NLP. Built AI systems that have helped over 500,000 patients navigate care." },
  { name: "James Kim", role: "CTO", bio: "Full-stack engineer with expertise in health data systems, security, and scalable infrastructure." },
];

const IMPACT = [
  { icon: Users, value: "10,000+", label: "Nigerians helped", color: "text-primary" },
  { icon: TrendingDown, value: "₦47K", label: "Avg. savings per user", color: "text-emerald-500" },
  { icon: Globe, value: "36", label: "States covered", color: "text-accent" },
  { icon: Award, value: "500+", label: "Partner clinics", color: "text-amber-500" },
];

const VALUES = [
  { icon: Shield, title: "Affordability first", description: "Every feature is designed to reduce what Nigerians pay for healthcare. We measure success in naira saved." },
  { icon: Target, title: "Accuracy matters", description: "Our AI is trained on Nigerian healthcare data — local drug prices, local clinics, local insurance schemes." },
  { icon: Heart, title: "No one left behind", description: "The free tier is genuinely useful. We believe basic healthcare navigation should be free for everyone." },
  { icon: Zap, title: "Speed saves lives", description: "When someone is sick, they need answers fast. MediNav delivers in seconds, not hours." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">About MediNav</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Healthcare affordability<br />
              <span className="gradient-text">for every Nigerian</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              MediNav was born from a painful reality: millions of Nigerians delay or skip treatment not because care doesn't exist, but because they don't know where to find affordable care, what it costs, or how to pay for it. We built the AI solution to fix that.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Making healthcare affordable for everyone</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Nigeria has over 200 million people, but most cannot afford quality healthcare. The problem isn't just poverty — it's information asymmetry. People don't know the cheapest hospital nearby, the generic drug alternative, or the government subsidy they qualify for.</p>
                <p>MediNav uses AI to close that gap. We aggregate data on clinic prices, drug costs, insurance plans, and payment options — then make it instantly accessible to anyone with a smartphone.</p>
                <p>Our goal: ensure that no Nigerian delays treatment because of cost uncertainty.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {IMPACT.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-card text-center">
                  <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
                  <div className={`text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The team</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Doctors, engineers, and health advocates united by one mission.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join us in making healthcare affordable</h2>
            <p className="text-muted-foreground text-lg mb-10">Start using MediNav today — free forever for basic features.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-10 shadow-lg shadow-primary/20">Get started free</Button>
              </Link>
              <Link href="/symptom-checker">
                <Button size="lg" variant="outline" className="gap-2 px-10">Try Symptom Checker</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
