import { NextResponse } from "next/server";
import { listExceptions } from "@/lib/data/sample-data";

export async function GET() {
  return NextResponse.json({ exceptions: listExceptions() }, { status: 200 });
}
