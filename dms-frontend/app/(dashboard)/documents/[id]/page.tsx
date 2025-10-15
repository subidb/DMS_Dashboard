import { DocumentDetailScreen } from "@/components/documents/document-detail-screen";

interface DocumentDetailPageProps {
  params: { id: string };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  return <DocumentDetailScreen id={params.id} />;
}
