# MVP Development Plan: Chore-Management Website

## Overview

This document outlines the development plan for the MVP (Minimum Viable Product)
of the chore-management website based on the architecture defined in
`ARCHITECTURE.md`. The MVP will focus on core functionality while maintaining a
solid foundation for future enhancements.

## MVP Scope Definition

### Core Features (MVP)

1. **User Authentication** - Google OAuth2 integration ✅ (frontend & backend complete)
2. **Quest Management** - Create, view, claim, complete quests
3. **Basic RBAC** - Admin, Editor, Player roles
4. **Quest Lifecycle** - Claim → Complete → Approve workflow
5. **User Dashboard** - Basic stats and current quests
6. **Claim Expiry** - 48-hour timeout mechanism

### Out of Scope (Future Versions)

- Email notifications
- Leaderboards
- Mobile app
- Payment integration
- Advanced gamification features

## Development Phases

### Phase 1: Project Setup & Foundation (Week 1) ✅ COMPLETED

**Duration:** 1 week **Goal:** Establish development environment and basic
project structure

#### Tasks

1. **Project Initialization** ✅
   - Set up repository structure ✅
   - Initialize backend (Express.js) and frontend (React) projects ✅
   - Configure development environment (Docker, linting, testing) ✅
   - Set up CI/CD pipeline basics ✅

2. **Database Design & Setup** ✅
   - Create SQLite database schema ✅
   - Implement database migrations ✅
   - Set up ORM (Prisma with Express.js) ✅
   - Create initial seed data ✅

3. **Authentication Foundation** ✅
   - Set up Google OAuth2 configuration ✅
   - Implement JWT token management ✅
   - Create basic user model and authentication middleware ✅

#### Deliverables ✅

- Working development environment ✅
- Database schema and migrations ✅
- Basic authentication flow ✅
- Project documentation ✅

#### Technical Stack Decisions ✅

- **Backend:** Express.js + Prisma + SQLite ✅
- **Frontend:** React + TypeScript + Vite ✅
- **Authentication:** Google OAuth2 + JWT ✅
- **Styling:** Tailwind CSS ✅
- **State Management:** React Context or Zustand ✅

### Phase 2: Backend API Development (Week 2-3) ✅ COMPLETED

**Duration:** 2 weeks **Goal:** Complete backend API with all core endpoints

#### Phase 2 Tasks

1. **User Management API** ✅
   - User CRUD operations ✅
   - Role-based access control middleware ✅
   - User profile management ✅

2. **Quest Management API** ✅
   - Quest CRUD operations ✅
   - Quest claiming logic ✅
   - Quest completion workflow ✅
   - Approval system ✅

3. **Dashboard API** ✅
   - User statistics endpoint ✅
   - Quest listing with filters ✅
   - Bounty calculation ✅

4. **Scheduled Jobs** ✅
   - Quest claim expiry job (48-hour timeout) ✅
   - Background task scheduling ✅

#### Phase 2 Deliverables

- Complete REST API with all endpoints ✅
- RBAC implementation ✅
- Background job system ✅
- API documentation (OpenAPI/Swagger) ⏳
- Unit tests for core functionality ⏳

#### API Endpoints (MVP)

```text
Authentication:
- POST /auth/google - Google OAuth2 login ✅
- POST /auth/refresh - Refresh JWT token ✅
- POST /auth/logout - Logout ✅

Users:
- GET /users/me - Get current user profile ✅
- PUT /users/me - Update user profile ✅
- GET /users - List users (admin only) ✅

Quests:
- GET /quests - List all quests ✅
- GET /quests/:id - Get quest details ✅
- POST /quests - Create quest (admin/editor) ✅
- PUT /quests/:id - Update quest (admin/editor) ✅
- DELETE /quests/:id - Delete quest (admin only) ✅
- POST /quests/:id/claim - Claim quest ✅
- POST /quests/:id/complete - Mark quest as completed ✅
- POST /quests/:id/approve - Approve quest completion (admin/editor) ✅
- POST /quests/:id/reject - Reject quest completion (admin/editor) ✅

Dashboard:
- GET /dashboard - User dashboard data ✅
- GET /dashboard/stats - User statistics ✅
```

### ✅ Phase 2 Complete! All backend API endpoints and background jobs are implemented and working

### ✅ Phase 3 Complete! Full frontend implementation with medieval fantasy theming

