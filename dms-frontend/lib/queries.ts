import { useQuery } from "@tanstack/react-query";
import {
  fetchAlerts,
  fetchDashboardInsights,
  fetchDocumentById,
  fetchDocuments,
  fetchExceptions
} from "@/lib/api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardInsights,
    staleTime: 1000 * 10, // 10 seconds - consider data stale quickly
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true // Always refetch on mount
  });
}

export function useDocumentsQuery() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { documents } = await fetchDocuments();
      return documents;
    },
    staleTime: 1000 * 60
  });
}

export function useDocumentQuery(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => fetchDocumentById(id),
    enabled: Boolean(id)
  });
}

export function useExceptionsQuery() {
  return useQuery({
    queryKey: ["exceptions"],
    queryFn: async () => {
      const { exceptions } = await fetchExceptions();
      return exceptions;
    },
    staleTime: 1000 * 30
  });
}

export function useAlertsQuery() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { alerts } = await fetchAlerts();
      return alerts;
    },
    staleTime: 1000 * 10, // 10 seconds - refresh more frequently for real-time alerts
    refetchInterval: 1000 * 30 // Auto-refresh every 30 seconds
  });
}
