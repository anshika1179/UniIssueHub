# Deployment Strategy

## Overview
The application will be containerized using Docker and deployed with a CI/CD pipeline via GitHub Actions.

## Environments

| Environment | Purpose | URL (planned) |
|---|---|---|
| Development | Local development | http://localhost:5173 (client), http://localhost:5000 (server) |
| Staging | Pre-production testing | TBD |
| Production | Live application | TBD |

## Docker Setup

### Planned Containers
1. **client** — React app served via Nginx
2. **server** — Node.js/Express API
3. **mongodb** — MongoDB database
4. **nginx** — Reverse proxy (production)

### Docker Compose Structure (Planned)
```yaml
services:
  client:
    build: ./client
    ports: "5173:80"
  server:
    build: ./server
    ports: "5000:5000"
    depends_on: mongodb
  mongodb:
    image: mongo:6
    ports: "27017:27017"
    volumes: mongo-data
  nginx:
    image: nginx:alpine
    ports: "80:80, 443:443"
    depends_on: client, server
```

## CI/CD Pipeline (GitHub Actions)

### Planned Workflows

#### 1. CI — On Pull Request
- Checkout code
- Install dependencies
- Run linting (ESLint)
- Run unit tests (Jest)
- Run integration tests (Supertest)
- Build client and server
- Report test coverage

#### 2. CD — On Push to Main
- All CI steps
- Build Docker images
- Push to container registry
- Deploy to staging
- Run smoke tests
- Manual approval for production
- Deploy to production

## Hosting Options (Under Evaluation)

| Option | Frontend | Backend | Database |
|---|---|---|---|
| Option A | Vercel | Railway/Render | MongoDB Atlas |
| Option B | Netlify | Railway/Render | MongoDB Atlas |
| Option C | VPS (DigitalOcean/AWS EC2) | Same VPS | MongoDB Atlas or self-hosted |
| Option D | AWS S3 + CloudFront | AWS ECS/EC2 | MongoDB Atlas |

### Recommended Initial Setup
- **Frontend**: Vercel (free tier, excellent React support)
- **Backend**: Render or Railway (free tier for MVP)
- **Database**: MongoDB Atlas (free M0 cluster for development)

## Production Checklist (Planned)

### Server Configuration
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Enable Helmet security headers
- [ ] Set up rate limiting
- [ ] Configure MongoDB connection pooling
- [ ] Set up structured logging
- [ ] Configure file upload storage (cloud storage in production)
- [ ] Set up health check endpoint

### Security
- [ ] Use HTTPS everywhere
- [ ] Set secure cookie flags
- [ ] Rotate JWT secrets
- [ ] Set up MongoDB authentication
- [ ] Configure firewall rules
- [ ] Enable CORS whitelist
- [ ] Set up DDoS protection

### Monitoring (Future)
- [ ] Application logging (Winston/Morgan)
- [ ] Error tracking (Sentry - optional)
- [ ] Uptime monitoring
- [ ] Database monitoring (MongoDB Atlas built-in)
- [ ] Performance metrics

### Backup Strategy
- MongoDB Atlas automated backups
- Daily database snapshots
- File upload backup to cloud storage

## Domain & SSL
- Domain: TBD
- SSL: Let's Encrypt (auto-renewal) or cloud provider managed

## Scaling Strategy (Future)
- Horizontal scaling of API servers behind load balancer
- MongoDB replica set for read scaling
- Redis for caching and session storage
- CDN for static assets
- WebSocket scaling with Redis adapter for Socket.IO
