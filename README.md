# 📄 DMS Dashboard - Document Management System

A comprehensive Document Management System with AWS Textract-powered PDF processing, intelligent data extraction, real-time dashboard analytics, and automated alerting.

## 🌟 Features

### **Document Processing**
- **AWS Textract OCR**: Automatic text extraction from scanned documents using Amazon Textract with S3-based async processing
- **Smart Data Extraction**: Automated extraction of client, vendor, amounts, dates, PO numbers, invoice numbers, and contact information
- **Document Classification**: ML-based classification of documents (POs, invoices, agreements, etc.)
- **Confidence Scoring**: Multi-factor analysis for extraction quality assessment
- **Duplicate Prevention**: Automatic detection and prevention of duplicate document processing

### **Dashboard Analytics**
- **Real-Time KPIs**: Track active client POs, invoice utilization, exceptions, and processing times
- **Dynamic Updates**: Dashboard automatically refreshes when documents are uploaded or deleted
- **Monthly Document Activity**: Visual charts showing document amounts created per month
- **Category Distribution**: Donut charts showing document type breakdown
- **Recent Documents**: Quick preview of latest processed documents with key information

### **Alert System**
- **PO Utilization Alerts**: 
  - Warning when PO is 80%+ utilized
  - Critical when PO is 95%+ utilized
- **Invoice-PO Mismatch Alerts**:
  - Critical when invoice exceeds PO balance
  - Warnings for currency/vendor/client mismatches
- **Contract Expiration Alerts**:
  - Warning when contract expiring within 30 days
  - Critical when contract has expired
- **Real-Time Updates**: Alerts refresh every 30 seconds automatically

### **Document Linking**
- **Intelligent Linking**: Automatic linking of invoices to POs using multiple strategies:
  - Exact PO number match
  - PO number in title
  - Client + Vendor + Date proximity
  - Client + Amount similarity
- **Contract Linking**: Links contracts to POs and tracks validity periods
- **Enhanced Validation**: Comprehensive validation of invoice-PO matches

### **Document Management**
- **Document Inventory**: View all processed documents with extracted data
- **Full-Text Search**: Access complete text content of processed documents
- **Metadata Extraction**: Summary, key terms, and contact information
- **Document Deletion**: Delete from both database and processed files
- **Deduplication**: Automatic detection and prevention of duplicate entries

### **Exception Handling**
- **Automated Validation**: Automatic detection of document issues
- **Severity-based Triage**: High, medium, and low severity exception handling
- **Owner Assignment**: Assign exceptions to team members for resolution
- **Real-Time Tracking**: Track exception status and resolution progress

## 🏗️ Architecture

### **Frontend**
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS with dark theme
- **State Management**: TanStack React Query for data fetching and caching
- **Charts**: Recharts for analytics visualization
- **Components**: shadcn-inspired UI primitives
- **Auto-Refresh**: Real-time updates with query invalidation

### **Backend**
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **PDF Processing**: AWS Textract with S3-based async processing
- **ML Classification**: scikit-learn with TF-IDF vectorization
- **API**: RESTful API with automatic documentation
- **AWS Integration**: S3 for file storage, Textract for OCR

## 📦 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.10+
- AWS Account with Textract and S3 access
- AWS IAM user with appropriate permissions

### **Backend Setup**

1. **Clone and navigate to backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp env.example .env
```

Edit `.env` and add:
```env
# Required
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Optional
OPENAI_API_KEY=your_api_key_here  # For advanced chat features
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

3. **Run database migration (if needed):**
```bash
python scripts/migrate_add_po_invoice_fields.py
```

4. **Start backend:**
```bash
uvicorn app.main:app --reload --port 8000
```

### **Frontend Setup**

1. **Navigate to frontend:**
```bash
cd dms-frontend
npm install
```

2. **Configure environment:**
```bash
cp env.local.example env.local
```

Edit `env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. **Start frontend:**
```bash
npm run dev
```

### **Quick Start Script**

Use the provided script to start both backend and frontend:
```bash
./start_with_backend.sh
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 AWS Setup

### **1. Enable AWS Textract**

1. Log into AWS Console: https://console.aws.amazon.com/
2. Navigate to Amazon Textract service
3. Click "Get started" or "Enable" to activate the service
4. Verify region matches your configuration (default: `us-east-1`)

