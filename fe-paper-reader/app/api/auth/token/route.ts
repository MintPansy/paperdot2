import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiUrl } from "@/app/config/env";

const BACKEND_URL = getApiUrl();

export async function POST() {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${BACKEND_URL}/auth/token`, {
      method: "POST",
      headers: { cookie: cookieHeader },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(null, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
