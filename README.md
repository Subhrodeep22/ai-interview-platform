# AI Interview Platform

A modern AI-powered interview platform built with Next.js, Express.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB server (MongoDB Atlas, local installation, or Docker)

### MongoDB Setup

This project uses an external MongoDB server. You have several options:

1. **MongoDB Atlas (Cloud - Recommended)**: Free cloud MongoDB database
2. **Local MongoDB Installation**: Install MongoDB on your machine
3. **Docker MongoDB**: Use Docker for local development (optional)

See [SETUP.md](./SETUP.md) for detailed MongoDB setup instructions.

### Configure Environment Variables

Create `apps/api/.env` file with your MongoDB connection string:

```env
# For MongoDB Atlas (cloud)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ai_interview_dev?retryWrites=true&w=majority

# For local MongoDB
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev

# Required for all setups
JWT_SECRET=your-secret-key-change-in-production-123456789
PORT=5000
```

### Starting the Development Environment

#### Option 1: Using Helper Scripts (Recommended)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

The script will verify your MongoDB connection and prepare the development environment.

### Starting the Application

After MongoDB is configured:

```bash
# Start both API and Web servers
pnpm dev

# Or start individually:
# API Server (port 5000)
cd apps/api && pnpm dev

# Web App (port 3000)
cd apps/web && pnpm dev
```

## 🛠️ Development Workflow

### Daily Development

1. **Ensure MongoDB is running** (MongoDB Atlas is always running, local MongoDB needs to be started)
2. **Start the application:**
   ```bash
   pnpm dev
   ```

### MongoDB Connection

The application connects to MongoDB using the `DATABASE_URL` environment variable in `apps/api/.env`. 

- **MongoDB Atlas**: Always available, no local setup needed
- **Local MongoDB**: Ensure MongoDB service is running on your machine
- **Docker MongoDB**: Optional - use `docker-compose up -d mongodb` if preferred

## 📊 Optional Docker Services

If you prefer using Docker for local development, the following services are available:

- **MongoDB**: `localhost:27017` - Main database (optional)
- **PostgreSQL**: `localhost:5432` - (Optional, not currently used)
- **Redis**: `localhost:6379` - (Optional, for caching)
- **pgAdmin**: `localhost:8081` - PostgreSQL admin UI (optional)

To use Docker MongoDB:
```bash
docker-compose up -d mongodb
```
Then set `DATABASE_URL=mongodb://localhost:27017/ai_interview_dev?directConnection=true` in `apps/api/.env`

## 🔧 Useful Commands

```bash
# Start development servers
pnpm dev

# Initialize database schema
cd packages/database && pnpm prisma db push

# Open Prisma Studio (Database GUI)
cd packages/database && pnpm prisma studio

# Test MongoDB connection (if mongosh is installed)
mongosh "your-mongodb-connection-string"
```

### Docker Commands (Optional - if using Docker MongoDB)

```bash
# View running containers
pnpm docker:status
# or
docker-compose ps

# View MongoDB logs
docker-compose logs -f mongodb

# Restart MongoDB
docker-compose restart mongodb

# Access MongoDB shell
docker exec -it ai-interview-mongodb mongosh

# Stop MongoDB container
docker-compose down

# Remove all containers and volumes (⚠️ deletes data)
docker-compose down -v
```

## 🔐 Environment Variables

### API Server (`apps/api/.env`)
```env
# MongoDB connection string (required)
# For MongoDB Atlas:
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ai_interview_dev?retryWrites=true&w=majority

# For local MongoDB:
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev

# For Docker MongoDB:
DATABASE_URL=mongodb://localhost:27017/ai_interview_dev?directConnection=true

# Other required variables
JWT_SECRET=your-secret-key-change-in-production-123456789
PORT=5000
```

### Web App (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📝 Database Management

### Initialize Schema
```bash
cd packages/database
pnpm prisma db push
```

### Open Prisma Studio (Database GUI)
```bash
cd packages/database
pnpm prisma studio
```

## 🐛 Troubleshooting

### MongoDB Connection Issues?

1. **Verify DATABASE_URL is set correctly** in `apps/api/.env`
2. **Test your connection string:**
   ```bash
   mongosh "your-database-url"
   ```
3. **For MongoDB Atlas:**
   - Ensure your IP address is whitelisted in Network Access
   - Verify your username and password are correct
   - Check that your cluster is running
4. **For local MongoDB:**
   - Ensure MongoDB service is running: `net start MongoDB` (Windows)
   - Check if port 27017 is available: `netstat -an | findstr 27017`
5. **For Docker MongoDB:**
   - Check if Docker is running: `docker ps`
   - View logs: `docker-compose logs mongodb`
   - Ensure container is running: `docker-compose ps`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more detailed troubleshooting steps.

## 📚 Project Structure

```
ai-interview-platform/
├── apps/
│   ├── api/          # Express.js API server
│   └── web/          # Next.js web application
├── packages/
│   ├── database/     # Prisma schema and database package
│   ├── shared/       # Shared utilities
│   └── ui/           # Shared UI components
└── docker-compose.yml # Docker services configuration
```

## 💡 Tips

- **MongoDB Atlas** is recommended for development - it's free, always available, and requires no local setup
- Your database connection is configured via the `DATABASE_URL` environment variable
- Always keep your `DATABASE_URL` secure and never commit it to version control
- Use `.env` files (which should be in `.gitignore`) to store your connection strings
- For MongoDB Atlas, remember to whitelist your IP address in the Network Access settings



