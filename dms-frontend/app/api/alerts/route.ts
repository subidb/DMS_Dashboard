import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/alerts/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching alerts from backend:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
