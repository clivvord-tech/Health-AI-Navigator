import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

const DEMO_EXPLANATIONS: Record<string, { simplified: string; terms: string; steps: string; urgency: "low" | "moderate" | "high" }> = {
  default: {
    simplified:
      "Your radiology report has been analyzed by our AI system. The findings have been reviewed and summarized to help you better understand your results. Please discuss these findings with your healthcare provider for proper medical guidance.",
    terms:
      "Parenchyma: The functional tissue of an organ. Opacity: An area that appears white/light on an X-ray, indicating denser tissue. Attenuation: The reduction in intensity of a signal as it passes through tissue.",
    steps:
      "1. Schedule a follow-up appointment with your primary care physician within 2 weeks.\n2. Bring this report and the AI summary to your appointment.\n3. Ask your doctor about any findings that concern you.\n4. Do not self-diagnose or change any medications without consulting your doctor.",
    urgency: "low",
  },
  chest: {
    simplified:
      "Your chest X-ray shows the lungs, heart, and surrounding structures. The heart size appears within normal limits. The lung fields show clear airspace without evidence of significant consolidation or effusion. The bony structures of the chest wall appear intact.",
    terms:
      "Consolidation: When air spaces in the lung fill with fluid or other material. Effusion: Accumulation of fluid in the pleural space surrounding the lung. Cardiomegaly: Enlargement of the heart beyond normal size.",
    steps:
      "1. Continue any prescribed respiratory medications as directed.\n2. Follow up with your doctor if you develop new symptoms such as shortness of breath, chest pain, or cough.\n3. Avoid smoking and exposure to secondhand smoke.\n4. Maintain regular follow-up appointments as recommended by your physician.",
    urgency: "low",
  },
  brain: {
    simplified:
      "Your brain MRI has been carefully analyzed. The imaging shows the brain structure in detail. There are subtle findings that warrant attention and further evaluation by a specialist. The white matter and grey matter structures are visible and show some areas that your neurologist should review.",
    terms:
      "White matter: Areas of the brain made up primarily of nerve fibers. Gyri: The ridges or folds on the surface of the brain. Ventricles: Fluid-filled spaces within the brain. FLAIR: A special MRI sequence that highlights certain types of abnormalities.",
    steps:
      "1. Schedule an appointment with a neurologist as soon as possible.\n2. Bring all imaging studies including this MRI.\n3. Keep a log of any symptoms such as headaches, vision changes, or memory issues.\n4. Avoid driving until cleared by your physician if you have had any seizures.",
    urgency: "moderate",
  },
  knee: {
    simplified:
      "Your knee MRI provides detailed images of the joint structures including cartilage, ligaments, and menisci. The study reveals some changes in the joint that are consistent with common wear-and-tear findings. The medial and lateral compartments have been evaluated along with the patellofemoral joint.",
    terms:
      "Meniscus: C-shaped cartilage pads that act as shock absorbers in the knee. ACL/PCL: Anterior and posterior cruciate ligaments that stabilize the knee. Chondromalacia: Softening or deterioration of cartilage under the kneecap.",
    steps:
      "1. Apply ice to the knee for 15-20 minutes several times per day to reduce swelling.\n2. Avoid high-impact activities until you see an orthopedic specialist.\n3. Consider physical therapy to strengthen the muscles around the knee.\n4. Schedule an appointment with an orthopedic surgeon to review these findings.",
    urgency: "moderate",
  },
};

function getAnalysis(text: string): { simplified: string; terms: string; steps: string; urgency: "low" | "moderate" | "high" } {
  const lower = text.toLowerCase();
  if (lower.includes("brain") || lower.includes("head") || lower.includes("mri") || lower.includes("cerebr")) {
    return DEMO_EXPLANATIONS.brain;
  }
  if (lower.includes("knee") || lower.includes("ligament") || lower.includes("meniscus") || lower.includes("cartilage")) {
    return DEMO_EXPLANATIONS.knee;
  }
  if (lower.includes("chest") || lower.includes("lung") || lower.includes("pulmon") || lower.includes("x-ray") || lower.includes("xray")) {
    return DEMO_EXPLANATIONS.chest;
  }
  // Detect high urgency keywords
  const highUrgencyKeywords = ["mass", "tumor", "malignant", "cancer", "hemorrhage", "stroke", "infarct", "embolism", "urgent", "emergent", "critical"];
  if (highUrgencyKeywords.some((kw) => lower.includes(kw))) {
    return { ...DEMO_EXPLANATIONS.default, urgency: "high" };
  }
  return DEMO_EXPLANATIONS.default;
}

// GET /api/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt));
    res.json(reports);
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Failed to list reports" });
  }
});

// GET /api/reports/recent
router.get("/reports/recent", async (req, res) => {
  try {
    const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt)).limit(5);
    res.json(reports);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent reports");
    res.status(500).json({ error: "Failed to get recent reports" });
  }
});

// POST /api/reports
router.post("/reports", async (req, res) => {
  try {
    const { title, originalText, reportType, bodyPart } = req.body;
    if (!title || !originalText) {
      return res.status(400).json({ error: "title and originalText are required" });
    }

    const analysis = getAnalysis(originalText);

    const [report] = await db
      .insert(reportsTable)
      .values({
        title,
        originalText,
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

    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
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

    await db.delete(reportsTable).where(eq(reportsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete report");
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
