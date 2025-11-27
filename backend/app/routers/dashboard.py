from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.document_service import DocumentService
from app.schemas import DashboardInsights

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/", response_model=DashboardInsights)
async def get_dashboard_insights(db: Session = Depends(get_db)):
    """Get dashboard insights including KPIs, trends, and recent alerts/exceptions"""
    try:
        document_service = DocumentService(db)
        insights = document_service.get_dashboard_insights()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard insights: {str(e)}")
