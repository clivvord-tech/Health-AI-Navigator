# MediNav — AI Health & Affordability Platform

> **AI Unleashed 2026 Hackathon — Health & Finance Track**  
> Bingham University | Team: The Vanguard

---

## 🩺 The Problem

Millions of Nigerians delay or skip medical treatment — not because care doesn't exist, but because they face critical information gaps:

- They don't know **which hospital is cheapest** nearby
- They don't know **what a procedure actually costs** before going
- They receive **radiology reports** full of jargon they can't understand
- They don't know **which insurance plans** they qualify for
- They receive **huge hospital bills** with no payment options

---

## 💡 The Solution

**MediNav** is an AI-powered platform that solves healthcare affordability through two integrated pillars:

### 🔬 Radiology AI (Core Feature)
- **Upload X-ray / MRI / CT scan** images or text reports
- **Gemini Vision AI** analyzes the scan and explains findings in plain English
- **Urgency detection** — Low / Moderate / High with clear action steps
- **Medical terms glossary** — every complex term explained simply
- **Voice playback** — listen to your report explanation
- **Share reports** — generate a shareable link for family or doctors
- **View all reports** — full history with search and filter
- **Report comparison** — track health changes over time
- **Second opinion AI** — independent AI re-analysis

### 💰 Health Finance Tools (New Features)
- **AI Symptom Checker** — describe symptoms → get possible conditions + estimated treatment cost
- **Treatment Cost Estimator** — compare prices across public, private, and mission hospitals
- **Affordable Clinic Finder** — find clinics near you filtered by budget, insurance, and payment plans
- **Health Insurance Advisor** — AI matches you to NHIS, HMO, and private plans based on income
- **Medical Payment Plans** — find 0% interest financing for hospital bills
- **AI Health Chat** — 24/7 assistant for health and finance questions

---

## 💸 Revenue Model (Self-Sustaining)

| Stream | Details |
|--------|---------|
| **Subscriptions** | Free / Basic ₦500/mo / Premium ₦1,500/mo |
| **Clinic Partnerships** | Clinics pay ₦5K–₦20K/mo for featured listings + referrals |
| **Insurance Commission** | 5–15% on insurance plans sold via platform |
| **Telemedicine Revenue Share** | 30% on consultations booked via MediNav |
| **Pharmacy Affiliates** | Drug price comparison with affiliate commissions |
| **B2B / Employer Plans** | Corporate health benefit packages for SMEs |

**Target:** 10,000 users × avg ₦750/mo = **₦7.5M/month** recurring revenue

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui + framer-motion |
| AI | Google Gemini 2.5 Flash (text + vision) |
| Backend | Supabase Edge Functions (Deno) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (localStorage for demo) |
| Routing | Wouter |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with `GEMINI_API_KEY` set in Edge Function secrets

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/Health-AI-Navigator.git
cd Health-AI-Navigator

# Install dependencies
cd client
npm install

# Set environment variables
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Run development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Function

```bash
# Deploy the Gemini edge function
supabase functions deploy gemini

# Set the Gemini API key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

### Database Schema

The app requires two tables in Supabase:

```sql
-- Reports table
create table reports (
  id bigint primary key generated always as identity,
  user_id text not null,
  title text not null,
  original_text text,
  simplified_explanation text,
  urgency text default 'low',
  status text default 'complete',
  recommended_next_steps text,
  medical_terms_breakdown text,
  report_type text,
  body_part text,
  share_token text unique,
  created_at timestamptz default now()
);

-- Chat messages table
create table chat_messages (
  id bigint primary key generated always as identity,
  user_id text not null,
  report_id bigint references reports(id),
  role text not null,
  content text not null,
  created_at timestamptz default now()
);
```

---

## 📁 Project Structure

```
Health-AI-Navigator/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── landing.tsx        # Homepage
│   │   │   ├── dashboard.tsx      # Main dashboard
│   │   │   ├── upload.tsx         # Upload radiology report ⭐
│   │   │   ├── reports.tsx        # View all reports ⭐
│   │   │   ├── report-results.tsx # AI analysis results ⭐
│   │   │   ├── shared-report.tsx  # Public shared report
│   │   │   ├── chat.tsx           # AI health chat
│   │   │   ├── symptom-checker.tsx # NEW: AI symptom analysis
│   │   │   ├── clinic-finder.tsx  # NEW: Find affordable clinics
│   │   │   ├── cost-estimator.tsx # NEW: Treatment cost comparison
│   │   │   ├── insurance-plans.tsx # NEW: Insurance advisor
│   │   │   ├── payment-plans.tsx  # NEW: Bill payment plans
│   │   │   ├── pricing.tsx        # NEW: Subscription plans
│   │   │   └── about.tsx          # About page
│   │   ├── components/
│   │   │   ├── nav.tsx            # Navigation
│   │   │   └── ui/                # shadcn/ui components
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx       # Auth + plan management
│   │   │   └── use-theme.tsx      # Dark/light mode
│   │   └── lib/
│   │       └── supabase.ts        # All API calls
│   └── package.json
├── supabase/
│   └── functions/
│       └── gemini/
│           └── index.ts           # AI edge function (all handlers)
└── README.md
```

---

## 🎯 Hackathon Track

**AI in Health and Wellness** + **AI in Finance and Business** (dual-track solution)

- ✅ Addresses a genuine, well-defined problem (healthcare affordability in Nigeria)
- ✅ Functional deployed application with working feature set
- ✅ Real users can interact without guidance
- ✅ Creative combination of radiology AI + health finance tools
- ✅ Clear revenue model for self-sustainability
- ✅ Domain expert validated pain points

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| Technical Lead | Full-stack development, AI integration |
| Domain Expert | Medical validation, Nigerian healthcare context |
| Designer/Communicator | UI/UX, pitch deck, demo |
| Wildcard | Research, testing, business model |

---

## 🔗 Links

- **Live Demo:** [your-deployment-url]
- **GitHub:** [this repo]
- **Devpost:** [your-devpost-link]

---

*Built with ❤️ for AI Unleashed 2026 — Bingham University*
