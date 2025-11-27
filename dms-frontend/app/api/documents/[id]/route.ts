import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "Document not found" }, { status: 404 });
      }
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching document from backend:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
