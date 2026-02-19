"""
Delhi Traffic AI Service - FastAPI
Agent orchestration: Monitoring -> Prediction -> Optimization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os

from agents import MonitoringAgent, PredictionAgent, OptimizationAgent

app = FastAPI(title="Delhi Traffic AI Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/delhi_traffic")

monitoring_agent = MonitoringAgent(BACKEND_URL)
prediction_agent = PredictionAgent()
optimization_agent = OptimizationAgent(BACKEND_URL)


class PredictRequest(BaseModel):
    vehicleCount: int
    averageSpeed: float
    weatherCondition: Optional[str] = "Clear"
    junctionName: Optional[str] = ""


@app.get("/")
def root():
    return {"service": "Delhi Traffic AI", "status": "running"}


@app.get("/api/predict")
async def predict(
    vehicleCount: int,
    averageSpeed: float,
    weatherCondition: str = "Clear",
    junctionName: str = ""
):
    """Live inference endpoint - predicts congestion level"""
    predicted, confidence = prediction_agent.predict(
        vehicleCount, averageSpeed, weatherCondition, junctionName
    )
    return {
        "predictedCongestion": predicted,
        "confidence": round(confidence, 4),
        "features": {"vehicleCount": vehicleCount, "averageSpeed": averageSpeed, "weatherCondition": weatherCondition}
    }


class OptimizeRequest(BaseModel):
    trafficData: Optional[List[dict]] = None


@app.post("/api/optimize")
async def optimize(req: OptimizeRequest = OptimizeRequest()):
    """
    Agent orchestration:
    1. Monitoring Agent fetches recent traffic (or receives from backend)
    2. Prediction Agent predicts congestion per junction
    3. Optimization Agent computes new signal timings
    Returns updates for backend to persist and emit via Socket.io
    """
    traffic_data = req.trafficData if req.trafficData else await monitoring_agent.fetch_recent_traffic(limit=50)
    
    junction_congestion = {}
    for record in traffic_data:
        jn = record.get("junctionName", "")
        if not jn:
            continue
        features = monitoring_agent.prepare_for_prediction(record)
        pred, _ = prediction_agent.predict(
            features["vehicleCount"],
            features["averageSpeed"],
            features["weatherCondition"],
            jn
        )
        if jn not in junction_congestion or pred == "High":
            junction_congestion[jn] = pred
    
    junctions = ["AIIMS", "ITO", "Connaught Place", "Karol Bagh", "Lajpat Nagar"]
    updates = []
    for jn in junctions:
        level = junction_congestion.get(jn, "Medium")
        update = optimization_agent.compute_optimal_timing(jn, level)
        updates.append(update)
    
    # Backend receives these updates and persists + emits via Socket.io
    return {"updates": updates, "junctionCongestion": junction_congestion}
