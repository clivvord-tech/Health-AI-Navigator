import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callGemini(parts: any[], temperature = 0.4, maxTokens = 1500): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature, maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

function parseJSON(raw: string): any {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { type, payload } = await req.json();

    // ── Analyze radiology report (text or image) ───────────────────────────
    if (type === "analyze") {
      const { text, imageBase64, imageMimeType } = payload;
      const prompt = `You are MediNav's radiology AI — a medical expert helping Nigerian patients understand their radiology reports in plain English.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation for a non-medical Nigerian patient. Be empathetic, clear, and mention what this means for their daily life. Avoid all jargon.",
  "terms": "Key medical terms explained simply. Format exactly: Term: plain English explanation. Term: plain English explanation.",
  "steps": "Numbered recommended next steps specific to Nigeria (mention PHCs, teaching hospitals, NHIS where relevant). Format exactly: 1. step\\n2. step\\n3. step"
}

Urgency guide:
- low = normal/routine findings, no immediate action needed, follow up at next scheduled visit
- moderate = abnormal findings requiring medical attention within 1-2 weeks, book appointment soon
- high = critical findings requiring IMMEDIATE medical attention today, go to emergency room now

For Nigerian context:
- Mention affordable options (PHCs, general hospitals, teaching hospitals) when recommending follow-up
- If high urgency: mention going to nearest government hospital emergency or calling 112
- Be empathetic — many patients are seeing these results alone without a doctor present

${text ? `Report Text:\n${text}` : "No text provided — analyze the image only."}`;

      const parts: any[] = [{ text: prompt }];
      if (imageBase64 && imageMimeType) parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });

      const raw = await callGemini(parts, 0.3, 1500);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify({ text: raw, parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Chat ────────────────────────────────────────────────────────────────
    if (type === "chat") {
      const { message, history = [], reportContext = "" } = payload;
      const historyText = history.map((m: any) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`).join("\n");
      const prompt = `You are MediNav's AI Medical Assistant — compassionate, knowledgeable, and deeply trained on both radiology and Nigerian healthcare affordability.

=== ABOUT MEDINAV ===
MediNav is an AI-powered health platform with two core pillars:
1. RADIOLOGY AI: Upload X-ray, MRI, CT scan images or text reports → Gemini Vision AI analyzes instantly → plain English explanation, urgency detection (Low/Moderate/High), medical terms glossary, voice playback, shareable reports, second opinion AI, report comparison over time.
2. HEALTH FINANCE: AI Symptom Checker (symptoms → conditions + ₦ cost estimate), Treatment Cost Estimator (compare PHC vs private vs teaching hospital prices), Affordable Clinic Finder (filter by budget/insurance/location), Health Insurance Advisor (NHIS, HMO, private plans matched to income), Medical Payment Plans (0% interest financing for hospital bills), 24/7 AI Health Chat.

Plans: Free (5 symptom checks/mo, basic features) | Basic ₦500/mo (unlimited AI, insurance advisor, payment plans) | Premium ₦1,500/mo (telemedicine, personal health advisor, bill negotiation).

=== YOUR EXPERTISE ===
RADIOLOGY:
- X-ray findings: consolidation, effusion, pneumothorax, cardiomegaly, infiltrates, nodules, masses
- MRI findings: T1/T2/FLAIR signals, hyperintensities, hypointensities, enhancement patterns, diffusion restriction
- CT findings: Hounsfield units, contrast enhancement, lesion characterization
- Urgency classification: low=routine/normal, moderate=follow-up 1-2 weeks, high=seek care today
- Body systems: chest/pulmonary, brain/neuro, musculoskeletal, abdominal, spine, cardiac
- Common conditions: pneumonia, pleural effusion, pulmonary edema, brain tumors, stroke, herniated disc, fractures, appendicitis
- Medical terms: always explain in plain English (e.g. "consolidation" = "fluid or infection filling the air spaces in the lung")

NIGERIAN HEALTHCARE SYSTEM:
- Public facilities: Primary Health Centres (PHCs) — cheapest, ₦500-₦2,000 consultations; General Hospitals — ₦1,000-₦5,000; Teaching Hospitals (LUTH, UCH, ABUTH, UNTH, UNILAG) — ₦2,000-₦15,000 but specialist care
- Private facilities: Private clinics ₦3,000-₦20,000; Private hospitals ₦10,000-₦100,000+
- NHIS (National Health Insurance Scheme): government scheme, ₦0-₦1,500/mo, covers outpatient, inpatient, drugs, antenatal. Apply at NHIS offices or through employer.
- HMOs operating in Nigeria: Hygeia HMO, Reliance HMO, AXA Mansard Health, Leadway Health, Total Health Trust, Clearline HMO
- Common conditions and realistic costs in Nigeria:
  * Malaria: PHC ₦1,500-₦3,000 | Private ₦5,000-₦15,000 | Drugs only ₦800-₦2,500
  * Typhoid: ₦3,000-₦8,000 treatment | Blood test ₦1,500-₦3,000
  * Antenatal care: PHC free-₦5,000 | Private ₦30,000-₦150,000 full package
  * C-section: Govt hospital ₦50,000-₦150,000 | Private ₦200,000-₦600,000
  * Appendectomy: Govt ₦80,000-₦200,000 | Private ₦300,000-₦800,000
  * Dialysis: ₦15,000-₦35,000 per session
  * MRI scan: ₦25,000-₦80,000
  * X-ray: ₦2,000-₦8,000
  * Blood test (full panel): ₦3,000-₦10,000
  * Eye test: ₦1,500-₦5,000
  * Dental extraction: ₦3,000-₦15,000
- Generic drugs: 60-80% cheaper than branded. Always ask pharmacist for generic equivalent.
- Free healthcare programs: free antenatal at PHCs, free malaria treatment for under-5s and pregnant women, free TB treatment (DOTS program), free HIV/AIDS treatment (ARVs at govt hospitals)
- Medical financing in Nigeria: Carbon (medical loans), FairMoney, Renmoney, hospital installment plans, NGO charity care (MSF, Catholic hospitals), state government health schemes
- Emergency numbers: 112 (general emergency), NEMA 0800-CALL-NEMA, Lagos State Emergency 767, Abuja Emergency 112
- States with best public healthcare: Lagos, Abuja FCT, Rivers, Oyo (UCH Ibadan)

DRUGS & PHARMACY:
- Always recommend generic alternatives: Paracetamol instead of Panadol, Amoxicillin instead of Amoxil, Metformin instead of Glucophage
- NAFDAC-approved drugs only — warn against fake drugs
- Common OTC drugs in Nigeria: Paracetamol (fever/pain), Oral Rehydration Salts (diarrhea), Zinc (diarrhea in children), Vitamin C, Folic acid (pregnancy)
- Prescription required: antibiotics, antimalarials (ACTs), antihypertensives, antidiabetics, opioids

INSURANCE GUIDANCE:
- NHIS enrollment: visit nearest NHIS office, bring NIN, passport photo, ₦1,500 registration fee
- Employer-based NHIS: ask HR department, employer contributes 10% of basic salary
- Informal sector NHIS: Community-Based Health Insurance (CBHI) schemes available in some states
- Private HMO: compare on coverage, network hospitals, premium vs deductible
- Always check: which hospitals are in the HMO network before enrolling

PAYMENT PLANS:
- Most government hospitals offer installment payment — ask the billing department
- Carbon app: medical loans up to ₦1M, instant approval, 10-30% interest
- FairMoney: up to ₦500K, lower interest for good credit
- NGO support: Médecins Sans Frontières (MSF), Catholic Mission hospitals often have charity care
- State government schemes: Lagos ILERA EKO, Kwara SOBI, Ekiti EKHA

=== RESPONSE GUIDELINES ===
- Always respond as MediNav's AI — warm, empathetic, clear, and practical
- Use plain English — no unnecessary jargon
- For Nigerian users: always mention local options first (PHCs, NHIS, generic drugs)
- Give specific ₦ amounts when discussing costs — be realistic
- For radiology questions: explain findings clearly, state urgency, recommend next steps
- For affordability questions: give cheapest option first, then alternatives
- Always end with: "For a definitive diagnosis, please consult a qualified healthcare professional."
- Keep responses concise: 3-5 sentences for simple questions, more detail for complex ones
- Never diagnose definitively — say "possible" or "may indicate"
- If urgency is HIGH: always say "seek medical attention TODAY" and mention nearest emergency
${reportContext ? `\n=== PATIENT'S REPORT CONTEXT ===\n${reportContext}` : ""}
${historyText ? `\n=== CONVERSATION HISTORY ===\n${historyText}\n` : ""}
Patient: ${message}
MediNav AI:`;

      const text = await callGemini([{ text: prompt }], 0.7, 512);
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Second Opinion ───────────────────────────────────────────────────────
    if (type === "second-opinion") {
      const { originalText, firstAnalysis, title } = payload;
      const prompt = `You are a second independent AI radiologist reviewing a report that was already analyzed by another AI system.

Report Title: ${title}
Original Report Text: ${originalText || "Not provided"}
First AI Analysis: ${firstAnalysis}

Provide a COMPLETELY INDEPENDENT second opinion. Do not be influenced by the first analysis. Look for anything missed or interpreted differently.

Respond with ONLY valid JSON (no markdown):
{
  "agrees": true | false,
  "confidence": 0-100,
  "secondOpinion": "Your independent 2-3 paragraph plain-English analysis for the patient",
  "differences": "Key differences from the first analysis, or 'Both analyses are in agreement' if no differences",
  "additionalFindings": "Any additional observations or concerns not mentioned in the first analysis, or 'No additional findings'",
  "urgency": "low" | "moderate" | "high",
  "recommendation": "What the patient should do based on this second opinion"
}`;

      const raw = await callGemini([{ text: prompt }], 0.5, 1200);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Translate ────────────────────────────────────────────────────────────
    if (type === "translate") {
      const { simplified, terms, steps, language } = payload;
      const prompt = `Translate the following medical report explanation into ${language}. 
Keep medical terms accurate. Maintain the same empathetic, patient-friendly tone.
Do NOT add any extra commentary — just translate.

Respond with ONLY valid JSON (no markdown):
{
  "simplified": "translated simplified explanation",
  "terms": "translated medical terms breakdown",
  "steps": "translated recommended next steps"
}

Content to translate:
Simplified Explanation: ${simplified}
Medical Terms: ${terms}
Next Steps: ${steps}`;

      const raw = await callGemini([{ text: prompt }], 0.2, 1200);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Compare two reports ──────────────────────────────────────────────────
    if (type === "compare") {
      const { report1, report2 } = payload;
      const prompt = `You are a medical AI comparing two radiology reports from the same patient over time to track health progression.

Report 1 — ${report1.title} (${report1.date}):
${report1.text || report1.summary || "No text available"}

Report 2 — ${report2.title} (${report2.date}):
${report2.text || report2.summary || "No text available"}

Compare these reports carefully and respond with ONLY valid JSON (no markdown):
{
  "trend": "improving" | "worsening" | "stable" | "mixed" | "unrelated",
  "trendEmoji": "✅" | "⚠️" | "🔴" | "🔄" | "❓",
  "summary": "2-3 sentence plain English summary of how the patient's condition has changed",
  "improvements": ["specific thing that improved or resolved"],
  "concerns": ["specific new finding or thing that worsened"],
  "unchanged": ["finding that remained the same"],
  "recommendation": "Clear recommendation for what the patient should do",
  "urgency": "low" | "moderate" | "high"
}`;

      const raw = await callGemini([{ text: prompt }], 0.3, 1000);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Annotate selected text ───────────────────────────────────────────────
    if (type === "annotate") {
      const { selectedText, reportTitle } = payload;
      const prompt = `A patient is reading their radiology report "${reportTitle}" and highlighted this specific text:

"${selectedText}"

Explain ONLY this highlighted portion in plain English that a non-medical person can understand. Be concise (2-4 sentences), empathetic, and clear. Do not add disclaimers.`;

      const text = await callGemini([{ text: prompt }], 0.4, 300);
      return new Response(JSON.stringify({ explanation: text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── NEW: Symptom Analysis ───────────────────────────────────────────────
    if (type === "symptoms") {
      const { symptoms, age, location } = payload;
      const prompt = `You are a healthcare AI assistant helping Nigerians find affordable care. A patient describes their symptoms.

Patient: Age ${age}, Location: ${location || "Nigeria"}
Symptoms: ${symptoms}

Respond with ONLY valid JSON (no markdown):
{
  "possibleConditions": [
    {"name": "condition name", "likelihood": "High/Medium/Low", "description": "brief plain-English description"}
  ],
  "urgency": "low" | "moderate" | "high",
  "urgencyReason": "brief reason for urgency level",
  "recommendedAction": "what the patient should do next",
  "estimatedCostRange": "₦X,XXX - ₦XX,XXX (Nigerian Naira range for treatment)",
  "selfCareAdvice": ["tip 1", "tip 2", "tip 3"]
}

Urgency: low=can wait 1-2 weeks, moderate=see doctor in 2-3 days, high=seek care today.
Use Nigerian Naira (₦) for all costs. Be realistic about Nigerian healthcare costs (PHCs, general hospitals).
List 2-4 possible conditions ordered by likelihood.`;

      const raw = await callGemini([{ text: prompt }], 0.3, 1000);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── NEW: Clinic Finder ──────────────────────────────────────────────────
    if (type === "clinics") {
      const { location, condition, budget } = payload;
      const prompt = `You are a healthcare AI helping Nigerians find affordable clinics. Generate realistic clinic data for Nigeria.

Location: ${location}
Condition/Service: ${condition}
Budget: ${budget}

Generate 5-6 realistic Nigerian clinics/hospitals. Respond with ONLY valid JSON array (no markdown):
[
  {
    "name": "clinic name",
    "type": "Primary Health Centre | General Hospital | Private Clinic | Teaching Hospital | Pharmacy",
    "distance": "X.X km",
    "estimatedCost": "₦X,XXX",
    "acceptsInsurance": ["NHIS", "HMO name"],
    "paymentPlans": true | false,
    "rating": 3.5,
    "phone": "080XXXXXXXX",
    "address": "realistic Nigerian address near ${location}",
    "openNow": true | false
  }
]

Include a mix of cheap public options (PHC, general hospitals) and private clinics. Use realistic Nigerian prices.`;

      const raw = await callGemini([{ text: prompt }], 0.5, 1200);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── NEW: Cost Estimator ─────────────────────────────────────────────────
    if (type === "cost") {
      const { procedure, location, hasInsurance } = payload;
      const prompt = `You are a healthcare cost advisor for Nigeria. Provide realistic cost estimates.

Procedure: ${procedure}
Location: ${location || "Nigeria"}
Has Insurance: ${hasInsurance}

Respond with ONLY valid JSON (no markdown):
{
  "procedure": "${procedure}",
  "lowCost": number (cheapest option in ₦, e.g. public hospital/PHC),
  "avgCost": number (average private clinic in ₦),
  "highCost": number (expensive private hospital in ₦),
  "withInsurance": number (cost with NHIS/HMO, 0 if not applicable),
  "savingsTips": ["tip 1", "tip 2", "tip 3"],
  "cheaperAlternatives": ["alternative 1", "alternative 2"],
  "nearbyAffordableOptions": ["option 1", "option 2"]
}

Use realistic Nigerian Naira amounts. Teaching hospitals and PHCs are cheapest. Generic drugs save 60-80%.`;

      const raw = await callGemini([{ text: prompt }], 0.3, 800);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── NEW: Insurance Plans ────────────────────────────────────────────────
    if (type === "insurance") {
      const { income, familySize, location, conditions } = payload;
      const prompt = `You are a Nigerian health insurance advisor. Find suitable plans for this person.

Monthly Income: ₦${income}
Family Size: ${familySize}
Location: ${location || "Nigeria"}
Pre-existing Conditions: ${conditions || "None"}

Generate 4-5 realistic Nigerian health insurance options. Respond with ONLY valid JSON array (no markdown):
[
  {
    "name": "plan name",
    "provider": "NHIS | Hygeia HMO | Reliance HMO | AXA Mansard | Leadway Health | etc",
    "monthlyPremium": number (in ₦),
    "deductible": number (in ₦),
    "copay": number (in ₦ per visit),
    "coverage": ["what is covered"],
    "bestFor": "who this plan is best for",
    "rating": 3.5,
    "govtSubsidy": true | false
  }
]

Always include NHIS as the cheapest government option. Be realistic about Nigerian insurance costs.`;

      const raw = await callGemini([{ text: prompt }], 0.4, 1200);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── NEW: Payment Plans ──────────────────────────────────────────────────
    if (type === "payment-plans") {
      const { billAmount, creditScore } = payload;
      const prompt = `You are a medical finance advisor for Nigeria. Find payment options for a hospital bill.

Bill Amount: ₦${billAmount}
Credit History: ${creditScore}

Generate 4-5 realistic Nigerian medical payment options. Respond with ONLY valid JSON array (no markdown):
[
  {
    "provider": "provider name (hospital, bank, fintech, NGO)",
    "planName": "plan name",
    "interestRate": "0% | X%",
    "monthlyPayment": number (estimated monthly in ₦),
    "term": "X months",
    "minAmount": number (minimum bill amount in ₦),
    "requirements": "what is required to qualify",
    "applyUrl": "https://example.com"
  }
]

Include: hospital installment plans, medical loans (Carbon, FairMoney, Renmoney), NGO charity care, government schemes. Prioritize 0% options first.`;

      const raw = await callGemini([{ text: prompt }], 0.4, 1000);
      const parsed = parseJSON(raw);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
