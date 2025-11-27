from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Client PO, Vendor PO, Client Invoice, Vendor Invoice, Service Agreement
    client = Column(String, nullable=False)
    vendor = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="Draft")  # Draft, Approved, Pending Review, Flagged
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
    confidence = Column(Float, default=0.0)
    linked_to = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    processed = Column(Boolean, default=False)
    po_number = Column(String, nullable=True, index=True)  # PO number for linking invoices to POs
    invoice_number = Column(String, nullable=True, index=True)  # Invoice number for reference

class Exception(Base):
    __tablename__ = "exceptions"
    
    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    issue = Column(Text, nullable=False)
    severity = Column(String, nullable=False)  # low, medium, high
    owner = Column(String, nullable=False)
    raised_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)
    
    # Relationship
    document = relationship("Document", back_populates="exceptions")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    level = Column(String, nullable=False)  # info, warning, critical
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged = Column(Boolean, default=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    
    # Relationship
    document = relationship("Document", back_populates="alerts")

# Add relationships to Document model
Document.exceptions = relationship("Exception", back_populates="document")
Document.alerts = relationship("Alert", back_populates="document")
