# MedGenAI - Clinical Pedigree Analysis Platform

[![Deploy Backend](https://github.com/codebuzer/pedigree-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/codebuzer/pedigree-ai/actions/workflows/deploy.yml)
[![Deploy Frontend](https://github.com/codebuzer/pedigree-ai/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/codebuzer/pedigree-ai/actions/workflows/deploy-frontend.yml)

> **Professional Medical-Grade Pedigree Drawing & Analysis Tool**

A comprehensive clinical genetics platform for healthcare professionals to create, analyze, and manage family pedigrees with AI-powered genetic analysis capabilities.

## 🌐 Live Demo

**Frontend**: [http://medgenai-frontend-app.s3-website-us-east-1.amazonaws.com](http://medgenai-frontend-app.s3-website-us-east-1.amazonaws.com)

**Backend API**: `https://f5r95yyk12.execute-api.us-east-1.amazonaws.com/dev`

## ✨ Features

### 🏥 Clinical Interface
- **Medical-grade UI** with professional healthcare design
- **Clinical terminology** throughout the application
- **MRN (Medical Record Number)** patient identification
- **ICD-10 diagnosis** support
- **Ethnicity tracking** for genetic analysis

### 👥 Patient Management
- **Proband registration** with comprehensive medical data
- **Multi-generational family tree** management
- **Relationship mapping** (parents, siblings, children, grandparents)
- **Clinical status tracking** (affected, unaffected, carrier, deceased)
- **Real-time data synchronization**

### 🎨 Advanced Pedigree Tools
- **Dual drawing modes**: Freehand drawing + Symbol placement
- **Medical pedigree symbols**:
  - Male (square), Female (circle)
  - Affected individuals (filled symbols)
  - Carriers (dotted symbols)
  - Deceased (diagonal line)
- **High-precision canvas** with grid overlay
- **Touch/stylus support** for tablets
- **Export functionality** (PNG format)

### 📊 Clinical Analytics
- **Real-time analysis summary**
- **Generation counting**
- **Affected individual tracking**
- **Inheritance pattern detection** (AI-powered)
- **Professional reporting**

### 🔧 Professional Features
- **Responsive design** for all devices
- **High-DPI support** for medical displays
- **Professional notifications**
- **Loading states** and error handling
- **Accessibility compliant**

## 🏗️ Architecture

### Frontend
- **Technology**: Vanilla JavaScript, CSS3, HTML5
- **Hosting**: AWS S3 Static Website
- **Design**: Medical-grade professional interface
- **Responsive**: Mobile, tablet, desktop optimized

### Backend
- **Technology**: AWS Lambda (Python 3.9)
- **API**: RESTful API with API Gateway
- **Database**: DynamoDB (NoSQL)
- **Authentication**: IAM-based security
- **Validation**: Pydantic data models

### Infrastructure
- **Cloud Provider**: Amazon Web Services (AWS)
- **Deployment**: Serverless Framework
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch
- **Cost Optimization**: Pay-per-use model

## 🚀 Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ and npm
- Python 3.9+
- Git

### Backend Deployment

```bash
# Clone repository
git clone https://github.com/codebuzer/pedigree-ai.git
cd pedigree-ai/backend

# Install dependencies
npm install
pip install -r requirements.txt

# Configure AWS credentials
aws configure

# Deploy to AWS
npm run deploy-dev
```

### Frontend Deployment

```bash
# Upload to S3
aws s3 sync . s3://your-bucket-name --exclude "*" --include "*.html" --include "*.css" --include "*.js"

# Configure static website
aws s3 website s3://your-bucket-name --index-document index.html
```

## 📡 API Documentation

### Base URL
```
https://f5r95yyk12.execute-api.us-east-1.amazonaws.com/dev
```

### Endpoints

#### Proband Management
```http
POST /proband
GET  /proband/{id}
```

#### Family Members
```http
POST   /family
GET    /family/proband/{probandId}
PUT    /family/member/{id}
DELETE /family/member/{id}
```

### Request Examples

#### Create Proband
```json
POST /proband
{
  "name": "John Doe",
  "sex": "male",
  "age": 35,
  "diagnosis": "Diabetes Type 2"
}
```

#### Create Family Member
```json
POST /family
{
  "name": "Jane Doe",
  "sex": "female",
  "relationship": "mother",
  "proband_id": "uuid-here",
  "age": 60
}
```

## 💰 Cost Optimization

### Monthly Costs (Estimated)
- **AWS Lambda**: ~$0.20 (1M requests)
- **DynamoDB**: ~$1.25 (1M requests)
- **API Gateway**: ~$3.50 (1M requests)
- **S3 Hosting**: ~$0.50 (static website)
- **Total**: **<$6/month** for moderate usage

### Optimization Features
- **128MB Lambda memory** (minimum)
- **30-second timeouts**
- **Pay-per-request DynamoDB**
- **Single table design**
- **Minimal dependencies**

## 🔒 Security

- **IAM-based authentication**
- **CORS enabled** for cross-origin requests
- **Input validation** with Pydantic
- **Error handling** and logging
- **No sensitive data exposure**

## 🧪 Testing

### Manual Testing
1. Open live demo URL
2. Register a proband with medical information
3. Add family members with relationships
4. Test drawing tools (freehand + symbols)
5. Export pedigree as PNG

### API Testing
Use Postman or curl to test backend endpoints:
```bash
curl -X POST https://api-url/dev/proband \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","sex":"male","age":30,"diagnosis":"Test"}'
```

## 🛠️ Development

### Local Development
```bash
# Frontend
open index.html in browser

# Backend
cd backend
serverless offline start
```

### Environment Variables
```bash
# Backend
DYNAMODB_TABLE=pedigree-ai-backend-dev
AWS_REGION=us-east-1
```

## 📈 Roadmap

### Phase 1: ✅ Complete
- [x] Professional medical interface
- [x] Patient and family management
- [x] Advanced pedigree drawing tools
- [x] AWS serverless backend
- [x] Live deployment

### Phase 2: 🔄 In Progress
- [ ] AI-powered genetic analysis
- [ ] Machine learning model integration
- [ ] Advanced inheritance pattern detection
- [ ] Clinical report generation

### Phase 3: 📋 Planned
- [ ] User authentication system
- [ ] Multi-user collaboration
- [ ] Advanced export formats (PDF, DICOM)
- [ ] Integration with EMR systems
- [ ] Mobile applications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abuzar** - [GitHub](https://github.com/codebuzer)

## 🙏 Acknowledgments

- Medical genetics community for requirements
- AWS for serverless infrastructure
- Healthcare professionals for feedback

---

**Built with ❤️ for the medical genetics community**