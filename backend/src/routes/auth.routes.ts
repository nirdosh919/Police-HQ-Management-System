import { Router } from "express";

import {
  login,
  me,
  register,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";

import {
  authenticate,
  requireRoles,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/login",
  login
);

router.get(
  "/me",
  authenticate,
  me
);

router.put(
  "/profile",
  authenticate,
  updateProfile
);

router.put(
  "/password",
  authenticate,
  changePassword
);

router.post(
  "/register",
  authenticate,
  requireRoles("Super Admin"),
  register
);

export default router;

