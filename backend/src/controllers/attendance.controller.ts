import { Request, Response } from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance";
import Officer from "../models/Officer";

export async function listAttendance(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 100, 1),
      500
    );

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.date) {
      const date = String(req.query.date);
      const start = new Date(`${date}T00:00:00.000`);
      const end = new Date(`${date}T23:59:59.999`);

      if (!Number.isNaN(start.getTime())) {
        filter.date = {
          $gte: start,
          $lte: end,
        };
      }
    }

    if (req.query.status) {
      const status = String(req.query.status);

      if (
        ["Present", "Absent", "Leave"].includes(status)
      ) {
        filter.status = status;
      }
    }

    if (req.query.officerId) {
      const id = String(req.query.officerId);

      if (mongoose.Types.ObjectId.isValid(id)) {
        filter.officerId = id;
      }
    }

    const [data, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1, officerName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Attendance.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "ATTENDANCE LIST ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load attendance",
    });
  }
}

export async function markAttendance(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.body.officerId || "");

    const {
      date,
      status,
      remarks,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid officer is required",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        message: "Attendance date is required",
      });
      return;
    }

    if (
      !["Present", "Absent", "Leave"].includes(
        status
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Status must be Present, Absent or Leave",
      });
      return;
    }

    const officer =
      await Officer.findById(id).lean();

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    const attendanceDate =
      new Date(`${String(date)}T00:00:00.000`);

    if (
      Number.isNaN(
        attendanceDate.getTime()
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
      return;
    }

    const record =
      await Attendance.findOneAndUpdate(
        {
          officerId: officer._id,
          date: attendanceDate,
        },
        {
          officerId: officer._id,
          employeeId: officer.employeeId,
          officerName: officer.fullName,
          department: officer.department,
          date: attendanceDate,
          status,
          remarks: remarks
            ? String(remarks).trim()
            : undefined,
          markedBy:
            (req as any).user?.email ||
            (req as any).user?.name ||
            undefined,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
      .lean();

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      data: record,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE MARK ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to save attendance",
    });
  }
}

export async function attendanceSummary(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.date) {
      const date = String(req.query.date);

      const start =
        new Date(`${date}T00:00:00.000`);

      const end =
        new Date(`${date}T23:59:59.999`);

      if (
        !Number.isNaN(start.getTime())
      ) {
        filter.date = {
          $gte: start,
          $lte: end,
        };
      }
    }

    const rows =
      await Attendance.find(filter)
        .select("status")
        .lean();

    const summary = {
      total: rows.length,
      present: rows.filter(
        (row) => row.status === "Present"
      ).length,
      absent: rows.filter(
        (row) => row.status === "Absent"
      ).length,
      leave: rows.filter(
        (row) => row.status === "Leave"
      ).length,
    };

    summary.total = rows.length;

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE SUMMARY ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load attendance summary",
    });
  }
}
