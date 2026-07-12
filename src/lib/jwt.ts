/**
 * JWT helpers — sign and verify tokens for the auth API routes.
 *
 * Payload stored in every token:
 *   sub      — user UUID (primary key in users table)
 *   email    — user email
 *   role     — Role enum value (EMPLOYEE, ADMIN, etc.)
 *   isActive — whether the account is active
 */

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

/** Create a signed JWT for the given user. */
export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  if (!SECRET) {
    throw new Error("JWT_SECRET or AUTH_SECRET must be configured.");
  }

  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 * Returns null instead of throwing if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!SECRET) return null;
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/** Extract the raw token string from an Authorization header (Bearer …). */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}
