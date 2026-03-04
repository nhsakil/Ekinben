# KINBEN Platform - Deployment & Operations Guide

**Status**: Production Ready
**Version**: Phase 8 Complete
**Last Updated**: March 2026

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Error Monitoring Setup](#error-monitoring-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] Code coverage >80%: `npm run test:coverage`
- [ ] No console.log in production code
- [ ] No hardcoded secrets
- [ ] All environment variables documented

### Security
- [ ] Database has parameterized queries
- [ ] Input validation on all endpoints
- [ ] Security headers configured (Helmet.js)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] JWT secrets are strong and unique
- [ ] Sensitive data never logged

### Performance
- [ ] Database indexes applied (27 total)
- [ ] Caching configured and tested
- [ ] Load tests passed (>99% success rate)
- [ ] Response times < 100ms target
- [ ] Compression enabled

### Documentation
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Runbooks created for common tasks
- [ ] README updated

### Infrastructure
- [ ] Database backups configured
- [ ] SSL/TLS certificates ready
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Error tracking configured

---

## 🏠 Local Development Setup

### Prerequisites

**System Requirements**:
- Node.js 18+ (`node --version`)
- PostgreSQL 15+ (`psql --version`)
- Git (`git --version`)
- npm 9+ (`npm --version`)

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd Ekinben
cd kinben-backend
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup PostgreSQL**

**On macOS (homebrew)**:
```bash
brew install postgresql
brew services start postgresql
createuser postgres
createdb kinben_ecommerce
```

**On Linux (Ubuntu)**:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb kinben_ecommerce
```

**On Windows**:
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Keep default port 5432

**4. Create .env File**
```bash
cp .env.example .env
```

**Edit .env** with your local settings:
```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kinben_ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

**5. Initialize Database**
```bash
psql -U postgres -d kinben_ecommerce -f src/migrations/001_create_tables.sql
psql -U postgres -d kinben_ecommerce -f src/migrations/003_database_optimization.sql
```

**6. Start Development Server**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Running Tests Locally

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# Load testing
npm run test:load
```

---

## 🚀 Production Deployment

### Option 1: Railway.app (Recommended - FREE TIER)

**Benefits**:
- Free tier for up to $5/month usage
- PostgreSQL included
- GitHub auto-deploy
- Custom domain support
- Zero configuration

**Setup Steps**:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project

2. **Connect Repository**
   - Select "Deploy from GitHub"
   - Authorize Railway
   - Select Ekinben repository

3. **Add PostgreSQL**
   - Click "Add Service"
   - Select PostgreSQL
   - Railway creates database automatically

4. **Configure Environment**
   - Go to project variables
   - Add from `.env.example`:
     ```
     DB_HOST=[Railway provides]
     DB_PORT=[Railway provides]
     DB_NAME=kinben_ecommerce
     DB_USER=[Railway provides]
     DB_PASSWORD=[Railway provides]
     JWT_SECRET=[Generate secure key]
     NODE_ENV=production
     CORS_ORIGIN=[Your frontend URL]
     ```

5. **Deploy**
   - Push to main branch
   - Railway auto-deploys
   - View logs in dashboard

**Cost**: Free tier is $5 credit/month (usually covered)

---

### Option 2: Render.com (Alternative - FREE TIER)

**Setup Steps**:

1. **Create Account at https://render.com**

2. **Create New Web Service**
   - Select "Build and deploy from GitHub"
   - Authorize and select repository
   - Set build command: `npm install && npm ci`
   - Set start command: `npm start`

3. **Add PostgreSQL Database**
   - Create new PostgreSQL instance
   - Connect to web service
   - Railway automatically sets DB variables

4. **Deploy**
   - Render auto-deploys on push to main
   - View logs and metrics in dashboard

**Cost**: Free tier available

---

### Option 3: AWS EC2 (Self-Hosted)

**Setup Steps**:

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS t2.micro (free tier eligible)
   - Security group: Allow 80, 443, 5000
   - Create key pair

2. **Connect via SSH**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PostgreSQL**
   ```bash
   sudo apt-get install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

