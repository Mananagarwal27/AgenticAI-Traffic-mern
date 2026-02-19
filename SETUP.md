# Setup Instructions

## Local Development (Without Docker)

### 1. Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB running locally (or Docker: `docker run -d -p 27017:27017 mongo:7`)

### 2. Generate Dataset
```bash
cd data
node generate_dataset.js
cd ..
```

### 3. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
Backend runs on http://localhost:5000

### 4. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python3 train_model.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
AI runs on http://localhost:8000

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000 (Vite proxies /api and /socket.io to backend)

### 6. Test
- Open http://localhost:3000
- Register or login with admin@delhi.gov.in / admin123
- View dashboard, map, analytics
- As admin: Run AI Optimization from Admin panel

---

## Docker Setup

```bash
# Build and start all services
docker-compose up --build

# In another terminal, seed the database
docker exec delhi-traffic-backend npm run seed

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# AI Service: http://localhost:8000
```

---

## Environment Variables

### Backend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/delhi_traffic | MongoDB connection |
| JWT_SECRET | (change in production) | JWT signing key |
| AI_SERVICE_URL | http://localhost:8000 | AI service URL |
| FRONTEND_URL | http://localhost:3000 | CORS origin |

### Frontend (build-time)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | API base URL (empty = same origin) |
| VITE_SOCKET_URL | Socket.io URL (empty = same origin) |
