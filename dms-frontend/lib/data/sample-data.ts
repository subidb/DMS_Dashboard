export type DocumentCategory =
  | "Client PO"
  | "Vendor PO"
  | "Client Invoice"
  | "Vendor Invoice"
  | "Service Agreement";

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  client: string;
  vendor?: string;
  amount: number;
  currency: string;
  status: "Draft" | "Approved" | "Pending Review" | "Flagged";
  createdAt: string;
  dueDate?: string;
  confidence: number;
  linkedTo?: string;
  pdfUrl?: string;
}

export interface ExceptionRecord {
  id: string;
  documentId: string;
  issue: string;
  severity: "low" | "medium" | "high";
  owner: string;
  raisedAt: string;
}

export interface AlertRecord {
  id: string;
  title: string;
  description: string;
  level: "info" | "warning" | "critical";
  timestamp: string;
}

export interface DashboardInsights {
  kpis: Array<{ label: string; value: string; delta: string; helper: string }>;
  utilizationTrend: Array<{ month: string; client: number; vendor: number }>;
  categorySplit: Array<{ name: string; value: number; fill: string }>;
  alerts: AlertRecord[];
  exceptions: ExceptionRecord[];
}

const documents: DocumentRecord[] = [
  {
    id: "PO-2024-001",
    title: "EMB Retail Supply PO",
    category: "Client PO",
    client: "EMB Retail",
    amount: 150000,
    currency: "USD",
    status: "Approved",
    createdAt: "2024-03-02T09:30:00Z",
    dueDate: "2024-12-31T00:00:00Z",
    confidence: 0.98,
    linkedTo: "AGR-2024-002",
    pdfUrl: "/docs/sample-po.pdf"
  },
  {
    id: "INV-2024-032",
    title: "Supplier Invoice - Batch #32",
    category: "Vendor Invoice",
    client: "EMB Retail",
    vendor: "Northwind Components",
    amount: 28500,
    currency: "USD",
    status: "Pending Review",
    createdAt: "2024-03-11T14:47:00Z",
    confidence: 0.91,
    linkedTo: "PO-2024-001",
    pdfUrl: "/docs/sample-invoice.pdf"
  },
  {
    id: "AGR-2024-002",
    title: "Service Agreement - Field Support",
    category: "Service Agreement",
    client: "EMB Logistics",
    vendor: "Helios Services",
    amount: 56000,
    currency: "USD",
    status: "Approved",
    createdAt: "2024-01-17T10:15:00Z",
    dueDate: "2025-01-17T00:00:00Z",
    confidence: 0.95,
    pdfUrl: "/docs/sample-agreement.pdf"
  },
  {
    id: "INV-2024-045",
    title: "Client Invoice - Retail Expansion",
    category: "Client Invoice",
    client: "EMB Retail",
    amount: 72000,
    currency: "USD",
    status: "Flagged",
    createdAt: "2024-03-15T08:12:00Z",
    confidence: 0.76,
    linkedTo: "PO-2023-014",
    pdfUrl: "/docs/sample-invoice.pdf"
  },
  {
    id: "PO-2023-014",
    title: "Vendor Supply PO",
    category: "Vendor PO",
    client: "EMB Retail",
    vendor: "Helios Services",
    amount: 90000,
    currency: "USD",
    status: "Approved",
    createdAt: "2023-11-21T12:00:00Z",
    confidence: 0.99,
    pdfUrl: "/docs/sample-po.pdf"
  }
];

const exceptions: ExceptionRecord[] = [
  {
    id: "EX-220",
    documentId: "INV-2024-045",
    issue: "Invoice exceeds PO cap by 8%",
    severity: "high",
    owner: "Finance Ops",
    raisedAt: "2024-03-16T09:04:00Z"
  },
  {
    id: "EX-221",
    documentId: "INV-2024-032",
    issue: "Missing tax registration ID",
    severity: "medium",
    owner: "Compliance",
    raisedAt: "2024-03-15T15:10:00Z"
  },
  {
    id: "EX-224",
    documentId: "PO-2024-001",
    issue: "Vendor address mismatch against CRM record",
    severity: "low",
    owner: "Finance Ops",
    raisedAt: "2024-03-13T11:22:00Z"
  }
];

const alerts: AlertRecord[] = [
  {
    id: "AL-400",
    title: "PO Cap Utilization at 85%",
    description: "Client PO PO-2024-001 is close to its spending limit. Review pending invoices.",
    level: "warning",
    timestamp: "2024-03-16T11:32:00Z"
  },
  {
    id: "AL-404",
    title: "Service Agreement expiring in 30 days",
    description: "Agreement AGR-2024-002 for Helios Services expires soon. Consider renewal.",
    level: "info",
    timestamp: "2024-03-15T06:18:00Z"
  },
  {
    id: "AL-409",
    title: "Unlinked Vendor Invoice",
    description: "Vendor invoice INV-2024-051 could not be linked automatically.",
    level: "critical",
    timestamp: "2024-03-12T20:02:00Z"
  }
];

const dashboardInsights: DashboardInsights = {
  kpis: [
    { label: "Active Client POs", value: "42", delta: "+6.4%", helper: "vs last 30 days" },
    { label: "Invoice Utilization", value: "68%", delta: "+4.1%", helper: "PO caps consumed" },
    { label: "Exceptions", value: "9", delta: "-3 cases", helper: "open validation issues" },
    { label: "Avg. Processing Time", value: "12m", delta: "-5m", helper: "from ingest to validation" }
  ],
  utilizationTrend: [
    { month: "Oct", client: 42, vendor: 35 },
    { month: "Nov", client: 55, vendor: 44 },
    { month: "Dec", client: 60, vendor: 51 },
    { month: "Jan", client: 63, vendor: 54 },
    { month: "Feb", client: 66, vendor: 58 },
    { month: "Mar", client: 72, vendor: 63 }
  ],
  categorySplit: [
    { name: "Client POs", value: 18, fill: "#38bdf8" },
    { name: "Vendor POs", value: 12, fill: "#0ea5e9" },
    { name: "Client Invoices", value: 15, fill: "#6366f1" },
    { name: "Vendor Invoices", value: 9, fill: "#a855f7" },
    { name: "Agreements", value: 6, fill: "#f97316" }
  ],
  alerts,
  exceptions
};

export function listDocuments(): DocumentRecord[] {
  return documents;
}

export function getDocumentById(id: string): DocumentRecord | undefined {
  return documents.find((doc) => doc.id === id);
}

export function listExceptions(): ExceptionRecord[] {
  return exceptions;
}

export function listAlerts(): AlertRecord[] {
  return alerts;
}

export function getDashboardInsights(): DashboardInsights {
  return dashboardInsights;
}
