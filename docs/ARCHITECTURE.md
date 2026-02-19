# Architecture Documentation

## System Overview

The Delhi Traffic Monitoring System uses a 3-tier architecture with an Agentic AI layer for intelligent signal optimization.

## Component Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           React Frontend                │
                    │  (Dashboard, Map, Analytics, Admin)     │
                    └──────────────┬──────────────────────────┘
                                   │ REST + Socket.io
                                   ▼
                    ┌─────────────────────────────────────────┐
                    │         Node.js Backend                  │
                    │  Express, MongoDB, JWT, Socket.io        │
                    └──────────────┬──────────────────────────┘
                                   │ HTTP
                    ┌──────────────┴──────────────────────────┐
                    │         Python AI Service               │
                    │  FastAPI, Scikit-learn, 3 Agents        │
                    └──────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────────┐
                    │              MongoDB                     │
                    └─────────────────────────────────────────┘
```

## Agent Communication Flow

1. **Admin triggers optimization** → Backend POST /api/signals/optimize
2. **Backend fetches** recent traffic from MongoDB
3. **Backend sends** traffic data to AI service POST /api/optimize
4. **Monitoring Agent** (in AI) receives traffic data
5. **Prediction Agent** predicts congestion per junction using ML
6. **Optimization Agent** computes new green/red times via rules
7. **AI returns** updates to backend
8. **Backend persists** to MongoDB and **emits** via Socket.io
9. **Frontend** receives real-time signal updates

## FastAPI ↔ Node Backend Interaction

- Backend calls AI: `POST http://ai-service:8000/api/optimize` with `{ trafficData: [...] }`
- AI returns: `{ updates: [{ junctionName, greenTime, redTime }] }`
- Backend applies updates and emits to connected clients

## Data Flow

```
TrafficData (MongoDB) → Backend → AI Prediction → Optimization Rules → TrafficSignal (MongoDB)
                                                                              │
                                                                              ▼
                                                                    Socket.io → Frontend
```

## Security

- JWT for API authentication
- Admin-only: signal update, AI optimize
- CORS configured for frontend origin
