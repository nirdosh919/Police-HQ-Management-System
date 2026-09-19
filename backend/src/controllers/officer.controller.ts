import { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Officer from "../models/Officer";

export async function createOfficer(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const officer = await Officer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: officer,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Employee ID or Belt Number already exists",
      });
      return;
    }

    console.error("Create officer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create officer",
    });
  }
}

export async function getOfficers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      search,
      department,
      rank,
      headquarters,
      district,
      state,
      serviceStatus,
      gender,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const filter: Record<string, any> = {};

    if (department) filter.department = department;
    if (rank) filter.rank = rank;
    if (headquarters) filter.headquarters = headquarters;
    if (district) filter.district = district;
    if (state) filter.state = state;
    if (serviceStatus) filter.serviceStatus = serviceStatus;
    if (gender) filter.gender = gender;

    if (search) {
      filter.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          beltNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          district: {
            $regex: search,
            $options: "i",
          },
        },
        {
          headquarters: {
            $regex: search,
            $options: "i",
          },
        },
        {
          department: {
            $regex: search,
            $options: "i",
          },
        },
        {
          rank: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [officers, total] =
      await Promise.all([
        Officer.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber),

        Officer.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      data: officers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get officers error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch officers",
    });
  }
}

export async function getOfficerById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const officer =
      await Officer.findById(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: officer,
    });
  } catch (error) {
    console.error(
      "Get officer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch officer",
    });
  }
}

export async function updateOfficer(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const officer =
      await Officer.findByIdAndUpdate(
        id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      data: officer,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "Employee ID or Belt Number already exists",
      });
      return;
    }

    console.error(
      "Update officer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update officer",
    });
  }
}

export async function deleteOfficer(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const officer =
      await Officer.findByIdAndDelete(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Officer deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete officer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete officer",
    });
  }
}

/* ==========================================
   UPLOAD OFFICER FILES
========================================== */

export async function uploadOfficerFiles(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const officer =
      await Officer.findById(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const photograph =
      files?.photograph?.[0];

    const documents =
      files?.documents || [];

    if (photograph) {
      officer.photograph =
        `/uploads/officers/${photograph.filename}`;
    }

    if (documents.length > 0) {
      const documentPaths =
        documents.map(
          (file) =>
            `/uploads/officers/${file.filename}`
        );

      officer.documents.push(
        ...documentPaths
      );
    }

    await officer.save();

    res.status(200).json({
      success: true,
      message:
        "Officer files uploaded successfully",
      data: officer,
      uploaded: {
        photograph: photograph
          ? officer.photograph
          : null,
        documents: documents.map(
          (file) =>
            `/uploads/officers/${file.filename}`
        ),
      },
    });
  } catch (error) {
    console.error(
      "Upload officer files error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to upload officer files",
    });
  }
}

/* ==========================================
   ADD PROMOTION
========================================== */

export async function addPromotion(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const {
      rank,
      date,
      orderNumber,
      remarks,
    } = req.body;

    if (!rank || !date) {
      res.status(400).json({
        success: false,
        message:
          "Rank and promotion date are required",
      });
      return;
    }

    const officer =
      await Officer.findById(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    officer.promotionHistory.push({
      rank,
      date: new Date(date),
      orderNumber,
      remarks,
    });

    
      officer.rank = String(rank).trim();await officer.save();

    res.status(200).json({
      success: true,
      message:
        "Promotion history added successfully",
      data: officer,
    });
  } catch (error) {
    console.error(
      "Add promotion error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add promotion history",
    });
  }
}




/* ==========================================
   DELETE OFFICER DOCUMENT
========================================== */

export async function deleteOfficerDocument(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);
    const documentIndex = Number(
      req.params.documentIndex
    );

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    if (
      !Number.isInteger(documentIndex) ||
      documentIndex < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid document index",
      });
      return;
    }

    const officer =
      await Officer.findById(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    if (
      documentIndex >= officer.documents.length
    ) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    const documentPath =
      officer.documents[documentIndex];

    officer.documents.splice(
      documentIndex,
      1
    );

    await officer.save();

    const relativePath =
      documentPath.replace(
        /^\/uploads[\\/]/,
        ""
      );

    const filePath = path.join(
      process.cwd(),
      "uploads",
      relativePath
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      data: officer,
    });
  } catch (error) {
    console.error(
      "Delete officer document error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
}

/* ==========================================
   RECORD TRANSFER / POSTING
========================================== */

export async function recordTransfer(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
      return;
    }

    const {
      toPosting,
      date,
      orderNumber,
      remarks,
    } = req.body;

    if (!toPosting || !String(toPosting).trim()) {
      res.status(400).json({
        success: false,
        message: "New posting is required",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        message: "Transfer date is required",
      });
      return;
    }

    const officer = await Officer.findById(id);

    if (!officer) {
      res.status(404).json({
        success: false,
        message: "Officer not found",
      });
      return;
    }

    const fromPosting =
      officer.currentPosting ||
      officer.previousPosting ||
      "";

    const destination = String(toPosting).trim();

    if (fromPosting === destination) {
      res.status(400).json({
        success: false,
        message: "New posting must be different from current posting",
      });
      return;
    }

    officer.transferHistory.push({
      fromPosting,
      toPosting: destination,
      date: new Date(date),
      orderNumber: orderNumber
        ? String(orderNumber).trim()
        : undefined,
      remarks: remarks
        ? String(remarks).trim()
        : undefined,
    });

    officer.previousPosting = fromPosting;
    officer.currentPosting = destination;

    await officer.save();

    res.status(200).json({
      success: true,
      message: "Transfer recorded successfully",
      data: officer,
    });
  } catch (error) {
    console.error("Record transfer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record transfer",
    });
  }
}

