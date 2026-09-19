import { Router } from "express";

import {
  createPoliceStation,
  getPoliceStations,
  getPoliceStation,
  getPoliceStationOfficers,
  updatePoliceStation,
  deletePoliceStation
} from "../controllers/policeStation.controller";

const router = Router();

router.get("/", getPoliceStations);
router.get("/:id/officers", getPoliceStationOfficers);
router.get("/:id", getPoliceStation);

router.post("/", createPoliceStation);
router.put("/:id", updatePoliceStation);
router.delete("/:id", deletePoliceStation);

export default router;
