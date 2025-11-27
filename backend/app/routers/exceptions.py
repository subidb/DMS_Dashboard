from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.exception_service import ExceptionService
from app.schemas import Exception as ExceptionSchema, ExceptionCreate, ExceptionUpdate
from typing import Dict, List

router = APIRouter(prefix="/api/exceptions", tags=["exceptions"])

@router.get("/", response_model=Dict[str, List[ExceptionSchema]])
async def get_exceptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get list of exceptions with pagination"""
    try:
        exception_service = ExceptionService(db)
        exceptions = exception_service.get_exceptions(skip=skip, limit=limit)
        return {"exceptions": exceptions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exceptions: {str(e)}")

@router.get("/{exception_id}", response_model=ExceptionSchema)
async def get_exception(
    exception_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific exception by ID"""
    try:
        exception_service = ExceptionService(db)
        exception = exception_service.get_exception(exception_id)
        if not exception:
            raise HTTPException(status_code=404, detail="Exception not found")
        return exception
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exception: {str(e)}")

@router.post("/", response_model=ExceptionSchema)
async def create_exception(
    exception: ExceptionCreate,
    db: Session = Depends(get_db)
):
    """Create a new exception"""
    try:
        exception_service = ExceptionService(db)
        return exception_service.create_exception(exception)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create exception: {str(e)}")

@router.put("/{exception_id}", response_model=ExceptionSchema)
async def update_exception(
    exception_id: str,
    exception: ExceptionUpdate,
    db: Session = Depends(get_db)
):
    """Update an exception"""
    try:
        exception_service = ExceptionService(db)
        updated_exception = exception_service.update_exception(exception_id, exception)
        if not updated_exception:
            raise HTTPException(status_code=404, detail="Exception not found")
        return updated_exception
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update exception: {str(e)}")

@router.delete("/{exception_id}")
async def delete_exception(
    exception_id: str,
    db: Session = Depends(get_db)
):
    """Delete an exception"""
    try:
        exception_service = ExceptionService(db)
        success = exception_service.delete_exception(exception_id)
        if not success:
            raise HTTPException(status_code=404, detail="Exception not found")
        return {"message": "Exception deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete exception: {str(e)}")
