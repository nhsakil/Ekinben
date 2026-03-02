# KINBEN E-Commerce Platform

A full-featured e-commerce website for KINBEN, a premium Bangladeshi men's fashion brand specializing in shirts, panjabis, polos, pants, and seasonal collections.

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand / React Context
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Backend Service**: Supabase
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT + Bcrypt
- **File Storage**: Supabase Storage
- **Email**: Nodemailer
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS

## Project Structure

```
/kinben-frontend/          # React frontend application
/kinben-backend/           # Node.js/Express backend API
/database/                 # SQL migrations and seeds
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account (free tier available)

### Frontend Setup

```bash
cd kinben-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update with your Supabase credentials
# VITE_API_URL=http://localhost:5000/api
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Run development server (localhost:5173)
npm run dev
```

### Backend Setup

```bash
cd kinben-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update with your configuration:
# SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_KEY=your-service-key
# JWT_SECRET=random-32-character-secret
# CORS_ORIGIN=http://localhost:5173

# Run development server (localhost:5000)
npm run dev
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration:
   ```sql
   -- Copy contents of kinben-backend/src/migrations/001_create_tables.sql
   ```
3. Seed the database with categories and products (optional):
   ```sql
   -- Run the seed files in kinben-backend/src/seeds/
   ```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "01700000000"
}
```

#### POST `/api/auth/login`
Authenticate user
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication)

#### POST `/api/auth/refresh-token`
Refresh access token
```json
{
  "refreshToken": "your-refresh-token"
}
```

### Product Endpoints

#### GET `/api/products`
List all products with pagination and filtering
```
?page=1&limit=20&category=shirts&minPrice=1000&maxPrice=3000&search=white&sort=price&order=asc
```

#### GET `/api/products/:id`
Get single product by ID

#### GET `/api/products/slug/:slug`
Get single product by slug

#### GET `/api/products/categories`
Get all product categories

#### GET `/api/products/search`
Search products
```
?q=shirt&limit=10
```

## Features Implemented

### Phase 1: Core Infrastructure ✓
- [x] React frontend with Vite & TailwindCSS
- [x] Express.js backend with middleware
- [x] PostgreSQL database schema (14 tables)
- [x] Folder structure and configuration

### Phase 2: Authentication ✓
- [x] User signup with validation
- [x] User login with JWT tokens
- [x] Token refresh mechanism
- [x] Protected routes with auth middleware
- [x] Admin role-based access control

### Phase 3: Product Catalog ✓
- [x] List products with pagination
- [x] Product filtering (category, price, search)
- [x] Product detail pages
- [x] Category management

### Upcoming Phases
- [ ] Shopping Cart
- [ ] Checkout Flow (4-step)
- [ ] Order Management
- [ ] User Profiles & Addresses
- [ ] Reviews & Ratings
- [ ] Admin Dashboard
- [ ] Blog System
- [ ] Wishlist
- [ ] Email Notifications
- [ ] Analytics Integration

## Development Workflow

### Running Both Frontend and Backend

**Terminal 1 - Frontend:**
```bash
cd kinben-frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd kinben-backend
npm run dev
```

**Terminal 3 - Monitor:** (Optional)
```bash
# Use a tool like Postman to test API endpoints
# API: http://localhost:5000/api
# Frontend: http://localhost:5173
```

### Testing API Endpoints

Use Postman or cURL to test endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test"}'
```

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_GOOGLE_ANALYTICS_ID=optional
VITE_FACEBOOK_PIXEL_ID=optional
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=min-32-characters
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password
SMTP_FROM=noreply@kinben.com
```

## Database Schema Highlights

### Core Tables
- **users** - User accounts and profiles
- **products** - Product information
- **categories** - Product categories
- **orders** - Customer orders
- **cart_items** - Shopping cart items
- **reviews** - Product reviews & ratings
- **wishlist_items** - User saved items
- **blog_posts** - Blog articles
- **addresses** - Shipping/billing addresses
- **admin_users** - Admin user roles

## Security Features

- ✓ Password hashing with bcrypt
- ✓ JWT token-based authentication
- ✓ Rate limiting on login endpoints
- ✓ CORS configuration
- ✓ Helmet.js for security headers
- ✓ Input validation and sanitization
- ✓ SQL injection prevention (parameterized queries)
- ✓ Admin role-based access control

## Performance Targets

- Homepage load: < 3 seconds
- Product page load: < 2 seconds
- API response time: < 200ms average
- Mobile Lighthouse score: > 85

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make your changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/feature-name`

## Deployment

### Frontend (Vercel Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/DigitalOcean Recommended)
1. Package as Docker container
2. Deploy to hosting platform
3. Set environment variables
4. Configure database connection

## Support

For questions or issues, please create an issue in the repository or contact the development team.

## License

Proprietary - KINBEN Fashion Brand

---

**Project Status**: Under Active Development
**Last Updated**: 2024