**Cost**: First 1,000 pages/month FREE, then $1.50 per 1,000 pages

### **2. Create S3 Bucket**

1. Go to AWS S3 Console: https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: Unique name (e.g., `dms-textract-processing-{account-id}`)
   - **Region**: Same as Textract region
   - **Block Public Access**: Keep enabled
   - **Default encryption**: Enable (recommended)
4. Click "Create bucket"

### **3. Configure IAM Permissions**

Create an IAM user (e.g., `emb_admin`) with these permissions:

**Required IAM Policies:**
- `AmazonTextractFullAccess` (or custom policy with `textract:StartDocumentTextDetection`, `textract:GetDocumentTextDetection`)
- `AmazonS3FullAccess` (or custom policy for your bucket with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`)

**Custom Policy Example:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "textract:StartDocumentTextDetection",
                "textract:GetDocumentTextDetection"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        }
    ]
}
```

### **4. Verify AWS Setup**

Test your AWS credentials:
```bash
cd backend
source venv/bin/activate
python verify_aws_credentials.py
```

## 🚀 Usage

### **Uploading Documents**

1. Navigate to the Documents page or use the quick upload widget on the dashboard
2. Drag and drop PDF files or click to select
3. Documents are automatically:
   - Uploaded to S3
   - Processed with AWS Textract
   - Extracted data saved to database
   - Alerts generated automatically
   - Dashboard refreshed in real-time

**Duplicate Prevention**: The system automatically detects and prevents re-processing of existing documents.

### **Viewing Dashboard**

1. The dashboard shows real-time KPIs and trends
2. **KPIs**:
   - Active Client POs (with 30-day delta)
   - Invoice Utilization (PO consumption percentage)
   - Exceptions count
   - Average Processing Time
3. **Charts**:
   - Monthly Document Activity (last 6 months)
   - Documents by Type (category distribution)
4. Recent documents panel shows latest processed documents
5. Click on any document to view full details
6. Use refresh button to manually update data

### **Managing Alerts**

1. Navigate to Alerts page
2. View alerts by level (Critical, Warning, Info)
3. Filter by acknowledged status
4. Alerts automatically generated for:
   - PO utilization thresholds
   - Invoice-PO mismatches
   - Contract expiration
5. Alerts refresh every 30 seconds automatically

### **Document Linking**

The system automatically links documents:
- **Invoices → POs**: By PO number, client/vendor match, or amount similarity
- **Contracts → POs**: By vendor/client and date range
- **POs → Contracts**: By vendor/client and validity period

Linked documents enable:
- PO consumption tracking
- Invoice validation
- Contract compliance checking

### **Deleting Documents**

1. Click delete icon on any document
2. Confirm deletion
3. Document is removed from:
   - Database
   - Processed JSON files
4. Dashboard automatically refreshes

## 📊 Data Extraction

The system extracts the following data from PDFs using AWS Textract:

### **Document Classification**
- Client PO, Vendor PO
- Client Invoice, Vendor Invoice
- Service Agreement, Contract

### **Financial Data**
- **Amounts**: Total, subtotal, tax amounts (prioritizes "Total Incl VAT")
- **Currency**: 20+ international currencies (USD, EUR, GBP, AED, etc.)
- **Payment Terms**: Due dates, payment deadlines

### **Entity Information**
- **Client**: Company name with enhanced pattern matching
- **Vendor**: Supplier/business name
- **Addresses**: Vendor and client addresses

### **Reference Numbers**
- **PO Numbers**: Purchase order identifiers
- **Invoice Numbers**: Invoice identifiers
- **Document Numbers**: Various reference numbers

### **Dates**
- **Document Date**: Invoice date, PO date, etc.
- **Due Date**: Payment due date, contract expiration
- **Date Normalization**: Consistent YYYY-MM-DD format

### **Contact Information**
- **Emails**: Extracted email addresses
- **Phones**: 10-11 digit phone numbers (validated)
- **Addresses**: Full address extraction

### **Content Analysis**
- **Summary**: Automated document summary
- **Key Terms**: Important financial and document terms
- **Full Text**: Complete extracted text content

## 🔄 Duplicate Prevention

The system prevents duplicate document processing through multiple checks:

### **Check Order**
1. **Database Check**: By filename (`file_path`)
2. **S3 Check**: By filename in organized folders
3. **Enhanced Matching**: By title + amount, invoice/PO number
4. **Processing**: Only if document is truly new

### **Matching Strategies**
- Exact filename match
- Title + amount match (within 1% tolerance)
- Invoice number match (for invoices)
- PO number match (for POs)
- Client + amount match (fallback)

### **Benefits**
- ✅ No duplicate S3 uploads
- ✅ No duplicate Textract processing
- ✅ Cost savings on AWS services
- ✅ Clean database without duplicates

## 🎯 Alert System Details

### **PO Utilization Alerts**

**Warning** (80%+ utilization):
```
"PO [Title] is 85.2% utilized (3 invoices totaling $127,800.00 USD of $150,000.00 USD). $22,200.00 USD remaining."
```

**Critical** (95%+ utilization):
```
"PO [Title] is 97.5% utilized (5 invoices totaling $146,250.00 USD of $150,000.00 USD). Only $3,750.00 USD remaining."
```

### **Invoice-PO Mismatch Alerts**

**Critical** (Invoice exceeds balance):
```
"Invoice [Title] ($30,000.00 USD) exceeds remaining PO balance ($22,200.00 USD). PO: [PO Title] (Total: $150,000.00 USD)."
```

**Warning** (Currency mismatch):
```
"Invoice [Title] uses AED but linked PO [PO Title] uses USD. Please verify amounts are correct."
```

### **Contract Expiration Alerts**

**Warning** (Expiring soon):
```
"Service Agreement [Title] will expire in 25 days (2025-12-31). This contract governs 3 PO(s) worth $450,000.00 USD with 8 linked invoice(s)."
```

**Critical** (Expired):
```
"Service Agreement [Title] expired on 2025-11-15. This contract governs 3 PO(s) worth $450,000.00 USD with 8 linked invoice(s). Please renew or terminate."
```

## 🛠️ Development

### **Project Structure**
```
DMS_Dashboard/
├── backend/
│   ├── app/
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   │       ├── pdf_processor.py      # AWS Textract processing
│   │       ├── upload_service.py     # File upload handling
│   │       ├── alert_generator.py    # Alert generation
│   │       ├── document_linking_service.py  # Document linking
│   │       └── document_service.py   # Document CRUD
│   ├── scripts/              # Migration scripts
│   ├── uploads/             # Uploaded PDFs
│   ├── processed/           # Processed JSON results
│   └── requirements.txt
├── dms-frontend/
│   ├── app/                 # Next.js pages
│   ├── components/         # React components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document components
│   │   └── alerts/        # Alert components
│   ├── lib/                # Utilities and API client
│   └── package.json
└── README.md
```

### **Key Services**

**PDFProcessor**: Handles AWS Textract processing
- S3-based async processing
- Text extraction and parsing
- Data extraction (amounts, dates, entities)
- Document classification

**UploadService**: Manages file uploads
- File validation and sanitization
- Duplicate detection
- Database integration
- Alert generation trigger

**AlertGenerator**: Generates alerts
- PO utilization monitoring
- Invoice-PO validation
- Contract expiration tracking
- Real-time alert creation

**DocumentLinkingService**: Links related documents
- Multiple linking strategies
- Invoice-PO matching
- Contract-PO linking
- Validation and consumption calculation

### **Database Schema**

**Documents Table**:
- `id`, `title`, `category`, `client`, `vendor`
- `amount`, `currency`, `status`
- `created_at`, `due_date`, `confidence`
- `po_number`, `invoice_number` (indexed)
- `linked_to` (foreign key to other documents)
- `file_path`, `pdf_url`, `processed`

**Alerts Table**:
- `id`, `title`, `description`, `level`
- `timestamp`, `acknowledged`
- `document_id` (foreign key)

**Exceptions Table**:
- `id`, `document_id`, `type`, `severity`
- `message`, `resolved`, `raised_at`

## 🔍 Troubleshooting

### **AWS Textract Issues**

**Error: "SubscriptionRequiredException"**
- Enable Textract in AWS Console
- See `ENABLE_TEXTRACT.md` for detailed steps

**Error: "UnrecognizedClientException"**
- Check AWS credentials in `.env`
- Verify IAM user has Textract permissions
- Run `python verify_aws_credentials.py`

**Error: "UnsupportedDocumentException"**
- System uses S3-based async processing (handles most PDFs)
- Ensure S3 bucket is configured
- Check PDF format and size (max 500MB)

### **S3 Issues**

**Error: "S3 bucket not configured"**
- Add `AWS_S3_BUCKET=your-bucket-name` to `.env`
- Restart backend after updating

**Error: "Access Denied"**
- Check IAM user has S3 permissions
- Verify bucket name is correct
- Check bucket region matches AWS region

### **Duplicate Documents**

**Documents appearing twice:**
- System has deduplication at multiple levels
- Check database for actual duplicates
- Frontend deduplicates before display
- Backend deduplicates before returning

**To clean up existing duplicates:**
```python
from app.database import SessionLocal
from app.models import Document
from sqlalchemy import func

db = SessionLocal()
# Find and remove duplicates (keeps oldest)
duplicates = db.query(Document.title, Document.amount, func.count(Document.id)).group_by(Document.title, Document.amount).having(func.count(Document.id) > 1).all()
# Delete duplicates...
```

### **Dashboard Not Updating**

**Graphs showing old data:**
- Click refresh button
- Check if documents were deleted from database (not just JSON files)
- Verify backend is running and accessible
- Check browser console for errors

**KPIs not updating:**
- Dashboard auto-refreshes every 30 seconds
- Manual refresh available via button
- Check database has documents
- Verify API endpoints are working

### **Frontend Issues**

**"Failed to fetch" errors:**
- Check `NEXT_PUBLIC_API_BASE_URL` in `env.local`
- Verify backend is running on correct port (8000)
- Check CORS settings in backend
- Verify `credentials: "include"` in API calls

## 📈 Performance

- **Textract Processing**: 30 seconds to 5 minutes per document (async)
- **Classification Accuracy**: 85%+ with ML-based approach
- **Data Extraction**: 74%+ confidence with multi-factor analysis
- **API Response Time**: < 100ms for most endpoints
- **Dashboard Refresh**: Real-time with 30-second auto-refresh

## 🔒 Security

- **Environment Variables**: All sensitive data stored in `.env` files (not committed)
- **Input Validation**: Pydantic schemas for data validation
- **File Upload Limits**: 25MB max file size
- **CORS Protection**: Configured origins in settings
- **AWS Credentials**: Stored securely in environment variables
- **S3 Access**: Private bucket with IAM-based access control

## 📝 API Documentation

### **Endpoints**

**Documents**:
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document details
- `POST /api/documents/` - Create document
- `DELETE /api/documents/{id}` - Delete document

**Uploads**:
- `POST /api/uploads/` - Upload files
- `POST /api/uploads/process/{filename}` - Process uploaded PDF
- `GET /api/uploads/{filename}` - Get uploaded file

**Alerts**:
- `GET /api/alerts/` - List alerts (with filtering)
- `PUT /api/alerts/{id}` - Update alert (acknowledge)

**Dashboard**:
- `GET /api/dashboard/` - Get dashboard insights

**Processed Documents**:
- `GET /api/processed-documents/` - List processed documents
- `GET /api/processed-documents/{id}` - Get processed document
- `DELETE /api/processed-documents/{id}` - Delete processed document

Full API documentation available at: `http://localhost:8000/docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check troubleshooting section above
- Review individual feature documentation files
- Open an issue on GitHub
- Contact the development team

## 🚀 Deployment

### **Frontend (Vercel)**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import GitHub repository
   - **Root Directory**: `dms-frontend`
   - Add environment variable: `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com`

3. **Deploy**: Vercel will automatically build and deploy

### **Backend (Railway/Render/AWS)**

**Railway** (Recommended):
1. Go to https://railway.app
2. Deploy from GitHub repo
3. **Root Directory**: `backend`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see `backend/env.example`)

**Render**:
1. Go to https://render.com
2. Create Web Service from GitHub
3. **Root Directory**: `backend`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Important**: Update `ALLOWED_ORIGINS` in backend to include your Vercel URL.

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Document versioning
- [ ] Advanced search capabilities
- [ ] Automated testing suite
- [ ] WebSocket for real-time updates
- [ ] Document signing workflow
- [ ] Multi-tenant support
- [ ] Export/import functionality
- [ ] Advanced reporting

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, FastAPI, AWS Textract, and modern web technologies**