5. **Deploy Application**
   ```bash
   cd /home/ubuntu
   git clone <repository>
   cd Ekinben/kinben-backend
   npm install
   npm start
   ```

6. **Setup PM2 for Auto-restart**
   ```bash
   npm install -g pm2
   pm2 start npm --name "kinben-api" -- start
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx as Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 4: DigitalOcean App Platform

**Simple 3-Step Setup**:

1. Create account at https://digitalocean.com
2. Create App → Connect GitHub → Select repository
3. DigitalOcean auto-detects Node.js + provisions database
4. Deploy!

**Cost**: Free tier available

---

## 🔍 Production Deployment Checklist

Before deploying to production:

**Database**:
- [ ] PostgreSQL running
- [ ] Backups configured
- [ ] All migrations applied
- [ ] Database user created with least privileges
- [ ] Connection pooling configured

**Environment**:
- [ ] NODE_ENV=production
- [ ] JWT_SECRET is strong (use `openssl rand -hex 32`)
- [ ] CORS_ORIGIN set to frontend URL
- [ ] LOG_LEVEL=info or error
- [ ] All secrets in environment variables

**Security**:
- [ ] SSL/TLS certificate installed
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Security headers active
- [ ] CORS properly restricted

**Monitoring**:
- [ ] Error tracking active (Sentry configured)
- [ ] Health check endpoint responsive
- [ ] Logs being collected
- [ ] Alerts configured
- [ ] Backups verified

**Performance**:
- [ ] All database indexes present
- [ ] Caching enabled
- [ ] Compression working
- [ ] Load test successful
- [ ] Response times verified

---

## 📊 Error Monitoring Setup (Sentry Free Tier)

### Sentry Configuration

**1. Create Sentry Account**
```
Go to: https://sentry.io
Sign up with GitHub (free tier)
Create new project: Node.js
```

**2. Get DSN**
- Sentry provides Data Source Name (DSN)
- Format: `https://[key]@[host]/[id]`
- Add to `.env`: `SENTRY_DSN=your-dsn`

**3. Install Sentry SDK**
```bash
npm install @sentry/node
```

**4. Integrate in app.js**
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ request: true, serverName: true })
  ]
});

// Add before routes
app.use(Sentry.Handlers.requestHandler());

// Add after routes
app.use(Sentry.Handlers.errorHandler());
```

**5. Test Sentry**
```javascript
// Test endpoint
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('Testing Sentry integration');
});

// Curl to test
curl http://localhost:5000/debug-sentry
```

### Sentry Free Tier Benefits
- 10,000 events/month free
- Error tracking
- Release tracking
- Performance monitoring
- Custom alerts
- 90-day data retention

---

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

**File Location**: `.github/workflows/ci-cd.yml` (Already created)

**Pipeline Stages**:
1. **Lint** - Code quality checks
2. **Security** - Dependency scanning
3. **Test** - Unit + integration tests
4. **Build** - Docker image creation
5. **Performance** - Load testing
6. **Deploy** - Production deployment
7. **Notify** - Slack notifications

**Configuration**:

**1. Add GitHub Secrets**
```
Settings → Secrets and variables → Actions

Required secrets:
- DEPLOY_KEY: SSH private key
- DEPLOY_HOST: Production server IP
- DEPLOY_USER: Deploy user
- SLACK_WEBHOOK: Slack webhook URL (optional)
```

**2. Trigger Pipeline**
- Pipeline runs automatically on `git push` to main
- Can manually trigger from Actions tab
- Automatic rollback on failure

**3. Monitor Pipeline**
- View logs in Actions tab
- Get notifications on success/failure
- Track deployment history

---

## 📈 Monitoring & Maintenance

### Daily Operations

**Health Checks**:
```bash
# Check API health
curl https://your-api.com/api/health

# Check database connection
curl https://your-api.com/api/health/db

