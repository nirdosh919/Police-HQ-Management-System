import { Request, Response } from "express";
import Officer from "../models/Officer";
import Attendance from "../models/Attendance";

export async function dashboardOverview(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const [
      officers,
      todayAttendance,
    ] = await Promise.all([
      Officer.find()
        .select(
          "fullName employeeId rank department district serviceStatus promotionHistory transferHistory updatedAt createdAt"
        )
        .lean(),

      Attendance.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .sort({ officerName: 1 })
        .lean(),
    ]);

    const total = officers.length;

    const active = officers.filter(
      (officer) =>
        officer.serviceStatus === "Active"
    ).length;

    const suspended = officers.filter(
      (officer) =>
        officer.serviceStatus === "Suspended"
    ).length;

    const retired = officers.filter(
      (officer) =>
        officer.serviceStatus === "Retired"
    ).length;

    const promotions = officers.reduce(
      (sum, officer) =>
        sum +
        (Array.isArray(
          officer.promotionHistory
        )
          ? officer.promotionHistory.length
          : 0),
      0
    );

    const transfers = officers.reduce(
      (sum, officer) =>
        sum +
        (Array.isArray(
          officer.transferHistory
        )
          ? officer.transferHistory.length
          : 0),
      0
    );

    const present = todayAttendance.filter(
      (row) => row.status === "Present"
    ).length;

    const absent = todayAttendance.filter(
      (row) => row.status === "Absent"
    ).length;

    const leave = todayAttendance.filter(
      (row) => row.status === "Leave"
    ).length;

    const activeOfficerIds = new Set(
      officers
        .filter(
          (officer) =>
            officer.serviceStatus === "Active"
        )
        .map((officer) =>
          String(officer._id)
        )
    );

    const markedActiveOfficerIds =
      new Set(
        todayAttendance
          .filter((row) =>
            activeOfficerIds.has(
              String(row.officerId)
            )
          )
          .map((row) =>
            String(row.officerId)
          )
      );

    const attendancePending = Math.max(
      active - markedActiveOfficerIds.size,
      0
    );

    const attendanceCoverage =
      active > 0
        ? Math.round(
            (markedActiveOfficerIds.size /
              active) *
              1000
          ) / 10
        : 0;

    const alerts = [];

    if (suspended > 0) {
      alerts.push({
        type: "warning",
        title: "Suspended Officers",
        count: suspended,
        message:
          `${suspended} officer(s) currently have Suspended status.`,
      });
    }

    if (absent > 0) {
      alerts.push({
        type: "danger",
        title: "Today's Absence",
        count: absent,
        message:
          `${absent} officer(s) are marked Absent today.`,
      });
    }

    if (attendancePending > 0) {
      alerts.push({
        type: "info",
        title: "Attendance Pending",
        count: attendancePending,
        message:
          `${attendancePending} active officer(s) do not have attendance marked today.`,
      });
    }

    const recentPromotions = officers
      .flatMap((officer) =>
        (officer.promotionHistory || []).map(
          (promotion) => ({
            officerId: String(
              officer._id
            ),
            employeeId:
              officer.employeeId,
            officerName:
              officer.fullName,
            rank: promotion.rank,
            date: promotion.date,
            orderNumber:
              promotion.orderNumber,
            remarks:
              promotion.remarks,
          })
        )
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);

    const recentTransfers = officers
      .flatMap((officer) =>
        (officer.transferHistory || []).map(
          (transfer) => ({
            officerId: String(
              officer._id
            ),
            employeeId:
              officer.employeeId,
            officerName:
              officer.fullName,
            fromPosting:
              transfer.fromPosting,
            toPosting:
              transfer.toPosting,
            date: transfer.date,
            orderNumber:
              transfer.orderNumber,
            remarks:
              transfer.remarks,
          })
        )
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);

    const recentActivity = [...officers]
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ).getTime() -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          ).getTime()
      )
      .slice(0, 8)
      .map((officer) => ({
        officerId: String(
          officer._id
        ),
        employeeId:
          officer.employeeId,
        fullName:
          officer.fullName,
        rank: officer.rank,
        department:
          officer.department,
        status:
          officer.serviceStatus,
        updatedAt:
          officer.updatedAt ||
          officer.createdAt,
      }));

    res.json({
      success: true,

      data: {
        generatedAt:
          new Date().toISOString(),

        officers: {
          total,
          active,
          suspended,
          retired,
          promotions,
          transfers,
        },

        attendance: {
          date:
            startOfDay.toISOString(),
          present,
          absent,
          leave,
          marked:
            todayAttendance.length,
          expected: active,
          pending:
            attendancePending,
          coverage:
            attendanceCoverage,
        },

        alerts,

        recent: {
          promotions:
            recentPromotions,
          transfers:
            recentTransfers,
          activity:
            recentActivity,
        },
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD OVERVIEW ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate dashboard overview",
    });
  }
}
