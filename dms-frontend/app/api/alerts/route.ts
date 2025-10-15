import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/data/sample-data";

export async function GET() {
  return NextResponse.json({ alerts: listAlerts() }, { status: 200 });
}
