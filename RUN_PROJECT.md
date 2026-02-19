# How to Run Delhi Traffic Project

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **Python** 3.11+ ([Download](https://python.org))
- **MongoDB** (or use Docker for MongoDB only)
- **Docker Desktop** (for Docker option) ([Download](https://www.docker.com/products/docker-desktop))

---

## Option 1: Docker (Easiest – Everything in One Command)

### Step 1: Open Terminal in VS Code
- Press `` Ctrl+` `` (or `Cmd+` ` on Mac) to open the integrated terminal
- Or: **Terminal → New Terminal**

### Step 2: Run Docker
```bash
cd /Users/macbookair/Desktop/mern/AgenticAI-Traffic-mern
docker-compose up --build
```

Wait 2–3 minutes for all services to build and start.

### Step 3: Seed the Database
Open a **new terminal** (Terminal → New Terminal) and run:
```bash
docker exec delhi-traffic-backend npm run seed
```

### Step 4: Open the App
- **Frontend:** http://localhost:3000
- **Login:** admin@delhi.gov.in / admin123

### Stop Docker
Press `Ctrl+C` in the terminal, then:
```bash
docker-compose down
```

---

## Option 2: Local Development (Without Docker)

### One-Time Setup

**Terminal 1** – Run these once:
```bash
cd /Users/macbookair/Desktop/mern/AgenticAI-Traffic-mern

# 1. Generate dataset
node data/generate_dataset.js

# 2. Train ML model
python3 ai-service/train_model.py
```

**Start MongoDB** (if not installed, run in a separate terminal):
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

---

### Run All Services (3 Terminals)

**Terminal 1 – Backend**
```bash
cd /Users/macbookair/Desktop/mern/AgenticAI-Traffic-mern/backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
✅ Backend running on http://localhost:5000

---

**Terminal 2 – AI Service**
```bash
cd /Users/macbookair/Desktop/mern/AgenticAI-Traffic-mern/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
✅ AI Service running on http://localhost:8000

---

**Terminal 3 – Frontend**
```bash
cd /Users/macbookair/Desktop/mern/AgenticAI-Traffic-mern/frontend
npm install
npm run dev
```
✅ Frontend running on http://localhost:3000

---

### Open the App
- Go to **http://localhost:3000**
- Login: **admin@delhi.gov.in** / **admin123**

---

## How Everything Connects

```
┌─────────────┐     REST + Socket.io      ┌─────────────┐     HTTP      ┌─────────────┐
│   Frontend  │ ◄──────────────────────► │   Backend   │ ◄───────────► │  AI Service │
│  (React)    │    localhost:5000        │  (Node.js)  │  localhost:8000│  (Python)   │
│  :3000      │                           │  :5000      │               │  :8000      │
└─────────────┘                           └──────┬──────┘               └─────────────┘
                                                 │
                                                 │ MongoDB
                                                 ▼
                                          ┌─────────────┐
                                          │  MongoDB    │
                                          │  :27017     │
                                          └─────────────┘
```

- **Frontend** → calls Backend API and Socket.io for live updates
- **Backend** → stores data in MongoDB, calls AI for predictions/optimization
- **AI Service** → runs ML model and rule-based optimization

---

## Quick Reference

| Service   | URL                  | Login                    |
|-----------|----------------------|--------------------------|
| Frontend  | http://localhost:3000 | admin@delhi.gov.in / admin123 |
| Backend   | http://localhost:5000 | -                        |
| AI        | http://localhost:8000 | -                        |
