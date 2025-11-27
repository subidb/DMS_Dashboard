const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Use Next.js API routes as proxy (they now forward to backend)
  // This allows for better error handling and CORS management
  const url = path.startsWith('/api/') ? path : `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    credentials: "include",
    cache: "no-store" // Always fetch fresh data
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request to ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchDashboardInsights() {
  return apiFetch<import("@/lib/data/sample-data").DashboardInsights>("/api/dashboard/");
}

export function fetchDocuments() {
  return apiFetch<{ documents: import("@/lib/data/sample-data").DocumentRecord[] }>(
    "/api/documents/"
  );
}

export function fetchDocumentById(id: string) {
  return apiFetch<{
    document: import("@/lib/data/sample-data").DocumentRecord;
    relatedExceptions: import("@/lib/data/sample-data").ExceptionRecord[];
    relatedAlerts: import("@/lib/data/sample-data").AlertRecord[];
  }>(`/api/documents/${id}`);
}

export function fetchExceptions() {
  return apiFetch<{ exceptions: import("@/lib/data/sample-data").ExceptionRecord[] }>(
    "/api/exceptions/"
  );
}

export function fetchAlerts() {
  return apiFetch<{ alerts: import("@/lib/data/sample-data").AlertRecord[] }>("/api/alerts/");
}

export function sendChatMessage(message: string, context?: Array<{ role: "user" | "assistant"; content: string }>) {
  return apiFetch<{ reply: string }>("/api/chat/", {
    method: "POST",
    body: JSON.stringify({ message, context })
  });
}