# Check cache status
curl https://your-api.com/api/health/cache
```

**Log Monitoring**:
```bash
# View logs (Railway)
railway logs -n 100

# View logs (Render)
View in dashboard

# View logs (AWS EC2)
tail -f /var/log/pm2-kinben-api.log

# Structured logs (all)
Check ./logs/ directory for JSON logs
```

### Weekly Tasks

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify backups completed
- [ ] Update dependencies if needed
- [ ] Review security alerts

### Monthly Tasks

- [ ] Full system backup
- [ ] Test backup restoration
- [ ] Review usage metrics
- [ ] Update documentation
- [ ] Security audit
- [ ] Performance review

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: API returns 503 Service Unavailable

**Solution**:
```bash
# Check if service is running
ps aux | grep node
pm2 logs

# Restart service
pm2 restart kinben-api
# or
systemctl restart kinben

# Check logs
tail -f /var/log/kinben.log
```

**Issue**: Database connection errors

**Solution**:
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check network connectivity
netstat -tlnp | grep 5432
```

**Issue**: High response times

**Solution**:
```bash
# Check database queries
tail -f ./logs/info.log | grep "Database Query"

# Run load test to identify bottlenecks
npm run test:load

# Check cache hit rate
curl https://your-api.com/api/products -v | grep X-Cache

# Check memory usage
free -h
top -n 1 | head -20
```

**Issue**: Out of memory error

**Solution**:
```bash
# Increase V8 heap size
node --max-old-space-size=2048 src/server.js

# Or in package.json:
"start": "node --max-old-space-size=2048 src/server.js"

# Check memory leak
npm install -g clinic
clinic doctor -- npm start
```

**Issue**: Cannot connect to database

**Solution**:
```bash
# Verify DB credentials
cat .env | grep DB_

# Check if database exists
psql -U postgres -l | grep kinben_ecommerce

# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Create database if missing
createdb -U postgres kinben_ecommerce
```

---

## ↩️ Rollback Procedures

### Rollback to Previous Version

**Option 1: Git/GitHub**
```bash
# View deployment history
git log --oneline | head -10

# Rollback to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main
```

**Option 2: Database Backup**
```bash
# List backups
ls -la /backups/

# Restore from backup
pg_restore -d kinben_ecommerce /backups/kinben_2026-03-04.sql

# Or
psql -d kinben_ecommerce < /backups/kinben_2026-03-04.sql
```

**Option 3: Blue-Green Deployment**
```bash
# Keep two instances running
pm2 start npm --name "kinben-api-blue" -- start
pm2 start npm --name "kinben-api-green" -- start

# Switch via Nginx config
server {
    listen 80;
    location / {
        proxy_pass http://localhost:5000;  # Switch between blue/green
    }
}

# Reload Nginx
sudo nginx -s reload
```

---

## 📞 Support & Help

**Error Monitoring**: https://sentry.io
**CI/CD Status**: GitHub Actions tab
**Server Status**: Check health endpoint
**Database Status**: PostgreSQL logs
**Performance Metrics**: In-app cache statistics

**Common Commands**:
```bash
# Restart service
pm2 restart kinben-api

# Restart database
sudo systemctl restart postgresql

# View real-time logs
pm2 logs kinben-api --lines 100

# Health check
curl -v http://localhost:5000/api/health

# Database backup
pg_dump -U postgres kinben_ecommerce > backup_$(date +%Y%m%d).sql

# Run migrations
psql -U postgres -d kinben_ecommerce -f src/migrations/001_create_tables.sql
```

---

## 🎯 Production Checklist Summary

- ✅ All tests passing (Unit + Integration)
- ✅ Code coverage >80%
- ✅ Security headers configured
- ✅ Database optimized (27 indexes)
- ✅ Caching enabled
- ✅ Rate limiting active
- ✅ Error monitoring (Sentry) active
- ✅ CI/CD pipeline configured
- ✅ Backups automated
- ✅ Monitoring active
- ✅ Firewall configured
- ✅ SSL/TLS enabled
- ✅ Runbooks created

**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT

