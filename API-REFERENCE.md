# ThreadCounty API Reference
## Complete Endpoints Documentation

---

## BASE URL
```
Development: http://localhost:5000/api
Production: https://api.threadcounty.com/api
```

---

## AUTHENTICATION ENDPOINTS

### 1. Sign Up
```
POST /auth/signup

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "Signup successful. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}

Error (400):
{
  "success": false,
  "message": "Invalid email format"
}
```

### 2. Login
```
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}

Response (200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "customToken": "eyJhbGc..."
}

Error (401):
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 3. Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Forgot Password
```
POST /auth/forgot-password

Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

### 5. Reset Password
```
POST /auth/reset-password

Request:
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 6. Verify Email
```
POST /auth/verify-email

Request:
{
  "token": "verification-token"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 7. Refresh Token
```
POST /auth/refresh-token

Request:
{
  "refreshToken": "refresh-token"
}

Response (200):
{
  "success": true,
  "session": {
    "access_token": "new-token",
    "expires_in": 3600
  }
}
```

---

## USER ENDPOINTS

### 1. Get Profile
```
GET /users/profile
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "status": "active"
    },
    "profile": {
      "phone": "+1234567890",
      "country": "USA",
      "company_name": "Textile Corp",
      "job_title": "QC Manager"
    },
    "subscription": {
      "plan": "professional",
      "status": "active",
      "current_period_end": "2024-02-15"
    }
  }
}
```

### 2. Update Profile
```
PUT /users/profile
Headers: Authorization: Bearer {token}

Request:
{
  "full_name": "John Doe Updated",
  "phone": "+1234567890",
  "company_name": "New Company",
  "job_title": "Senior Manager"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "John Doe Updated",
    "updated_at": "2024-01-15T11:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

### 3. Upload Avatar
```
POST /users/avatar
Headers: 
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Form Data:
{
  "file": <binary image file>
}

Response (200):
{
  "success": true,
  "avatarUrl": "https://...",
  "message": "Avatar uploaded successfully"
}
```

### 4. Change Password
```
POST /users/password
Headers: Authorization: Bearer {token}

Request:
{
  "oldPassword": "CurrentPass123",
  "newPassword": "NewSecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}

Error (401):
{
  "success": false,
  "message": "Old password is incorrect"
}
```

### 5. Delete Account
```
DELETE /users/account
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### 6. Get Activity Log
```
GET /users/activity?limit=50&offset=0
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "login",
      "resource_type": "auth",
      "created_at": "2024-01-15T10:30:00Z",
      "ip_address": "192.168.1.1"
    },
    {
      "id": "uuid",
      "action": "upload",
      "resource_type": "image",
      "resource_id": "upload-uuid",
      "created_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### 7. Get Notifications
```
GET /users/notifications
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "analysis_complete",
      "title": "Analysis Complete",
      "message": "Your fabric analysis is ready",
      "is_read": false,
      "action_url": "/reports/uuid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 8. Mark Notifications as Read
```
PUT /users/notifications/read
Headers: Authorization: Bearer {token}

Request:
{
  "notificationIds": ["uuid1", "uuid2"]
}

Response (200):
{
  "success": true,
  "message": "Notifications marked as read"
}
```

---

## UPLOAD ENDPOINTS

### 1. Upload Image
```
POST /uploads
Headers: 
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Form Data:
{
  "file": <binary image file>
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "filename": "1234567890-uuid.jpg",
    "original_filename": "fabric_sample.jpg",
    "file_size": 2048576,
    "file_type": "image/jpeg",
    "image_width": 1920,
    "image_height": 1080,
    "storage_url": "https://...",
    "thumbnail_url": "https://...",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "File uploaded successfully"
}

Error (400):
{
  "success": false,
  "message": "Only JPG, JPEG, PNG files are allowed"
}

Error (413):
{
  "success": false,
  "message": "File size exceeds 50MB limit"
}
```

### 2. Get User Uploads
```
GET /uploads?limit=20&offset=0
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "original_filename": "fabric_sample.jpg",
      "file_size": 2048576,
      "storage_url": "https://...",
      "thumbnail_url": "https://...",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

### 3. Delete Upload
```
DELETE /uploads/{uploadId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "File deleted successfully"
}

Error (404):
{
  "success": false,
  "message": "Upload not found"
}
```

### 4. Get Upload Details
```
GET /uploads/{uploadId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "1234567890-uuid.jpg",
    "original_filename": "fabric_sample.jpg",
    "file_size": 2048576,
    "image_width": 1920,
    "image_height": 1080,
    "storage_url": "https://...",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## REPORT ENDPOINTS

### 1. Analyze Image
```
POST /reports/{uploadId}/analyze
Headers: Authorization: Bearer {token}

Response (202):
{
  "success": true,
  "data": {
    "id": "uuid",
    "upload_id": "uuid",
    "status": "processing",
    "message": "Analysis in progress..."
  }
}

Response When Complete (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "upload_id": "uuid",
    "report_title": "Analysis Report - fabric_sample.jpg",
    "warp_count": 156,
    "weft_count": 142,
    "fabric_type": "Cotton",
    "thread_density": {
      "warp": {
        "value": 15.6,
        "unit": "threads/cm"
      },
      "weft": {
        "value": 14.2,
        "unit": "threads/cm"
      },
      "confidence": 0.89
    },
    "confidence_score": 0.89,
    "quality_score": 0.85,
    "ai_insights": "High-quality fabric with excellent thread density...",
    "processing_time_ms": 3245,
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Report
```
GET /reports/{reportId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "report_title": "Analysis Report - fabric_sample.jpg",
    "warp_count": 156,
    "weft_count": 142,
    "fabric_type": "Cotton",
    "confidence_score": 0.89,
    "quality_score": 0.85,
    "ai_insights": "...",
    "is_public": false,
    "download_count": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "uploads": {
      "id": "uuid",
      "original_filename": "fabric_sample.jpg",
      "storage_url": "https://..."
    }
  }
}
```

### 3. Get User Reports
```
GET /reports?limit=20&offset=0
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "report_title": "Analysis Report 1",
      "fabric_type": "Cotton",
      "confidence_score": 0.89,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

### 4. Delete Report
```
DELETE /reports/{reportId}
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### 5. Share Report
```
POST /reports/{reportId}/share
Headers: Authorization: Bearer {token}

Request:
{
  "expiresIn": 7  // days
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_public": true,
    "share_token": "abcd1234...",
    "share_expires_at": "2024-01-22T10:30:00Z"
  },
  "shareUrl": "https://threadcounty.com/reports/shared/abcd1234..."
}
```

### 6. View Shared Report
```
GET /reports/shared/{shareToken}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "report_title": "Analysis Report - fabric_sample.jpg",
    "warp_count": 156,
    "weft_count": 142,
    "fabric_type": "Cotton",
    "confidence_score": 0.89,
    "ai_insights": "..."
  }
}

