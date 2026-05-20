import { motion } from "framer-motion";
import { Activity, Target, Heart, Globe, Users, Award, Zap, Shield } from "lucide-react";
import { Link } from "wouter";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";

const TEAM = [
  { name: "Chidebe Chikamso", role: "Chief Medical Officer", bio: "Board-certified radiologist with 15 years of experience at Stanford Medical Center. Passionate about making medical information accessible to all patients." },
  { name: "Clivvord Nnamani", role: "CEO & Co-Founder", bio: "Former product lead at Google Health. Built healthcare AI systems serving over 2 million patients across 40 countries." },
  { name: "Emmy White", role: "Head of AI Research", bio: "PhD in Medical Informatics from MIT. Published 30+ papers on AI-assisted diagnostics and natural language processing in healthcare." },
  { name: "James Kim", role: "CTO", bio: "Previously led engineering at Epic Systems. Expert in healthcare data security, HIPAA compliance, and scalable medical infrastructure." },
];

const IMPACT = [
  { icon: Users, value: "50,000+", label: "Reports analyzed", color: "text-primary" },
  { icon: Globe, value: "40+", label: "Countries served", color: "text-accent" },
  { icon: Award, value: "98%", label: "Accuracy rate", color: "text-emerald-500" },
  { icon: Heart, value: "120+", label: "Partner hospitals", color: "text-red-500" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Privacy first",
    description: "Your medical data is yours. We use enterprise-grade encryption and comply with HIPAA, GDPR, and all major healthcare data regulations.",
  },
  {
    icon: Target,
    title: "Clinical accuracy",
    description: "Every AI output is validated against a clinical dataset of 500,000+ annotated radiology reports by board-certified radiologists.",
  },
  {
    icon: Heart,
    title: "Patient empowerment",
    description: "We believe informed patients make better health decisions. Our mission is to bridge the gap between medical jargon and human understanding.",
  },
  {
    icon: Zap,
    title: "Accessible technology",
    description: "Radiology expertise shouldn't be limited to those who can afford specialists. RADapp makes world-class AI analysis available to everyone.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">About RADapp</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-6">
              Radiology intelligence<br />
              <span className="gradient-text">for every patient</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              RADapp was born from a simple frustration: patients receiving radiology reports filled with technical terms 
              and leaving their doctor's office more confused than when they arrived. We built the AI bridge between 
              complex medical imaging findings and the patients who deserve to understand them.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Making radiology understandable for everyone
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Radiology is one of the most technically complex fields in medicine — yet patients receive 
                  reports filled with specialized terminology and are expected to understand their own health status.
                </p>
                <p>
                  Our mission is to use AI to democratize access to radiology expertise. Whether you're a patient 
                  trying to understand your chest X-ray, or a clinician explaining complex MRI findings to a family, 
                  RADapp provides the clarity you need.
                </p>
                <p>
                  We partner with radiologists, hospitals, and healthcare systems to ensure our AI is not just 
                  impressive — it's clinically accurate and genuinely helpful.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {IMPACT.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-card text-center"
                >
                  <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
                  <div className={`text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our values</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              The principles that guide every decision we make at RADapp.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
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

      {/* Team */}
      <section className="py-24 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The team behind RADapp</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A multidisciplinary team of doctors, engineers, and researchers united by a shared mission.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
                data-testid={`card-team-${i}`}
              >
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

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Join us in transforming healthcare
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Start using RADapp today and take control of your health information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-10 shadow-lg shadow-primary/20" data-testid="button-about-cta">
                  Get started free
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="gap-2 px-10">
                  Try with a demo report
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
