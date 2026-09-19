import { Router } from "express";

import {
  createOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  uploadOfficerFiles,
  addPromotion,
  recordTransfer,
  deleteOfficerDocument,
} from "../controllers/officer.controller";

import {
  uploadOfficerFiles as uploadFiles,
} from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/",
  createOfficer
);

router.get(
  "/",
  getOfficers
);

router.get(
  "/:id",
  getOfficerById
);

router.put(
  "/:id",
  updateOfficer
);

router.delete(
  "/:id",
  deleteOfficer
);

/* ==========================================
   OFFICER PHOTOGRAPH + DOCUMENTS
========================================== */

router.post(
  "/:id/files",
  uploadFiles,
  uploadOfficerFiles
);

/* ==========================================
   DELETE OFFICER DOCUMENT
========================================== */

router.delete(
  "/:id/documents/:documentIndex",
  deleteOfficerDocument
);

/* ==========================================
   OFFICER PROMOTION
========================================== */

router.post(
  "/:id/promotions",
  addPromotion
);

/* ==========================================
   OFFICER TRANSFER
========================================== */

router.post(
  "/:id/transfers",
  recordTransfer
);

export default router;

