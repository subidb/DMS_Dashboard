import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/data/sample-data";

export async function GET() {
  return NextResponse.json({ documents: listDocuments() }, { status: 200 });
}