1. **Authentication UI** - Login/logout components, protected routes, user context ✅
2. **Quest Board Interface** - Quest listing, detail view, claim/complete actions ✅
3. **Admin/Editor Interface** - Quest creation/editing, approval workflow, user management ✅
4. **User Dashboard** - Personal statistics, current quests, bounty balance ✅
5. **Responsive Design** - Mobile-friendly layout, accessibility compliance ✅

### 🎯 Next Phase: Testing & Polish (Phase 4)

Current priorities for Phase 4 completion:

1. **Unit Tests** - Backend API endpoint testing ⏳
2. **Integration Tests** - Full stack workflow testing ⏳
3. **Performance Optimization** - API response times, bundle size ⏳
4. **Bug Fixes & Polish** - Edge cases, error handling improvements ⏳
5. **Security Review** - Authentication, authorization, input validation ⏳

### Phase 3: Frontend Development (Week 4-6) ✅ COMPLETED

**Duration:** 3 weeks **Goal:** Complete user interface with all core features

#### Phase 3 Tasks

1. **Authentication UI** ✅
   - Login/logout components ✅
   - Protected route wrapper ✅
   - User context management ✅

2. **Quest Board Interface** ✅
   - Quest listing with filters ✅
   - Quest detail view ✅
   - Claim/complete quest actions ✅
   - Quest status indicators ✅

3. **Admin/Editor Interface** ✅
   - Quest creation/editing forms ✅
   - Approval workflow interface ✅
   - User management (admin only) ✅

4. **User Dashboard** ✅
   - Personal statistics display ✅
   - Current quests overview ✅
   - Bounty balance display ✅

5. **Responsive Design** ⏳
   - Mobile-friendly layout ⏳
   - Cross-browser compatibility ⏳
   - Accessibility compliance ⏳

#### Phase 3 Deliverables

- Complete React application ✅
- Responsive UI components ✅
- State management implementation ✅
- User experience testing ✅
- Component library documentation ⏳

#### Key Components

```text
Authentication:
- LoginPage ✅
- ProtectedRoute ✅
- UserContext ✅

Quest Management:
- QuestBoard ✅
- QuestCard ✅
- QuestDetail ✅
- QuestForm ✅
- QuestActions ✅

Dashboard:
- UserDashboard ✅
- StatsCard ✅
- QuestList ✅

Admin:
- AdminPanel ✅
- UserManagement ✅
- ApprovalQueue ✅

Common:
- Header ✅
- Navigation ✅
- LoadingSpinner ✅
- ErrorBoundary ✅
```

### Phase 4: Integration & Testing (Week 7) ⏳ IN PROGRESS

**Duration:** 1 week **Goal:** Integrate frontend and backend, comprehensive
testing

#### Phase 4 Tasks

1. **Full Stack Integration** ✅
   - Connect frontend to backend API ✅
   - Handle authentication flow ✅
   - Implement error handling ✅
   - Optimize API calls ✅

2. **Testing** ⏳
   - Unit tests for both frontend and backend ⏳
   - Integration tests for API endpoints ⏳
   - End-to-end testing with Cypress ⏳
   - Performance testing ⏳

3. **Bug Fixes & Polish** ⏳
   - Fix integration issues ⏳
   - Improve error messages ⏳
   - Optimize performance ⏳
   - Security review ⏳

#### Phase 4 Deliverables

- Fully integrated application
- Comprehensive test suite
- Performance benchmarks
- Security audit report

### Phase 5: Deployment & Documentation (Week 8) ⏳ PENDING

**Duration:** 1 week **Goal:** Deploy MVP and create user documentation

#### Phase 5 Tasks

1. **Deployment Setup** ⏳
   - Docker containerization ⏳
   - Environment configuration ⏳
   - Production database setup ⏳
   - CI/CD pipeline completion ⏳

2. **Documentation** ⏳
   - User manual ⏳
   - API documentation ⏳
   - Deployment guide ⏳
   - Development setup guide ⏳

3. **Final Testing** ⏳
   - Production environment testing ⏳
   - User acceptance testing ⏳
   - Performance validation ⏳

#### Phase 5 Deliverables

- Deployed MVP application
- Complete documentation
- Deployment scripts
- User training materials

## Technical Implementation Details

### Database Schema (MVP) ✅ COMPLETED

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'player', -- 'admin', 'editor', 'player'
    bounty_balance REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests table
CREATE TABLE quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    bounty REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'claimed', 'completed', 'approved', 'rejected'
    created_by INTEGER NOT NULL,
    claimed_by INTEGER,
    claimed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (claimed_by) REFERENCES users(id)
);

