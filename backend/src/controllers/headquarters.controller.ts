import { Request, Response } from "express";
import mongoose from "mongoose";
import Headquarters from "../models/Headquarters";
import Officer from "../models/Officer";

export const createHeadquarters = async (
  req: Request,
  res: Response
) => {
  try {
    const headquarters = await Headquarters.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Headquarters created successfully",
      data: headquarters,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "Headquarters code already exists"
        : error.message || "Failed to create headquarters",
    });
  }
};

export const getHeadquarters = async (
  _req: Request,
  res: Response
) => {
  try {
    const headquarters = await Headquarters.find()
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      headquarters.map(async (hq) => {
        const officerCount = await Officer.countDocuments({
          headquarters: {
            $regex: `^${hq.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        });

        return {
          ...hq,
          officerCount,
        };
      })
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch headquarters",
    });
  }
};

export const getHeadquartersById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid headquarters ID",
      });
    }

    const headquarters = await Headquarters.findById(id);

    if (!headquarters) {
      return res.status(404).json({
        success: false,
        message: "Headquarters not found",
      });
    }

    return res.json({
      success: true,
      data: headquarters,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch headquarters",
    });
  }
};

export const getHeadquartersOfficers = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid headquarters ID",
      });
    }

    const headquarters = await Headquarters.findById(id);

    if (!headquarters) {
      return res.status(404).json({
        success: false,
        message: "Headquarters not found",
      });
    }

    const officers = await Officer.find({
      headquarters: {
        $regex: `^${headquarters.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    }).sort({ fullName: 1 });

    return res.json({
      success: true,
      data: officers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch headquarters officers",
    });
  }
};

export const updateHeadquarters = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid headquarters ID",
      });
    }

    const headquarters = await Headquarters.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!headquarters) {
      return res.status(404).json({
        success: false,
        message: "Headquarters not found",
      });
    }

    return res.json({
      success: true,
      message: "Headquarters updated successfully",
      data: headquarters,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "Headquarters code already exists"
        : error.message || "Failed to update headquarters",
    });
  }
};

export const deleteHeadquarters = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid headquarters ID",
      });
    }

    const headquarters = await Headquarters.findById(id);

    if (!headquarters) {
      return res.status(404).json({
        success: false,
        message: "Headquarters not found",
      });
    }

    const officerCount = await Officer.countDocuments({
      headquarters: {
        $regex: `^${headquarters.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (officerCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete headquarters. ${officerCount} officer(s) are assigned to it.`,
      });
    }

    await Headquarters.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Headquarters deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete headquarters",
    });
  }
};
