# PowerShell script to start development environment
# This script verifies MongoDB connection and then starts the application

Write-Host "Starting AI Interview Platform Development Environment..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
$envFile = "apps/api/.env"
if (-not $env:DATABASE_URL) {
    # Try to load from .env file if it exists
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            $line = $_.Trim()
            # Skip empty lines and comments
            if ($line -and -not $line.StartsWith('#')) {
                if ($line.Contains('=')) {
                    $parts = $line.Split('=', 2)
                    $key = $parts[0].Trim()
                    $value = $parts[1].Trim()
                    if ($key) {
                        [Environment]::SetEnvironmentVariable($key, $value, "Process")
                    }
                }
            }
        }
    } else {
        Write-Host "ERROR: DATABASE_URL not found. Please set it in apps/api/.env" -ForegroundColor Red
        Write-Host ""
        Write-Host "Example .env file:" -ForegroundColor Yellow
        Write-Host "  DATABASE_URL=mongodb://localhost:27017/ai_interview_dev" -ForegroundColor Gray
        Write-Host "  DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL is not set in $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "Using MongoDB connection from DATABASE_URL" -ForegroundColor Green

# Extract connection info for display
$dbUrl = $env:DATABASE_URL

# Check for MongoDB Atlas connection (mongodb+srv://)
if ($dbUrl.Contains('mongodb+srv://')) {
    # Try to extract cluster name using string manipulation
    try {
        $atIndex = $dbUrl.IndexOf('@')
        if ($atIndex -ge 0) {
            $afterAt = $dbUrl.Substring($atIndex + 1)
            $cluster = $afterAt.Split('/')[0].Split('?')[0]
            Write-Host "Using MongoDB Atlas cluster: $cluster" -ForegroundColor Cyan
            Write-Host "   Please ensure your IP is whitelisted and credentials are correct." -ForegroundColor Gray
        } else {
            Write-Host "Using MongoDB Atlas (cloud)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "Using MongoDB Atlas (cloud)" -ForegroundColor Cyan
    }
}
# Check for standard MongoDB connection (mongodb://)
elseif ($dbUrl.Contains('mongodb://')) {
    # Extract host and port using string manipulation
    try {
        $protocolIndex = $dbUrl.IndexOf('://')
        if ($protocolIndex -ge 0) {
            $afterProtocol = $dbUrl.Substring($protocolIndex + 3)
            $connectionInfo = $afterProtocol.Split('/')[0].Split('?')[0]
            
            # Check if it's localhost
            if ($connectionInfo.Contains('localhost') -or $connectionInfo.Contains('127.0.0.1')) {
                Write-Host "Testing MongoDB connection at $connectionInfo..." -ForegroundColor Yellow
                
                # Try to test connection if mongosh is available
                $mongoTest = Get-Command mongosh -ErrorAction SilentlyContinue
                if ($mongoTest) {
                    try {
                        $null = mongosh $dbUrl --eval "db.runCommand('ping')" --quiet 2>&1
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "MongoDB is ready and responding" -ForegroundColor Green
                        } else {
                            Write-Host "Could not connect to MongoDB. Please ensure MongoDB is running." -ForegroundColor Yellow
                            Write-Host "   Connection string: $dbUrl" -ForegroundColor Gray
                        }
                    } catch {
                        Write-Host "Could not test MongoDB connection." -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "mongosh not found. Skipping connection test." -ForegroundColor Yellow
                    Write-Host "   Please ensure MongoDB is accessible at: $dbUrl" -ForegroundColor Gray
                }
            } else {
                Write-Host "Using remote MongoDB server: $connectionInfo" -ForegroundColor Cyan
            }
        } else {
            Write-Host "Using MongoDB connection: $dbUrl" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "Using MongoDB connection: $dbUrl" -ForegroundColor Cyan
    }
} else {
    Write-Host "WARNING: Could not parse DATABASE_URL format. Please verify your connection string." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Development environment is ready!" -ForegroundColor Green
Write-Host "   - MongoDB: $dbUrl" -ForegroundColor Gray
Write-Host "   - API Server: http://localhost:5000" -ForegroundColor Gray
Write-Host "   - Web App: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "To start the API and Web servers, run:" -ForegroundColor Cyan
Write-Host "   pnpm dev" -ForegroundColor White
Write-Host ""



