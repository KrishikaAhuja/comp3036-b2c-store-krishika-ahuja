
// ASSIGNMENT 3
// check that auth_token cookie exists and is valid
 
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";
import { cookies } from "next/headers";

export async function isLoggedIn() {
  const userCookies = await cookies(); // get cookies from request

  const token = userCookies.get("auth_token")?.value; // read JWT token

  if (!token) return false; // no token = not logged in

  try {
    jwt.verify(token, env.JWT_SECRET || ""); // check if token is valid
    return true; // valid → logged in
  } catch {
    return false; // invalid → not logged in
  }
} 