import { client } from "@repo/db/client";
import { env } from "@repo/env/web";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

type UserTokenPayload = JwtPayload & {
  authenticated?: boolean;
  userId?: number;
  email?: string;
  role?: string;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

function verifyToken(token: string): UserTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET || "");

    if (typeof payload === "string") {
      return null;
    }

    return payload as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userCookies = await cookies();
  const token = userCookies.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload?.authenticated || typeof payload.userId !== "number") {
    return null;
  }

  const user = await client.db.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
