import os
import uuid
from typing import List
from fastapi import UploadFile
from app.config import settings
from app.schemas import UploadedFile, UploadResponse
from app.services.pdf_processor import PDFProcessor

class UploadService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        self.max_file_size = settings.max_file_size
        self.pdf_processor = PDFProcessor()
    
    async def upload_files(self, files: List[UploadFile]) -> UploadResponse:
        uploads = []
        
        for file in files:
            if not file.filename:
                continue
            
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(self.upload_dir, unique_filename)
            
            try:
                # Check file size
                file_size = 0
                content = await file.read()
                file_size = len(content)
                
                if file_size > self.max_file_size:
                    uploads.append(UploadedFile(
                        name=file.filename,
                        size=file_size,
                        type=file.content_type or "application/octet-stream",
                        status="rejected",
                        location=""
                    ))
                    continue
                
                # Save file
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                uploads.append(UploadedFile(
                    name=file.filename,
                    size=file_size,
                    type=file.content_type or "application/octet-stream",
                    status="queued",
                    location=f"/uploads/{unique_filename}"
                ))
                
            except Exception as e:
                uploads.append(UploadedFile(
                    name=file.filename,
                    size=0,
                    type=file.content_type or "application/octet-stream",
                    status="error",
                    location=""
                ))
        
        return UploadResponse(uploads=uploads)
    
    async def process_uploaded_pdf(self, filename: str) -> dict:
        """Process an uploaded PDF file and extract data"""
        file_path = self.get_file_path(filename)
        
        if not os.path.exists(file_path):
            return {"success": False, "error": "File not found"}
        
        # Check if it's a PDF
        if not filename.lower().endswith('.pdf'):
            return {"success": False, "error": "File is not a PDF"}
        
        # Process the PDF
        result = await self.pdf_processor.process_pdf(file_path)
        
        # Save the processed document if successful
        if result.get("success", False):
            self.save_processed_document(result)
        
        return result
    
    def get_file_path(self, filename: str) -> str:
        return os.path.join(self.upload_dir, filename)
    
    def delete_file(self, filename: str) -> bool:
        try:
            file_path = self.get_file_path(filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    def save_processed_document(self, result: dict) -> bool:
        """Save processed document result to JSON file"""
        try:
            import json
            processed_dir = "./processed"
            os.makedirs(processed_dir, exist_ok=True)
            
            # Create filename from document ID
            document_id = result.get('document_id', 'unknown')
            filename = f"{document_id}.json"
            file_path = os.path.join(processed_dir, filename)
            
            # Save the result
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving processed document: {e}")
            return False
