import { Router } from "express";
import { db, chatMessagesTable, reportsTable } from "@workspace/db";
import { asc, eq, and } from "drizzle-orm";

const router = Router();

function getUserId(req: any): string {
  return (req.headers["x-user-id"] as string) || "anonymous";
}

async function getAIResponse(
  userMessage: string,
  userId: string,
  reportId?: number | null
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackResponse(userMessage);
  }

  // Build context from user's reports
  let reportContext = "";
  if (reportId) {
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, userId)));
    if (report) {
      reportContext = `\n\nThe user is asking about this specific radiology report:
Title: ${report.title}
Type: ${report.reportType || "Unknown"}
Urgency: ${report.urgency}
AI Summary: ${report.simplifiedExplanation || ""}
Original Report: ${report.originalText?.slice(0, 1000) || ""}`;
    }
  } else {
    // Get user's recent reports for general context
    const reports = await db
      .select({ id: reportsTable.id, title: reportsTable.title, urgency: reportsTable.urgency, reportType: reportsTable.reportType })
      .from(reportsTable)
      .where(eq(reportsTable.userId, userId))
      .limit(5);

    if (reports.length > 0) {
      reportContext = `\n\nThe user has these radiology reports on file:\n${reports
        .map((r) => `- ${r.title} (${r.reportType || "Unknown"}, ${r.urgency} urgency)`)
        .join("\n")}`;
    }
  }

  // Get recent chat history for context
  const history = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, userId))
    .orderBy(asc(chatMessagesTable.createdAt))
    .limit(10);

  const historyText = history
    .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `You are RADapp's AI Medical Assistant — a compassionate, knowledgeable assistant helping patients understand their radiology reports and medical imaging results.

Guidelines:
- Explain things in plain, empathetic language a non-medical person can understand
- Be reassuring but honest about urgency when needed
- Always recommend consulting a real doctor for personal medical decisions
- Keep responses concise (2-4 sentences for simple questions, more for complex ones)
- If asked about a specific report, reference it directly${reportContext}

${historyText ? `Recent conversation:\n${historyText}\n` : ""}
Patient: ${userMessage}
Assistant:`;

  try {
    const response = await fetch(
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

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? fallbackResponse(userMessage);
  } catch {
    return fallbackResponse(userMessage);
  }
}

function fallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (/hello|hi|hey/.test(lower)) {
    return "Hello! I'm RADapp's AI Medical Assistant. I can help you understand your radiology reports and answer questions about medical imaging. How can I help you today?";
  }
  if (/urgent|urgency|serious/.test(lower)) {
    return "Urgency levels indicate how quickly you should seek care. Low means routine follow-up is fine. Moderate means see your doctor within 1-2 weeks. High means seek medical attention today or go to an emergency department if symptoms are severe.";
  }
  if (/mri/.test(lower)) {
    return "An MRI (Magnetic Resonance Imaging) uses powerful magnets and radio waves to create detailed images of soft tissues like the brain, spinal cord, and joints. It does not use radiation, making it very safe for most people.";
  }
  if (/x.ray|xray/.test(lower)) {
    return "An X-ray uses a small dose of radiation to image dense structures like bones and lungs. It's one of the most common and quickest imaging tests, ideal for detecting fractures, lung conditions, and heart size.";
  }
  return "Thank you for your question. For specific questions about your personal health or test results, please consult with your healthcare provider who can give you personalized medical advice. Is there a specific aspect of your report you'd like me to explain?";
}

// GET /api/chat/messages
router.get("/chat/messages", async (req, res) => {
  try {
    const userId = getUserId(req);
    const reportId = req.query.reportId ? Number(req.query.reportId) : undefined;

    const conditions = [eq(chatMessagesTable.userId, userId)];
    if (reportId) conditions.push(eq(chatMessagesTable.reportId, reportId));

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(and(...conditions))
      .orderBy(asc(chatMessagesTable.createdAt));

    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get chat messages");
    res.status(500).json({ error: "Failed to get chat messages" });
  }
});

// POST /api/chat/messages
router.post("/chat/messages", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { content, reportId } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    // Save user message
    await db.insert(chatMessagesTable).values({
      userId,
      reportId: reportId || null,
      role: "user",
      content,
    });

    // Generate AI response with context
    const aiContent = await getAIResponse(content, userId, reportId);

    // Save AI response
    const [aiMessage] = await db
      .insert(chatMessagesTable)
      .values({ userId, reportId: reportId || null, role: "assistant", content: aiContent })
      .returning();

    res.status(201).json(aiMessage);
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    res.status(500).json({ error: "Failed to send chat message" });
  }
});

export default router;
