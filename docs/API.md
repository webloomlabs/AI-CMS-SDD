# API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

Production: Replace with your production domain.

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Error Responses

All endpoints may return these error formats:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Login

Authenticate a user and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

---

## Content Endpoints

### List Content Items

Get a paginated list of content items with optional filtering.

**Endpoint**: `GET /content`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `contentTypeId` (optional) - Filter by content type ID
- `status` (optional) - Filter by status: `draft`, `published`, `archived`
- `search` (optional) - Search in title and content

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "slug": "my-first-post",
      "contentTypeId": 1,
      "status": "published",
      "fields": [
        {
          "fieldName": "body",
          "value": "Content body text..."
        },
        {
          "fieldName": "excerpt",
          "value": "Short excerpt..."
        }
      ],
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T12:00:00.000Z",
      "publishedAt": "2025-01-10T12:00:00.000Z",
      "authorId": 1,
      "contentType": {
        "id": 1,
        "name": "Blog Post",
        "slug": "blog-post"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3001/api/v1/content?page=1&limit=10&status=published" \
  -H "Authorization: Bearer <your-token>"
```

### Get Content Item

Get a single content item by ID.

**Endpoint**: `GET /content/:id`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "My First Post",
  "slug": "my-first-post",
  "contentTypeId": 1,
  "status": "published",
  "fields": [
    {
      "id": 1,
      "fieldName": "body",
      "value": "Content body text..."
    }
  ],
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z",
  "publishedAt": "2025-01-10T12:00:00.000Z",
  "authorId": 1,
  "contentType": {
    "id": 1,
    "name": "Blog Post",
    "slug": "blog-post",
    "fields": [
      {
        "name": "body",
        "type": "textarea",
        "required": true
      }
    ]
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer <your-token>"
```

### Create Content Item

Create a new content item.

**Endpoint**: `POST /content`

**Authentication**: Required (ADMIN or EDITOR role)

**Request Body**:
```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "contentTypeId": 1,
  "status": "draft",
  "fields": [
    {
      "fieldName": "body",
      "value": "This is the content body..."
    },
    {
      "fieldName": "excerpt",
      "value": "Short excerpt for the post"
    }
  ]
}
```

**Success Response** (201 Created):
```json
{
  "id": 2,
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "contentTypeId": 1,
  "status": "draft",
  "fields": [...],
  "createdAt": "2025-01-10T14:00:00.000Z",
  "updatedAt": "2025-01-10T14:00:00.000Z",
  "publishedAt": null,
  "authorId": 1
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/v1/content \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Blog Post",
    "slug": "new-blog-post",
    "contentTypeId": 1,
    "status": "draft",
    "fields": [
      {
        "fieldName": "body",
        "value": "Content text here..."
      }
    ]
  }'
```

### Update Content Item

Update an existing content item.

**Endpoint**: `PUT /content/:id`

**Authentication**: Required (ADMIN, EDITOR, or content author)

**Request Body**:
```json
{
  "title": "Updated Title",
  "status": "published",
  "fields": [
    {
      "fieldName": "body",
      "value": "Updated content body..."
    }
  ]
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Updated Title",
  "slug": "my-first-post",
  "status": "published",
  "fields": [...],
  "updatedAt": "2025-01-10T15:00:00.000Z",
  "publishedAt": "2025-01-10T15:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "published"
  }'
```

### Delete Content Item

Delete a content item.

**Endpoint**: `DELETE /content/:id`

**Authentication**: Required (ADMIN or content author)

**Success Response** (200 OK):
```json
{
  "message": "Content item deleted successfully"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Media Endpoints

### Upload Media

Upload a media file (image).

**Endpoint**: `POST /media`

**Authentication**: Required

**Request**: `multipart/form-data`

**Form Fields**:
- `file` (required) - The file to upload
- `altText` (optional) - Alt text for accessibility
- `title` (optional) - Media title

**Success Response** (201 Created):
```json
{
  "id": 1,
  "filename": "image-1234567890.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "url": "/uploads/image-1234567890.jpg",
  "altText": "A beautiful landscape",
  "title": "Landscape Photo",
  "width": 1920,
  "height": 1080,
  "uploadedById": 1,
  "createdAt": "2025-01-10T16:00:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "No file uploaded"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/v1/media \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@/path/to/image.jpg" \
  -F "altText=A beautiful landscape" \
  -F "title=Landscape Photo"
```

### List Media Files

Get a paginated list of media files.

**Endpoint**: `GET /media`

**Authentication**: Required

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `mimeType` (optional) - Filter by MIME type (e.g., `image/jpeg`)
- `search` (optional) - Search in filename, title, altText

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "filename": "image-1234567890.jpg",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "url": "/uploads/image-1234567890.jpg",
      "altText": "A beautiful landscape",
      "title": "Landscape Photo",
      "width": 1920,
      "height": 1080,
      "uploadedById": 1,
      "createdAt": "2025-01-10T16:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3001/api/v1/media?page=1&limit=20" \
  -H "Authorization: Bearer <your-token>"
```

### Get Media File

Get a single media file by ID.

**Endpoint**: `GET /media/:id`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "filename": "image-1234567890.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "url": "/uploads/image-1234567890.jpg",
  "altText": "A beautiful landscape",
  "title": "Landscape Photo",
  "width": 1920,
  "height": 1080,
  "uploadedById": 1,
  "uploadedBy": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "createdAt": "2025-01-10T16:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/v1/media/1 \
  -H "Authorization: Bearer <your-token>"
```

### Delete Media File

Delete a media file.

**Endpoint**: `DELETE /media/:id`

**Authentication**: Required (ADMIN or file uploader)

**Success Response** (200 OK):
```json
{
  "message": "Media file deleted successfully"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3001/api/v1/media/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## AI Generation Endpoints

### Generate AI Content

Generate content using AI (Google Gemini).

**Endpoint**: `POST /ai/generate`

**Authentication**: Required

**Request Body**:
```json
{
  "prompt": "Write a blog post about sustainable living",
  "mode": "draft",
  "context": {
    "contentType": "blog-post",
    "tone": "professional"
  }
}
```

**Modes**:
- `draft` - Generate full content draft
- `seo` - Generate SEO metadata (title, description, keywords)
- `alt_text` - Generate image alt text

**Success Response** (200 OK):

For `draft` mode:
```json
{
  "content": "Sustainable living is becoming increasingly important...\n\n[Generated content continues]",
  "mode": "draft"
}
```

For `seo` mode:
```json
{
  "content": "Title: 10 Ways to Live More Sustainably\nDescription: Discover practical tips for reducing your environmental impact and living a more sustainable lifestyle.\nKeywords: sustainable living, eco-friendly, green lifestyle, environmental conservation",
  "mode": "seo"
}
```

For `alt_text` mode:
```json
{
  "content": "A hand holding a reusable water bottle against a natural outdoor background, promoting sustainable living practices",
  "mode": "alt_text"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "AI generation failed: API key not configured"
}
```

**cURL Example**:
```bash
# Generate draft
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about sustainable living",
    "mode": "draft"
  }'

# Generate SEO metadata
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Sustainable living blog post",
    "mode": "seo"
  }'

# Generate alt text
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Image of person with reusable water bottle outdoors",
    "mode": "alt_text"
  }'
```

---

## Content Type Endpoints

### List Content Types

Get all content types with their field definitions.

**Endpoint**: `GET /content-types`

**Authentication**: Required

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Blog Post",
    "slug": "blog-post",
    "description": "Standard blog post format",
    "fields": [
      {
        "name": "body",
        "type": "textarea",
        "required": true,
        "options": {}
      },
      {
        "name": "excerpt",
        "type": "text",
        "required": false,
        "options": {
          "maxLength": 200
        }
      },
      {
        "name": "featuredImage",
        "type": "media",
        "required": false,
        "options": {}
      }
    ],
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/v1/content-types \
  -H "Authorization: Bearer <your-token>"
```

### Get Content Type

Get a single content type by ID.

**Endpoint**: `GET /content-types/:id`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Blog Post",
  "slug": "blog-post",
  "description": "Standard blog post format",
  "fields": [...],
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/v1/content-types/1 \
  -H "Authorization: Bearer <your-token>"
```

### Create Content Type

Create a new content type.

**Endpoint**: `POST /content-types`

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "name": "Product",
  "slug": "product",
  "description": "E-commerce product",
  "fields": [
    {
      "name": "description",
      "type": "textarea",
      "required": true,
      "options": {}
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "options": {
        "min": 0
      }
    },
    {
      "name": "category",
      "type": "select",
      "required": true,
      "options": {
        "choices": ["Electronics", "Clothing", "Books"]
      }
    }
  ]
}
```

**Field Types**:
- `text` - Single line text
- `textarea` - Multi-line text
- `number` - Numeric value
- `boolean` - True/false
- `date` - Date value
- `media` - Media file reference
- `select` - Dropdown selection
- `json` - JSON data

**Success Response** (201 Created):
```json
{
  "id": 2,
  "name": "Product",
  "slug": "product",
  "description": "E-commerce product",
  "fields": [...],
  "createdAt": "2025-01-10T17:00:00.000Z",
  "updatedAt": "2025-01-10T17:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/v1/content-types \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "slug": "product",
    "fields": [
      {
        "name": "description",
        "type": "textarea",
        "required": true
      }
    ]
  }'
```

### Update Content Type

Update an existing content type.

**Endpoint**: `PUT /content-types/:id`

**Authentication**: Required (ADMIN role)

**Request Body**: Same as create

**Success Response** (200 OK): Same as create

**cURL Example**: Similar to create with PUT method

### Delete Content Type

Delete a content type (only if no content items exist).

**Endpoint**: `DELETE /content-types/:id`

**Authentication**: Required (ADMIN role)

**Success Response** (200 OK):
```json
{
  "message": "Content type deleted successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Cannot delete content type with existing content"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3001/api/v1/content-types/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Health Check

### Health Status

Check API health and database connectivity.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T18:00:00.000Z",
  "uptime": 86400,
  "database": "connected"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/v1/health
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployments, consider adding:
- Rate limiting middleware (e.g., express-rate-limit)
- API key-based quotas for AI generation
- File upload size and frequency limits

---

## Versioning

The API is versioned via URL path: `/api/v1/`

Future versions will use `/api/v2/`, etc., allowing backward compatibility.

---

## Pagination

List endpoints support pagination via query parameters:
- `page` - Page number (1-indexed)
- `limit` - Items per page

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## Filtering

List endpoints support filtering via query parameters:
- Content: `contentTypeId`, `status`, `search`
- Media: `mimeType`, `search`

Example:
```
GET /content?status=published&contentTypeId=1&search=keyword
```

---

## Notes

1. **File Uploads**: Maximum file size is 10MB (configurable via `MAX_FILE_SIZE` env var)
2. **AI Generation**: Requires `GEMINI_API_KEY` environment variable
3. **Permissions**: 
   - VIEWER: Read-only access
   - EDITOR: Can create/edit content
   - ADMIN: Full access including user and content type management
4. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
5. **Slugs**: Must be unique and URL-safe (lowercase, hyphens only)

---

For deployment guides, see [DEPLOYMENT.md](DEPLOYMENT.md).

For troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
