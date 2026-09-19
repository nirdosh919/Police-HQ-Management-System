import { Router } from "express";

import {
  createHeadquarters,
  getHeadquarters,
  getHeadquartersById,
  getHeadquartersOfficers,
  updateHeadquarters,
  deleteHeadquarters,
} from "../controllers/headquarters.controller";

const router = Router();

router.get("/", getHeadquarters);
router.get("/:id/officers", getHeadquartersOfficers);
router.get("/:id", getHeadquartersById);

router.post("/", createHeadquarters);
router.put("/:id", updateHeadquarters);
router.delete("/:id", deleteHeadquarters);

export default router;
