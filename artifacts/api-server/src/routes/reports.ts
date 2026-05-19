import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import crypto from "crypto";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();
const upload = multer({ dest: "/tmp/radapp-uploads/", limits: { fileSize: 20 * 1024 * 1024 } });

function getUserId(req: any): string {
  return (req.headers["x-user-id"] as string) || "anonymous";
}

async function analyzeWithGemini(
  text: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<{ simplified: string; terms: string; steps: string; urgency: "low" | "moderate" | "high" }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackAnalysis(text);

  const prompt = `You are a medical AI assistant helping patients understand their radiology reports and imaging.

Analyze the provided radiology ${imageBase64 ? "image and/or report text" : "report text"} and respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "urgency": "low" | "moderate" | "high",
  "simplified": "2-3 paragraph plain English explanation of the findings for a non-medical patient. Be empathetic and clear.",
  "terms": "Key medical terms explained simply. Format exactly as: Term: explanation. Term: explanation.",
  "steps": "Numbered recommended next steps. Format exactly as: 1. step\\n2. step\\n3. step"
}

Urgency guide:
- low: normal/routine findings, no immediate concern
- moderate: findings needing follow-up within 1-2 weeks  
- high: urgent findings requiring immediate medical attention

${text ? `Report Text:\n${text}` : "No text provided — analyze the image only."}`;

  try {
    const parts: any[] = [{ text: prompt }];

    if (imageBase64 && imageMimeType) {
      parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
    }

    const response = await fetch(
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

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json() as any;
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

function fallbackAnalysis(text: string): { simplified: string; terms: string; steps: string; urgency: "low" | "moderate" | "high" } {
  const lower = text.toLowerCase();
  const highKw = ["mass", "tumor", "malignant", "cancer", "hemorrhage", "stroke", "infarct", "embolism", "urgent", "critical", "fracture"];
  const modKw = ["abnormal", "lesion", "effusion", "opacity", "nodule", "tear", "inflammation", "enlarged"];
  let urgency: "low" | "moderate" | "high" = "low";
  if (highKw.some((k) => lower.includes(k))) urgency = "high";
  else if (modKw.some((k) => lower.includes(k))) urgency = "moderate";
  return {
    urgency,
    simplified: "Your radiology report has been analyzed. Please discuss these results with your healthcare provider for proper medical guidance.",
    terms: "Parenchyma: The functional tissue of an organ. Opacity: An area appearing white/light on imaging. Attenuation: Reduction in signal intensity through tissue.",
    steps: "1. Schedule a follow-up with your primary care physician.\n2. Bring this report to your appointment.\n3. Ask your doctor about any findings that concern you.",
  };
}

async function extractPdfText(filePath: string): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    return "";
  }
}

// GET /api/reports
router.get("/reports", async (req, res) => {
  try {
    const userId = getUserId(req);
    const reports = await db.select().from(reportsTable).where(eq(reportsTable.userId, userId)).orderBy(desc(reportsTable.createdAt));
    res.json(reports);
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Failed to list reports" });
  }
});

// GET /api/reports/recent
router.get("/reports/recent", async (req, res) => {
  try {
    const userId = getUserId(req);
    const reports = await db.select().from(reportsTable).where(eq(reportsTable.userId, userId)).orderBy(desc(reportsTable.createdAt)).limit(5);
    res.json(reports);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent reports");
    res.status(500).json({ error: "Failed to get recent reports" });
  }
});

// GET /api/reports/shared/:token
router.get("/reports/shared/:token", async (req, res) => {
  try {
    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.shareToken, req.params.token));
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Failed to get shared report");
    res.status(500).json({ error: "Failed to get shared report" });
  }
});

// POST /api/reports — supports JSON body OR multipart file upload
router.post("/reports", upload.single("file"), async (req, res) => {
  try {
    const userId = getUserId(req);
    let { title, originalText, reportType, bodyPart } = req.body;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    let imageUrl: string | undefined;

    if (req.file) {
      const mime = req.file.mimetype;
      const isImage = mime.startsWith("image/");
      const isPdf = mime === "application/pdf";

      if (isImage) {
        imageBase64 = fs.readFileSync(req.file.path).toString("base64");
        imageMimeType = mime;
        imageUrl = `/api/reports/image/${path.basename(req.file.path)}`;
        if (!title) title = req.file.originalname.replace(/\.[^/.]+$/, "");
        if (!originalText) originalText = "";
      } else if (isPdf) {
        originalText = await extractPdfText(req.file.path);
        if (!title) title = req.file.originalname.replace(/\.pdf$/i, "");
      } else {
        originalText = fs.readFileSync(req.file.path, "utf-8");
        if (!title) title = req.file.originalname.replace(/\.[^/.]+$/, "");
      }

      fs.unlinkSync(req.file.path);
    }

    if (!title) return res.status(400).json({ error: "title is required" });
    if (!originalText && !imageBase64) return res.status(400).json({ error: "Report text or image is required" });

    const analysis = await analyzeWithGemini(originalText || "", imageBase64, imageMimeType);

    const [report] = await db
      .insert(reportsTable)
      .values({
        userId,
        title,
        originalText: originalText || null,
        reportType: reportType || null,
        bodyPart: bodyPart || null,
        urgency: analysis.urgency,
        status: "complete",
        simplifiedExplanation: analysis.simplified,
        medicalTermsBreakdown: analysis.terms,
        recommendedNextSteps: analysis.steps,
      })
      .returning();

    res.status(201).json(report);
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(500).json({ error: "Failed to create report" });
  }
});

// GET /api/reports/:id
router.get("/reports/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const userId = getUserId(req);
    const [report] = await db.select().from(reportsTable).where(and(eq(reportsTable.id, id), eq(reportsTable.userId, userId)));
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Failed to get report");
    res.status(500).json({ error: "Failed to get report" });
  }
});

// DELETE /api/reports/:id
router.delete("/reports/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const userId = getUserId(req);
    await db.delete(reportsTable).where(and(eq(reportsTable.id, id), eq(reportsTable.userId, userId)));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete report");
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// POST /api/reports/:id/share
router.post("/reports/:id/share", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const userId = getUserId(req);
    const token = crypto.randomBytes(16).toString("hex");
    const [report] = await db.update(reportsTable).set({ shareToken: token }).where(and(eq(reportsTable.id, id), eq(reportsTable.userId, userId))).returning();
    if (!report) return res.status(404).json({ error: "Report not found" });
    const origin = req.headers.origin || `http://localhost:${process.env.FRONTEND_PORT || 24122}`;
    res.json({ token, url: `${origin}/shared/${token}` });
  } catch (err) {
    req.log.error({ err }, "Failed to share report");
    res.status(500).json({ error: "Failed to share report" });
  }
});

export default router;
