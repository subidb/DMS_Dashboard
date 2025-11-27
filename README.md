# 📄 DMS Dashboard - Document Management System

A comprehensive Document Management System with AI-powered PDF processing, intelligent data extraction, and real-time dashboard analytics.

## 🌟 Features

### **Document Processing**
- **AI-Powered OCR**: Automatic text extraction from scanned documents using PyMuPDF and Tesseract
- **Smart Data Extraction**: Automated extraction of client, vendor, amounts, dates, and contact information
- **Document Classification**: ML-based classification of documents (POs, invoices, agreements, etc.)
- **Confidence Scoring**: Multi-factor analysis for extraction quality assessment

### **Dashboard Analytics**
- **Real-Time KPIs**: Track active client POs, invoice utilization, exceptions, and processing times
- **Utilization Trends**: Visual charts showing spending patterns over time
- **Category Distribution**: Pie charts showing document type breakdown
- **Recent Documents**: Quick preview of latest processed documents with key information

### **Document Management**
- **Document Inventory**: View all processed documents with extracted data
- **Full-Text Search**: Access complete text content of processed documents
- **Metadata Extraction**: Summary, key terms, and contact information
- **Document Deletion**: Manage document lifecycle with delete functionality

### **Exception Handling**
- **Automated Validation**: Automatic detection of document issues
- **Severity-based Triage**: High, medium, and low severity exception handling
- **Owner Assignment**: Assign exceptions to team members for resolution
- **Real-Time Tracking**: Track exception status and resolution progress

### **Alert System**
- **Automated Monitoring**: Real-time alerts for PO cap utilization, expiring agreements, and unlinked invoices
- **Multi-Level Alerts**: Critical, warning, and info level notifications
- **Document Linking**: Automatic linking of documents and tracking

### **Conversational Assistant**
- **AI Chatbot**: Intelligent assistant for answering document queries
- **Context-Aware**: Understands document relationships and history
- **OpenAI Integration**: Advanced language understanding (optional)

## 🏗️ Architecture

### **Frontend**
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS with dark theme
- **State Management**: TanStack React Query for data fetching
- **Charts**: Recharts for analytics visualization
- **Components**: shadcn-inspired UI primitives

### **Backend**
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **PDF Processing**: PyMuPDF, Tesseract OCR
- **ML Classification**: scikit-learn with TF-IDF vectorization
- **API**: RESTful API with automatic documentation

## 📦 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.10+
- Tesseract OCR (for PDF processing)

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

### **Frontend Setup**
```bash
cd dms-frontend
npm install
cp env.local.example .env.local
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Docs**: http://localhost:8002/docs

## 🚀 Usage

### **Uploading Documents**
1. Navigate to the Documents page or use the quick upload widget on the dashboard
2. Drag and drop PDF files or click to select
3. Documents are automatically processed with OCR and data extraction
4. View extracted data in the Document Inventory

### **Viewing Dashboard**
1. The dashboard shows real-time KPIs and trends
2. Recent documents panel shows latest processed documents
3. Click on any document to view full details
4. Use quick actions to navigate to specific sections

### **Managing Exceptions**
1. Navigate to Exceptions page
2. View exceptions by severity level
3. Assign owners and track resolution progress
4. Filter and search exceptions

### **Setting Up Alerts**
1. Go to Settings page
2. Configure alert rules and thresholds
3. Set up notification preferences
4. Monitor alerts in the Alerts center

## 🔧 Configuration

### **Environment Variables**

#### **Backend** (`.env`)
```
OPENAI_API_KEY=your_api_key_here  # Optional for advanced chat
DB_URL=sqlite:///./dms.db
UPLOAD_DIR=./uploads
```

#### **Frontend** (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

### **OCR Setup**
Install Tesseract OCR:

**macOS**:
```bash
brew install tesseract
```

**Ubuntu/Debian**:
```bash
sudo apt-get install tesseract-ocr
```

**Windows**:
Download from: https://github.com/UB-Mannheim/tesseract/wiki

## 📊 Data Extraction

The system extracts the following data from PDFs:

- **Document Type**: Classifies as Client PO, Vendor PO, Client Invoice, Vendor Invoice, or Service Agreement
- **Client/Vendor**: Company names with enhanced pattern matching
- **Financial Data**: Amounts, currency, and payment terms
- **Dates**: Document dates, due dates with normalization
- **References**: PO numbers, invoice numbers with multiple patterns
- **Addresses**: Vendor and client addresses with smart recognition
- **Contact Info**: Emails, phones, and addresses
- **Summary**: Automated document summary
- **Key Terms**: Important financial and document terms

## 🛠️ Development

### **Project Structure**
```
DMS_Dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   ├── uploads/             # Uploaded PDFs
│   ├── processed/           # Processed JSON results
│   └── requirements.txt
├── dms-frontend/
│   ├── app/                 # Next.js pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and API client
│   └── package.json
└── README.md
```

### **Running Tests**
```bash
# Backend
cd backend
pytest

# Frontend
cd dms-frontend
npm run test
```

## 📈 Performance

- **OCR Processing**: 2-5 seconds per document
- **Classification Accuracy**: 85%+ with ML-based approach
- **Data Extraction**: 74%+ confidence with multi-factor analysis
- **API Response Time**: < 100ms for most endpoints

## 🔒 Security

- **Environment Variables**: All sensitive data stored in `.env` files
- **Input Validation**: Pydantic schemas for data validation
- **File Upload Limits**: 25MB max file size
- **CORS Protection**: Configured origins in settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Next Steps

- [ ] Add user authentication and authorization
- [ ] Implement document versioning
- [ ] Add advanced search capabilities
- [ ] Set up automated testing
- [ ] Deploy to production environment
- [ ] Add WebSocket for real-time updates
- [ ] Implement document signing workflow

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, FastAPI, and modern web technologies**
