# Delhi Traffic Monitoring & Signal Optimization System

An intelligent traffic monitoring and signal optimization system for Delhi city using Agentic AI architecture. Built for academic submission with simplified but functional AI logic.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Tailwind CSS, Socket.io-client, Axios, React Router, Recharts, Leaflet |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT, REST APIs, Socket.io |
| **AI Layer** | Python, FastAPI, Scikit-learn, Rule-based optimization |
| **DevOps** | Docker, docker-compose, GitHub Actions |

## Delhi Junctions (Real Data)

- **AIIMS** - Major hospital area
- **ITO** - Central Delhi crossing
- **Connaught Place** - Commercial hub
- **Karol Bagh** - Shopping district
- **Lajpat Nagar** - Market area

## Agentic AI Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Monitoring     │────▶│  Prediction     │────▶│  Optimization  │
│  Agent          │     │  Agent          │     │  Agent          │
│                 │     │  (Random Forest)│     │  (Rule-based)   │
│ Fetches traffic │     │  Low/Med/High   │     │  High→+green    │
│ from DB         │     │  congestion     │     │  Low→-green     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                         FastAPI ←→ Node Backend
```

### Agent Flow

1. **Monitoring Agent**: Collects traffic data from MongoDB (via backend)
2. **Prediction Agent**: ML model predicts congestion (Low/Medium/High)
3. **Optimization Agent**: Rule-based logic adjusts signal timing

### Decision Logic (Optimization Agent)

- **High congestion** → Green +20s (max 120s), Red -10s
- **Medium** → Default (60s each)
- **Low congestion** → Green -15s (min 20s), Red +10s

## Project Structure

```
lyo/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + MongoDB
├── ai-service/        # Python FastAPI + Agents + ML
├── data/              # Delhi dataset & generation scripts
├── .github/workflows/ # CI
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (or use Docker)
- Git

### 1. Generate Dataset

```bash
cd data
node generate_dataset.js
# Creates delhi_traffic_sample.json (3500-5000 records)
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Edit if needed
npm install
npm run seed            # Seed MongoDB
npm run dev
# Runs on http://localhost:5000
```

### 3. AI Service

```bash
cd ai-service
pip install -r requirements.txt
python3 train_model.py  # Train ML model
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 5. Docker (All-in-one)

```bash
docker-compose up --build
# Wait for services to start, then seed the database:
docker exec delhi-traffic-backend npm run seed

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# AI:       http://localhost:8000
# MongoDB:  localhost:27017
```

## Default Credentials

- **Admin**: admin@delhi.gov.in / admin123
- **User**: Register via /register

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/traffic | Get traffic data |
| POST | /api/traffic | Add traffic record |
| GET | /api/traffic/prediction | Get congestion prediction |
| GET | /api/signals | Get signal timings |
| PUT | /api/signals/:junction | Update signal (admin) |
| POST | /api/signals/optimize | Run AI optimization (admin) |
| GET | /api/dashboard/stats | Dashboard statistics |

## MongoDB Schemas

- **User**: name, email, password, role
- **TrafficData**: junctionName, timestamp, vehicleCount, averageSpeed, congestionLevel, weatherCondition
- **TrafficSignal**: junctionName, greenTime, redTime, yellowTime, updatedBy
- **PredictionLog**: junctionName, predictedCongestion, confidence

## ER Diagram (Simplified)

```
User ────────────────────────────────────────
  │
  │ (auth for)
  ▼
TrafficData ◄─────── PredictionLog
  │
  │ (junction)
  ▼
TrafficSignal
```

## Branching Strategy

- **main**: Production-ready code
- **dev**: Development, feature branches merge here

## CI (GitHub Actions)

- Triggers on push/PR to main, dev
- Jobs: backend check, frontend build, AI model training

## Viva Tips

1. **Explain agent flow**: Monitoring → Prediction → Optimization
2. **ML model**: Random Forest, features: vehicleCount, averageSpeed, hour, weather
3. **Rule-based optimization**: Simple if-else, explainable
4. **Real-time**: Socket.io emits signal updates to dashboard

## License

Academic use only.
Updated by team member for collaboration and project improvements.
## Team Contributions
- Documentation updates
- Testing support
- UI review