Error (404):
{
  "success": false,
  "message": "Report not found or has expired"
}
```

### 7. Download Report PDF
```
GET /reports/{reportId}/pdf
Headers: Authorization: Bearer {token}

Response (200):
Content-Type: application/pdf
Content-Disposition: attachment; filename="report.pdf"
<binary PDF content>

Error (404):
{
  "success": false,
  "message": "Report not found"
}
```

---

## SUBSCRIPTION ENDPOINTS

### 1. Get Current Subscription
```
GET /subscriptions/current
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": "professional",
    "status": "active",
    "current_period_start": "2024-01-01",
    "current_period_end": "2024-02-01",
    "renewal_date": "2024-02-01",
    "auto_renew": true,
    "features": {
      "uploads_per_month": 100,
      "storage_gb": 50,
      "api_calls": 10000,
      "advanced_analytics": true,
      "priority_support": true
    }
  }
}
```

### 2. Get Available Plans
```
GET /subscriptions/plans

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "billing_period": "monthly",
      "features": {
        "uploads_per_month": 10,
        "storage_gb": 5
      }
    },
    {
      "id": "professional",
      "name": "Professional",
      "price": 99,
      "currency": "USD",
      "features": {
        "uploads_per_month": 100,
        "storage_gb": 50
      }
    }
  ]
}
```

### 3. Create Subscription
```
POST /subscriptions
Headers: Authorization: Bearer {token}

Request:
{
  "planId": "professional",
  "stripeToken": "tok_..."  // Optional for paid plans
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": "professional",
    "status": "active",
    "current_period_end": "2024-02-01"
  },
  "message": "Subscription created successfully"
}
```

### 4. Update Subscription
```
PUT /subscriptions
Headers: Authorization: Bearer {token}

