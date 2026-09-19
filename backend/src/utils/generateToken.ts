import jwt from "jsonwebtoken";

export type TokenRole =
  | "Super Admin"
  | "Admin"
  | "Officer/Viewer";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: TokenRole;
}

export function generateToken(
  payload: TokenPayload
): string {
  const secret =
    process.env.JWT_SECRET ||
    "POLICE_HQ_CHANGE_THIS_SECRET";

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: "8h",
    }
  );
}
