import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";

const router = Router();

// GET /api/dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    // Total count and urgency breakdown in one query
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        low: sql<number>`count(*) filter (where urgency = 'low')::int`,
        moderate: sql<number>`count(*) filter (where urgency = 'moderate')::int`,
        high: sql<number>`count(*) filter (where urgency = 'high')::int`,
      })
      .from(reportsTable);

    // Recent activity: reports created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reportsTable)
      .where(gte(reportsTable.createdAt, sevenDaysAgo));

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
