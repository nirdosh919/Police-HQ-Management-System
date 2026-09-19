import {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";

import User from "../models/User";

import {
  createUser,
  loginUser,
} from "../services/auth.service";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

export async function login(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
      return;
    }

    const result =
      await loginUser(
        email,
        password
      );

    res.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
}

export async function me(
  req: AuthRequest,
  res: Response
): Promise<void> {
  res.json({
    success: true,
    data: req.user,
  });
}

export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { name, email, department, designation } = req.body;

    if (!name || !email) {
      res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: String(name).trim(),
        email: normalizedEmail,
        department: department ? String(department).trim() : undefined,
        designation: designation ? String(designation).trim() : undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id name email role department designation isActive lastLogin createdAt updatedAt");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile",
    });
  }
}

export async function changePassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
      return;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const valid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to change password",
    });
  }
}

export async function register(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (
      req.user?.role !==
      "Super Admin"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Only Super Admin can create users",
      });
      return;
    }

    const {
      name,
      email,
      password,
      role,
      department,
      designation,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required",
      });
      return;
    }

    const user =
      await createUser({
        name,
        email,
        password,
        role,
        department,
        designation,
      });

    res.status(201).json({
      success: true,
      message:
        "User created successfully",
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create user",
    });
  }
}

export async function seedDefaultAdmin() {
  const email =
    process.env.ADMIN_EMAIL ||
    "admin@policehq.local";

  const password =
    process.env.ADMIN_PASSWORD ||
    "Admin@12345";

  const existing =
    await User.findOne({
      email: email.toLowerCase(),
    });

  if (existing) {
    return;
  }

  const hashed =
    await bcrypt.hash(
      password,
      12
    );

  await User.create({
    name:
      process.env.ADMIN_NAME ||
      "Police HQ Super Admin",
    email:
      email.toLowerCase(),
    password: hashed,
    role: "Super Admin",
    department:
      "Administration",
    designation:
      "Super Administrator",
    isActive: true,
  });

  console.log("");
  console.log(
    "================================="
  );
  console.log(
    " DEFAULT SUPER ADMIN CREATED"
  );
  console.log(
    ` Email: ${email}`
  );
  console.log(
    ` Password: ${password}`
  );
  console.log(
    " CHANGE THIS PASSWORD AFTER LOGIN"
  );
  console.log(
    "================================="
  );
  console.log("");
}


