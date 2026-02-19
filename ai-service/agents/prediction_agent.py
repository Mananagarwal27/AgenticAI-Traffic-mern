"""
Prediction Agent - ML model predicts congestion level (Low/Medium/High)
"""

from typing import Dict, Any, Tuple
import joblib
from pathlib import Path
from datetime import datetime

class PredictionAgent:
    """Uses trained Random Forest to predict congestion level"""
    
    def __init__(self):
        self.model = None
        self.feature_cols = None
        self._load_model()
    
    def _load_model(self):
        """Load trained model"""
        model_path = Path(__file__).parent.parent / 'models' / 'congestion_model.joblib'
        if model_path.exists():
            data = joblib.load(model_path)
            self.model = data['model']
            self.feature_cols = data['feature_cols']
        else:
            self.model = None
            self.feature_cols = ['vehicleCount', 'averageSpeed', 'hour', 'day_of_week', 'is_peak_hour', 'weather_encoded']
    
    def predict(self, vehicle_count: int, average_speed: float, weather: str = "Clear", junction: str = "") -> Tuple[str, float]:
        """
        Predict congestion level
        Returns: (predicted_level, confidence)
        """
        if self.model is None:
            return self._rule_based_fallback(vehicle_count, average_speed), 0.7
        
        now = datetime.now()
        weather_map = {'Clear': 0, 'Cloudy': 1, 'Rain': 2, 'Fog': 3, 'Heat': 4}
        is_peak = 1 if (8 <= now.hour <= 10) or (17 <= now.hour <= 20) else 0
        
        features = [[
            vehicle_count,
            average_speed,
            now.hour,
            now.weekday(),
            is_peak,
            weather_map.get(weather, 0)
        ]]
        
        pred = self.model.predict(features)[0]
        proba = self.model.predict_proba(features)[0]
        idx = list(self.model.classes_).index(pred)
        confidence = float(proba[idx])
        
        return pred, confidence
    
    def _rule_based_fallback(self, vehicle_count: int, average_speed: float) -> str:
        """Fallback when model not loaded"""
        if vehicle_count > 80 or average_speed < 15:
            return "High"
        if vehicle_count > 50 or average_speed < 25:
            return "Medium"
        return "Low"
