import { client } from "@repo/db/client";
import { env } from "@repo/env/admin";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

type AdminTokenPayload = JwtPayload & {
  authenticated?: boolean;
  userId?: number;
  email?: string;
  role?: string;
};

export type CurrentAdminUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN";
};

function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET || "");

    if (typeof payload === "string") {
      return null;
    }

    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentAdminUser | null> {
  const userCookies = await cookies();
  const token = userCookies.get("admin_auth_token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAdminToken(token);

  if (
    !payload?.authenticated ||
    payload.role !== "ADMIN" ||
    typeof payload.userId !== "number"
  ) {
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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function isLoggedIn() {
  return (await getCurrentUser()) !== null;
}
