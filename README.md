# TaskFlow Pro

A modern kanban board for managing tasks and projects with drag-and-drop functionality.

## Features

- User authentication with secure JWT tokens
- Create and manage multiple boards
- Three-column workflow (To Do, In Progress, Done)
- Drag-and-drop task reordering
- Share boards with team members
- Clean, responsive UI

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with HttpOnly cookies

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)

### Quick Start with Docker

1. Clone the repository
   ```bash
   git clone https://github.com/TEMPLAR-007/taskflow-pro.git
   cd taskflow-pro
   ```

2. Start all services
   ```bash
   docker-compose up -d
   ```

3. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

4. Test credentials
   ```
   Email: test@example.com
   Password: password123
   ```

### Local Development

#### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

Environment variables (create `.env` file):
```
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Environment variables (create `.env.local` file):
```
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Project Structure

```
taskflow-pro/
├── frontend/          # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # Utilities
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # Authentication
│   │   ├── boards/    # Board management
│   │   ├── tasks/     # Task operations
│   │   └── columns/   # Column operations
│   └── prisma/        # Database schema
└── docker-compose.yml # Docker setup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Boards
- `GET /api/boards` - List all boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/share` - Share board with user

### Tasks
- `POST /api/columns/:id/tasks` - Create task
- `PATCH /api/tasks/:id/move` - Move task
- `DELETE /api/tasks/:id` - Delete task

## Database Schema

The application uses PostgreSQL with Prisma ORM. Main entities:

- **User**: Authentication and user data
- **Board**: Project boards
- **BoardMember**: Board access control
- **Column**: Kanban columns (To Do, In Progress, Done)
- **Task**: Individual tasks with position ordering

## Deployment

### Docker Production

Build and run with production settings:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: Railway, Render, Supabase

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.
