import { NextRequest, NextResponse } from "next/server"; //Used for handling HTTP request/response in Next.js route handlers.

export async function POST(request: NextRequest) { //when a POST request comes to /api/login, run this function
  const formData = await request.formData(); //This gets the submitted form values,works because  login form input has name="password"
  const password = formData.get("password");
  if (password !== "123") {
    return NextResponse.redirect(new URL("/?error=invalid", request.url), 303); //redirect, 303  tells the browser to follow the redirect with a GET request
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303); //prepare redirect to homepage (login page)

  response.cookies.set("auth_token", "true", { //cookie name auth-token, val- true
    httpOnly: true, //browser JavaScript cannot read it directly
    path: "/", //cookie works on whole app
    sameSite: "lax", //adds some CSRF protection
  });

  return response;
}//returns the final redirect with cookie attached.