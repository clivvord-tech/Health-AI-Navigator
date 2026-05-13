import { Router } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router = Router();

const MEDICAL_RESPONSES: { pattern: RegExp; response: string }[] = [
  {
    pattern: /what (is|are) (a |an )?(mri|magnetic resonance)/i,
    response:
      "An MRI (Magnetic Resonance Imaging) is a type of medical imaging that uses powerful magnets and radio waves to create detailed pictures of the inside of your body. Unlike X-rays, MRI does not use radiation. It's particularly useful for imaging soft tissues like the brain, spinal cord, muscles, and tendons.",
  },
  {
    pattern: /what (is|does) (an? )?(x-ray|xray|radiograph)/i,
    response:
      "An X-ray is one of the oldest and most common forms of medical imaging. It uses a small dose of ionizing radiation to produce images of the inside of your body. X-rays are best for imaging dense structures like bones and can also detect some soft tissue issues. Chest X-rays can reveal lung conditions, heart size, and rib fractures.",
  },
  {
    pattern: /urgency|urgent|emergency|serious|severe/i,
    response:
      "The urgency level in your report indicates how quickly you should seek medical attention. A 'Low' urgency means findings are within normal range or are minor and routine follow-up is sufficient. 'Moderate' urgency means you should see your doctor within the next few days to a week. 'High' urgency means you should seek medical attention as soon as possible — contact your doctor today or go to an emergency department if symptoms are severe.",
  },
  {
    pattern: /explain|simplif|understand|what does (it|this|the report) mean/i,
    response:
      "Medical reports can be complex and filled with technical terminology. RADapp's AI analyzes your report and translates the findings into plain language. We break down each finding, explain medical terms, and provide context about what the results might mean for your health. Always remember that these explanations are meant to help you understand, not to replace the advice of your healthcare provider.",
  },
  {
    pattern: /safe|radiation|dangerous|risk/i,
    response:
      "Different imaging modalities have different safety profiles. X-rays and CT scans use small amounts of ionizing radiation, but the diagnostic benefit generally outweighs the minimal risk. MRI and ultrasound do not use radiation and are considered very safe for most people. Contrast agents used in some scans are generally well-tolerated but should be disclosed to your doctor, especially if you have kidney problems or allergies.",
  },
  {
    pattern: /next step|follow.?up|what should i do|recommendation/i,
    response:
      "After receiving your radiology report, the most important next step is to discuss it with your referring physician or specialist. They ordered the imaging for a reason and are best placed to interpret the findings in the context of your symptoms and medical history. If your report indicates urgent findings, seek medical attention promptly. For routine findings, schedule a follow-up appointment at your earliest convenience.",
  },
  {
    pattern: /hello|hi|hey|good morning|good afternoon/i,
    response:
      "Hello! I'm RADapp's AI Medical Assistant. I'm here to help you understand radiology reports, medical imaging findings, and answer questions about your health. While I can provide helpful information, please remember that I'm not a substitute for professional medical advice. How can I assist you today?",
  },
  {
    pattern: /thank|thanks|appreciate/i,
    response:
      "You're welcome! If you have any more questions about your radiology reports or medical imaging, don't hesitate to ask. Remember, understanding your health is an important step in your care journey. Is there anything else I can help you with?",
  },
];

const DEFAULT_RESPONSE =
  "Thank you for your question. As a medical AI assistant, I can provide general information about radiology and medical imaging. For specific questions about your personal health or test results, please consult with your healthcare provider who can give you personalized medical advice based on your complete health history. Is there a specific aspect of radiology or your report you'd like me to explain?";

function generateAIResponse(userMessage: string): string {
  for (const { pattern, response } of MEDICAL_RESPONSES) {
    if (pattern.test(userMessage)) {
      return response;
    }
  }
  return DEFAULT_RESPONSE;
}

// GET /api/chat/messages
router.get("/chat/messages", async (req, res) => {
  try {
    const messages = await db.select().from(chatMessagesTable).orderBy(asc(chatMessagesTable.createdAt));
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get chat messages");
    res.status(500).json({ error: "Failed to get chat messages" });
  }
});

// POST /api/chat/messages
router.post("/chat/messages", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    // Save user message
    await db.insert(chatMessagesTable).values({ role: "user", content });

    // Generate AI response
    const aiContent = generateAIResponse(content);

    // Save AI response
    const [aiMessage] = await db
      .insert(chatMessagesTable)
      .values({ role: "assistant", content: aiContent })
      .returning();

    res.status(201).json(aiMessage);
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    res.status(500).json({ error: "Failed to send chat message" });
  }
});

export default router;
