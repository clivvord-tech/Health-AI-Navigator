import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EDGE_FN_URL = `${supabaseUrl}/functions/v1/gemini`;

async function callEdge(type: string, payload: any): Promise<any> {
  const res = await fetch(EDGE_FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseAnonKey}` },
    body: JSON.stringify({ type, payload }),
  });
  if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

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

export interface SecondOpinion {
  agrees: boolean;
  confidence: number;
  secondOpinion: string;
  differences: string;
  additionalFindings: string;
  urgency: Urgency;
  recommendation: string;
}

export interface ComparisonResult {
  trend: "improving" | "worsening" | "stable" | "mixed" | "unrelated";
  trendEmoji: string;
  summary: string;
  improvements: string[];
  concerns: string[];
  unchanged: string[];
  recommendation: string;
  urgency: Urgency;
}

// ── Reports ────────────────────────────────────────────────────────────────

export async function getRecentReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase.from("reports").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
  if (error) throw error;
  return data ?? [];
}

export async function getAllReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase.from("reports").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getReport(id: number, userId: string): Promise<Report | null> {
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).eq("user_id", userId).single();
  if (error) return null;
  return data;
}

export async function getSharedReport(token: string): Promise<Report | null> {
  const { data, error } = await supabase.from("reports").select("*").eq("share_token", token).single();
  if (error) return null;
  return data;
}

export async function deleteReport(id: number, userId: string): Promise<void> {
  const { error } = await supabase.from("reports").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function shareReport(id: number, userId: string): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await supabase.from("reports").update({ share_token: token }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return token;
}

export async function getDashboardStats(userId: string) {
  const { data, error } = await supabase.from("reports").select("urgency, created_at").eq("user_id", userId);
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
  const result = await callEdge("analyze", {
    text: payload.originalText ?? "",
    imageBase64: payload.imageBase64,
    imageMimeType: payload.imageMimeType,
  });

  const analysis = result.parsed ?? result;
  const { data, error } = await supabase.from("reports").insert({
    user_id: payload.userId,
    title: payload.title,
    original_text: payload.originalText ?? null,
    report_type: payload.reportType ?? null,
    body_part: payload.bodyPart ?? null,
    urgency: ["low", "moderate", "high"].includes(analysis.urgency) ? analysis.urgency : "low",
    status: "complete",
    simplified_explanation: analysis.simplified || null,
    medical_terms_breakdown: analysis.terms || null,
    recommended_next_steps: analysis.steps || null,
  }).select().single();

  if (error) throw error;
  return data;
}

// ── Chat ───────────────────────────────────────────────────────────────────

export async function getChatMessages(userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.from("chat_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendChatMessage(userId: string, content: string, reportContext?: string): Promise<ChatMessage> {
  await supabase.from("chat_messages").insert({ user_id: userId, role: "user", content });

  const { data: history } = await supabase.from("chat_messages").select("role, content").eq("user_id", userId).order("created_at", { ascending: true }).limit(10);

  const result = await callEdge("chat", { message: content, history: history ?? [], reportContext: reportContext ?? "" });

  const { data, error } = await supabase.from("chat_messages").insert({ user_id: userId, role: "assistant", content: result.text }).select().single();
  if (error) throw error;
  return data;
}

// ── Second Opinion ─────────────────────────────────────────────────────────

export async function getSecondOpinion(report: Report): Promise<SecondOpinion> {
  return callEdge("second-opinion", {
    title: report.title,
    originalText: report.original_text ?? "",
    firstAnalysis: report.simplified_explanation ?? "",
  });
}

// ── Translation ────────────────────────────────────────────────────────────

export async function translateReport(report: Report, language: string): Promise<{ simplified: string; terms: string; steps: string }> {
  return callEdge("translate", {
    simplified: report.simplified_explanation ?? "",
    terms: report.medical_terms_breakdown ?? "",
    steps: report.recommended_next_steps ?? "",
    language,
  });
}

// ── Compare Reports ────────────────────────────────────────────────────────

export async function compareReports(report1: Report, report2: Report): Promise<ComparisonResult> {
  return callEdge("compare", {
    report1: {
      title: report1.title,
      date: new Date(report1.created_at).toLocaleDateString(),
      text: report1.original_text ?? report1.simplified_explanation ?? "",
      summary: report1.simplified_explanation ?? "",
    },
    report2: {
      title: report2.title,
      date: new Date(report2.created_at).toLocaleDateString(),
      text: report2.original_text ?? report2.simplified_explanation ?? "",
      summary: report2.simplified_explanation ?? "",
    },
  });
}
