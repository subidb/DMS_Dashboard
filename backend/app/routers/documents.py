from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.document_service import DocumentService
from app.services.exception_service import ExceptionService
from app.services.alert_service import AlertService
from app.schemas import Document, DocumentCreate, DocumentUpdate, DocumentDetailResponse
from typing import Dict, Any

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("/", response_model=Dict[str, List[Document]])
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get list of documents with pagination"""
    try:
        document_service = DocumentService(db)
        documents = document_service.get_documents(skip=skip, limit=limit)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document_detail(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Get document details with related exceptions and alerts"""
    try:
        document_service = DocumentService(db)
        exception_service = ExceptionService(db)
        alert_service = AlertService(db)
        
        document = document_service.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        related_exceptions = exception_service.get_exceptions_by_document(document_id)
        related_alerts = alert_service.get_alerts_by_document(document_id)
        
        return DocumentDetailResponse(
            document=document,
            related_exceptions=related_exceptions,
            related_alerts=related_alerts
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch document details: {str(e)}")

@router.post("/", response_model=Document)
async def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db)
):
    """Create a new document"""
    try:
        document_service = DocumentService(db)
        return document_service.create_document(document)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update a document"""
    try:
        document_service = DocumentService(db)
        updated_document = document_service.update_document(document_id, document)
        if not updated_document:
            raise HTTPException(status_code=404, detail="Document not found")
        return updated_document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Delete a document"""
    try:
        document_service = DocumentService(db)
        success = document_service.delete_document(document_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
