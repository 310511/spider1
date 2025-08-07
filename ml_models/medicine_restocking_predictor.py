import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MedicineRestockingPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = ['Year', 'Month', 'Hour', 'Weekday_encoded']
        self.model_path = 'ml_models/trained_models/'
        self.scaler_path = 'ml_models/scalers/'
        
        # Create directories if they don't exist
        os.makedirs(self.model_path, exist_ok=True)
        os.makedirs(self.scaler_path, exist_ok=True)
    
    def load_and_preprocess_data(self):
        """Load and preprocess sales data from archive folder"""
        print("Loading sales data...")
        
        # Load daily sales data
        daily_data = pd.read_csv('archive/salesdaily.csv')
        
        # Convert date column
        daily_data['datum'] = pd.to_datetime(daily_data['datum'])
        
        # Create additional features
        daily_data['Weekday_encoded'] = pd.Categorical(daily_data['Weekday Name']).codes
        daily_data['Day_of_month'] = daily_data['datum'].dt.day
        daily_data['Week_of_year'] = daily_data['datum'].dt.isocalendar().week
        daily_data['Quarter'] = daily_data['datum'].dt.quarter
        
        # Get medicine categories from the data
        self.medicine_categories = [col for col in daily_data.columns if col not in 
                                  ['datum', 'Year', 'Month', 'Hour', 'Weekday Name', 'Weekday_encoded', 
                                   'Day_of_month', 'Week_of_year', 'Quarter']]
        
        # Add lag features for time series analysis
        for category in self.medicine_categories:
            daily_data[f'{category}_lag_1'] = daily_data[category].shift(1)
            daily_data[f'{category}_lag_7'] = daily_data[category].shift(7)
            daily_data[f'{category}_lag_30'] = daily_data[category].shift(30)
            
            # Rolling averages
            daily_data[f'{category}_rolling_7'] = daily_data[category].rolling(window=7).mean()
            daily_data[f'{category}_rolling_30'] = daily_data[category].rolling(window=30).mean()
        
        # Drop rows with NaN values (from lag features)
        daily_data = daily_data.dropna()
        
        return daily_data
    
    def prepare_features(self, data, target_category):
        """Prepare features for a specific medicine category"""
        feature_cols = self.feature_columns + [
            'Day_of_month', 'Week_of_year', 'Quarter',
            f'{target_category}_lag_1', f'{target_category}_lag_7', f'{target_category}_lag_30',
            f'{target_category}_rolling_7', f'{target_category}_rolling_30'
        ]
        
        # Add other categories as features
        for category in self.medicine_categories:
            if category != target_category:
                feature_cols.extend([
                    f'{category}_lag_1', f'{category}_lag_7', f'{category}_lag_30',
                    f'{category}_rolling_7', f'{category}_rolling_30'
                ])
        
        return feature_cols
    
    def train_models(self):
        """Train separate models for each medicine category"""
        print("Training ML models for medicine restocking prediction...")
        
        # Load and preprocess data
        data = self.load_and_preprocess_data()
        
        for category in self.medicine_categories:
            print(f"\nTraining model for {category}...")
            
            # Prepare features
            feature_cols = self.prepare_features(data, category)
            X = data[feature_cols]
            y = data[category]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            
            model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            print(f"  MAE: {mae:.2f}")
            print(f"  RMSE: {rmse:.2f}")
            print(f"  R²: {r2:.3f}")
            
            # Save model and scaler
            self.models[category] = model
            self.scalers[category] = scaler
            
            # Save to disk
            joblib.dump(model, f'{self.model_path}{category}_model.pkl')
            joblib.dump(scaler, f'{self.scaler_path}{category}_scaler.pkl')
        
        print("\nAll models trained and saved successfully!")
    
    def load_models(self):
        """Load trained models from disk"""
        print("Loading trained models...")
        
        # First, get the medicine categories from data
        try:
            data = self.load_and_preprocess_data()
            self.medicine_categories = [col for col in data.columns if col not in 
                                      ['datum', 'Year', 'Month', 'Hour', 'Weekday Name', 'Weekday_encoded', 
                                       'Day_of_month', 'Week_of_year', 'Quarter']]
        except:
            # Fallback to default categories if data loading fails
            self.medicine_categories = ['M01AB', 'M01AE', 'N02BA', 'N02BE', 'N05B', 'N05C', 'R03', 'R06']
        
        for category in self.medicine_categories:
            model_file = f'{self.model_path}{category}_model.pkl'
            scaler_file = f'{self.scaler_path}{category}_scaler.pkl'
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                self.models[category] = joblib.load(model_file)
                self.scalers[category] = joblib.load(scaler_file)
                print(f"  Loaded model for {category}")
            else:
                print(f"  Model for {category} not found. Please train models first.")
                return False
        
        return True
    
    def predict_for_inventory_items(self, inventory_items):
        """Predict restocking needs for actual inventory items"""
        if not self.models:
            print("No models loaded. Please train or load models first.")
            return None
        
        # Load recent data for prediction
        data = self.load_and_preprocess_data()
        
        # Get the latest data point
        latest_data = data.iloc[-1:].copy()
        
        predictions = {}
        
        # Map inventory items to medicine categories
        inventory_mapping = self._map_inventory_to_categories(inventory_items)
        
        for item in inventory_items:
            # Find the best matching category for this inventory item
            category = self._find_best_category_match(item, inventory_mapping)
            
            if category and category in self.models:
                model = self.models[category]
                scaler = self.scalers[category]
                
                # Prepare features for prediction
                feature_cols = self.prepare_features(data, category)
                X_pred = latest_data[feature_cols]
                X_pred_scaled = scaler.transform(X_pred)
                
                # Make prediction
                predicted_demand = model.predict(X_pred_scaled)[0]
                
                # Calculate restocking threshold (e.g., 7 days of average demand)
                avg_demand = data[category].tail(30).mean()
                restocking_threshold = avg_demand * 7
                
                # Use actual inventory stock
                current_stock = item.stock
                restocking_needed = current_stock < restocking_threshold
                
                predictions[item.name] = {
                    'category': category,
                    'predicted_demand': predicted_demand,
                    'current_stock': current_stock,
                    'restocking_threshold': restocking_threshold,
                    'restocking_needed': restocking_needed,
                    'days_until_stockout': max(0, int((current_stock - restocking_threshold) / avg_demand)) if avg_demand > 0 else 0,
                    'threshold': item.threshold,
                    'status': item.status
                }
            else:
                # Fallback prediction for items without matching categories
                predictions[item.name] = {
                    'category': 'Unknown',
                    'predicted_demand': 10.0,  # Default prediction
                    'current_stock': item.stock,
                    'restocking_threshold': item.threshold * 0.7,
                    'restocking_needed': item.stock < item.threshold,
                    'days_until_stockout': max(0, int((item.stock - item.threshold) / 10)) if item.stock > 0 else 0,
                    'threshold': item.threshold,
                    'status': item.status
                }
        
        return predictions
    
    def _map_inventory_to_categories(self, inventory_items):
        """Map inventory items to medicine categories based on names and categories"""
        mapping = {}
        
        # Medicine category descriptions
        category_descriptions = {
            'M01AB': 'anti-inflammatory antirheumatic non-steroids',
            'M01AE': 'anti-inflammatory antirheumatic acetic acid',
            'N02BA': 'analgesics anilides paracetamol',
            'N02BE': 'analgesics pyrazolones salicylic acid',
            'N05B': 'anxiolytics benzodiazepine',
            'N05C': 'hypnotics sedatives',
            'R03': 'obstructive airway diseases',
            'R06': 'antihistamines systemic'
        }
        
        for item in inventory_items:
            best_match = None
            best_score = 0
            
            # Check item name against category descriptions
            item_lower = item.name.lower()
            
            for category, description in category_descriptions.items():
                score = 0
                desc_words = description.lower().split()
                
                for word in desc_words:
                    if word in item_lower:
                        score += 1
                
                if score > best_score:
                    best_score = score
                    best_match = category
            
            # Also check item category
            if item.category:
                category_lower = item.category.lower()
                for category, description in category_descriptions.items():
                    if any(word in category_lower for word in description.split()):
                        best_match = category
                        break
            
            mapping[item.name] = best_match
        
        return mapping
    
    def _find_best_category_match(self, item, mapping):
        """Find the best matching category for an inventory item"""
        return mapping.get(item.name)
    
    def predict_restocking_needs(self, days_ahead=30):
        """Predict restocking needs for the next N days (legacy method)"""
        if not self.models:
            print("No models loaded. Please train or load models first.")
            return None
        
        # Load recent data for prediction
        data = self.load_and_preprocess_data()
        
        # Get the latest data point
        latest_data = data.iloc[-1:].copy()
        
        predictions = {}
        
        for category in self.medicine_categories:
            if category not in self.models:
                continue
            
            model = self.models[category]
            scaler = self.scalers[category]
            
            # Prepare features for prediction
            feature_cols = self.prepare_features(data, category)
            X_pred = latest_data[feature_cols]
            X_pred_scaled = scaler.transform(X_pred)
            
            # Make prediction
            prediction = model.predict(X_pred_scaled)[0]
            
            # Calculate restocking threshold (e.g., 7 days of average demand)
            avg_demand = data[category].tail(30).mean()
            restocking_threshold = avg_demand * 7
            
            # Determine if restocking is needed
            current_stock = prediction  # Simplified assumption
            restocking_needed = current_stock < restocking_threshold
            
            predictions[category] = {
                'predicted_demand': prediction,
                'current_stock': current_stock,
                'restocking_threshold': restocking_threshold,
                'restocking_needed': restocking_needed,
                'days_until_stockout': max(0, int((current_stock - restocking_threshold) / avg_demand)) if avg_demand > 0 else 0
            }
        
        return predictions
    
    def get_medicine_info(self):
        """Get information about medicine categories"""
        medicine_info = {
            'M01AB': 'Anti-inflammatory and antirheumatic products, non-steroids',
            'M01AE': 'Anti-inflammatory and antirheumatic products, acetic acid derivatives',
            'N02BA': 'Analgesics, anilides (paracetamol)',
            'N02BE': 'Analgesics, pyrazolones and pyrazolones with salicylic acid',
            'N05B': 'Anxiolytics, benzodiazepine derivatives',
            'N05C': 'Hypnotics and sedatives',
            'R03': 'Drugs for obstructive airway diseases',
            'R06': 'Antihistamines for systemic use'
        }
        return medicine_info
    
    def generate_restocking_report(self, predictions):
        """Generate a comprehensive restocking report"""
        if not predictions:
            return "No predictions available."
        
        report = "=== MEDICINE RESTOCKING PREDICTION REPORT ===\n\n"
        report += f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        medicine_info = self.get_medicine_info()
        
        # Categorize by urgency
        urgent = []
        moderate = []
        safe = []
        
        for item_name, pred in predictions.items():
            if pred['restocking_needed']:
                if pred['days_until_stockout'] <= 7:
                    urgent.append((item_name, pred))
                elif pred['days_until_stockout'] <= 14:
                    moderate.append((item_name, pred))
            else:
                safe.append((item_name, pred))
        
        # Urgent restocking needed
        if urgent:
            report += "🚨 URGENT RESTOCKING NEEDED:\n"
            report += "=" * 40 + "\n"
            for item_name, pred in urgent:
                info = medicine_info.get(pred.get('category', ''), pred.get('category', 'Unknown'))
                report += f"• {item_name} ({info})\n"
                report += f"  - Predicted demand: {pred['predicted_demand']:.2f} units\n"
                report += f"  - Current stock: {pred['current_stock']:.2f} units\n"
                report += f"  - Days until stockout: {pred['days_until_stockout']} days\n"
                report += f"  - Restocking threshold: {pred['restocking_threshold']:.2f} units\n\n"
        
        # Moderate restocking needed
        if moderate:
            report += "⚠️ MODERATE RESTOCKING NEEDED:\n"
            report += "=" * 40 + "\n"
            for item_name, pred in moderate:
                info = medicine_info.get(pred.get('category', ''), pred.get('category', 'Unknown'))
                report += f"• {item_name} ({info})\n"
                report += f"  - Predicted demand: {pred['predicted_demand']:.2f} units\n"
                report += f"  - Current stock: {pred['current_stock']:.2f} units\n"
                report += f"  - Days until stockout: {pred['days_until_stockout']} days\n\n"
        
        # Safe stock levels
        if safe:
            report += "✅ SAFE STOCK LEVELS:\n"
            report += "=" * 40 + "\n"
            for item_name, pred in safe:
                info = medicine_info.get(pred.get('category', ''), pred.get('category', 'Unknown'))
                report += f"• {item_name} ({info})\n"
                report += f"  - Predicted demand: {pred['predicted_demand']:.2f} units\n"
                report += f"  - Current stock: {pred['current_stock']:.2f} units\n\n"
        
        # Summary
        report += "📊 SUMMARY:\n"
        report += "=" * 40 + "\n"
        report += f"• Urgent restocking needed: {len(urgent)} items\n"
        report += f"• Moderate restocking needed: {len(moderate)} items\n"
        report += f"• Safe stock levels: {len(safe)} items\n"
        report += f"• Total items monitored: {len(predictions)}\n"
        
        return report

def main():
    """Main function to train models and generate predictions"""
    predictor = MedicineRestockingPredictor()
    
    # Check if models exist, if not train them
    if not predictor.load_models():
        print("Training new models...")
        predictor.train_models()
        predictor.load_models()
    
    # Generate predictions
    print("\nGenerating restocking predictions...")
    predictions = predictor.predict_restocking_needs(days_ahead=30)
    
    if predictions:
        # Generate and print report
        report = predictor.generate_restocking_report(predictions)
        print(report)
        
        # Save report to file
        with open('ml_models/restocking_report.txt', 'w') as f:
            f.write(report)
        
        print("Report saved to ml_models/restocking_report.txt")
        
        return predictions
    else:
        print("Failed to generate predictions.")
        return None

if __name__ == "__main__":
    main() 