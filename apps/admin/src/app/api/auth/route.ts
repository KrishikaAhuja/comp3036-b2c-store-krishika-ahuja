import jwt from "jsonwebtoken"; // Used to create and verify JWT tokens
import { env } from "@repo/env/admin"; // Gets admin password and JWT secret from env
import { NextRequest, NextResponse } from "next/server";

// Handles login
export async function POST(req: NextRequest) {
  let password = "";

  // Check what type of data the form sent
  const contentType = req.headers.get("content-type") || "";

  // If login request is JSON, read password from JSON body
  if (contentType.includes("application/json")) {
    const body = await req.json();
    password = body.password;
  } else {
    // Otherwise read password from normal form data
    const formData = await req.formData();
    password = String(formData.get("password") || "");
  }

  // If password is wrong, send user back to login page with error
  if (password !== env.PASSWORD) {
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  // Create JWT token after successful login
  const token = jwt.sign({ authenticated: true }, env.JWT_SECRET || "", {
    expiresIn: "1d",
  });

  // Redirect user to admin home page
  const response = NextResponse.redirect(new URL("/", req.url));

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