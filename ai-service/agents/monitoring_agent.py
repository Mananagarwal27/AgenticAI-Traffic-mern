"""
Monitoring Agent - Collects traffic data and sends to prediction agent
"""

from typing import List, Dict, Any
import httpx

class MonitoringAgent:
    """Collects traffic data from database/API and prepares for prediction"""
    
    def __init__(self, backend_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
    
    async def fetch_recent_traffic(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch recent traffic data - in production would call backend API"""
        try:
            async with httpx.AsyncClient() as client:
                # For demo, we return empty - actual impl would use auth token
                response = await client.get(f"{self.backend_url}/api/traffic", params={"limit": limit})
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", [])
        except Exception as e:
            print(f"MonitoringAgent fetch error: {e}")
        return []
    
    def prepare_for_prediction(self, record: Dict) -> Dict:
        """Extract features needed for prediction"""
        return {
            "vehicleCount": record.get("vehicleCount", 0),
            "averageSpeed": record.get("averageSpeed", 30),
            "weatherCondition": record.get("weatherCondition", "Clear"),
            "junctionName": record.get("junctionName", "")
        }
