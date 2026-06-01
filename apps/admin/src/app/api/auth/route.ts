import bcrypt from "bcryptjs";
import { client } from "@repo/db/client";
import { env } from "@repo/env/admin"; // Gets JWT secret from env
import jwt from "jsonwebtoken"; // Used to create and verify JWT tokens
import { NextRequest, NextResponse } from "next/server";

// Handles login
export async function POST(req: NextRequest) {
  let email = "";
  let password = "";

  // Check what type of data the form sent
  const contentType = req.headers.get("content-type") || "";

  // If login request is JSON, read email and password from JSON body
  if (contentType.includes("application/json")) {
    const body = await req.json();
    email = String(body.email || "");
    password = String(body.password || "");
  } else {
    // Otherwise read password from normal form data
    const formData = await req.formData();
    email = String(formData.get("email") || "");
    password = String(formData.get("password") || "");
  }

  const user = await client.db.user.findUnique({
    where: {
      email,
    },
  });

  const validPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  // If details are wrong or the user is not an admin, send user back to login page with error
  if (!user || !validPassword || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/?error=invalid", req.url), 303);
  }

  // Create JWT token after successful login
  const token = jwt.sign(
    {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET || "",
    {
      expiresIn: "1d",
    },
  );

  // Redirect user to admin home page
  const response = NextResponse.redirect(new URL("/", req.url), 303);

  // Store JWT token in a secure httpOnly cookie
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

// Handles logout
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Expire the auth cookie so the user is logged out
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });

  return response;
}
