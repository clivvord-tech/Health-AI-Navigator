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

    // ── Analyze report (text or image) ──────────────────────────────────────
    if (type === "analyze") {
      const { text, imageBase64, imageMimeType } = payload;
      const prompt = `You are a medical AI assistant helping patients understand their radiology reports.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation for a non-medical patient. Be empathetic and clear.",
  "terms": "Key medical terms explained simply. Format exactly: Term: explanation. Term: explanation.",
  "steps": "Numbered recommended next steps. Format exactly: 1. step\\n2. step\\n3. step"
}

Urgency guide: low=normal/routine, moderate=follow-up within 1-2 weeks, high=seek immediate attention

${text ? `Report Text:\n${text}` : "No text — analyze the image only."}`;

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
      const prompt = `You are RADapp's AI Medical Assistant — compassionate and knowledgeable, helping patients understand radiology reports.

Guidelines:
- Explain in plain, empathetic language a non-medical person can understand
- Be reassuring but honest about urgency
- Always recommend consulting a real doctor for personal medical decisions
- Keep responses concise (2-4 sentences for simple questions)
${reportContext ? `\nPatient's report context:\n${reportContext}` : ""}
${historyText ? `\nRecent conversation:\n${historyText}\n` : ""}
Patient: ${message}
Assistant:`;

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
  "summary": "2-3 sentence plain English summary of how the patient's condition has changed between these two reports",
  "improvements": ["specific thing that improved or resolved", "..."],
  "concerns": ["specific new finding or thing that worsened", "..."],
  "unchanged": ["finding that remained the same", "..."],
  "recommendation": "Clear recommendation for what the patient should do based on this comparison",
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

    return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
