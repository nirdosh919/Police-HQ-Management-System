import { Router } from "express";
import {
  attendanceSummary,
  listAttendance,
  markAttendance,
} from "../controllers/attendance.controller";

const router = Router();

router.get(
  "/",
  listAttendance
);

router.get(
  "/summary",
  attendanceSummary
);

router.post(
  "/",
  markAttendance
);

export default router;
