"""
Delhi Traffic Congestion Prediction - ML Model Training
Uses Random Forest for explainable predictions
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
from pathlib import Path

def load_and_preprocess():
    """Load and preprocess traffic data"""
    data_path = Path(__file__).parent / 'data' / 'delhi_traffic_sample.json'
    if not data_path.exists():
        data_path = Path(__file__).parent.parent / 'data' / 'delhi_traffic_sample.json'
    df = pd.read_json(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_peak_hour'] = ((df['hour'] >= 8) & (df['hour'] <= 10)) | ((df['hour'] >= 17) & (df['hour'] <= 20))
    df['is_peak_hour'] = df['is_peak_hour'].astype(int)
    weather_map = {'Clear': 0, 'Cloudy': 1, 'Rain': 2, 'Fog': 3, 'Heat': 4}
    df['weather_encoded'] = df['weatherCondition'].map(weather_map)
    return df

def main():
    df = load_and_preprocess()
    feature_cols = ['vehicleCount', 'averageSpeed', 'hour', 'day_of_week', 'is_peak_hour', 'weather_encoded']
    X = df[feature_cols]
    y = df['congestionLevel']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    model_dir = Path(__file__).parent / 'models'
    model_dir.mkdir(exist_ok=True)
    joblib.dump({'model': model, 'feature_cols': feature_cols}, model_dir / 'congestion_model.joblib')
    print(f"\nModel saved to {model_dir / 'congestion_model.joblib'}")

if __name__ == '__main__':
    main()
