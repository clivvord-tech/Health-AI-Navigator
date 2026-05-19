import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, payload } = await req.json();

    let requestBody: any;

    if (type === "analyze") {
      const { text, imageBase64, imageMimeType } = payload;
      const prompt = `You are a medical AI assistant helping patients understand their radiology reports.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation for a non-medical patient. Be empathetic, warm and very clear. Use simple everyday language.",
  "terms": "Key medical terms explained simply. Format exactly: Term: explanation. Term: explanation. Term: explanation.",
  "steps": "Numbered recommended next steps based on the findings. Format exactly: 1. step\\n2. step\\n3. step"
}

Urgency guide:
- low: normal or routine findings, no immediate concern
- moderate: findings that need follow-up within 1-2 weeks
- high: urgent findings requiring immediate medical attention today

${text ? `Report Text:\n${text}` : "No text provided — analyze the image only."}`;

      const parts: any[] = [{ text: prompt }];
      if (imageBase64 && imageMimeType) {
        parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
      }

      requestBody = {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          thinkingConfig: { thinkingBudget: 0 },
        },
      };
    } else if (type === "chat") {
      const { message, history } = payload;
      const historyText = (history ?? [])
        .map((m: any) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
        .join("\n");

      const prompt = `You are RADapp's AI Medical Assistant — compassionate, knowledgeable, and dedicated to helping patients understand their radiology and medical imaging reports.

Your personality:
- Warm, empathetic, and reassuring
- Use plain everyday language, never jargon without explanation
- Be thorough but concise — 3-5 sentences for most answers
- Always recommend consulting a real doctor for personal medical decisions
- If asked about a specific finding, explain what it means, why it matters, and what to expect next

${historyText ? `Conversation so far:\n${historyText}\n\n` : ""}Patient: ${message}
Assistant:`;

      requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 0 },
        },
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return new Response(JSON.stringify({ error: `Gemini API error: ${geminiRes.status}` }), {
        status: geminiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
