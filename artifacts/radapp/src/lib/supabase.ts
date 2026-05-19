import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ──────────────────────────────────────────────────────────────────

export type Urgency = "low" | "moderate" | "high";

export interface Report {
  id: number;
  user_id: string;
  title: string;
  original_text: string | null;
  simplified_explanation: string | null;
  urgency: Urgency;
  status: string;
  recommended_next_steps: string | null;
  medical_terms_breakdown: string | null;
  report_type: string | null;
  body_part: string | null;
  share_token: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: string;
  report_id: number | null;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ── Reports ────────────────────────────────────────────────────────────────

export async function getRecentReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

export async function getAllReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getReport(id: number, userId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getSharedReport(token: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("share_token", token)
    .single();
  if (error) return null;
  return data;
}

export async function deleteReport(id: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function shareReport(id: number, userId: string): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await supabase
    .from("reports")
    .update({ share_token: token })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
  return token;
}

export async function getDashboardStats(userId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("urgency, created_at")
    .eq("user_id", userId);
  if (error) throw error;
  const reports = data ?? [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return {
    totalReports: reports.length,
    urgencyBreakdown: {
      low: reports.filter((r) => r.urgency === "low").length,
      moderate: reports.filter((r) => r.urgency === "moderate").length,
      high: reports.filter((r) => r.urgency === "high").length,
    },
    recentActivity: reports.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length,
  };
}

export async function createReport(payload: {
  userId: string;
  title: string;
  originalText?: string;
  reportType?: string;
  bodyPart?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<Report> {
  const analysis = await analyzeWithGemini(
    payload.originalText ?? "",
    payload.imageBase64,
    payload.imageMimeType
  );
  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: payload.userId,
      title: payload.title,
      original_text: payload.originalText ?? null,
      report_type: payload.reportType ?? null,
      body_part: payload.bodyPart ?? null,
      urgency: analysis.urgency,
      status: "complete",
      simplified_explanation: analysis.simplified,
      medical_terms_breakdown: analysis.terms,
      recommended_next_steps: analysis.steps,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Chat ───────────────────────────────────────────────────────────────────

export async function getChatMessages(userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendChatMessage(userId: string, content: string): Promise<ChatMessage> {
  // Save user message
  await supabase.from("chat_messages").insert({ user_id: userId, role: "user", content });

  // Get recent history for context
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(10);

  const aiContent = await getAIResponse(content, history ?? []);

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, role: "assistant", content: aiContent })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Gemini AI ──────────────────────────────────────────────────────────────

async function analyzeWithGemini(
  text: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<{ simplified: string; terms: string; steps: string; urgency: Urgency }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) return fallbackAnalysis(text);

  const prompt = `You are a medical AI assistant helping patients understand their radiology reports.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation for a non-medical patient. Be empathetic and clear.",
  "terms": "Key medical terms explained simply. Format: Term: explanation. Term: explanation.",
  "steps": "Numbered next steps. Format: 1. step\\n2. step\\n3. step"
}

Urgency: low = normal/routine, moderate = follow-up within 1-2 weeks, high = urgent/immediate attention.

${text ? `Report Text:\n${text}` : "No text — analyze the image only."}`;

  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64 && imageMimeType) {
      parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json() as any;
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      urgency: ["low", "moderate", "high"].includes(parsed.urgency) ? parsed.urgency : "low",
      simplified: parsed.simplified || "",
      terms: parsed.terms || "",
      steps: parsed.steps || "",
    };
  } catch {
    return fallbackAnalysis(text);
  }
}

async function getAIResponse(
  userMessage: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) return fallbackChatResponse(userMessage);

  const historyText = history
    .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `You are RADapp's AI Medical Assistant — compassionate and knowledgeable, helping patients understand radiology reports.

Guidelines:
- Explain in plain, empathetic language
- Be reassuring but honest about urgency
- Always recommend consulting a real doctor for personal decisions
- Keep responses concise (2-4 sentences for simple questions)

${historyText ? `Recent conversation:\n${historyText}\n` : ""}Patient: ${userMessage}
Assistant:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );
    if (!res.ok) throw new Error();
    const data = await res.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? fallbackChatResponse(userMessage);
  } catch {
    return fallbackChatResponse(userMessage);
  }
}

function fallbackAnalysis(text: string): { simplified: string; terms: string; steps: string; urgency: Urgency } {
  const lower = text.toLowerCase();
  const highKw = ["mass", "tumor", "malignant", "cancer", "hemorrhage", "stroke", "infarct", "embolism", "urgent", "critical", "fracture"];
  const modKw = ["abnormal", "lesion", "effusion", "opacity", "nodule", "tear", "inflammation", "enlarged"];
  let urgency: Urgency = "low";
  if (highKw.some((k) => lower.includes(k))) urgency = "high";
  else if (modKw.some((k) => lower.includes(k))) urgency = "moderate";
  return {
    urgency,
    simplified: "Your radiology report has been analyzed. Please discuss these results with your healthcare provider for proper medical guidance.",
    terms: "Parenchyma: The functional tissue of an organ. Opacity: An area appearing white/light on imaging. Attenuation: Reduction in signal intensity through tissue.",
    steps: "1. Schedule a follow-up with your primary care physician.\n2. Bring this report to your appointment.\n3. Ask your doctor about any findings that concern you.",
  };
}

function fallbackChatResponse(message: string): string {
  const lower = message.toLowerCase();
  if (/hello|hi|hey/.test(lower)) return "Hello! I'm RADapp's AI Medical Assistant. How can I help you understand your radiology reports today?";
  if (/urgent|urgency|serious/.test(lower)) return "Urgency levels: Low = routine follow-up. Moderate = see your doctor within 1-2 weeks. High = seek medical attention today.";
  if (/mri/.test(lower)) return "An MRI uses powerful magnets and radio waves to create detailed images of soft tissues. It does not use radiation.";
  if (/x.ray|xray/.test(lower)) return "An X-ray uses a small dose of radiation to image dense structures like bones and lungs. It's quick and ideal for detecting fractures and lung conditions.";
  return "Thank you for your question. For specific questions about your personal health, please consult with your healthcare provider. Is there a specific aspect of your report you'd like me to explain?";
}
