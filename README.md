```markdown
# Creator Dashboard

A full-stack application for content creators to manage profiles, earn credits, and interact with personalized content feeds from various social media platforms.

---

## ✨ Features

- **JWT-based Authentication**: Secure login and registration with role-based access control (User/Admin)
- **Credit Points System**: Earn credits for daily logins, profile completion, and content interactions
- **Multi-source Content Feed**: Aggregated content from Twitter and Reddit APIs
- **User Dashboard**: View credit balance, saved content, and activity history
- **Admin Dashboard**: Monitor user analytics and content activity
- **Content Management**: Save, share, and report content from the feed
- **Extra Features**:
  - Redis caching for improved performance
  - Real-time notifications using WebSockets

---

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB Atlas
- Redis
- JWT (Authentication)
- Docker
- Socket.io

### Frontend
- React.js
- Tailwind CSS
- Axios
- Socket.io client

### Deployment
- **Backend**: Google Cloud Run  
- **Frontend**: Firebase Hosting

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Redis (optional for caching)
- Google Cloud account
- Firebase account

---

### 🔑 Environment Variables

#### Backend (`.env`)
```

NODE\_ENV=development
PORT=5000
MONGO\_URI=your\_mongodb\_atlas\_uri
JWT\_SECRET=your\_secret\_key
JWT\_EXPIRE=30d
REDIS\_URL=your\_redis\_url

TWITTER\_API\_KEY=your\_twitter\_api\_key
TWITTER\_API\_SECRET=your\_twitter\_api\_secret
TWITTER\_ACCESS\_TOKEN=your\_access\_token
TWITTER\_ACCESS\_SECRET=your\_access\_secret

REDDIT\_CLIENT\_ID=your\_reddit\_client\_id
REDDIT\_CLIENT\_SECRET=your\_reddit\_client\_secret
REDDIT\_USERNAME=your\_reddit\_username
REDDIT\_PASSWORD=your\_reddit\_password

```

#### Frontend (`.env`)
```

REACT\_APP\_API\_URL=[http://localhost:5000/api](http://localhost:5000/api)

````

---

### 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/creator-dashboard.git
   cd creator-dashboard
````

2. Install backend dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../client
   npm install
   ```

4. Start the backend server:

   ```bash
   cd ../server
   npm run dev
   ```

5. Start the frontend server:

   ```bash
   cd ../client
   npm start
   ```

App should now be running:

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:3000`

---

## ☁️ Deployment

### Backend (Google Cloud Run)

1. Build the Docker image:

   ```bash
   cd server
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/creator-dashboard-api
   ```

2. Deploy:

   ```bash
   gcloud run deploy creator-dashboard-api \
     --image gcr.io/YOUR_PROJECT_ID/creator-dashboard-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="MONGO_URI=your_uri,JWT_SECRET=your_secret"
   ```

### Frontend (Firebase)

1. Build the React app:

   ```bash
   cd client
   npm run build
   ```

2. Deploy:

   ```bash
   firebase deploy --only hosting
   ```

---

## 📚 API Documentation

### Base URL

* Development: `http://localhost:5000/api`
* Production: `https://creator-dashboard-api-abcdef.run.app/api`

---

### 🔐 Authentication Endpoints

#### Register User

* **URL**: `/auth/register`
* **Method**: `POST`
* **Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response**:

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "data": {
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "credits": 10
  }
}
```

**Error**:

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

#### Login User

* **URL**: `/auth/login`
* **Method**: `POST`
* **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response**:

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "data": {
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "credits": 15
  }
}
```

**Error**:

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

#### Get Current User

* **URL**: `/auth/me`
* **Method**: `GET`
* **Headers**:

  ```
  Authorization: Bearer <token>
  ```

**Success Response**:

```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "credits": 15,
    "profile": {
      "bio": "Web developer",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

**Error**:

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 📥 Feed Endpoints

#### Get Feed Content

* **URL**: `/feed`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`

**Success**:

```json
{
  "success": true,
  "data": [
    {
      "id": "tw1",
      "source": "twitter",
      "title": "Web Development Trends",
      "description": "Check out these amazing web development trends",
      "image": "https://example.com/image1.jpg",
      "url": "https://twitter.com/user/status/123",
      "upvotes": 42,
      "comments": 5,
      "createdAt": "2023-04-25T15:30:00Z"
    },
    {
      "id": "rd1",
      "source": "reddit",
      "title": "MERN Stack Tutorial",
      "description": "A comprehensive guide to MERN stack",
      "image": "https://example.com/image2.jpg",
      "url": "https://reddit.com/r/webdev/comments/123",
      "upvotes": 78,
      "comments": 23,
      "createdAt": "2023-04-25T12:15:00Z"
    }
  ],
  "fromCache": false
}
```

---

#### Save Content

* **URL**: `/feed/save`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Body**:

```json
{
  "contentId": "tw1",
  "source": "twitter",
  "title": "Web Development Trends",
  "description": "Check out these amazing web development trends",
  "image": "https://example.com/image1.jpg",
  "url": "https://twitter.com/user/status/123"
}
```

**Success**:

```json
{
  "success": true,
  "message": "Content saved successfully",
  "creditsEarned": 2
}
```

---

## 📊 Dashboard Endpoints

* `GET /dashboard` – Get user dashboard data
* `GET /dashboard/saved` – Get saved content
* `GET /dashboard/activities` – Get user activities
* `GET /dashboard/admin` – Admin-only dashboard analytics

---

## 🔔 Notification Endpoints

* `GET /notifications` – Get all notifications
* `PUT /notifications/read` – Mark notifications as read

---

## 🧪 Testing

### Backend:

```bash
cd server
npm test
```

### Frontend:

```bash
cd client
npm test
```

```
