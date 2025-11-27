from sqlalchemy.orm import Session
from app.models import Exception
from app.schemas import ExceptionCreate, ExceptionUpdate
from typing import List, Optional
import uuid

class ExceptionService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_exception(self, exception: ExceptionCreate) -> Exception:
        db_exception = Exception(
            id=str(uuid.uuid4()),
            **exception.dict()
        )
        self.db.add(db_exception)
        self.db.commit()
        self.db.refresh(db_exception)
        return db_exception
    
    def get_exception(self, exception_id: str) -> Optional[Exception]:
        return self.db.query(Exception).filter(Exception.id == exception_id).first()
    
    def get_exceptions(self, skip: int = 0, limit: int = 100) -> List[Exception]:
        return self.db.query(Exception).offset(skip).limit(limit).all()
    
    def get_exceptions_by_document(self, document_id: str) -> List[Exception]:
        return self.db.query(Exception).filter(Exception.document_id == document_id).all()
    
    def update_exception(self, exception_id: str, exception: ExceptionUpdate) -> Optional[Exception]:
        db_exception = self.get_exception(exception_id)
        if not db_exception:
            return None
        
        update_data = exception.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_exception, field, value)
        
        self.db.commit()
        self.db.refresh(db_exception)
        return db_exception
    
    def delete_exception(self, exception_id: str) -> bool:
        db_exception = self.get_exception(exception_id)
        if not db_exception:
            return False
        
        self.db.delete(db_exception)
        self.db.commit()
        return True
