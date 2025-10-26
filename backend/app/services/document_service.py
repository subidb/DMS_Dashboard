from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models import Document, Exception, Alert
from app.schemas import DocumentCreate, DocumentUpdate, DashboardInsights, KPIMetric, UtilizationTrend, CategorySplit
from typing import List, Optional
import uuid
from datetime import datetime, timedelta

class DocumentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_document(self, document: DocumentCreate) -> Document:
        db_document = Document(
            id=str(uuid.uuid4()),
            **document.dict()
        )
        self.db.add(db_document)
        self.db.commit()
        self.db.refresh(db_document)
        return db_document
    
    def get_document(self, document_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()
    
    def get_documents(self, skip: int = 0, limit: int = 100) -> List[Document]:
        return self.db.query(Document).offset(skip).limit(limit).all()
    
    def update_document(self, document_id: str, document: DocumentUpdate) -> Optional[Document]:
        db_document = self.get_document(document_id)
        if not db_document:
            return None
        
        update_data = document.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_document, field, value)
        
        self.db.commit()
        self.db.refresh(db_document)
        return db_document
    
    def delete_document(self, document_id: str) -> bool:
        db_document = self.get_document(document_id)
        if not db_document:
            return False
        
        self.db.delete(db_document)
        self.db.commit()
        return True
    
    def get_dashboard_insights(self) -> DashboardInsights:
        # Get KPIs
        total_documents = self.db.query(Document).count()
        approved_documents = self.db.query(Document).filter(Document.status == "Approved").count()
        pending_documents = self.db.query(Document).filter(Document.status == "Pending Review").count()
        flagged_documents = self.db.query(Document).filter(Document.status == "Flagged").count()
        
        # Calculate utilization (simplified)
        total_amount = self.db.query(func.sum(Document.amount)).scalar() or 0
        approved_amount = self.db.query(func.sum(Document.amount)).filter(Document.status == "Approved").scalar() or 0
        utilization = (approved_amount / total_amount * 100) if total_amount > 0 else 0
        
        # Get exceptions count
        exceptions_count = self.db.query(Exception).filter(Exception.resolved == False).count()
        
        kpis = [
            KPIMetric(label="Active Client POs", value=str(approved_documents), delta="+6.4%", helper="vs last 30 days"),
            KPIMetric(label="Invoice Utilization", value=f"{utilization:.0f}%", delta="+4.1%", helper="PO caps consumed"),
            KPIMetric(label="Exceptions", value=str(exceptions_count), delta="-3 cases", helper="open validation issues"),
            KPIMetric(label="Avg. Processing Time", value="12m", delta="-5m", helper="from ingest to validation")
        ]
        
        # Get utilization trend (simplified - using last 6 months)
        utilization_trend = []
        months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
        for i, month in enumerate(months):
            # Simulate data - in real app, you'd query actual data
            client_count = 42 + i * 5
            vendor_count = 35 + i * 4
            utilization_trend.append(UtilizationTrend(month=month, client=client_count, vendor=vendor_count))
        
        # Get category split
        category_counts = self.db.query(
            Document.category, 
            func.count(Document.id)
        ).group_by(Document.category).all()
        
        colors = ["#38bdf8", "#0ea5e9", "#6366f1", "#a855f7", "#f97316"]
        category_split = []
        for i, (category, count) in enumerate(category_counts):
            category_split.append(CategorySplit(
                name=category,
                value=count,
                fill=colors[i % len(colors)]
            ))
        
        # Get recent alerts and exceptions
        alerts = self.db.query(Alert).order_by(Alert.timestamp.desc()).limit(10).all()
        exceptions = self.db.query(Exception).order_by(Exception.raised_at.desc()).limit(10).all()
        
        return DashboardInsights(
            kpis=kpis,
            utilizationTrend=utilization_trend,
            categorySplit=category_split,
            alerts=alerts,
            exceptions=exceptions
        )
