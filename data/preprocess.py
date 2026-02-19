"""
Delhi Traffic Data Preprocessing Script
Prepares data for ML model training
"""

import pandas as pd
import json
import os
from pathlib import Path

def load_data(filepath='delhi_traffic_sample.json'):
    """Load traffic data from JSON"""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return pd.DataFrame(data)

def preprocess(df):
    """Preprocess data for ML"""
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_peak_hour'] = ((df['hour'] >= 8) & (df['hour'] <= 10)) | ((df['hour'] >= 17) & (df['hour'] <= 20))
    df['is_peak_hour'] = df['is_peak_hour'].astype(int)
    
    weather_map = {'Clear': 0, 'Cloudy': 1, 'Rain': 2, 'Fog': 3, 'Heat': 4}
    df['weather_encoded'] = df['weatherCondition'].map(weather_map)
    
    return df

def get_features_target(df):
    """Extract features and target for ML"""
    feature_cols = ['vehicleCount', 'averageSpeed', 'hour', 'day_of_week', 'is_peak_hour', 'weather_encoded']
    X = df[feature_cols]
    y = df['congestionLevel']
    return X, y

def main():
    script_dir = Path(__file__).parent
    data_path = script_dir / 'delhi_traffic_sample.json'
    
    if not data_path.exists():
        print("Run generate_dataset.js first to create delhi_traffic_sample.json")
        return
    
    df = load_data(data_path)
    df = preprocess(df)
    
    X, y = get_features_target(df)
    print(f"Dataset shape: {X.shape}")
    print(f"Target distribution:\n{y.value_counts()}")
    
    processed_path = script_dir / 'delhi_traffic_processed.csv'
    df.to_csv(processed_path, index=False)
    print(f"Saved processed data to {processed_path}")

if __name__ == '__main__':
    main()
