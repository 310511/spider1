#!/usr/bin/env python3
"""
Medicine Restocking ML Predictions Runner
This script runs the ML model training and generates predictions
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add the ml_models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml_models'))

from medicine_restocking_predictor import MedicineRestockingPredictor

def main():
    """
    Main function to run the ML predictions
    """
    print("=== Medicine Restocking ML Predictions ===")
    print(f"Started at: {datetime.now()}")
    
    try:
        # Initialize the predictor
        predictor = MedicineRestockingPredictor()
        
        # Create sample data file path
        data_file = 'data/medicine_inventory.csv'
        
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
        
        # Load and preprocess data
        print("\n1. Loading and preprocessing data...")
        df = predictor.load_and_preprocess_data(data_file)
        
        # Feature engineering
        print("\n2. Performing feature engineering...")
        df = predictor.feature_engineering(df)
        
        # Prepare features
        print("\n3. Preparing features for ML models...")
        X, y_restock_amount, y_days_until_restock = predictor.prepare_features(df)
        
        # Train models
        print("\n4. Training ML models...")
        restock_results, days_results = predictor.train_models(X, y_restock_amount, y_days_until_restock)
        
        # Feature importance analysis
        print("\n5. Analyzing feature importance...")
        feature_importance_df = predictor.feature_importance_analysis(X)
        
        # Create visualizations
        print("\n6. Creating visualizations...")
        predictor.create_visualizations(df, restock_results, days_results, feature_importance_df)
        
        # Save models
        print("\n7. Saving trained models...")
        predictor.save_models()
        
        # Generate sample predictions
        print("\n8. Generating sample predictions...")
        sample_data = df.head(10)
        predictions = predictor.predict_restocking_needs(sample_data)
        
        # Save predictions to CSV
        predictions.to_csv('data/sample_predictions.csv', index=False)
        print(f"Sample predictions saved to: data/sample_predictions.csv")
        
        # Print summary
        print("\n=== ML Predictions Summary ===")
        print(f"✓ Models trained successfully")
        print(f"✓ Best restock amount model: {max(restock_results.items(), key=lambda x: x[1]['r2'])[0]}")
        print(f"✓ Best days until restock model: {max(days_results.items(), key=lambda x: x[1]['r2'])[0]}")
        print(f"✓ Feature importance analysis completed")
        print(f"✓ Visualizations created")
        print(f"✓ Models saved to ml_models/ directory")
        print(f"✓ Sample predictions generated")
        
        print(f"\nCompleted at: {datetime.now()}")
        print("🎉 ML Predictions system is ready!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 