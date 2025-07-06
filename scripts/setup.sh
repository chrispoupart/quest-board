#!/usr/bin/env bash

# Quest Board MVP Setup Script
# This script initializes the development environment for the chore-management website

set -euo pipefail

# Error handling function
handle_error() {
  local exit_code=$?
  local line_number=$1
  echo "Error occurred in line ${line_number}" >&2
  echo "Exit code: ${exit_code}" >&2
  exit "${exit_code}"
}

# Set up error handling
trap 'handle_error ${LINENO}' ERR

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
  log_info "Checking prerequisites..."

  local missing_tools=()

  # Check for Docker
  if ! command -v docker &> /dev/null; then
    missing_tools+=("docker")
  fi

  # Check for Docker Compose
  if ! command -v docker-compose &> /dev/null; then
    missing_tools+=("docker-compose")
  fi

  # Check for Node.js
  if ! command -v node &> /dev/null; then
    missing_tools+=("node")
  fi

  # Check for npm
  if ! command -v npm &> /dev/null; then
    missing_tools+=("npm")
  fi

  # Check for Git
  if ! command -v git &> /dev/null; then
    missing_tools+=("git")
  fi

  if [ ${#missing_tools[@]} -ne 0 ]; then
    log_error "Missing required tools: ${missing_tools[*]}"
    log_info "Please install the missing tools and run this script again."
    exit 1
  fi

  log_success "All prerequisites are installed"
}

# Create project directory structure
create_directory_structure() {
  log_info "Creating project directory structure..."

  # Backend directories
  mkdir -p backend/src/{middleware,routes,controllers,services,models,utils,types}
  mkdir -p backend/prisma/migrations
  mkdir -p backend/tests

  # Frontend directories
  mkdir -p frontend/public
  mkdir -p frontend/src/{components/{common,auth,quests,dashboard,admin},pages,hooks,services,types,utils}

  # Documentation and scripts
  mkdir -p docs
  mkdir -p scripts
  mkdir -p .github/workflows

  log_success "Directory structure created"
}

# Initialize backend (Express.js + TypeScript)
setup_backend() {
  log_info "Setting up Express.js backend..."

  cd backend

  # Initialize package.json
  cat > package.json << 'EOF'
{
  "name": "quest-board-backend",
  "version": "1.0.0",
  "description": "Quest Board Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "google-auth-library": "^9.0.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.4",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.10.0",
    "@types/node-cron": "^3.0.11",
    "typescript": "^5.3.2",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

  # Create TypeScript config
  cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

  # Create Jest config
  cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
EOF

  # Create ESLint config
  cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
EOF

  # Create Prisma schema
  cat > prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  googleId      String   @unique @map("google_id")
  name          String
  email         String   @unique
  role          Role     @default(PLAYER)
  bountyBalance Float    @default(0) @map("bounty_balance")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  createdQuests Quest[]  @relation("QuestCreator")
  claimedQuests Quest[]  @relation("QuestClaimer")
  approvals     Approval[]

  @@map("users")
}

model Quest {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  bounty      Float
  status      QuestStatus @default(AVAILABLE)
  createdBy   Int       @map("created_by")
  claimedBy   Int?      @map("claimed_by")
  claimedAt   DateTime? @map("claimed_at")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  creator     User      @relation("QuestCreator", fields: [createdBy], references: [id])
  claimer     User?     @relation("QuestClaimer", fields: [claimedBy], references: [id])
  approval    Approval?

  @@map("quests")
}

model Approval {
  id        Int           @id @default(autoincrement())
  questId   Int           @unique @map("quest_id")
  approvedBy Int          @map("approved_by")
  status    ApprovalStatus
  notes     String?
  createdAt DateTime      @default(now()) @map("created_at")

  // Relations
  quest     Quest         @relation(fields: [questId], references: [id])
  approver  User          @relation(fields: [approvedBy], references: [id])

  @@map("approvals")
}

enum Role {
  ADMIN
  EDITOR
  PLAYER
}

enum QuestStatus {
  AVAILABLE
  CLAIMED
  COMPLETED
  APPROVED
  REJECTED
}

enum ApprovalStatus {
  APPROVED
  REJECTED
}
EOF

  # Create environment template
  cat > .env.example << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="30m"

# Google OAuth2
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=8000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"
EOF

  # Create main Express app
  cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import questRoutes from './routes/quests';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/quests', questRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
});
EOF

  # Create basic middleware
  cat > src/middleware/errorHandler.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
EOF

  cat > src/middleware/cors.ts << 'EOF'
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);
EOF

  # Create basic route files
  cat > src/routes/auth.ts << 'EOF'
import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes
router.post('/google', (req, res) => {
  res.json({ message: 'Google OAuth2 login endpoint' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: 'Token refresh endpoint' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});

export default router;
EOF

  cat > src/routes/users.ts << 'EOF'
import { Router } from 'express';

const router = Router();

// TODO: Implement user routes
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user endpoint' });
});

router.put('/me', (req, res) => {
  res.json({ message: 'Update user endpoint' });
});

router.get('/', (req, res) => {
  res.json({ message: 'List users endpoint' });
});

export default router;
EOF

  cat > src/routes/quests.ts << 'EOF'
import { Router } from 'express';

const router = Router();

// TODO: Implement quest routes
router.get('/', (req, res) => {
  res.json({ message: 'List quests endpoint' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get quest endpoint', id: req.params.id });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create quest endpoint' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update quest endpoint', id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete quest endpoint', id: req.params.id });
});

