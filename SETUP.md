# MongoDB Setup Guide

This project uses an external MongoDB server. You can use MongoDB Atlas (cloud), a local MongoDB installation, or any MongoDB server accessible via a connection string.

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create a MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free cluster (M0)

### Step 2: Get Your Connection String
1. In MongoDB Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)
4. Replace `<password>` with your database user password
5. Replace `<database>` with your database name (e.g., `ai_interview_dev`)

### Step 3: Configure Environment Variables
Create or update `apps/api/.env`:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ai_interview_dev?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production-123456789
PORT=5000
```

### Step 4: Whitelist Your IP Address
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Add your current IP address (or use `0.0.0.0/0` for development, but **not recommended for production**)

## Option 2: Local MongoDB Installation

### Windows Installation:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   # MongoDB usually starts automatically as a Windows service
   # Or start manually:
   net start MongoDB
   ```

### Configure Environment Variables
Create or update `apps/api/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev
JWT_SECRET=your-secret-key-change-in-production-123456789
PORT=5000
```

### Verify Connection
After MongoDB is running, test the connection:

```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/ai_interview_dev
```

Or check if port 27017 is listening:
```bash
netstat -an | findstr 27017
```

## Option 3: Docker (Optional - For Local Development)

If you prefer to use Docker for local MongoDB:

```bash
# Start MongoDB container
docker-compose up -d mongodb
```

Then use this connection string in `apps/api/.env`:
```env
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev?directConnection=true
```

## Environment Variables

Make sure `apps/api/.env` file exists with your MongoDB connection string:

```env
# For MongoDB Atlas (cloud)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ai_interview_dev?retryWrites=true&w=majority

# For local MongoDB
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev

# For Docker MongoDB
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev?directConnection=true

# Required for all setups
JWT_SECRET=your-secret-key-change-in-production-123456789
PORT=5000
```

## Initialize Database Schema

After MongoDB is running, push the Prisma schema:

```bash
cd packages/database
pnpm prisma db push
```

## Start the API Server

```bash
cd apps/api
pnpm dev
```

You should see: `🚀 Server running on http://localhost:5000`

