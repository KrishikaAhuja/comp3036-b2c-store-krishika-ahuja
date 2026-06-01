import { NextRequest, NextResponse } from "next/server"; 

export async function POST(request: NextRequest) { //Runs when /api/logout gets a POST request.
  const response = NextResponse.redirect(new URL("/", request.url), 303);
//After logout, send the user back to homepage.

//deletes cookie by setting it to empty and maxAge to 0, which tells the browser to remove it immediately.
  response.cookies.set("admin_auth_token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
