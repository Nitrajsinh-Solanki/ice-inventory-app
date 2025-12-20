# Backend API Integration Documentation

This document describes how the mobile app integrates with the backend API.

## Base Configuration

```typescript
// src/constants/config.ts
export const API_BASE_URL = "https://your-backend-url.vercel.app/api"
```

All API calls use this base URL and add the endpoint path.

## Authentication Flow

### 1. Register Partner

```typescript
POST /delivery/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "adminEmail": "admin@shop.com",
  "password": "securepassword"
}

Response (Success):
{
  "success": true,
  "message": "Partner registered successfully. Pending approval.",
  "partnerId": "partner_id_here"
}

Response (Error):
{
  "error": "Email already registered"
}
```

### 2. Login with OTP

```typescript
POST /delivery/login-otp

Request Body:
{
  "email": "john@example.com",
  "password": "securepassword"
}

Response (Success):
{
  "otpSent": true,
  "message": "OTP sent to email"
}

Response (Error):
{
  "error": "Invalid credentials"
}
```

### 3. Verify OTP

```typescript
POST /delivery/verify-otp

Request Body:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "partner": {
    "_id": "partner_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "adminEmail": "admin@shop.com",
    "status": "approved",
    "createdByUser": "user_id"
  },
  "userId": "user_id"
}

Response (Error):
{
  "error": "Invalid OTP"
}
```

## Order Management

### Get Pending Orders

```typescript
GET /delivery/orders?partnerId={partnerId}&userId={userId}

Response:
[
  {
    "_id": "order_id",
    "orderId": "ORD-001",
    "customerName": "Jane Smith",
    "customerContact": "+1234567890",
    "customerAddress": "123 Main St, City",
    "items": [
      {
        "productName": "Ice Block 10kg",
        "quantity": 2,
        "price": 50,
        "total": 100
      }
    ],
    "total": 100,
    "deliveryStatus": "Pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Delivered Orders (Grouped)

```typescript
GET /delivery/delivered-orders?partnerId={partnerId}

Response:
{
  "total": 25,
  "groups": {
    "today": [...orders],
    "yesterday": [...orders],
    "this_week": [...orders],
    "older": [...orders]
  }
}
```

### Update Order Status

```typescript
POST /delivery/update-order-status

Request Body:
{
  "orderId": "order_id",
  "deliveryStatus": "On the Way", // or "Delivered"
  "partnerId": "partner_id"
}

Response:
{
  "success": true,
  "message": "Order status updated"
}
```

## Customer Search

### Search Customers

```typescript
GET /delivery/search-customers?userId={userId}&q={searchQuery}

Response:
{
  "customers": [
    {
      "_id": "customer_id",
      "name": "Jane Smith",
      "shopName": "Jane's Shop",
      "shopAddress": "123 Main St, City",
      "contacts": ["+1234567890"],
      "lat": 40.7128,
      "lng": -74.0060
    }
  ]
}
```

### Save Search History

```typescript
POST /delivery/search-history

Request Body:
{
  "partnerId": "partner_id",
  "customerId": "customer_id"
}

Response:
{
  "success": true
}
```

### Get Search History

```typescript
GET /delivery/search-history?partnerId={partnerId}

Response:
{
  "history": [
    {
      "_id": "history_id",
      "customerId": "customer_id",
      "customerName": "Jane Smith",
      "searchedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Sticky Notes

### Create Sticky Note Order

```typescript
POST /delivery/sticky-notes

Request Body:
{
  "partnerId": "partner_id",
  "userId": "user_id",
  "customerName": "Jane Smith",
  "productName": "Ice Block 10kg",
  "quantity": 5,
  "notes": "Urgent delivery"
}

Response:
{
  "success": true,
  "message": "Sticky note created"
}
```

### Search Products

```typescript
GET /delivery/search-products?userId={userId}&q={searchQuery}

Response:
{
  "products": [
    {
      "_id": "product_id",
      "name": "Ice Block 10kg",
      "price": 50
    }
  ]
}
```

## Location Tracking

### Update Location

```typescript
POST /delivery/update-location

Request Body:
{
  "partnerId": "partner_id",
  "latitude": 40.7128,
  "longitude": -74.0060
}

Response:
{
  "success": true,
  "message": "Location updated"
}
```

**Note:** This endpoint is called automatically every 3-5 seconds by the app's location service.

## Error Handling

All API errors follow this format:

```typescript
Response (Error):
{
  "error": "Error message here"
}

HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden (account deleted/rejected)
- 404: Not Found
- 500: Server Error
```

## App-Side Error Handling

The app handles errors as follows:

1. **Network Errors**: Shows "Network Error" alert
2. **403/404 on Orders**: Auto-logout (account deleted)
3. **Validation Errors**: Shows specific error message
4. **General Errors**: Shows generic error alert

## Rate Limiting

Location updates: No rate limiting (real-time tracking)
Other endpoints: Reasonable use expected

## Security

1. All requests should use HTTPS in production
2. Partner ID and User ID are required for authentication
3. Status checks happen on every critical API call
4. Deleted/rejected partners are automatically logged out

---

For backend implementation details, refer to your backend repository documentation.
