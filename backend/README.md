# Pedigree AI Backend

AWS Lambda-based backend for Pedigree Drawing & Analysis Tool.

## Cost Optimization Features
- **128MB Memory**: Minimal memory allocation
- **30s Timeout**: Quick response times
- **Pay-per-request DynamoDB**: No idle costs
- **Serverless**: Only pay when used

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
pip install -r requirements.txt
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 3. Deploy to AWS
```bash
# Development
npm run deploy-dev

# Production
npm run deploy-prod
```

## API Endpoints

### Proband Management
- `POST /proband` - Create proband
- `GET /proband/{id}` - Get proband details

### Family Members
- `POST /family` - Create family member
- `GET /family/{probandId}` - Get all family members
- `PUT /family/{id}` - Update family member
- `DELETE /family/{id}` - Delete family member

## Data Models

### Proband
```json
{
  "name": "string",
  "sex": "male|female",
  "age": "number",
  "diagnosis": "string"
}
```

### Family Member
```json
{
  "name": "string",
  "sex": "male|female", 
  "relationship": "father|mother|sibling|child",
  "proband_id": "string",
  "age": "number (optional)"
}
```

## GitHub Secrets Required
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`