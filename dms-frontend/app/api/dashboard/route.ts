import { NextResponse } from "next/server";
import { getDashboardInsights } from "@/lib/data/sample-data";

export async function GET() {
  return NextResponse.json(getDashboardInsights(), { status: 200 });
}
