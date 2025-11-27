from sqlalchemy.orm import Session
from app.models import Alert
from app.schemas import AlertCreate, AlertUpdate
from typing import List, Optional
import uuid
from sqlalchemy import case

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
    
    def get_alerts(self, skip: int = 0, limit: int = 100, acknowledged: Optional[bool] = None) -> List[Alert]:
        query = self.db.query(Alert)
        if acknowledged is not None:
            query = query.filter(Alert.acknowledged == acknowledged)
        # Order by: critical first, then warning, then info; unacknowledged first; newest first
        level_order = case(
            (Alert.level == "critical", 1),
            (Alert.level == "warning", 2),
            (Alert.level == "info", 3),
            else_=4
        )
        return query.order_by(
            Alert.acknowledged.asc(),  # Unacknowledged first
            level_order.asc(),  # Critical first
            Alert.timestamp.desc()  # Newest first
        ).offset(skip).limit(limit).all()
    
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
