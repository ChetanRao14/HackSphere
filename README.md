# HackSphere

HackSphere is a full-stack MERN (MongoDB, Express, React, Node.js) application for hackathon registration and management. It allows participants to register teams and submit abstracts, while judges can review, accept, or reject submissions.

## Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/hacksphere`) or a MongoDB Atlas URI.

## Setup Instructions

### 1. Install Dependencies
Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

### 2. Environment Variables
To keep secrets safe, `.env` files are ignored by git. 
1. In the `/server` folder, copy `.env.example` to `.env` and fill in your `MONGO_URI` and `JWT_SECRET`.
2. In the `/client` folder, copy `.env.example` to `.env` and configure your API URL.

### 3. Run the Development Server

**Start both backend and frontend simultaneously:**
```bash
# In the main HackSphere directory
npm install
npm run dev
```
*This command uses `concurrently` to run the `server` (on port 5000) and `client` (on port 5173) together.*

## Application URLs
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## AWS Deployment (Serverless)
This project is configured for serverless deployment using AWS SAM (Serverless Application Model). 

1. Ensure you have the `aws-cli` and `sam-cli` installed.
2. Build and deploy the backend API:
```bash
cd server
sam build
sam deploy --guided
```
3. Build the frontend for production, and host the output on AWS S3 / CloudFront:
```bash
cd client
npm run build
# Then upload the contents of the `client/dist` directory to S3
```

## Features
- **Participants**: Create team, manage team members (Max 4), submit project abstract.
- **Judges**: Filter and search through submissions, review abstracts, and update status to Approved/Rejected.
- **UI**: Modern interface built with Tailwind CSS v4, Lucide React icons, and Framer Motion.