router.post('/:id/claim', (req, res) => {
  res.json({ message: 'Claim quest endpoint', id: req.params.id });
});

router.post('/:id/complete', (req, res) => {
  res.json({ message: 'Complete quest endpoint', id: req.params.id });
});

router.post('/:id/approve', (req, res) => {
  res.json({ message: 'Approve quest endpoint', id: req.params.id });
});

router.post('/:id/reject', (req, res) => {
  res.json({ message: 'Reject quest endpoint', id: req.params.id });
});

export default router;
EOF

  cat > src/routes/dashboard.ts << 'EOF'
import { Router } from 'express';

const router = Router();

// TODO: Implement dashboard routes
router.get('/', (req, res) => {
  res.json({ message: 'Dashboard data endpoint' });
});

router.get('/stats', (req, res) => {
  res.json({ message: 'User statistics endpoint' });
});

export default router;
EOF

  # Create Dockerfile for backend
  cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
EOF

  cd ..
  log_success "Backend setup completed"
}

# Initialize frontend (React + TypeScript)
setup_frontend() {
  log_info "Setting up React frontend..."

  cd frontend

  # Initialize package.json
  cat > package.json << 'EOF'
{
  "name": "quest-board-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
EOF

  # Create Vite config
  cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
EOF

  # Create TypeScript config
  cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

  cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

  # Create Tailwind config
  cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

  cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

  # Create basic React app structure
  cat > public/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quest Board</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

  cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

  cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

  cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 py-6">
              Quest Board
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<div>Welcome to Quest Board!</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
EOF

  # Create Dockerfile for frontend
  cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
EOF

  cd ..
  log_success "Frontend setup completed"
}

# Create Docker Compose for development
create_docker_compose() {
  log_info "Creating Docker Compose configuration..."

  cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=file:./dev.db
      - NODE_ENV=development
      - JWT_SECRET=dev-secret-key
      - ALLOWED_ORIGINS=http://localhost:3000
    command: npm run dev

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
    command: npm run dev
EOF

  log_success "Docker Compose configuration created"
}

# Create development scripts
create_scripts() {
  log_info "Creating development scripts..."

  cat > scripts/start-dev.sh << 'EOF'
#!/usr/bin/env bash

# Start development environment
set -euo pipefail

echo "Starting Quest Board development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start services
docker-compose up --build

echo "Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Health Check: http://localhost:8000/health"
EOF

  cat > scripts/run-tests.sh << 'EOF'
#!/usr/bin/env bash

# Run all tests
set -euo pipefail

echo "Running tests..."

# Backend tests
echo "Running backend tests..."
cd backend
npm test

# Frontend tests
echo "Running frontend tests..."
cd ../frontend
npm test

echo "All tests completed!"
EOF

  cat > scripts/setup-db.sh << 'EOF'
#!/usr/bin/env bash

# Setup database
set -euo pipefail

echo "Setting up database..."

cd backend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate dev

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Database setup completed!"
EOF

  # Make scripts executable
  chmod +x scripts/start-dev.sh
  chmod +x scripts/run-tests.sh
  chmod +x scripts/setup-db.sh

  log_success "Development scripts created"
}

# Create .gitignore
create_gitignore() {
  log_info "Creating .gitignore..."

  cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite3
prisma/migrations/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.egg-info/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# TypeScript
*.tsbuildinfo
EOF

  log_success ".gitignore created"
}

# Create README
create_readme() {
  log_info "Creating README..."

  cat > README.md << 'EOF'
# Quest Board - Chore Management Website

A gamified chore management system that turns household tasks into quests with bounties.

## Features

- **Quest Management**: Create, claim, and complete quests
- **Role-Based Access**: Admin, Editor, and Player roles
- **Google OAuth2**: Secure authentication
- **Quest Lifecycle**: Complete workflow from creation to approval
- **User Dashboard**: Track progress and earnings

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quest-board
   ```

2. Run the setup script:
   ```bash
   ./scripts/setup.sh
   ```

3. Set up the database:
   ```bash
   ./scripts/setup-db.sh
   ```

4. Start the development environment:
   ```bash
   ./scripts/start-dev.sh
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Health Check: http://localhost:8000/health

## Project Structure

- `backend/` - Express.js backend application
- `frontend/` - React frontend application
- `docs/` - Project documentation
- `scripts/` - Development and deployment scripts

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Management

```bash
cd backend
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

### Running Tests

```bash
./scripts/run-tests.sh
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [MVP Plan](docs/MVP_PLAN.md) - Development roadmap
- [API Documentation](docs/API_DOCUMENTATION.md) - API endpoints and usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

[Add your license here]
EOF

  log_success "README created"
}

# Main execution
main() {
  log_info "Starting Quest Board MVP setup..."

  check_prerequisites
  create_directory_structure
  setup_backend
  setup_frontend
  create_docker_compose
  create_scripts
  create_gitignore
  create_readme

  log_success "Quest Board MVP setup completed!"
  log_info ""
  log_info "Next steps:"
  log_info "1. Configure Google OAuth2 credentials"
  log_info "2. Set up environment variables"
  log_info "3. Run './scripts/setup-db.sh' to set up the database"
  log_info "4. Run './scripts/start-dev.sh' to start development"
  log_info "5. Check the documentation in docs/ for more details"
}

# Run main function
main "$@"
