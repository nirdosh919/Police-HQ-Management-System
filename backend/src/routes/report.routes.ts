import { Router } from "express";
import {
  reportOverview,
  reportOfficers,
} from "../controllers/report.controller";

const router = Router();

router.get("/overview", reportOverview);
router.get("/officers", reportOfficers);

export default router;
