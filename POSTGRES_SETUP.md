# KINBEN Backend - PostgreSQL Setup Guide

## Overview

The KINBEN backend has been migrated from Supabase to **self-hosted PostgreSQL** with the flexibility to migrate to any hosted PostgreSQL solution later.

### Database Details
- **Database System**: PostgreSQL 12+
- **Node Driver**: `pg` v8.11.2
- **Schema Version**: 001 (Complete e-commerce schema with all Phase 7 features)
- **Total Tables**: 14 tables with indexes
- **Migrations**: Located in `src/migrations/`

---

## Local Development Setup (Self-Hosted)

### Prerequisites
1. PostgreSQL 12 or higher installed on your machine
2. Node.js 16+ installed
3. Git installed

### Step 1: Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and remember the password for `postgres` user
- Default port: 5432

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kinben_ecommerce;

# Create a dedicated user (optional, but recommended)
CREATE USER kinben_user WITH PASSWORD 'your-secure-password';
ALTER ROLE kinben_user SET client_encoding TO 'utf8';
ALTER ROLE kinben_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE kinben_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE kinben_ecommerce TO kinben_user;

# Exit
\q
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp kinben-backend/.env.example kinben-backend/.env
```

Edit `kinben-backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kinben_ecommerce
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# OR use the dedicated user:
DB_USER=kinben_user
DB_PASSWORD=your-secure-password
```

### Step 4: Run Database Migrations

```bash
cd kinben-backend

# Option 1: Using psql directly
psql -U postgres -d kinben_ecommerce -f src/migrations/001_create_tables.sql
psql -U postgres -d kinben_ecommerce -f src/migrations/002_reviews_and_product_ratings.sql

# Option 2: If using dedicated user
psql -U kinben_user -d kinben_ecommerce -f src/migrations/001_create_tables.sql
psql -U kinben_user -d kinben_ecommerce -f src/migrations/002_reviews_and_product_ratings.sql
```

### Step 5: Install Dependencies

```bash
cd kinben-backend
npm install
```

### Step 6: Start Development Server

```bash
npm run dev
```

Expected output:
```
✓ PostgreSQL Database Connected Successfully
✓ KINBEN API Server running on port 5000
✓ Environment: development
```

---

## Production Setup (Hosted PostgreSQL)

### Supported Hosting Providers

The setup works with any PostgreSQL hosting:
- **Railway.app** (Recommended for ease)
- **Render.com**
- **Neon.tech**
- **AWS RDS**
- **DigitalOcean Managed Databases**
- **Azure Database for PostgreSQL**

### Example: Railway.app

1. **Create Railway Account**: https://railway.app/
2. **Create New Project** → Add PostgreSQL plugin
3. **Get Connection Details**:
   - Copy the generated `DATABASE_URL` or individual credentials
4. **Update `.env`**:
   ```
   DB_HOST=your-railway-host
   DB_PORT=5432
   DB_NAME=kinben_ecommerce
   DB_USER=postgres
   DB_PASSWORD=your-railway-password
   ```
5. **Run Migrations** (on your local machine first):
   ```bash
   psql postgresql://your-user:your-password@your-host:5432/kinben_ecommerce \
     -f src/migrations/001_create_tables.sql
   ```
6. **Deploy Backend**: Push code to Railway or use their deploy options

### Quick Connection String Format
```
postgresql://user:password@host:port/database_name
```

---

## Database Schema Overview

### Core Tables
1. **users** - User accounts
2. **admin_users** - Admin roles
3. **categories** - Product categories
4. **products** - Product catalog
5. **product_images** - Product images
6. **product_variants** - Size/color variants
7. **cart_items** - Shopping cart
8. **wishlist_items** - User wishlists
9. **addresses** - Shipping/Billing addresses
10. **orders** - Customer orders
11. **order_items** - Order line items
12. **reviews** - Product reviews
13. **payment_logs** - Payment transactions
14. **blog_posts** - Blog content (Phase 7)
15. **newsletter_subscriptions** - Newsletter (Phase 7)

### Indexes
All important columns have indexes for query performance:
- Primary keys
- Foreign keys
- Frequently searched columns (email, slug, status)
- Date fields for sorting

---

## API Testing

Once the server is running:

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@kinben.com",
    "password":"Test123!",
    "firstName":"John",
    "lastName":"Doe",
    "phone":"01700000000"
  }'
```

### See API_DOCUMENTATION.md for full endpoint list

---

## Troubleshooting

### Connection Error: "Can't reach database"
```bash
# Check PostgreSQL is running
ps aux | grep postgres

# On Mac
brew services list

# Verify connection string in .env
echo $DB_HOST  # should be localhost for local dev
```

### Port Already in Use
```bash
# Find process using port 5432
lsof -i :5432

# Kill the process
kill -9 <PID>
```

### Migration Failed
```bash
# Check syntax
psql -U postgres -d kinben_ecommerce -f src/migrations/001_create_tables.sql

# List tables to verify
psql -U postgres -d kinben_ecommerce
\dt
\q
```

### Application Crashes on Start
- Check `.env` file has correct credentials
- Verify database exists
- Verify migrations have been run
- Check logs for detailed errors

---

## Backup & Recovery

### Backup Database
```bash
# Full backup
pg_dump -U postgres kinben_ecommerce > backup.sql

# Compressed backup
pg_dump -U postgres kinben_ecommerce | gzip > backup.sql.gz
```

### Restore Database
```bash
# From SQL file
psql -U postgres kinben_ecommerce < backup.sql

# From compressed file
gunzip < backup.sql.gz | psql -U postgres kinben_ecommerce
```

---

## Monitoring

### Check Database Size
```bash
psql -U postgres -d kinben_ecommerce -c "\l+"
```

### Check Active Connections
```bash
psql -U postgres -d kinben_ecommerce -c "SELECT count(*) FROM pg_stat_activity;"
```

### Verify Data
```bash
psql -U postgres -d kinben_ecommerce

\dt                    # List all tables
SELECT COUNT(*) FROM users;  # Count users
SELECT COUNT(*) FROM products;  # Count products
SELECT COUNT(*) FROM orders;  # Count orders

\q
```

---

## Phase 7 Features

All Phase 7 features are fully implemented with PostgreSQL:

### ✅ Blog System
- Full CRUD for blog posts (Admin only)
- Search and filtering
- Pagination support
- View count tracking

### ✅ Wishlist System
- Add/remove from wishlist
- View wishlist with products
- Check if product in wishlist
- Clear entire wishlist

### ✅ Newsletter System
- Subscribe to newsletter
- View subscribers (Admin only)
- Unsubscribe functionality
- Batch operations
- Newsletter statistics

### API Endpoints
- `GET /api/blog` - List blog posts
- `POST /api/blog` - Create (admin)
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `POST /api/newsletter/subscribe` - Subscribe
- `GET /api/newsletter/subscribers` - Admin only

See `API_DOCUMENTATION.md` for full details.

---

## Next Steps

1. ✅ **Verify Setup**: Run health check and test endpoints
2. **Seed Data**: Add sample products, categories using admin endpoints
3. **Frontend Integration**: Connect frontend to backend API
4. **Testing**: Run API tests
5. **Production Deployment**: Choose hosting and deploy

---

## Support

For issues:
1. Check logs: `npm run dev` shows detailed errors
2. Verify `.env` credentials
3. Check PostgreSQL is running and accessible
4. Review migration files for schema details
5. Check API_DOCUMENTATION.md for endpoint details

---

**Database is ready! 🚀**
