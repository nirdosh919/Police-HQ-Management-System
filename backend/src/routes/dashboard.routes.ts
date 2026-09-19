import { Router } from "express";
import {
  dashboardOverview,
} from "../controllers/dashboard.controller";

const router = Router();

router.get(
  "/overview",
  dashboardOverview
);

export default router;
