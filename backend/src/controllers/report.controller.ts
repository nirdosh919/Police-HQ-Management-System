import { Request, Response } from "express";
import Officer from "../models/Officer";

export async function reportOverview(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const officers = await Officer.find().lean();

    const byDepartment: Record<string, number> = {};
    const byDistrict: Record<string, number> = {};
    const byRank: Record<string, number> = {};

    for (const officer of officers) {
      const department = officer.department || "Unassigned";
      const district = officer.district || "Unassigned";
      const rank = officer.rank || "Unassigned";

      byDepartment[department] = (byDepartment[department] || 0) + 1;
      byDistrict[district] = (byDistrict[district] || 0) + 1;
      byRank[rank] = (byRank[rank] || 0) + 1;
    }

    const total = officers.length;

    res.json({
      success: true,
      data: {
        total,
        active: officers.filter((o) => o.serviceStatus === "Active").length,
        suspended: officers.filter((o) => o.serviceStatus === "Suspended").length,
        retired: officers.filter((o) => o.serviceStatus === "Retired").length,
        promotions: officers.reduce(
          (sum, o) =>
            sum +
            (Array.isArray(o.promotionHistory)
              ? o.promotionHistory.length
              : 0),
          0
        ),
        transfers: officers.reduce(
          (sum, o) => sum + (Array.isArray(o.transferHistory)
            ? o.transferHistory.length
            : 0),
          0
        ),
        byDepartment,
        byDistrict,
        byRank,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("REPORT OVERVIEW ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate report overview",
    });
  }
}

export async function reportOfficers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const query: Record<string, string> = {};

    if (
      typeof req.query.department === "string" &&
      req.query.department !== "All Departments"
    ) {
      query.department = req.query.department;
    }

    if (
      typeof req.query.district === "string" &&
      req.query.district !== "All Districts"
    ) {
      query.district = req.query.district;
    }

    if (
      typeof req.query.status === "string" &&
      req.query.status !== "All Status"
    ) {
      query.serviceStatus = req.query.status;
    }

    const data = await Officer.find(query)
      .sort({ fullName: 1 })
      .lean();

    res.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    console.error("REPORT OFFICERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate officer report",
    });
  }
}
