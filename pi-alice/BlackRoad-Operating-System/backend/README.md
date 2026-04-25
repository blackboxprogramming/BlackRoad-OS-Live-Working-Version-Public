# BlackRoad Operating System - Backend API

A comprehensive FastAPI backend for the BlackRoad Operating System, a Windows 95-inspired web operating system with modern features.

## Features

### Core Services
- **Authentication** - JWT-based user authentication and authorization
- **RoadMail** - Full-featured email system with folders and attachments
- **BlackRoad Social** - Social media platform with posts, comments, likes, and follows
- **BlackStream** - Video streaming service with views and engagement tracking
- **File Storage** - File explorer with folder management and sharing
- **RoadCoin Blockchain** - Cryptocurrency with mining, transactions, and wallet management
- **AI Chat** - Conversational AI assistant with conversation history
- **Chaos Inbox / Identity / Notifications / Creator / Compliance** - New v0.2 APIs for capture, profiles, alerts, creative projects, and audit visibility

### New v0.2 endpoints
- `/api/capture/*` — capture items, clustering, status and tagging
- `/api/identity/profile` — canonical user profile for OS apps
- `/api/notifications` — create/list/mark notifications
- `/api/creator/projects` — manage creator projects and assets
- `/api/compliance/events` — surface audit events
- `/api/search?q=` — unified search scaffold

### Technology Stack
- **FastAPI** - Modern, fast Python web framework
- **PostgreSQL** - Primary database with async support
- **Redis** - Caching and session storage
- **SQLAlchemy** - ORM with async support
- **JWT** - Secure authentication
- **Docker** - Containerization and deployment

## Quick Start

> The desktop UI is bundled in `backend/static/index.html` and is served by the
> FastAPI app at `http://localhost:8000/`.

### Prerequisites
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Adminer**: http://localhost:8080

#### Option 2: Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start PostgreSQL and Redis (using Docker)
docker run -d -p 5432:5432 -e POSTGRES_USER=blackroad -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blackroad_db postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Run the application (serves backend/static/index.html at /)
# Run the application (PORT defaults to 8000 if unset)
python run.py
```

After either setup option finishes booting, browse to
`http://localhost:8000/` to load the Windows 95 desktop that lives in
`backend/static/index.html`. The API is available at `/api/*` from the same
server, so no extra reverse proxying is required for local or hosted (Railway,
GoDaddy, etc.) deployments.

### Configuration

Edit the `.env` file to configure:

```env
# Database
DATABASE_URL=postgresql://blackroad:password@localhost:5432/blackroad_db
DATABASE_ASYNC_URL=postgresql+asyncpg://blackroad:password@localhost:5432/blackroad_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Secret (CHANGE THIS!)
SECRET_KEY=your-very-secret-key-change-this-in-production

# CORS (Add your frontend URLs)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# OpenAI (for AI Chat)
OPENAI_API_KEY=your-openai-api-key
```

## API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Email (RoadMail) Endpoints

```http
GET    /api/email/folders
GET    /api/email/inbox
GET    /api/email/sent
POST   /api/email/send
GET    /api/email/{email_id}
DELETE /api/email/{email_id}
```

### Social Media Endpoints

```http
GET  /api/social/feed
POST /api/social/posts
POST /api/social/posts/{post_id}/like
GET  /api/social/posts/{post_id}/comments
POST /api/social/posts/{post_id}/comments
POST /api/social/users/{user_id}/follow
```

### Video Streaming Endpoints

```http
GET  /api/videos
POST /api/videos
GET  /api/videos/{video_id}
POST /api/videos/{video_id}/like
```

### File Storage Endpoints

```http
GET    /api/files/folders
POST   /api/files/folders
GET    /api/files
POST   /api/files/upload
GET    /api/files/{file_id}
DELETE /api/files/{file_id}
POST   /api/files/{file_id}/share
```

### Blockchain Endpoints

```http
GET  /api/blockchain/wallet
GET  /api/blockchain/balance
POST /api/blockchain/transactions
GET  /api/blockchain/transactions
GET  /api/blockchain/transactions/{tx_hash}
GET  /api/blockchain/blocks
GET  /api/blockchain/blocks/{block_id}
POST /api/blockchain/mine
GET  /api/blockchain/stats
```

### AI Chat Endpoints

```http
GET    /api/ai-chat/conversations
POST   /api/ai-chat/conversations
GET    /api/ai-chat/conversations/{id}
GET    /api/ai-chat/conversations/{id}/messages
POST   /api/ai-chat/conversations/{id}/messages
DELETE /api/ai-chat/conversations/{id}
```

## Database Schema

The backend uses PostgreSQL with the following main tables:

- `users` - User accounts with authentication and wallet info
- `emails` - Email messages
- `email_folders` - Email folder organization
- `posts` - Social media posts
- `comments` - Post comments
- `likes` - Like tracking
- `follows` - Follow relationships
- `videos` - Video metadata
- `video_views` - Video view tracking
- `video_likes` - Video engagement
- `files` - File metadata
- `folders` - Folder structure
- `blocks` - Blockchain blocks
- `transactions` - Blockchain transactions
- `wallets` - User wallets
- `conversations` - AI chat conversations
- `messages` - AI chat messages

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## Deployment

### Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False`
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure proper CORS origins
- [ ] Use strong database passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure AWS S3 for file storage
- [ ] Set up proper logging
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

### Docker Production Deployment

```bash
# Build production image
docker build -t blackroad-backend:latest .

# Run with production settings
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/blackroad \
  -e SECRET_KEY=your-production-secret \
  -e ENVIRONMENT=production \
  -e DEBUG=False \
  blackroad-backend:latest
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/JS)                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     FastAPI Backend                      │
├─────────────────────────────────────────────────────────┤
│  Routers:                                                │
│  • Authentication    • Email        • Social             │
│  • Videos           • Files        • Blockchain          │
│  • AI Chat                                               │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
┌───────────────────────┐   ┌──────────────────┐
│   PostgreSQL DB       │   │   Redis Cache    │
│   • User data         │   │   • Sessions     │
│   • Emails            │   │   • API cache    │
│   • Posts             │   │   • Rate limits  │
│   • Files metadata    │   └──────────────────┘
│   • Blockchain        │
│   • Conversations     │
└───────────────────────┘
```

## Security

- **Authentication**: JWT tokens with expiration
- **Password Hashing**: bcrypt with salt
- **Input Validation**: Pydantic schemas
- **SQL Injection**: SQLAlchemy ORM protection
- **CORS**: Configurable origins
- **Rate Limiting**: Redis-based (TODO)

## Performance

- **Async/Await**: Full async support with asyncio
- **Connection Pooling**: SQLAlchemy and Redis pools
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries with indexes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues
- Documentation: /api/docs
