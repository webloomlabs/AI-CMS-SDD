# Deployment Guide

This guide covers deploying the AI-Native CMS to various production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployments](#cloud-platform-deployments)
  - [AWS (EC2 + RDS)](#aws-ec2--rds)
  - [Google Cloud Platform](#google-cloud-platform)
  - [DigitalOcean](#digitalocean)
  - [Azure](#azure)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Scaling](#scaling)
- [Security Checklist](#security-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Docker and Docker Compose installed (for containerized deployment)
- [ ] PostgreSQL 15+ database (managed or self-hosted)
- [ ] Domain name with DNS configured
- [ ] SSL/TLS certificates (Let's Encrypt recommended)
- [ ] Google Gemini API key (for AI features)
- [ ] Server with minimum specs:
  - 2 vCPUs
  - 4GB RAM
  - 20GB storage
  - Ubuntu 20.04+ or similar Linux distribution

---

## Docker Deployment

### Quick Production Deployment

```bash
# 1. Clone repository
git clone <repository-url>
cd AI-CMS3

# 2. Create production environment file
cp .env.docker .env

# 3. Edit .env with production values
nano .env

# 4. Update critical values:
# - Set strong JWT_SECRET (min 32 characters)
# - Set strong DB_PASSWORD
# - Add GEMINI_API_KEY
# - Set production DATABASE_URL

# 5. Build and start services
docker-compose up -d --build

# 6. Check service health
docker-compose ps
docker-compose logs -f

# 7. Access application
# Frontend: http://your-domain:3000
# Backend: http://your-domain:3001
```

### Production Docker Compose

For production, modify `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ai-cms-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups  # Add backup mount
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ai-cms-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-cms-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      PORT: 3001
    volumes:
      - ./backend/uploads:/app/uploads
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - ai-cms-network
    # Don't expose port directly, use nginx reverse proxy
    expose:
      - "3001"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ai-cms-frontend
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ai-cms-network
    # Don't expose port directly, use nginx reverse proxy
    expose:
      - "80"

  # Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: ai-cms-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - ai-cms-network

  # Add certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: ai-cms-certbot
    volumes:
      - ./certbot/www:/var/www/certbot:rw
      - ./certbot/conf:/etc/letsencrypt:rw
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:

networks:
  ai-cms-network:
    driver: bridge
```

---

## Cloud Platform Deployments

### AWS (EC2 + RDS)

#### 1. Create RDS PostgreSQL Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier ai-cms-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name ai_cms \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00"
```

#### 2. Launch EC2 Instance

```bash
# Ubuntu 22.04 LTS, t3.medium or larger
# Security Group: Allow ports 80, 443, 22

# Connect to instance
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <repository-url>
cd AI-CMS3
cp .env.docker .env

# Edit .env with RDS connection
nano .env
# DATABASE_URL=postgresql://postgres:<password>@ai-cms-db.xxxxx.us-east-1.rds.amazonaws.com:5432/ai_cms

# Deploy
docker-compose up -d --build
```

#### 3. Configure Load Balancer (Optional)

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name ai-cms-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name ai-cms-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx \
  --health-check-path /api/v1/health

# Register targets
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-xxxxx
```

---

### Google Cloud Platform

#### 1. Create Cloud SQL PostgreSQL

```bash
# Using gcloud CLI
gcloud sql instances create ai-cms-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=<strong-password> \
  --backup \
  --backup-start-time=03:00

# Create database
gcloud sql databases create ai_cms --instance=ai-cms-db

# Get connection name
gcloud sql instances describe ai-cms-db --format="value(connectionName)"
```

#### 2. Deploy to Compute Engine

```bash
# Create VM instance
gcloud compute instances create ai-cms-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# SSH into instance
gcloud compute ssh ai-cms-vm --zone=us-central1-a

# Follow Docker installation steps from AWS section
```

#### 3. Deploy to Cloud Run (Alternative)

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-cms-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-cms-frontend ./frontend

# Deploy backend
gcloud run deploy ai-cms-backend \
  --image gcr.io/PROJECT_ID/ai-cms-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=<cloud-sql-connection> \
  --set-env-vars JWT_SECRET=<secret> \
  --add-cloudsql-instances=PROJECT_ID:us-central1:ai-cms-db

# Deploy frontend
gcloud run deploy ai-cms-frontend \
  --image gcr.io/PROJECT_ID/ai-cms-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REACT_APP_API_URL=<backend-url>
```

---

### DigitalOcean

#### 1. Create Droplet

```bash
# Create Ubuntu 22.04 Droplet (2GB RAM minimum)
# Or use doctl CLI
doctl compute droplet create ai-cms \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region nyc1 \
  --ssh-keys <your-ssh-key-id>

# SSH into droplet
ssh root@<droplet-ip>

# Install Docker (follow AWS section steps)
```

#### 2. Create Managed PostgreSQL Database

```bash
# Via DigitalOcean dashboard or doctl
doctl databases create ai-cms-db \
  --engine pg \
  --version 15 \
  --region nyc1 \
  --size db-s-1vcpu-1gb

# Get connection details
doctl databases connection ai-cms-db

# Create database
doctl databases db create ai-cms-db ai_cms
```

#### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd AI-CMS3

# Configure environment
cp .env.docker .env
nano .env
# Update DATABASE_URL with DigitalOcean connection string

# Deploy with Docker Compose
docker-compose up -d --build
```

#### 4. Configure Firewall

```bash
# Using doctl
doctl compute firewall create ai-cms-firewall \
  --inbound-rules "protocol:tcp,ports:22,sources:addresses:0.0.0.0/0 protocol:tcp,ports:80,sources:addresses:0.0.0.0/0 protocol:tcp,ports:443,sources:addresses:0.0.0.0/0" \
  --outbound-rules "protocol:tcp,ports:all,destinations:addresses:0.0.0.0/0"
```

---

### Azure

#### 1. Create Azure Database for PostgreSQL

```bash
# Using Azure CLI
az postgres flexible-server create \
  --resource-group ai-cms-rg \
  --name ai-cms-db \
  --location eastus \
  --admin-user postgres \
  --admin-password <strong-password> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --backup-retention 7

# Create database
az postgres flexible-server db create \
  --resource-group ai-cms-rg \
  --server-name ai-cms-db \
  --database-name ai_cms
```

#### 2. Create VM

```bash
# Create Ubuntu VM
az vm create \
  --resource-group ai-cms-rg \
  --name ai-cms-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys

# Open ports
az vm open-port --port 80 --resource-group ai-cms-rg --name ai-cms-vm
az vm open-port --port 443 --resource-group ai-cms-rg --name ai-cms-vm

# SSH and deploy (follow Docker steps)
ssh azureuser@<vm-ip>
```

---

## Database Setup

### Manual PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE ai_cms;
CREATE USER ai_cms_user WITH ENCRYPTED PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE ai_cms TO ai_cms_user;
\q

# Configure pg_hba.conf for remote access
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Configure postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
# Change: listen_addresses = '*'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Run Migrations

```bash
cd backend

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/ai_cms"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

---

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Manual nginx SSL Configuration

Create `/etc/nginx/sites-available/ai-cms`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256...';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/ai-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Environment Configuration

### Production .env Template

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/ai_cms
DB_USER=postgres
DB_PASSWORD=strong-random-password-here
DB_NAME=ai_cms

# Server
NODE_ENV=production
PORT=3001

# JWT (CRITICAL: Generate strong secret)
JWT_SECRET=your-very-long-random-secret-min-32-chars-use-openssl-rand
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760
STORAGE_PROVIDER=local

# AI Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your-google-gemini-api-key

# Optional: Seed database on startup
SEED_DATABASE=false

# CORS (if frontend on different domain)
CORS_ORIGIN=https://yourdomain.com
```

### Generate Strong Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs --tail=100 postgres

# Save logs to file
docker-compose logs > logs/$(date +%Y%m%d).log
```

### Health Monitoring

```bash
# Check health endpoint
curl http://localhost:3001/api/v1/health

# Automated health check script
#!/bin/bash
HEALTH_URL="http://localhost:3001/api/v1/health"
if curl -f -s $HEALTH_URL > /dev/null; then
    echo "✅ Service healthy"
else
    echo "❌ Service unhealthy"
    # Send alert (email, Slack, etc.)
fi
```

### Setup Monitoring Tools

**Prometheus + Grafana** (recommended):

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3003:3000"
    depends_on:
      - prometheus
```

**Application Performance Monitoring**:
- New Relic
- Datadog
- Sentry (for error tracking)

---

## Backup Strategy

### Database Backups

```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres ai_cms > backup-$(date +%Y%m%d).sql

# Or from host
pg_dump -h localhost -U postgres -d ai_cms -F c -f backup-$(date +%Y%m%d).dump

# Restore from backup
docker-compose exec -T postgres psql -U postgres ai_cms < backup.sql
```

### Automated Backup Script

Create `/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ai-cms-$DATE.sql"

# Create backup
docker-compose exec -T postgres pg_dump -U postgres ai_cms > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp ${BACKUP_FILE}.gz s3://your-bucket/backups/

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Cron Job for Daily Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Upload Files Backup

```bash
# Backup uploads directory
tar -czf uploads-$(date +%Y%m%d).tar.gz backend/uploads/

# Or sync to cloud storage
aws s3 sync backend/uploads/ s3://your-bucket/uploads/
```

---

## Scaling

### Vertical Scaling

Increase server resources:
- CPU: 2 → 4 vCPUs
- RAM: 4GB → 8GB
- Storage: SSD for database

### Horizontal Scaling

#### Multiple Backend Instances

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    # ... rest of config
```

#### Load Balancer (nginx)

```nginx
upstream backend {
    least_conn;
    server backend-1:3001;
    server backend-2:3001;
    server backend-3:3001;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

#### Database Scaling

- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Prisma has built-in pooling
- **Managed Database**: Use cloud provider managed PostgreSQL

#### CDN for Static Assets

- Cloudflare
- AWS CloudFront
- Google Cloud CDN

---

## Security Checklist

### Pre-Deployment

- [ ] Change default admin credentials
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Set strong database password
- [ ] Remove or secure database ports (don't expose 5432)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set NODE_ENV=production
- [ ] Disable SEED_DATABASE in production
- [ ] Run security audit: `npm audit`
- [ ] Update dependencies: `npm update`

### nginx Security

- [ ] Enable HSTS
- [ ] Set X-Frame-Options
- [ ] Set X-Content-Type-Options
- [ ] Enable rate limiting
- [ ] Hide nginx version
- [ ] Implement fail2ban

### Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Block PostgreSQL from external access
sudo ufw deny 5432/tcp
```

### Regular Maintenance

- [ ] Update Docker images monthly
- [ ] Apply security patches
- [ ] Rotate JWT secrets periodically
- [ ] Review access logs
- [ ] Monitor failed login attempts
- [ ] Backup database daily
- [ ] Test disaster recovery plan

---

## Performance Optimization

### Backend

- Enable Prisma connection pooling
- Add Redis for caching (optional)
- Optimize database queries with indexes
- Enable gzip compression
- Use PM2 for process management (if not using Docker)

### Frontend

- Enable React production build
- Configure nginx caching
- Use CDN for static assets
- Enable Brotli compression
- Implement lazy loading

### Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_content_status ON "Content" (status);
CREATE INDEX idx_content_type ON "Content" ("contentTypeId");
CREATE INDEX idx_content_author ON "Content" ("authorId");
CREATE INDEX idx_media_user ON "Media" ("uploadedById");
```

---

## Troubleshooting Deployment

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common deployment issues.

### Quick Checks

```bash
# Check all services are running
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 frontend

# Test database connection
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1"

# Test API
curl http://localhost:3001/api/v1/health

# Check disk space
df -h

# Check memory usage
free -m
```

---

## Post-Deployment

### 1. Verify Services

- [ ] Frontend accessible at https://yourdomain.com
- [ ] Backend API at https://yourdomain.com/api/v1/health
- [ ] Can login with admin credentials
- [ ] Can create content
- [ ] Can upload media
- [ ] AI generation works (if configured)

### 2. Set Up Monitoring

- [ ] Configure health check alerts
- [ ] Set up error tracking (Sentry)
- [ ] Enable access logs
- [ ] Configure backup notifications

### 3. Documentation

- [ ] Document server access details
- [ ] Record database credentials (securely)
- [ ] Note API endpoints
- [ ] Create runbook for common tasks

---

For additional help, see:
- [API Documentation](API.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Main README](../README.md)
