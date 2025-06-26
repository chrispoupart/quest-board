# Project Structure Template

```text
quest-board/
├── backend/                          # Express.js backend
│   ├── src/
│   │   ├── index.ts                  # Express application entry point
│   │   ├── config.ts                 # Configuration settings
│   │   ├── database.ts               # Database connection and Prisma client
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.ts               # Authentication middleware
│   │   │   ├── cors.ts               # CORS configuration
│   │   │   ├── errorHandler.ts       # Error handling middleware
│   │   │   └── validation.ts         # Request validation middleware
│   │   ├── routes/                   # Express routes
│   │   │   ├── auth.ts               # Authentication routes
│   │   │   ├── users.ts              # User management routes
│   │   │   ├── quests.ts             # Quest management routes
│   │   │   └── dashboard.ts          # Dashboard routes
│   │   ├── controllers/              # Route controllers
│   │   │   ├── authController.ts     # Authentication logic
│   │   │   ├── userController.ts     # User management logic
│   │   │   ├── questController.ts    # Quest management logic
│   │   │   └── dashboardController.ts # Dashboard logic
│   │   ├── services/                 # Business logic services
│   │   │   ├── authService.ts        # Authentication service
│   │   │   ├── userService.ts        # User management service
│   │   │   ├── questService.ts       # Quest management service
│   │   │   └── backgroundService.ts  # Background job service
│   │   ├── models/                   # Prisma schema and types
│   │   │   ├── schema.prisma         # Prisma database schema
│   │   │   └── types.ts              # TypeScript type definitions
│   │   ├── utils/                    # Utility functions
│   │   │   ├── jwt.ts                # JWT token utilities
│   │   │   ├── validation.ts         # Validation utilities
│   │   │   └── helpers.ts            # General helper functions
│   │   └── types/                    # TypeScript type definitions
│   │       ├── auth.ts               # Authentication types
│   │       ├── user.ts               # User types
│   │       ├── quest.ts              # Quest types
│   │       └── api.ts                # API response types
│   ├── prisma/                       # Database migrations and seeds
│   │   ├── migrations/               # Prisma migrations
│   │   └── seed.ts                   # Database seed script
│   ├── tests/                        # Backend tests
│   │   ├── auth.test.ts              # Authentication tests
│   │   ├── users.test.ts             # User management tests
│   │   ├── quests.test.ts            # Quest management tests
│   │   └── dashboard.test.ts         # Dashboard tests
│   ├── package.json                  # Node.js dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── jest.config.js                # Jest testing configuration
│   ├── .env.example                  # Environment variables template
│   └── Dockerfile                    # Backend container
├── frontend/                         # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── common/               # Common UI components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── auth/                 # Authentication components
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── UserContext.tsx
│   │   │   ├── quests/               # Quest-related components
│   │   │   │   ├── QuestBoard.tsx
│   │   │   │   ├── QuestCard.tsx
│   │   │   │   ├── QuestDetail.tsx
│   │   │   │   ├── QuestForm.tsx
│   │   │   │   └── QuestActions.tsx
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   │   ├── UserDashboard.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   └── QuestList.tsx
│   │   │   └── admin/                # Admin components
│   │   │       ├── AdminPanel.tsx
│   │   │       ├── UserManagement.tsx
│   │   │       └── ApprovalQueue.tsx
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── QuestBoardPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useQuests.ts
│   │   │   └── useApi.ts
│   │   ├── services/                 # API service functions
│   │   │   ├── api.ts                # Base API configuration
│   │   │   ├── authService.ts
│   │   │   ├── questService.ts
│   │   │   └── userService.ts
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── user.ts
│   │   │   ├── quest.ts
│   │   │   └── api.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── App.tsx                   # Main App component
│   │   ├── index.tsx                 # React entry point
│   │   └── main.tsx                  # Vite entry point
│   ├── package.json                  # Node.js dependencies
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── Dockerfile                    # Frontend container
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System architecture
│   ├── MVP_PLAN.md                   # MVP development plan
│   ├── API_DOCUMENTATION.md          # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── DEVELOPMENT.md                # Development setup guide
├── scripts/                          # Development scripts
│   ├── setup.sh                      # Initial project setup
│   ├── start-dev.sh                  # Start development environment
│   ├── run-tests.sh                  # Run all tests
│   └── deploy.sh                     # Deployment script
├── .github/                          # GitHub Actions CI/CD
│   └── workflows/
│       ├── ci.yml                    # Continuous integration
│       └── deploy.yml                # Deployment workflow
├── .gitignore                        # Git ignore rules
├── README.md                         # Project overview
└── docker-compose.yml                # Full stack development environment
```

## Key Development Principles

### Backend (Express.js + TypeScript)

- **Modular Structure**: Separate concerns into modules (routes, controllers, services)
- **Type Safety**: Full TypeScript coverage with strict mode
- **Database**: Prisma ORM with migrations and type generation
- **Testing**: Jest with supertest for API testing
- **Middleware**: Express middleware for authentication, validation, and error handling

### Frontend (React + TypeScript)

- **Component-Based**: Reusable, composable components
- **Type Safety**: Full TypeScript coverage
- **State Management**: Context API for global state, local state for components
- **API Integration**: Centralized service layer
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Development Workflow

- **Environment Consistency**: Docker containers for development
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
- **Testing**: Automated testing at multiple levels
- **Documentation**: Comprehensive API and user documentation
