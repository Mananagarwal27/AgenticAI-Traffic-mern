"""
Optimization Agent - Rule-based traffic signal timing optimization
High congestion -> increase green time, Low congestion -> reduce green time
"""

from typing import List, Dict, Any
import httpx

class OptimizationAgent:
    """Rule-based logic for signal timing optimization"""
    
    BASE_GREEN = 60
    BASE_RED = 60
    MIN_GREEN = 20
    MAX_GREEN = 120
    
    def __init__(self, backend_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
    
    def compute_optimal_timing(self, junction_name: str, congestion_level: str) -> Dict[str, Any]:
        """
        Rule-based optimization:
        - High: increase green by 20s (max 120)
        - Medium: keep default
        - Low: decrease green by 15s (min 20)
        """
        if congestion_level == "High":
            green = min(self.BASE_GREEN + 20, self.MAX_GREEN)
            red = max(self.BASE_RED - 10, 40)
        elif congestion_level == "Low":
            green = max(self.BASE_GREEN - 15, self.MIN_GREEN)
            red = min(self.BASE_RED + 10, 90)
        else:
            green = self.BASE_GREEN
            red = self.BASE_RED
        
        return {
            "junctionName": junction_name,
            "greenTime": green,
            "redTime": red,
            "yellowTime": 5,
            "reason": f"Congestion: {congestion_level}"
        }
    
    async def apply_updates(self, updates: List[Dict]) -> bool:
        """Send updates to backend - backend will persist and emit via Socket.io"""
        # Backend has its own endpoint that we call; the optimize endpoint
        # triggers this agent and we return updates to backend
        return True
