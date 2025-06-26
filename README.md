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
