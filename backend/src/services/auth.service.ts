import bcrypt from "bcryptjs";

import User, {
  UserRole,
} from "../models/User";

import {
  generateToken,
} from "../utils/generateToken";

export async function loginUser(
  email: string,
  password: string
) {
  const user =
    await User.findOne({
      email:
        email.toLowerCase().trim(),
    });

  if (
    !user ||
    !user.isActive
  ) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const valid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!valid) {
    throw new Error(
      "Invalid email or password"
    );
  }

  user.lastLogin = new Date();
  await user.save();

  const token =
    generateToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

  return {
    token,

    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      department:
        user.department || "",
      designation:
        user.designation || "",
      lastLogin:
        user.lastLogin,
    },
  };
}

export async function createUser(
  data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    designation?: string;
  }
) {
  const existing =
    await User.findOne({
      email:
        data.email.toLowerCase().trim(),
    });

  if (existing) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const hashed =
    await bcrypt.hash(
      data.password,
      12
    );

  const user =
    await User.create({
      ...data,
      email:
        data.email.toLowerCase().trim(),
      password: hashed,
    });

  return user;
}
