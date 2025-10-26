import os
import re
import uuid
import io
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np

class PDFProcessor:
    def __init__(self):
        self.upload_dir = "./uploads"
        self.processed_dir = "./processed"
        self.categories = [
            "Client PO", "Vendor PO", "Client Invoice", 
            "Vendor Invoice", "Service Agreement"
        ]
        
        # Create directories if they don't exist
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        
        # Initialize ML model for document classification
        self.classifier = None
        self.vectorizer = None
        self._train_classifier()
    
    def _train_classifier(self):
        """Train a simple document classifier based on keywords"""
        # Sample training data (in production, use real training data)
        training_data = [
            ("purchase order client", "Client PO"),
            ("purchase order vendor", "Vendor PO"),
            ("invoice client", "Client Invoice"),
            ("invoice vendor", "Vendor Invoice"),
            ("service agreement contract", "Service Agreement"),
            ("agreement terms", "Service Agreement"),
        ]
        
        texts = [data[0] for data in training_data]
        labels = [data[1] for data in training_data]
        
        self.vectorizer = TfidfVectorizer()
        X = self.vectorizer.fit_transform(texts)
        self.classifier = MultinomialNB()
        self.classifier.fit(X, labels)
    
    async def process_pdf(self, file_path: str) -> Dict:
        """Process a PDF file and extract structured data"""
        try:
            # Extract text and images from PDF
            text_content = self._extract_text_from_pdf(file_path)
            images = self._extract_images_from_pdf(file_path)
            
            # Perform OCR on images if needed
            ocr_text = ""
            if images:
                ocr_text = self._perform_ocr_on_images(images)
            
            # Combine all text
            full_text = f"{text_content} {ocr_text}".strip()
            
            # Classify document type
            document_type = self._classify_document(full_text)
            
            # Extract structured data
            extracted_data = self._extract_structured_data(full_text, document_type)
            
            # Calculate confidence score
            confidence = self._calculate_confidence(full_text, document_type)
            
            # Generate document ID
            document_id = self._generate_document_id(document_type)
            
            return {
                "success": True,
                "document_id": document_id,
                "document_type": document_type,
                "confidence": confidence,
                "extracted_data": extracted_data,
                "full_text": full_text,
                "processing_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": datetime.now().isoformat()
            }
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF with enhanced OCR"""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page_num in range(doc.page_count):
                page = doc[page_num]
                
                # First try direct text extraction
                page_text = page.get_text()
                
                # If no text found, try OCR on the page
                if not page_text.strip():
                    try:
                        # Convert page to image for OCR
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
                        img_data = pix.tobytes("png")
                        img = Image.open(io.BytesIO(img_data))
                        
                        # Perform OCR
                        ocr_text = pytesseract.image_to_string(img, config='--psm 6')
                        page_text = ocr_text
                    except Exception as ocr_error:
                        print(f"OCR failed for page {page_num}: {ocr_error}")
                        page_text = f"[OCR failed for page {page_num + 1}]"
                
                text += f"--- Page {page_num + 1} ---\n{page_text}\n\n"
            
            doc.close()
        except Exception as e:
            print(f"Error extracting text: {e}")
        return text
    
    def _extract_images_from_pdf(self, file_path: str) -> List[Image.Image]:
        """Extract images from PDF for OCR processing"""
        images = []
        try:
            doc = fitz.open(file_path)
            for page_num in range(doc.page_count):
                page = doc[page_num]
                # Convert page to image
                mat = fitz.Matrix(2, 2)  # 2x zoom for better OCR
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                images.append(img)
            doc.close()
        except Exception as e:
            print(f"Error extracting images: {e}")
        return images
    
    def _perform_ocr_on_images(self, images: List[Image.Image]) -> str:
        """Perform OCR on extracted images"""
        ocr_text = ""
        try:
            for img in images:
                # Convert to grayscale for better OCR
                if img.mode != 'L':
                    img = img.convert('L')
                
                # Perform OCR
                text = pytesseract.image_to_string(img)
                ocr_text += text + " "
        except Exception as e:
            print(f"OCR error: {e}")
        return ocr_text
    
    def _classify_document(self, text: str) -> str:
        """Classify document type using ML"""
        try:
            if not self.classifier or not self.vectorizer:
                return "Unknown"
            
            # Vectorize the text
            X = self.vectorizer.transform([text.lower()])
            prediction = self.classifier.predict(X)[0]
            return prediction
        except Exception as e:
            print(f"Classification error: {e}")
            return "Unknown"
    
    def _extract_structured_data(self, text: str, document_type: str) -> Dict:
        """Extract structured data based on document type"""
        extracted = {
            "title": self._extract_title(text),
            "client": self._extract_client(text),
            "vendor": self._extract_vendor(text),
            "amount": self._extract_amount(text),
            "currency": self._extract_currency(text),
            "date": self._extract_date(text),
            "due_date": self._extract_due_date(text),
            "po_number": self._extract_po_number(text),
            "invoice_number": self._extract_invoice_number(text),
            "vendor_address": self._extract_vendor_address(text),
            "client_address": self._extract_client_address(text),
            "summary": self._extract_summary(text),
            "key_terms": self._extract_key_terms(text),
            "contact_info": self._extract_contact_info(text)
        }
        
        return extracted
    
    def _extract_title(self, text: str) -> str:
        """Extract document title"""
        # Clean up the text first
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Look for common title patterns
        patterns = [
            r"Title:\s*(.+?)(?:\n|$)",
            r"Subject:\s*(.+?)(?:\n|$)",
            r"Document:\s*(.+?)(?:\n|$)",
            r"INVOICE\s+(.+?)(?:\n|$)",
            r"PURCHASE ORDER\s+(.+?)(?:\n|$)",
            r"AGREEMENT\s+(.+?)(?:\n|$)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                title = match.group(1).strip()
                if len(title) > 5 and len(title) < 100:
                    return title
        
        # Look for company names or document headers
        company_patterns = [
            r"^([A-Z][A-Z\s&]+(?:LTD|LLC|INC|CORP|COMPANY))",
            r"^([A-Z][A-Z\s&]+(?:TECHNOLOGY|SERVICES|SOLUTIONS))",
            r"^([A-Z][A-Z\s&]+(?:DIGITAL|INFORMATION))"
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, clean_text, re.MULTILINE)
            if match:
                title = match.group(1).strip()
                if len(title) > 5 and len(title) < 80:
                    return title
        
        # Fallback: use first meaningful line
        lines = clean_text.split('\n')
        for line in lines[:10]:
            line = line.strip()
            if len(line) > 10 and len(line) < 100 and not line.startswith('Company Registration'):
                return line
        
        return "Document"
    
    def _extract_client(self, text: str) -> str:
        """Extract client name with improved patterns"""
        # Clean text for better matching
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced patterns for client extraction
        patterns = [
            r"Client:\s*(.+?)(?:\n|$)",
            r"Customer:\s*(.+?)(?:\n|$)",
            r"Bill To:\s*(.+?)(?:\n|$)",
            r"Bill\s+To[:\s]*(.+?)(?:\n|$)",
            r"Billed\s+To[:\s]*(.+?)(?:\n|$)",
            r"To:\s*(.+?)(?:\n|$)",
            r"Company:\s*(.+?)(?:\n|$)",
            r"Organization:\s*(.+?)(?:\n|$)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE | re.MULTILINE)
            if match:
                client = match.group(1).strip()
                # Clean up the client name
                client = re.sub(r'\s+', ' ', client)  # Remove extra spaces
                if len(client) > 3 and len(client) < 100:
                    return client
        
        # Look for company names in document headers
        company_patterns = [
            r"^([A-Z][A-Z\s&]+(?:LTD|LLC|INC|CORP|COMPANY|LLP))",
            r"^([A-Z][A-Z\s&]+(?:TECHNOLOGY|SERVICES|SOLUTIONS|SYSTEMS))",
            r"^([A-Z][A-Z\s&]+(?:DIGITAL|INFORMATION|CONSULTING))"
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, clean_text, re.MULTILINE)
            if match:
                company = match.group(1).strip()
                if len(company) > 5 and len(company) < 80:
                    return company
        
        return "Unknown Client"
    
    def _extract_vendor(self, text: str) -> str:
        """Extract vendor name with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced patterns for vendor extraction
        patterns = [
            r"Vendor:\s*(.+?)(?:\n|$)",
            r"Supplier:\s*(.+?)(?:\n|$)",
            r"From:\s*(.+?)(?:\n|$)",
            r"Vendor\s+Name[:\s]*(.+?)(?:\n|$)",
            r"Supplier\s+Name[:\s]*(.+?)(?:\n|$)",
            r"Company\s+Name[:\s]*(.+?)(?:\n|$)",
            r"Business\s+Name[:\s]*(.+?)(?:\n|$)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE | re.MULTILINE)
            if match:
                vendor = match.group(1).strip()
                vendor = re.sub(r'\s+', ' ', vendor)  # Remove extra spaces
                if len(vendor) > 3 and len(vendor) < 100:
                    return vendor
        
        # Look for company names in document headers (for vendor invoices)
        company_patterns = [
            r"^([A-Z][A-Z\s&]+(?:LTD|LLC|INC|CORP|COMPANY|LLP))",
            r"^([A-Z][A-Z\s&]+(?:TECHNOLOGY|SERVICES|SOLUTIONS|SYSTEMS))",
            r"^([A-Z][A-Z\s&]+(?:DIGITAL|INFORMATION|CONSULTING))"
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, clean_text, re.MULTILINE)
            if match:
                company = match.group(1).strip()
                if len(company) > 5 and len(company) < 80:
                    return company
        
        return None
    
    def _extract_amount(self, text: str) -> float:
        """Extract monetary amount with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced patterns for amount extraction
        patterns = [
            r"Amount[:\s]*\$?([\d,]+\.?\d*)",
            r"Total[:\s]*\$?([\d,]+\.?\d*)",
            r"Price[:\s]*\$?([\d,]+\.?\d*)",
            r"Due[:\s]*\$?([\d,]+\.?\d*)",
            r"Balance[:\s]*\$?([\d,]+\.?\d*)",
            r"Subtotal[:\s]*\$?([\d,]+\.?\d*)",
            r"Grand\s+Total[:\s]*\$?([\d,]+\.?\d*)",
            r"Net\s+Amount[:\s]*\$?([\d,]+\.?\d*)",
            r"Final\s+Amount[:\s]*\$?([\d,]+\.?\d*)",
            r"Amount\s+Due[:\s]*\$?([\d,]+\.?\d*)",
            r"Total\s+Amount[:\s]*\$?([\d,]+\.?\d*)",
            r"Invoice\s+Total[:\s]*\$?([\d,]+\.?\d*)",
            r"PO\s+Amount[:\s]*\$?([\d,]+\.?\d*)",
            r"Contract\s+Value[:\s]*\$?([\d,]+\.?\d*)",
            r"Service\s+Fee[:\s]*\$?([\d,]+\.?\d*)",
            r"\$([\d,]+\.?\d*)"
        ]
        
        amounts = []
        for pattern in patterns:
            matches = re.findall(pattern, clean_text, re.IGNORECASE)
            for match in matches:
                try:
                    amount_str = match.replace(',', '')
                    amount = float(amount_str)
                    if amount > 0:
                        amounts.append(amount)
                except ValueError:
                    continue
        
        # Return the highest amount found (likely the total)
        if amounts:
            return max(amounts)
        
        return 0.0
    
    def _extract_currency(self, text: str) -> str:
        """Extract currency with improved detection"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Currency symbol patterns
        currency_patterns = [
            (r'\$', 'USD'),
            (r'€', 'EUR'),
            (r'£', 'GBP'),
            (r'¥', 'JPY'),
            (r'₹', 'INR'),
            (r'₽', 'RUB'),
            (r'₩', 'KRW'),
            (r'₪', 'ILS'),
            (r'₦', 'NGN'),
            (r'₨', 'PKR')
        ]
        
        for pattern, currency in currency_patterns:
            if re.search(pattern, clean_text):
                return currency
        
        # Currency code patterns
        currency_codes = [
            r'\bUSD\b', r'\bEUR\b', r'\bGBP\b', r'\bJPY\b', r'\bINR\b',
            r'\bRUB\b', r'\bKRW\b', r'\bILS\b', r'\bNGN\b', r'\bPKR\b',
            r'\bCAD\b', r'\bAUD\b', r'\bCHF\b', r'\bCNY\b', r'\bSEK\b',
            r'\bNOK\b', r'\bDKK\b', r'\bPLN\b', r'\bCZK\b', r'\bHUF\b'
        ]
        
        for code in currency_codes:
            if re.search(code, clean_text, re.IGNORECASE):
                return code.replace('\\b', '').replace('\\b', '')
        
        # Default to USD if no currency found
        return 'USD'
    
    def _extract_date(self, text: str) -> str:
        """Extract document date with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced date patterns
        patterns = [
            r"Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Issue\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Created[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Invoice\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"PO\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Order\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Contract\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Agreement\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Effective\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Start\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Document\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Generated[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Printed[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                # Try to normalize the date format
                try:
                    # Handle different date formats
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            if len(parts[2]) == 2:  # YY format
                                parts[2] = '20' + parts[2]
                            return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                    elif '-' in date_str:
                        return date_str
                except:
                    continue
        
        return datetime.now().strftime("%Y-%m-%d")
    
    def _extract_due_date(self, text: str) -> Optional[str]:
        """Extract due date with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced due date patterns
        patterns = [
            r"Due\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Payment\s+Due[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Expires[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Expiry\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"End\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Termination\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Contract\s+End[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Agreement\s+End[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Valid\s+Until[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Deadline[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Payment\s+Deadline[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"Final\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                # Try to normalize the date format
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            if len(parts[2]) == 2:  # YY format
                                parts[2] = '20' + parts[2]
                            return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                    elif '-' in date_str:
                        return date_str
                except:
                    continue
        
        return None
    
    def _extract_po_number(self, text: str) -> Optional[str]:
        """Extract PO number with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced PO number patterns
        patterns = [
            r"PO\s*#?\s*([A-Z0-9-]+)",
            r"Purchase\s+Order\s*#?\s*([A-Z0-9-]+)",
            r"P\.O\.\s*#?\s*([A-Z0-9-]+)",
            r"PO\s+Number[:\s]*([A-Z0-9-]+)",
            r"Purchase\s+Order\s+Number[:\s]*([A-Z0-9-]+)",
            r"Order\s+Number[:\s]*([A-Z0-9-]+)",
            r"Order\s+ID[:\s]*([A-Z0-9-]+)",
            r"Reference[:\s]*([A-Z0-9-]+)",
            r"Ref[:\s]*([A-Z0-9-]+)",
            r"Order\s+Ref[:\s]*([A-Z0-9-]+)",
            r"PO\s+Ref[:\s]*([A-Z0-9-]+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                po_number = match.group(1).strip()
                if len(po_number) > 2:  # Ensure it's a meaningful PO number
                    return po_number
        
        return None
    
    def _extract_invoice_number(self, text: str) -> Optional[str]:
        """Extract invoice number with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        
        # Enhanced invoice number patterns
        patterns = [
            r"Invoice\s*#?\s*([A-Z0-9-]+)",
            r"Inv\s*#?\s*([A-Z0-9-]+)",
            r"Bill\s*#?\s*([A-Z0-9-]+)",
            r"Invoice\s+Number[:\s]*([A-Z0-9-]+)",
            r"Bill\s+Number[:\s]*([A-Z0-9-]+)",
            r"Statement\s+Number[:\s]*([A-Z0-9-]+)",
            r"Receipt\s+Number[:\s]*([A-Z0-9-]+)",
            r"Transaction\s+ID[:\s]*([A-Z0-9-]+)",
            r"Transaction\s+Number[:\s]*([A-Z0-9-]+)",
            r"Document\s+Number[:\s]*([A-Z0-9-]+)",
            r"Doc\s+Number[:\s]*([A-Z0-9-]+)",
            r"Reference\s+Number[:\s]*([A-Z0-9-]+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                invoice_number = match.group(1).strip()
                if len(invoice_number) > 2:  # Ensure it's a meaningful invoice number
                    return invoice_number
        
        return None
    
    def _extract_vendor_address(self, text: str) -> Optional[str]:
        """Extract vendor address with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        lines = clean_text.split('\n')
        
        # Enhanced vendor address patterns
        vendor_keywords = ['vendor', 'supplier', 'from', 'company address', 'business address', 'headquarters']
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in vendor_keywords):
                # Look for address in next few lines
                address_lines = []
                for j in range(i+1, min(i+6, len(lines))):
                    current_line = lines[j].strip()
                    if current_line and len(current_line) > 5:
                        # Check if line looks like an address
                        if (re.search(r'\d+', current_line) or  # Contains numbers
                            re.search(r'(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)', current_line, re.IGNORECASE) or
                            re.search(r'(city|state|zip|postal|postal code)', current_line, re.IGNORECASE)):
                            address_lines.append(current_line)
                        elif len(address_lines) > 0:  # Stop if we've started collecting but hit non-address line
                            break
                
                if address_lines:
                    return ' '.join(address_lines)
        
        return None
    
    def _extract_client_address(self, text: str) -> Optional[str]:
        """Extract client address with improved patterns"""
        clean_text = text.replace('--- Page 1 ---', '').strip()
        lines = clean_text.split('\n')
        
        # Enhanced client address patterns
        client_keywords = ['client', 'customer', 'bill to', 'billed to', 'ship to', 'shipping address', 'billing address']
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in client_keywords):
                # Look for address in next few lines
                address_lines = []
                for j in range(i+1, min(i+6, len(lines))):
                    current_line = lines[j].strip()
                    if current_line and len(current_line) > 5:
                        # Check if line looks like an address
                        if (re.search(r'\d+', current_line) or  # Contains numbers
                            re.search(r'(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)', current_line, re.IGNORECASE) or
                            re.search(r'(city|state|zip|postal|postal code)', current_line, re.IGNORECASE)):
                            address_lines.append(current_line)
                        elif len(address_lines) > 0:  # Stop if we've started collecting but hit non-address line
                            break
                
                if address_lines:
                    return ' '.join(address_lines)
        
        return None
    
    def _calculate_confidence(self, text: str, document_type: str) -> float:
        """Calculate confidence score for the extraction with improved logic"""
        confidence = 0.3  # Base confidence
        
        # Increase confidence based on text length and quality
        text_length = len(text)
        if text_length > 100:
            confidence += 0.1
        if text_length > 500:
            confidence += 0.1
        if text_length > 1000:
            confidence += 0.1
        
        # Increase confidence based on document structure indicators
        structure_indicators = [
            r'\$[\d,]+\.?\d*',  # Currency amounts
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # Dates
            r'[A-Z]{2,}\s*#?\s*[A-Z0-9-]+',  # Document numbers
            r'[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2,3}',  # Addresses
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email addresses
        ]
        
        structure_matches = 0
        for pattern in structure_indicators:
            if re.search(pattern, text):
                structure_matches += 1
        
        confidence += (structure_matches / len(structure_indicators)) * 0.2
        
        # Increase confidence based on document type keywords
        type_keywords = {
            "Client PO": ["purchase order", "client", "po", "order", "requisition"],
            "Vendor PO": ["purchase order", "vendor", "supplier", "order", "requisition"],
            "Client Invoice": ["invoice", "client", "bill", "statement", "receipt"],
            "Vendor Invoice": ["invoice", "vendor", "supplier", "bill", "statement"],
            "Service Agreement": ["agreement", "contract", "service", "terms", "conditions"]
        }
        
        if document_type in type_keywords:
            keywords = type_keywords[document_type]
            matches = sum(1 for keyword in keywords if keyword.lower() in text.lower())
            confidence += (matches / len(keywords)) * 0.2
        
        # Increase confidence based on extracted data quality
        extracted_data_quality = 0
        if re.search(r'\$[\d,]+\.?\d*', text):  # Has monetary amounts
            extracted_data_quality += 0.1
        if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text):  # Has dates
            extracted_data_quality += 0.1
        if re.search(r'[A-Z]{2,}\s*#?\s*[A-Z0-9-]+', text):  # Has document numbers
            extracted_data_quality += 0.1
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):  # Has email
            extracted_data_quality += 0.1
        
        confidence += extracted_data_quality
        
        return min(confidence, 0.95)  # Cap at 95% to leave room for uncertainty
    
    def _generate_document_id(self, document_type: str) -> str:
        """Generate a unique document ID"""
        prefix_map = {
            "Client PO": "PO-CLIENT",
            "Vendor PO": "PO-VENDOR", 
            "Client Invoice": "INV-CLIENT",
            "Vendor Invoice": "INV-VENDOR",
            "Service Agreement": "AGR"
        }
        
        prefix = prefix_map.get(document_type, "DOC")
        timestamp = datetime.now().strftime("%Y%m%d")
        unique_id = str(uuid.uuid4())[:8].upper()
        
        return f"{prefix}-{timestamp}-{unique_id}"
    
    def _extract_summary(self, text: str) -> str:
        """Extract a summary of the document"""
        # Get first few sentences as summary
        sentences = text.split('.')[:3]
        summary = '. '.join(sentences).strip()
        if len(summary) > 200:
            summary = summary[:200] + "..."
        return summary
    
    def _extract_key_terms(self, text: str) -> List[str]:
        """Extract key terms and phrases from the document"""
        # Look for important terms
        key_terms = []
        
        # Financial terms
        financial_patterns = [
            r"Total[:\s]*([A-Z]{3}\s*[\d,]+\.?\d*)",
            r"Amount[:\s]*([A-Z]{3}\s*[\d,]+\.?\d*)",
            r"Due[:\s]*([A-Z]{3}\s*[\d,]+\.?\d*)",
            r"Payment[:\s]*([A-Z]{3}\s*[\d,]+\.?\d*)"
        ]
        
        for pattern in financial_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            key_terms.extend(matches)
        
        # Document numbers
        doc_patterns = [
            r"PO[:\s]*([A-Z0-9-]+)",
            r"Invoice[:\s]*([A-Z0-9-]+)",
            r"Reference[:\s]*([A-Z0-9-]+)"
        ]
        
        for pattern in doc_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            key_terms.extend(matches)
        
        return list(set(key_terms))[:10]  # Return unique terms, max 10
    
    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information"""
        contact_info = {}
        
        # Email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info['emails'] = emails[:3]  # Max 3 emails
        
        # Phone numbers
        phone_pattern = r'(\+?[\d\s\-\(\)]{10,})'
        phones = re.findall(phone_pattern, text)
        if phones:
            contact_info['phones'] = phones[:3]  # Max 3 phones
        
        # Addresses (simple pattern)
        address_pattern = r'([A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2,3})'
        addresses = re.findall(address_pattern, text)
        if addresses:
            contact_info['addresses'] = addresses[:2]  # Max 2 addresses
        
        return contact_info
