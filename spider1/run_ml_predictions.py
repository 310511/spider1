#!/usr/bin/env python3
"""
Medicine Restocking Prediction Runner
Uses sales data from archive folder to predict restocking needs
"""

import sys
import os
import json
from datetime import datetime
import pandas as pd

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_models.medicine_restocking_predictor import MedicineRestockingPredictor

def run_predictions():
    """Run ML predictions and return results as JSON"""
    try:
        print("Starting medicine restocking predictions...")
        
        # Initialize predictor
        predictor = MedicineRestockingPredictor()
        
        # Check if models exist, if not train them
        if not predictor.load_models():
            print("Training new models...")
            predictor.train_models()
            predictor.load_models()
        
        # Generate predictions
        print("Generating restocking predictions...")
        predictions = predictor.predict_restocking_needs(days_ahead=30)
        
        if not predictions:
            return {
                "success": False,
                "error": "Failed to generate predictions",
                "timestamp": datetime.now().isoformat()
            }
        
        # Generate report
        report = predictor.generate_restocking_report(predictions)
        
        # Save report to file
        os.makedirs('ml_models', exist_ok=True)
        with open('ml_models/restocking_report.txt', 'w') as f:
            f.write(report)
        
        # Prepare results for frontend
        medicine_info = predictor.get_medicine_info()
        
        # Categorize predictions
        urgent = []
        moderate = []
        safe = []
        
        for category, pred in predictions.items():
            category_info = {
                "category": category,
                "description": medicine_info.get(category, category),
                "predicted_demand": round(pred['predicted_demand'], 2),
                "current_stock": round(pred['current_stock'], 2),
                "restocking_threshold": round(pred['restocking_threshold'], 2),
                "restocking_needed": pred['restocking_needed'],
                "days_until_stockout": pred['days_until_stockout']
            }
            
            if pred['restocking_needed']:
                if pred['days_until_stockout'] <= 7:
                    urgent.append(category_info)
                elif pred['days_until_stockout'] <= 14:
                    moderate.append(category_info)
            else:
                safe.append(category_info)
        
        # Create summary
        summary = {
            "total_categories": len(predictions),
            "urgent_restocking": len(urgent),
            "moderate_restocking": len(moderate),
            "safe_stock_levels": len(safe),
            "timestamp": datetime.now().isoformat()
        }
        
        # Prepare final results
        results = {
            "success": True,
            "summary": summary,
            "predictions": {
                "urgent": urgent,
                "moderate": moderate,
                "safe": safe
            },
            "report": report,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save results as JSON for frontend
        with open('ml_models/prediction_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print("Predictions completed successfully!")
        print(f"Summary: {summary['urgent_restocking']} urgent, {summary['moderate_restocking']} moderate, {summary['safe_stock_levels']} safe")
        
        return results
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save error to file
        with open('ml_models/prediction_error.json', 'w') as f:
            json.dump(error_result, f, indent=2)
        
        print(f"Error during predictions: {e}")
        return error_result

def get_prediction_results():
    """Get the latest prediction results"""
    try:
        # Try to load results from file
        if os.path.exists('ml_models/prediction_results.json'):
            with open('ml_models/prediction_results.json', 'r') as f:
                return json.load(f)
        else:
            return {
                "success": False,
                "error": "No prediction results found. Run predictions first.",
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error loading results: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def main():
    """Main function"""
    print("=== Medicine Restocking Prediction Runner ===")
    
    # Run predictions
    results = run_predictions()
    
    if results["success"]:
        print("\n✅ Predictions completed successfully!")
        print(f"📊 Summary: {results['summary']}")
        
        # Print urgent items
        if results['predictions']['urgent']:
            print("\n🚨 URGENT RESTOCKING NEEDED:")
            for item in results['predictions']['urgent']:
                print(f"  • {item['category']}: {item['description']}")
                print(f"    Days until stockout: {item['days_until_stockout']}")
        
        # Print moderate items
        if results['predictions']['moderate']:
            print("\n⚠️ MODERATE RESTOCKING NEEDED:")
            for item in results['predictions']['moderate']:
                print(f"  • {item['category']}: {item['description']}")
                print(f"    Days until stockout: {item['days_until_stockout']}")
        
        print(f"\n📄 Report saved to: ml_models/restocking_report.txt")
        print(f"📄 Results saved to: ml_models/prediction_results.json")
        
    else:
        print(f"\n❌ Predictions failed: {results['error']}")
    
    return results

if __name__ == "__main__":
    main() 