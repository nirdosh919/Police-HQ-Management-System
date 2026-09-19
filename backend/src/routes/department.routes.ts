import { Router } from "express";
import {
  getDepartments,
  getDepartment, getDepartmentOfficers,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../controllers/department.controller";

const router = Router();

router.get("/", getDepartments);
router.get("/:id/officers", getDepartmentOfficers);
router.get("/:id", getDepartment);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;

