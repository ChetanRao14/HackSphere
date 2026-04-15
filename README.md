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
The application uses default `.env` files which are already placed in both directories, but for production you'll want to update them.

- `/server/.env` needs `MONGO_URI`, `PORT` (usually 5000), and `JWT_SECRET`.
- `/client/.env` needs `VITE_API_URL` pointing to the backend.

### 3. Run the Development Server

**Start both backend and frontend simultaneously:**
```bash
# In the main HackSphere directory
npm run dev
```
*This command runs the `server` (on port 5000) and `client` (on port 5173) together.*

## Application URLs
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## Features
- **Participants**: Create team, manage team members (Max 4), submit project abstract.
- **Judges**: Filter and search through submissions, review abstracts, and update status to Approved/Rejected.
- **UI**: Modern interface built with Tailwind CSS v4, Lucide React icons, and Framer Motion.
