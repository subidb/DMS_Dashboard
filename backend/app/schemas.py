from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Document schemas
class DocumentBase(BaseModel):
    title: str
    category: str
    client: str
    vendor: Optional[str] = None
    amount: float
    currency: str = "USD"
    status: str = "Draft"
    due_date: Optional[datetime] = None
    confidence: float = 0.0
    linked_to: Optional[str] = None
    pdf_url: Optional[str] = None
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    client: Optional[str] = None
    vendor: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    confidence: Optional[float] = None
    linked_to: Optional[str] = None
    pdf_url: Optional[str] = None
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None

class Document(DocumentBase):
    id: str
    created_at: datetime
    file_path: Optional[str] = None
    processed: bool = False
    
    class Config:
        from_attributes = True

# Exception schemas
class ExceptionBase(BaseModel):
    document_id: str
    issue: str
    severity: str
    owner: str

class ExceptionCreate(ExceptionBase):
    pass

class ExceptionUpdate(BaseModel):
    issue: Optional[str] = None
    severity: Optional[str] = None
    owner: Optional[str] = None
    resolved: Optional[bool] = None

class Exception(ExceptionBase):
    id: str
    raised_at: datetime
    resolved: bool = False
    
    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    title: str
    description: str
    level: str
    document_id: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    acknowledged: Optional[bool] = None

class Alert(AlertBase):
    id: str
    timestamp: datetime
    acknowledged: bool = False
    
    class Config:
        from_attributes = True

# Dashboard schemas
class KPIMetric(BaseModel):
    label: str
    value: str
    delta: str
    helper: str

class UtilizationTrend(BaseModel):
    month: str
    client: int
    vendor: int

class CategorySplit(BaseModel):
    name: str
    value: int
    fill: str

class DashboardInsights(BaseModel):
    kpis: List[KPIMetric]
    utilizationTrend: List[UtilizationTrend]
    categorySplit: List[CategorySplit]
    alerts: List[Alert]
    exceptions: List[Exception]

# Chat schemas
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    reply: str

# Upload schemas
class UploadedFile(BaseModel):
    name: str
    size: int
    type: str
    status: str
    location: str

class UploadResponse(BaseModel):
    uploads: List[UploadedFile]

# Document detail response
class DocumentDetailResponse(BaseModel):
    document: Document
    related_exceptions: List[Exception]
    related_alerts: List[Alert]
