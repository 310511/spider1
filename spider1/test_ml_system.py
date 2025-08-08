#!/usr/bin/env python3
"""
Test script for ML Medicine Restocking System
"""

import sys
import os
import json
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_data_loading():
    """Test if we can load the archive data"""
    try:
        import pandas as pd
        
        print("Testing data loading...")
        
        # Test loading daily sales data
        daily_data = pd.read_csv('archive/salesdaily.csv')
        print(f"✓ Daily sales data loaded: {len(daily_data)} rows")
        print(f"  Columns: {list(daily_data.columns)}")
        
        # Test loading weekly sales data
        weekly_data = pd.read_csv('archive/salesweekly.csv')
        print(f"✓ Weekly sales data loaded: {len(weekly_data)} rows")
        
        # Test loading monthly sales data
        monthly_data = pd.read_csv('archive/salesmonthly.csv')
        print(f"✓ Monthly sales data loaded: {len(monthly_data)} rows")
        
        # Show sample data
        print("\nSample daily data:")
        print(daily_data.head(3))
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return False

def test_ml_predictor():
    """Test the ML predictor"""
    try:
        from ml_models.medicine_restocking_predictor import MedicineRestockingPredictor
        
        print("\nTesting ML predictor...")
        
        # Initialize predictor
        predictor = MedicineRestockingPredictor()
        print("✓ Predictor initialized")
        
        # Test data loading
        data = predictor.load_and_preprocess_data()
        print(f"✓ Data preprocessed: {len(data)} rows")
        
        # Test model training (this will take some time)
        print("Training models...")
        predictor.train_models()
        print("✓ Models trained successfully")
        
        # Test predictions
        predictions = predictor.predict_restocking_needs()
        print(f"✓ Predictions generated for {len(predictions)} categories")
        
        # Test report generation
        report = predictor.generate_restocking_report(predictions)
        print("✓ Report generated successfully")
        
        # Save test results
        test_results = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "predictions_count": len(predictions),
            "categories": list(predictions.keys()),
            "report_length": len(report)
        }
        
        with open('ml_models/test_results.json', 'w') as f:
            json.dump(test_results, f, indent=2)
        
        print("✓ Test results saved to ml_models/test_results.json")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in ML predictor: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("=== ML Medicine Restocking System Test ===")
    print(f"Started at: {datetime.now()}")
    
    # Test 1: Data loading
    data_ok = test_data_loading()
    
    if data_ok:
        # Test 2: ML predictor
        ml_ok = test_ml_predictor()
        
        if ml_ok:
            print("\n🎉 All tests passed! ML system is working correctly.")
            print("\nNext steps:")
            print("1. The ML models are trained and ready to use")
            print("2. Predictions can be generated for medicine restocking")
            print("3. The frontend can now display real ML predictions")
        else:
            print("\n❌ ML predictor test failed")
    else:
        print("\n❌ Data loading test failed")
    
    print(f"\nTest completed at: {datetime.now()}")

if __name__ == "__main__":
    main() 