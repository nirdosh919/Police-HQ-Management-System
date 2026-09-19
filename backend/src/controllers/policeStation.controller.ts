import { Request, Response } from "express";
import mongoose from "mongoose";
import PoliceStation from "../models/PoliceStation";
import Officer from "../models/Officer";

const getId = (req: Request) =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

export async function createPoliceStation(req: Request, res: Response): Promise<void> {
  try {
    const station = await PoliceStation.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.code === 11000 ? "Station code already exists" : error?.message || "Failed to create police station"
    });
  }
}

export async function getPoliceStations(_req: Request, res: Response): Promise<void> {
  try {
    const stations = await PoliceStation.find().sort({ name: 1 }).lean();

    const officers = await Officer.find(
      {},
      { fullName: 1, employeeId: 1, rank: 1, department: 1, serviceStatus: 1, district: 1, currentPosting: 1 }
    ).lean();

    const data = stations.map((station: any) => {
      const stationName = String(station.name || "").trim().toLowerCase();

      const assigned = officers.filter((o: any) =>
        String(o.currentPosting || "").trim().toLowerCase() === stationName
      );

      return {
        ...station,
        officerCount: assigned.length
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || "Failed to fetch police stations" });
  }
}

export async function getPoliceStation(req: Request, res: Response): Promise<void> {
  try {
    const id = getId(req);

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid station ID" });
      return;
    }

    const station = await PoliceStation.findById(id);

    if (!station) {
      res.status(404).json({ success: false, message: "Police station not found" });
      return;
    }

    res.json({ success: true, data: station });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || "Failed to fetch police station" });
  }
}

export async function getPoliceStationOfficers(req: Request, res: Response): Promise<void> {
  try {
    const id = getId(req);

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid station ID" });
      return;
    }

    const station: any = await PoliceStation.findById(id).lean();

    if (!station) {
      res.status(404).json({ success: false, message: "Police station not found" });
      return;
    }

    const officers = await Officer.find({
      currentPosting: {
        $regex: `^${String(station.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      }
    }).sort({ fullName: 1 });

    res.json({ success: true, data: officers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || "Failed to fetch station officers" });
  }
}

export async function updatePoliceStation(req: Request, res: Response): Promise<void> {
  try {
    const id = getId(req);

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid station ID" });
      return;
    }

    const station = await PoliceStation.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!station) {
      res.status(404).json({ success: false, message: "Police station not found" });
      return;
    }

    res.json({ success: true, data: station });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.code === 11000 ? "Station code already exists" : error?.message || "Failed to update police station"
    });
  }
}

export async function deletePoliceStation(req: Request, res: Response): Promise<void> {
  try {
    const id = getId(req);

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid station ID" });
      return;
    }

    const station: any = await PoliceStation.findById(id).lean();

    if (!station) {
      res.status(404).json({ success: false, message: "Police station not found" });
      return;
    }

    const officerCount = await Officer.countDocuments({
      currentPosting: {
        $regex: `^${String(station.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      }
    });

    if (officerCount > 0) {
      res.status(409).json({
        success: false,
        message: `Cannot delete this station. ${officerCount} officer(s) are currently assigned.`
      });
      return;
    }

    await PoliceStation.findByIdAndDelete(id);

    res.json({ success: true, message: "Police station deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || "Failed to delete police station" });
  }
}
