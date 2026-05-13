import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(chatRouter);
router.use(dashboardRouter);

export default router;
