import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("customer_auth_token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });

  return response;
}