-- Approvals table
CREATE TABLE approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_id INTEGER NOT NULL,
    approved_by INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'approved', 'rejected'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quest_id) REFERENCES quests(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

### Security Considerations

1. **Authentication**
   - JWT tokens with appropriate expiration
   - Secure cookie storage
   - CSRF protection

2. **Authorization**
   - Role-based middleware on all protected endpoints
   - Input validation and sanitization
   - SQL injection prevention

3. **Data Protection**
   - HTTPS enforcement
   - Sensitive data encryption
   - Rate limiting

### Performance Considerations

1. **Database**
   - Proper indexing on frequently queried fields
   - Query optimization
   - Connection pooling

2. **Frontend**
   - Code splitting
   - Lazy loading
   - Caching strategies

3. **API**
   - Pagination for large datasets
   - Response caching
   - Background job optimization

## Risk Assessment & Mitigation

### High Risk

- **Google OAuth2 Integration Complexity**
  - Mitigation: Start with simple OAuth flow, add complexity incrementally

- **Real-time Quest Status Updates**
  - Mitigation: Use polling initially, implement WebSockets in future versions

### Medium Risk

- **Role-based Access Control Implementation**
  - Mitigation: Thorough testing of all role combinations

- **Background Job Reliability**
  - Mitigation: Implement job retry logic and monitoring

### Low Risk

- **UI/UX Design**
  - Mitigation: Use established design patterns and component libraries

## Success Criteria

### Functional Requirements

- [x] Users can authenticate via Google OAuth2
- [x] Admins/editors can create and manage quests
- [x] Players can claim and complete quests
- [x] Quest approval workflow functions correctly
- [x] 48-hour claim expiry works automatically
- [x] User dashboard displays accurate statistics

### Non-Functional Requirements

- [ ] Application loads in under 3 seconds
- [ ] API response time under 500ms
- [ ] 99% uptime during MVP testing
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)

## Post-MVP Roadmap

### Version 1.1 (Month 3)

- Email notifications
- Quest categories and tags
- Advanced search and filtering

### Version 1.2 (Month 4)

- Leaderboards and achievements
- Quest templates
- Bulk operations

### Version 2.0 (Month 6)

- Mobile app
- Real-time notifications
- Payment integration

## Current Status & Next Steps

### ✅ MAJOR MILESTONE: MVP Core Features Complete!

**Completed Phases:**

- **Phase 1:** Project Setup & Foundation ✅
- **Phase 2:** Complete Backend API Development ✅
- **Phase 3:** Full Frontend Implementation ✅

**Key Achievements:**

- Full-stack medieval fantasy themed Quest Board application ✅
- Google OAuth2 authentication with JWT tokens ✅
- Complete quest lifecycle: Create → Claim → Complete → Approve ✅
- Role-based access control (Admin/Editor/Player) ✅
- Real-time quest management with proper UX flows ✅
- Admin interface for user and quest management ✅
- User dashboard with statistics and quest tracking ✅
- Background job system for quest claim expiry ✅

### 🎯 Current Focus: Testing & Polish (Phase 4)

**Immediate Priority Tasks:**

1. **Unit Tests** - Backend API endpoint testing
2. **Integration Tests** - Full stack workflow testing
3. **Performance Optimization** - Bundle size, API response times
4. **Security Review** - Authentication, authorization validation
5. **Bug Fixes & Polish** - Edge cases and error handling

### Future features

1. Quests assined to specific users. Other users will not see the quest if it is
   not assigned to them.
2. Ability to copy quest, at which point you then edit them.
3. UI improvement - when editing a quest, open in a new modal window instead of
   at the top of the page.
4. Users can post their own quests, using their own bounty points. The bounty
   points go into "escrow" until the quest is completed or until it is
   cancelled. When completed, the points are transfered to the person completing
   the quest, when cancelled, the points go back to the person who posted the
   quest.
5. Favicon, and "save to desktop" icons. ✅
6. Make the login screen use the same css as the rest of the site. ✅
7. Have a "dark" theme. Make it optional, or match the OSes settings. ✅
8. Have push notifications.
9. Add the option to add a timer to quests.
10. Database backups (automatic snapshots)
11. "Challenges", where all bounty earned during a period of time goes towards a
    family reward (such as a trip to an escape room, movie, arcade, museum, etc). The user also gets the equivalent bouncy in their own pool, so this doesn't divert their bounty -- it doubles it.
12. Completed Quest section does not include "repeatable" quests. ✅
13. Add a leaderboard
