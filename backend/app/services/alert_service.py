from sqlalchemy.orm import Session
from app.models import Alert
from app.schemas import AlertCreate, AlertUpdate
from typing import List, Optional
import uuid

class AlertService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_alert(self, alert: AlertCreate) -> Alert:
        db_alert = Alert(
            id=str(uuid.uuid4()),
            **alert.dict()
        )
        self.db.add(db_alert)
        self.db.commit()
        self.db.refresh(db_alert)
        return db_alert
    
    def get_alert(self, alert_id: str) -> Optional[Alert]:
        return self.db.query(Alert).filter(Alert.id == alert_id).first()
    
    def get_alerts(self, skip: int = 0, limit: int = 100) -> List[Alert]:
        return self.db.query(Alert).offset(skip).limit(limit).all()
    
    def get_alerts_by_document(self, document_id: str) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.document_id == document_id).all()
    
    def update_alert(self, alert_id: str, alert: AlertUpdate) -> Optional[Alert]:
        db_alert = self.get_alert(alert_id)
        if not db_alert:
            return None
        
        update_data = alert.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_alert, field, value)
        
        self.db.commit()
        self.db.refresh(db_alert)
        return db_alert
    
    def delete_alert(self, alert_id: str) -> bool:
        db_alert = self.get_alert(alert_id)
        if not db_alert:
            return False
        
        self.db.delete(db_alert)
        self.db.commit()
        return True
