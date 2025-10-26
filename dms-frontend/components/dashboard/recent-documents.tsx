"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, DollarSign, User, Building, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface ProcessedDocument {
  document_id: string;
  document_type: string;
  confidence: number;
  extracted_data: {
    title: string;
    client: string;
    vendor?: string;
    amount: number;
    currency: string;
    date: string;
    due_date?: string;
    po_number?: string;
    invoice_number?: string;
    summary: string;
    key_terms: string[];
    contact_info: {
      emails?: string[];
      phones?: string[];
      addresses?: string[];
    };
  };
  full_text: string;
  processing_time: string;
}

export function RecentDocuments() {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const fetchRecentDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/processed-documents/`);
      const data = await response.json();
      // Get only the 3 most recent documents
      setDocuments((data.documents || []).slice(0, 3));
    } catch (error) {
      console.error("Error fetching recent documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/processed-documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.document_id !== documentId));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete document: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert('Failed to delete document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6">
        <div className="text-center text-slate-300">Loading recent documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Recent Documents</h3>
          <Link 
            href="/documents"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 mx-auto mb-4">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-400">No processed documents yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload PDFs to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Recent Documents</h3>
        <Link 
          href="/documents"
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.document_id}
            className="rounded-lg border border-slate-800 bg-slate-800/40 p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">
                    {doc.extracted_data.title.replace('--- Page 1 ---', '').trim() || 'Document'}
                  </h4>
                  <p className="text-xs text-slate-400">{doc.document_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">
                  {(doc.confidence * 100).toFixed(0)}%
                </div>
                <button
                  onClick={(e) => deleteDocument(doc.document_id, e)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {doc.extracted_data.client && doc.extracted_data.client !== 'Unknown Client' && (
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300 truncate">{doc.extracted_data.client}</span>
                </div>
              )}
              {doc.extracted_data.amount > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">
                    {doc.extracted_data.currency} {doc.extracted_data.amount.toLocaleString()}
                  </span>
                </div>
              )}
              {doc.extracted_data.date && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">{doc.extracted_data.date}</span>
                </div>
              )}
              {doc.extracted_data.vendor && (
                <div className="flex items-center gap-2 text-xs">
                  <Building className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300 truncate">{doc.extracted_data.vendor}</span>
                </div>
              )}
            </div>

            {doc.extracted_data.summary && (
              <div className="mb-3">
                <p className="text-xs text-slate-300 line-clamp-2">
                  {doc.extracted_data.summary.replace('--- Page 1 ---', '').trim().substring(0, 100)}...
                </p>
              </div>
            )}

            {doc.extracted_data.key_terms && doc.extracted_data.key_terms.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {doc.extracted_data.key_terms.slice(0, 3).map((term, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                  >
                    {term}
                  </span>
                ))}
                {doc.extracted_data.key_terms.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                    +{doc.extracted_data.key_terms.length - 3}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {new Date(doc.processing_time).toLocaleDateString()}
              </div>
              <Link
                href={`/documents`}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Eye className="h-3 w-3" />
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
