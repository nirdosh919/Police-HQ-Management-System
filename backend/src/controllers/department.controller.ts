import { Request, Response } from "express";
import Department from "../models/Department";
import Officer from "../models/Officer";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { head: { $regex: search, $options: "i" } }
      ];
    }

    if (status) filter.status = status;

    const departments = await Department.find(filter).sort({ name: 1 }).lean();

    const data = await Promise.all(
      departments.map(async (department) => {
        const departmentName = department.name.trim();
        const escapedName = departmentName.replace(/[.*+?^${}()|[\]\\]/g, "\$&");

        const officerCount = await Officer.countDocuments({
          department: {
            $regex: "^" + escapedName + "$",
            $options: "i",
          },
        });

        return {
          ...department,
          officerCount,
        };
      })
    );

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch departments" });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, data: department });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch department" });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Department code already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create department"
    });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update department" });
  }
};


export const getDepartmentOfficers = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const officers = await Officer.find({
      department: department.name,
    }).sort({ fullName: 1 });

    return res.json({
      success: true,
      department: department.name,
      count: officers.length,
      data: officers,
    });
  } catch (error) {
    console.error("Get department officers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department officers",
    });
  }
};
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Department deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete department" });
  }
};





