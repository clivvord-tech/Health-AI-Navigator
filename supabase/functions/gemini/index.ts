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
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, payload } = await req.json();

    if (type === "analyze") {
      const { text, imageBase64, imageMimeType } = payload;

      const prompt = `You are a medical AI assistant helping patients understand their radiology reports.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation for a non-medical patient",
  "terms": "Key medical terms explained. Format: Term: explanation. Term: explanation.",
  "steps": "Numbered next steps. Format: 1. step\\n2. step\\n3. step"
}

Urgency: low=normal/routine, moderate=follow-up within 1-2 weeks, high=seek immediate attention

${text ? `Report Text:\n${text}` : "Analyze the image only."}`;

      const parts: any[] = [{ text: prompt }];
      if (imageBase64 && imageMimeType) {
        parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
      }

      const raw = await callGemini(parts, 0.3, 1500);
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return new Response(JSON.stringify({ text: raw, parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "chat") {
      const { message, history = [], reportContext = "" } = payload;

      const historyText = history
        .map((m: any) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
        .join("\n");

      const prompt = `You are RADapp's AI Medical Assistant — compassionate and knowledgeable, helping patients understand radiology reports.

Guidelines:
- Explain in plain, empathetic language
- Be reassuring but honest about urgency
- Always recommend consulting a real doctor for personal decisions
- Keep responses concise (2-4 sentences for simple questions)
${reportContext ? `\nContext about patient's reports:\n${reportContext}` : ""}
${historyText ? `\nRecent conversation:\n${historyText}\n` : ""}
Patient: ${message}
Assistant:`;

      const text = await callGemini([{ text: prompt }], 0.7, 512);
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "second-opinion") {
      const { originalText, firstAnalysis } = payload;
      const prompt = `You are a second independent AI radiologist reviewing a report already analyzed.

Original Report: ${originalText}
First Analysis: ${firstAnalysis}

Provide a SECOND INDEPENDENT OPINION. Respond with ONLY valid JSON:
{
  "agrees": true | false,
  "confidence": 0-100,
  "secondOpinion": "Your independent 2-3 paragraph plain-English analysis",
  "differences": "Key differences from first analysis or 'No significant differences found'",
  "additionalFindings": "Any additional observations not in first analysis",
  "urgency": "low" | "moderate" | "high"
}`;

      const raw = await callGemini([{ text: prompt }], 0.4, 1000);
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "translate") {
      const { simplified, terms, steps, language } = payload;
      const prompt = `Translate this medical report explanation into ${language}. Keep medical terms accurate and tone empathetic.

Respond with ONLY valid JSON:
{
  "simplified": "translated simplified explanation",
  "terms": "translated medical terms",
  "steps": "translated next steps"
}

Content:
Simplified: ${simplified}
Terms: ${terms}
Steps: ${steps}`;

      const raw = await callGemini([{ text: prompt }], 0.3, 1000);
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "compare") {
      const { report1, report2 } = payload;
      const prompt = `Compare these two radiology reports from the same patient over time.

Report 1 (${report1.date}) - ${report1.title}: ${report1.text}
Report 2 (${report2.date}) - ${report2.title}: ${report2.text}

Respond with ONLY valid JSON:
{
  "trend": "improving" | "worsening" | "stable" | "mixed" | "unrelated",
  "summary": "2-3 sentence plain English summary of how condition changed",
  "improvements": ["things that improved"],
  "concerns": ["new findings or things that worsened"],
  "unchanged": ["findings that stayed the same"],
  "recommendation": "What the patient should do based on this comparison"
}`;

      const raw = await callGemini([{ text: prompt }], 0.4, 1000);
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "annotate") {
      const { selectedText, reportTitle } = payload;
      const prompt = `A patient highlighted this text from their radiology report "${reportTitle}":

"${selectedText}"

Explain ONLY this highlighted portion in plain English (2-4 sentences). Be concise and clear.`;

      const text = await callGemini([{ text: prompt }], 0.4, 300);
      return new Response(JSON.stringify({ explanation: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
