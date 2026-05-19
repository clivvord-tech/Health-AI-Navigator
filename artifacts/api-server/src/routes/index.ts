import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";
import aiFeaturesRouter from "./ai-features";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(chatRouter);
router.use(dashboardRouter);
router.use(aiFeaturesRouter);

export default router;
