#!/usr/bin/env python3
"""
Script to populate the database with sample data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Document, Exception, Alert
from datetime import datetime, timedelta
import uuid

def create_sample_data():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Alert).delete()
        db.query(Exception).delete()
        db.query(Document).delete()
        
        # Create sample documents
        documents = [
            Document(
                id="PO-2024-001",
                title="EMB Retail Supply PO",
                category="Client PO",
                client="EMB Retail",
                amount=150000,
                currency="USD",
                status="Approved",
                created_at=datetime(2024, 3, 2, 9, 30, 0),
                due_date=datetime(2024, 12, 31),
                confidence=0.98,
                linked_to="AGR-2024-002",
                pdf_url="/uploads/sample-po.pdf",
                processed=True
            ),
            Document(
                id="INV-2024-032",
                title="Supplier Invoice - Batch #32",
                category="Vendor Invoice",
                client="EMB Retail",
                vendor="Northwind Components",
                amount=28500,
                currency="USD",
                status="Pending Review",
                created_at=datetime(2024, 3, 11, 14, 47, 0),
                confidence=0.91,
                linked_to="PO-2024-001",
                pdf_url="/uploads/sample-invoice.pdf",
                processed=True
            ),
            Document(
                id="AGR-2024-002",
                title="Service Agreement - Field Support",
                category="Service Agreement",
                client="EMB Logistics",
                vendor="Helios Services",
                amount=56000,
                currency="USD",
                status="Approved",
                created_at=datetime(2024, 1, 17, 10, 15, 0),
                due_date=datetime(2025, 1, 17),
                confidence=0.95,
                pdf_url="/uploads/sample-agreement.pdf",
                processed=True
            ),
            Document(
                id="INV-2024-045",
                title="Client Invoice - Retail Expansion",
                category="Client Invoice",
                client="EMB Retail",
                amount=72000,
                currency="USD",
                status="Flagged",
                created_at=datetime(2024, 3, 15, 8, 12, 0),
                confidence=0.76,
                linked_to="PO-2023-014",
                pdf_url="/uploads/sample-invoice.pdf",
                processed=True
            ),
            Document(
                id="PO-2023-014",
                title="Vendor Supply PO",
                category="Vendor PO",
                client="EMB Retail",
                vendor="Helios Services",
                amount=90000,
                currency="USD",
                status="Approved",
                created_at=datetime(2023, 11, 21, 12, 0, 0),
                confidence=0.99,
                pdf_url="/uploads/sample-po.pdf",
                processed=True
            )
        ]
        
        for doc in documents:
            db.add(doc)
        
        # Create sample exceptions
        exceptions = [
            Exception(
                id="EX-220",
                document_id="INV-2024-045",
                issue="Invoice exceeds PO cap by 8%",
                severity="high",
                owner="Finance Ops",
                raised_at=datetime(2024, 3, 16, 9, 4, 0),
                resolved=False
            ),
            Exception(
                id="EX-221",
                document_id="INV-2024-032",
                issue="Missing tax registration ID",
                severity="medium",
                owner="Compliance",
                raised_at=datetime(2024, 3, 15, 15, 10, 0),
                resolved=False
            ),
            Exception(
                id="EX-224",
                document_id="PO-2024-001",
                issue="Vendor address mismatch against CRM record",
                severity="low",
                owner="Finance Ops",
                raised_at=datetime(2024, 3, 13, 11, 22, 0),
                resolved=False
            )
        ]
        
        for exc in exceptions:
            db.add(exc)
        
        # Create sample alerts
        alerts = [
            Alert(
                id="AL-400",
                title="PO Cap Utilization at 85%",
                description="Client PO PO-2024-001 is close to its spending limit. Review pending invoices.",
                level="warning",
                timestamp=datetime(2024, 3, 16, 11, 32, 0),
                acknowledged=False,
                document_id="PO-2024-001"
            ),
            Alert(
                id="AL-404",
                title="Service Agreement expiring in 30 days",
                description="Agreement AGR-2024-002 for Helios Services expires soon. Consider renewal.",
                level="info",
                timestamp=datetime(2024, 3, 15, 6, 18, 0),
                acknowledged=False,
                document_id="AGR-2024-002"
            ),
            Alert(
                id="AL-409",
                title="Unlinked Vendor Invoice",
                description="Vendor invoice INV-2024-051 could not be linked automatically.",
                level="critical",
                timestamp=datetime(2024, 3, 12, 20, 2, 0),
                acknowledged=False
            )
        ]
        
        for alert in alerts:
            db.add(alert)
        
        db.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
