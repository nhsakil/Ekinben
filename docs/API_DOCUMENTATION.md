# KINBEN API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "01700000000"
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  },
  "message": "Account created successfully"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  },
  "message": "Login successful"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "01700000000",
    "profile_image_url": null,
    "created_at": "2024-03-02T..."
  }
}
```

### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-jwt-refresh-token"
  },
  "message": "Token refreshed"
}
```

---

## Products

### List Products
```
GET /products?page=1&limit=20&category=shirts&minPrice=1000&maxPrice=3000&search=white&sort=price&order=asc

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Classic White Shirt",
      "slug": "classic-white-shirt",
      "description": "...",
      "price": 1490,
      "compare_price": 1790,
      "stock_quantity": 50,
      "average_rating": 4.5,
      "total_reviews": 10,
      "is_featured": true,
      "product_images": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get Product By ID
```
GET /products/:productId

Response 200:
{
  "success": true,
  "data": { ... product details ... }
}
```

### Get Product By Slug
```
GET /products/slug/:slug

Response 200:
{
  "success": true,
  "data": { ... product details ... }
}
```

### Get Categories
```
GET /products/categories

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Shirts",
      "slug": "shirts",
      "description": "...",
      "display_order": 1
    }
  ]
}
```

### Search Products
```
GET /products/search?q=shirt&limit=10

Response 200:
{
  "success": true,
  "data": {
    "results": [...]
  }
}
```

---

## Orders & Checkout

### Create Order
```
POST /orders
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "items": [...],
  "shippingAddressId": "uuid",
  "billingAddressId": "uuid",
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "promoCode": "KINBEN10",
  "customerNotes": "Please deliver in the morning"
}

Response 201:
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-XXXXX-XXXXX",
      "status": "pending",
      "total": 3897.50,
      "items": [...],
      "shipping": 100
    },
    "clientSecret": "mock_uuid"
  },
  "message": "Order created successfully"
}
```

### Get User Orders
```
GET /orders?page=1&limit=20&status=pending
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": [ { order objects } ],
  "pagination": { ... }
}
```

### Get Order Details
```
GET /orders/:orderId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { order object with items and addresses }
}
```

### Cancel Order
```
POST /orders/:orderId/cancel
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { updated order },
  "message": "Order cancelled successfully"
}
```

### Update Order Status (Admin)
```
PATCH /orders/:orderId
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}

Response 200:
{
  "success": true,
  "data": { updated order },
  "message": "Order status updated"
}
```

---

## User Profile & Addresses

### Get User Profile
```
GET /users/profile
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "01700000000",
    "date_of_birth": "1990-01-01",
    "gender": "Male"
  }
}
```

### Update User Profile
```
PATCH /users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "01700000000",
  "dateOfBirth": "1990-01-01",
  "gender": "Male"
}

Response 200:
{
  "success": true,
  "data": { updated user },
  "message": "Profile updated successfully"
}
```

### Create Address
```
POST /users/addresses
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "label": "Home",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "01700000000",
  "streetAddress": "House 16, Street 10",
  "apartmentSuite": "Apt 5",
  "city": "Dhaka",
  "stateProvince": "Dhaka",
  "postalCode": "1207",
  "country": "Bangladesh",
  "isDefaultShipping": true,
  "isDefaultBilling": true
}

Response 201:
{
  "success": true,
  "data": { address object },
  "message": "Address created successfully"
}
```

### Get Addresses
```
GET /users/addresses
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": [ { address objects } ]
}
```

### Update Address
```
PATCH /users/addresses/:addressId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "city": "Chittagong",
  "isDefaultShipping": false
}

Response 200:
{
  "success": true,
  "data": { updated address },
  "message": "Address updated successfully"
}
```

### Delete Address
```
DELETE /users/addresses/:addressId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

## Shopping Cart

### Get Cart
```
GET /cart
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "product_id": "uuid",
        "product_variant_id": null,
        "quantity": 2,
        "products": {
          "id": "uuid",
          "name": "Classic White Shirt",
          "price": 1490,
          "product_images": [...]
        },
        "product_variants": null
      }
    ],
    "subtotal": 2980,
    "tax": 447,
    "total": 3427,
    "itemCount": 1
  }
}
```

### Add to Cart
```
POST /cart/items
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "productId": "uuid",
  "productVariantId": null,
  "quantity": 2
}

Response 200:
{
  "success": true,
  "data": { ... cart item ... },
  "message": "Item added to cart"
}
```

### Update Cart Item
```
PATCH /cart/items/:itemId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "quantity": 3
}

Response 200:
{
  "success": true,
  "data": { ... updated cart item ... },
  "message": "Cart item updated"
}
```

### Remove from Cart
```
DELETE /cart/items/:itemId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Clear Cart
```
DELETE /cart
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Apply Promo Code
```
POST /cart/promo-code
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "code": "KINBEN10"
}

Response 200:
{
  "success": true,
  "data": {
    "code": "KINBEN10",
    "discountPercentage": 10,
    "message": "10% discount applied!"
  }
}
```

**Valid Promo Codes (for testing):**
- `KINBEN10` - 10% discount
- `KINBEN20` - 20% discount
- `WELCOME` - 15% discount

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "No authentication token provided"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal Server Error"
  }
}
```

---

## Testing with cURL

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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@kinben.com",
    "password":"Test123!"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Add to Cart (requires token from login)
```bash
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"product-uuid",
    "quantity":1
  }'
```

---

## Frontend Integration

### Using Axios
```javascript
import axios from 'axios';

// Create instance with default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Signup
const signup = async (email, password, firstName, lastName, phone) => {
  const response = await api.post('/auth/signup', {
    email, password, firstName, lastName, phone
  });
  return response.data.data;
};

// Get products
const getProducts = async (page = 1, limit = 20) => {
  const response = await api.get('/products', {
    params: { page, limit }
  });
  return response.data;
};
```

---

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Response header**: `RateLimit-Remaining`, `RateLimit-Reset`

---

## Next: Checkout Flow (In Progress)

Coming soon:
- `POST /orders` - Create an order
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order status (admin only)

