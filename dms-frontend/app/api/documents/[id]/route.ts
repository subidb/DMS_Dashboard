import { NextResponse } from "next/server";
import { getDocumentById, listAlerts, listExceptions } from "@/lib/data/sample-data";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const document = getDocumentById(params.id);

  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const relatedExceptions = listExceptions().filter((item) => item.documentId === document.id);
  const relatedAlerts = listAlerts().filter((alert) => alert.description.includes(document.id));

  return NextResponse.json(
    {
      document,
      relatedExceptions,
      relatedAlerts
    },
    { status: 200 }
  );
}
