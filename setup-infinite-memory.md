# Infinite Memory Integration Setup

This guide will help you set up the Infinite Memory backend to work with the Ledger Clinic frontend.

## Prerequisites

1. **Python 3.9+** installed on your system
2. **Node.js & npm** for the React frontend
3. **AWS Account** with appropriate permissions
4. **Google Cloud Platform Account** for Calendar API

## Step 1: Set up the Infinite Memory Backend

### 1.1 Navigate to the infinite-memory directory
```bash
cd infinite-memory
```

### 1.2 Install Python dependencies
```bash
# Install uv if you don't have it
pip install uv

# Install dependencies
uv sync
```

### 1.3 Configure AWS Services

You'll need to create the following AWS resources in the same region:

#### Amazon S3 Bucket
- Create a standard S3 bucket
- Add CORS policy to allow GET requests from `*`

#### Amazon Kendra Index
- Create a new Kendra Index (Developer edition)
- Add facet definitions:
  - `importance_score` (Type: Double, Sortable, Displayable)
  - `s3_url` (Type: String, Displayable)
  - `speaker_cluster_id` (Type: String, Displayable)
  - `creation_timestamp` (Type: Long, Sortable, Displayable)

#### Amazon DynamoDB Tables (4 tables)
1. **Speakers Table**: `infinite-memory-speakers`
   - Primary Key: Composite (`user_id` [String] Partition Key, `cluster_id` [String] Sort Key)

2. **Tasks Table**: `infinite-memory-tasks`
   - Primary Key: Composite (`patient_id` [String] Partition Key, `task_id` [String] Sort Key)

3. **Analytics Table**: `infinite-memory-analytics`
   - Primary Key: Composite (`patient_id` [String] Partition Key, `timestamp` [String] Sort Key)

4. **Alerts Table**: `infinite-memory-alerts`
   - Primary Key: Composite (`patient_id` [String] Partition Key, `timestamp` [String] Sort Key)

#### Amazon Neptune Database
- Create a new Neptune cluster
- Note the Cluster endpoint

#### EC2 Bastion Host
- Launch a `t2.micro` EC2 instance in the same VPC as your Neptune cluster
- Create and download an SSH key pair (`.pem` file)
- Configure security groups for SSH access and Neptune connectivity

### 1.4 Configure Google Calendar API

1. Go to Google Cloud Console and enable "Google Calendar API"
2. Create "OAuth 2.0 Client IDs" credentials for a "Desktop app"
3. Download the credentials JSON file and rename it to `credentials.json` in the infinite-memory root

### 1.5 Create Environment File

Create a `.env` file in the infinite-memory directory with your AWS and other configuration:

```env
# AWS Configuration
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Configuration
S3_BUCKET_NAME=your-s3-bucket-name

# Kendra Configuration
KENDRA_INDEX_ID=your-kendra-index-id

# Neptune Configuration
NEPTUNE_CLUSTER_ENDPOINT=your-neptune-cluster-endpoint

# DynamoDB Table Names
DYNAMODB_SPEAKERS_TABLE=infinite-memory-speakers
DYNAMODB_TASKS_TABLE=infinite-memory-tasks
DYNAMODB_ANALYTICS_TABLE=infinite-memory-analytics
DYNAMODB_ALERTS_TABLE=infinite-memory-alerts

# ElevenLabs Configuration (for text-to-speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-opus-20240229-v1:0
```

### 1.6 Install System Dependencies (macOS)
```bash
brew install portaudio
```

## Step 2: Start the Infinite Memory Backend

### 2.1 Start SSH Tunnel to Neptune
```bash
# Replace with your actual values
ssh -i /path/to/your/neptune.pem ec2-user@<YOUR_BASTION_PUBLIC_IP> -N -L 8182:<YOUR_NEPTUNE_CLUSTER_ENDPOINT>:8182
```

### 2.2 Start the Backend Server
```bash
cd infinite-memory
uv run backend/main.py
```

The backend should start on `http://localhost:8000`

### 2.3 First-Time Google Authentication
When you first use calendar features, the backend will pause and show a URL. Copy this URL into your browser to authenticate with Google.

## Step 3: Start the Ledger Clinic Frontend

### 3.1 Navigate to the ledger-clinic directory
```bash
cd ledger-clinic
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start the development server
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

## Step 4: Access Infinite Memory

1. Open your browser and go to `http://localhost:5173`
2. You'll see the main Ledger Clinic dashboard
3. Look for the "Infinite Memory" card in the right sidebar
4. Click "Open Infinite Memory" to access the AI memory dashboard
5. Or navigate directly to `http://localhost:5173/infinite-memory`

## Features Available

### Conversation Tab
- Process text input with AI analysis
- Upload and process images with captions
- View conversation history with importance scores

### Memory Query Tab
- Ask questions about stored memories
- Get AI-powered answers based on your memory data

### Tasks Tab
- Create new tasks with dates and descriptions
- Mark tasks as completed
- View all your pending and completed tasks

### Analytics Tab
- View memory interaction statistics
- Track importance scores over time
- Monitor cognitive health patterns

## Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on `http://localhost:8000`
- Check that all AWS services are properly configured
- Verify the SSH tunnel to Neptune is active

### Frontend Issues
- Make sure all npm dependencies are installed
- Check the browser console for any JavaScript errors
- Verify the API calls are reaching the backend

### AWS Issues
- Ensure all AWS credentials are correct
- Verify all required AWS services are in the same region
- Check that the Neptune cluster is accessible via the bastion host

## Next Steps

1. **Customize the UI**: Modify the React components to match your design preferences
2. **Add Authentication**: Implement proper user authentication and management
3. **Scale the Backend**: Consider deploying the backend to AWS ECS or similar
4. **Add More Features**: Extend the AI capabilities with additional tools and integrations 