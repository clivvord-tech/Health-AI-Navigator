import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, sql, gte, and } from "drizzle-orm";

const router = Router();

function getUserId(req: any): string {
  return (req.headers["x-user-id"] as string) || "anonymous";
}

// GET /api/dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const userId = getUserId(req);

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        low: sql<number>`count(*) filter (where urgency = 'low')::int`,
        moderate: sql<number>`count(*) filter (where urgency = 'moderate')::int`,
        high: sql<number>`count(*) filter (where urgency = 'high')::int`,
      })
      .from(reportsTable)
      .where(eq(reportsTable.userId, userId));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reportsTable)
      .where(and(eq(reportsTable.userId, userId), gte(reportsTable.createdAt, sevenDaysAgo)));

    res.json({
      totalReports: stats?.total ?? 0,
      urgencyBreakdown: {
        low: stats?.low ?? 0,
        moderate: stats?.moderate ?? 0,
        high: stats?.high ?? 0,
      },
      recentActivity: recentActivity?.count ?? 0,
      averageProcessingTime: 2.4,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

export default router;
