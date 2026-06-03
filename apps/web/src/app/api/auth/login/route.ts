import bcrypt from "bcryptjs";
import { client } from "@repo/db/client";
import { env } from "@repo/env/web";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const user = await client.db.user.findUnique({
    where: {
      email,
    },
  });

  const validPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !validPassword) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const token = jwt.sign(
    {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET || "",
    {
      expiresIn: "7d",
    },
  );

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set("customer_auth_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