Request:
{
  "planId": "enterprise",
  "auto_renew": true
}

Response (200):
{
  "success": true,
  "data": {
    "plan": "enterprise",
    "status": "active"
  }
}
```

### 5. Cancel Subscription
```
DELETE /subscriptions
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

## CONTACT ENDPOINTS

### 1. Send Contact Message
```
POST /contact

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Feature Request",
  "message": "I would like to suggest...",
  "attachment_url": null  // Optional
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "new",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Message sent successfully. We'll get back to you soon!"
}
```

### 2. Subscribe to Newsletter
```
POST /contact/newsletter

Request:
{
  "email": "user@example.com"
}

Response (201):
{
  "success": true,
  "message": "Subscribed successfully"
}
```

---

## ADMIN ENDPOINTS

### 1. Get All Users
```
GET /admin/users?limit=50&offset=0&role=user&status=active
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "status": "active",
      "role": "user",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0
  }
}
```

### 2. Get User Details
```
GET /admin/users/{userId}
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "status": "active",
    "uploads_count": 15,
    "reports_count": 12,
    "subscription": { ... },
    "last_login": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Update User Status
```
PUT /admin/users/{userId}
Headers: Authorization: Bearer {admin_token}

Request:
{
  "status": "suspended",
  "reason": "Abuse of service"
}

Response (200):
{
  "success": true,
  "message": "User status updated"
}
```

### 4. Delete User
```
DELETE /admin/users/{userId}
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 5. Get Platform Analytics
```
GET /admin/analytics?startDate=2024-01-01&endDate=2024-01-31
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "data": {
    "total_users": 1250,
    "active_users": 450,
    "total_uploads": 5230,
    "total_reports": 4890,
    "total_storage_used_gb": 2345,
    "subscription_revenue": 12500,
    "daily_active_users": [
      { "date": "2024-01-01", "count": 120 },
      { "date": "2024-01-02", "count": 135 }
    ]
  }
}
```

### 6. Get All Uploads
```
GET /admin/uploads?limit=50&offset=0&status=completed
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "original_filename": "fabric_sample.jpg",
      "file_size": 2048576,
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 7. Delete Admin Report
```
DELETE /admin/reports/{reportId}
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "message": "Report deleted by admin"
}
```

### 8. Manage Subscriptions
```
GET /admin/subscriptions?plan=professional&status=active
Headers: Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "plan": "professional",
      "status": "active",
      "amount_paid": 99,
      "renewal_date": "2024-02-01"
    }
  ]
}
```

---

## ERROR HANDLING

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "details": {} // Optional additional info
}
```

### Common Error Codes
```
400 - Bad Request: Invalid input
401 - Unauthorized: Invalid/expired token
403 - Forbidden: Insufficient permissions
404 - Not Found: Resource doesn't exist
409 - Conflict: Resource already exists
413 - Payload Too Large: File too large
429 - Too Many Requests: Rate limit exceeded
500 - Internal Server Error: Server error
```

---

## AUTHENTICATION

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer {jwt_token}
```

Token obtained from login response:
```javascript
const token = response.data.customToken;
localStorage.setItem('authToken', token);

// Use in requests
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

axios.get('/api/users/profile', config);
```

---

## RATE LIMITING

API endpoints are rate limited:

```
- Public endpoints: 30 requests/minute per IP
- Authenticated endpoints: 100 requests/minute per user
- Admin endpoints: 200 requests/minute per admin
```

When rate limited, response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

---

## PAGINATION

Endpoints that support pagination use query parameters:

```
GET /api/reports?limit=20&offset=0

Response:
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

---

## REQUEST HEADERS

Always include:

```
Content-Type: application/json
Authorization: Bearer {token}  // For protected endpoints
```

---

## WEBHOOKS (Future Implementation)

Subscribe to events:
```
POST /webhooks
{
  "url": "https://yourapp.com/webhook",
  "events": ["report.completed", "upload.failed"]
}
```

Webhook payload:
```
{
  "id": "webhook-event-id",
  "event": "report.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": { ... }
}
```

---

## VERSION

API Version: 1.0
Last Updated: 2024
