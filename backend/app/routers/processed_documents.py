from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from app.services.pdf_processor import PDFProcessor
import os
import json

router = APIRouter(prefix="/api/processed-documents", tags=["processed-documents"])

@router.get("/")
async def get_processed_documents():
    """Get list of processed documents with their extracted content"""
    try:
        processor = PDFProcessor()
        processed_dir = processor.processed_dir
        
        if not os.path.exists(processed_dir):
            return {"documents": []}
        
        documents = []
        
        # Read all processed files
        seen_document_ids = set()
        seen_keys = set()  # For deduplication by title+amount+client
        
        for filename in os.listdir(processed_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(processed_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        # Skip if not successful
                        if not data.get('success', False):
                            continue
                        
                        # Deduplicate by document_id
                        doc_id = data.get('document_id')
                        if doc_id and doc_id in seen_document_ids:
                            continue
                        
                        # Also deduplicate by title+amount+client
                        extracted = data.get('extracted_data', {})
                        title = extracted.get('title', '')
                        amount = extracted.get('amount', 0)
                        client = extracted.get('client', '')
                        dedup_key = f"{title}_{amount}_{client}"
                        
                        if dedup_key in seen_keys:
                            continue
                        
                        seen_document_ids.add(doc_id)
                        seen_keys.add(dedup_key)
                        documents.append(data)
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
                    continue
        
        # Sort by processing time (newest first)
        documents.sort(key=lambda x: x.get('processing_time', ''), reverse=True)
        
        return {"documents": documents}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get processed documents: {str(e)}")

@router.get("/{document_id}")
async def get_processed_document(document_id: str):
    """Get specific processed document by ID"""
    try:
        processor = PDFProcessor()
        processed_dir = processor.processed_dir
        
        # Look for JSON file with this document ID
        for filename in os.listdir(processed_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(processed_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('document_id') == document_id:
                            return data
                except Exception as e:
                    continue
        
        raise HTTPException(status_code=404, detail="Document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document: {str(e)}")

@router.get("/content/{document_id}")
async def get_document_content(document_id: str):
    """Get the full text content of a processed document"""
    try:
        processor = PDFProcessor()
        processed_dir = processor.processed_dir
        
        # Look for JSON file with this document ID
        for filename in os.listdir(processed_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(processed_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('document_id') == document_id:
                            return {
                                "document_id": document_id,
                                "full_text": data.get('full_text', ''),
                                "extracted_data": data.get('extracted_data', {}),
                                "processing_time": data.get('processing_time', '')
                            }
                except Exception as e:
                    continue
        
        raise HTTPException(status_code=404, detail="Document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document content: {str(e)}")

@router.delete("/{document_id}")
async def delete_processed_document(document_id: str):
    """Delete a processed document by ID"""
    try:
        processor = PDFProcessor()
        processed_dir = processor.processed_dir
        
        # Look for JSON file with this document ID
        for filename in os.listdir(processed_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(processed_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('document_id') == document_id:
                            # Delete the JSON file
                            os.remove(file_path)
                            return {"message": "Document deleted successfully", "document_id": document_id}
                except Exception as e:
                    continue
        
        raise HTTPException(status_code=404, detail="Document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
