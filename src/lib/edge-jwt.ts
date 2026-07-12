import { jwtVerify } from "jose/jwt/verify";

export interface EdgeJwtPayload {
  sub: string;
  email: string;
  role: string;
  isActive: boolean;
}

const encoder = new TextEncoder();

export async function verifyTokenAtEdge(token: string): Promise<EdgeJwtPayload | null> {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? ""),
      isActive: payload.isActive === true,
    };
  } catch {
    return null;
  }
}
