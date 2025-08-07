import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.feature_selection import SelectKBest, f_regression
import xgboost as xgb
import lightgbm as lgb
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MedicineRestockingPredictor:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_importance = {}
        self.best_model = None
        self.best_model_name = None
        
    def load_and_preprocess_data(self, file_path):
        """
        Load and preprocess medicine inventory data
        """
        print("Loading and preprocessing data...")
        
        # Load the dataset
        try:
            df = pd.read_csv(file_path)
        except FileNotFoundError:
            print(f"File {file_path} not found. Creating sample data...")
            df = self._create_sample_data()
        
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        
        # Display basic info
        print("\nDataset Info:")
        print(df.info())
        print("\nFirst few rows:")
        print(df.head())
        
        return df
    
    def _create_sample_data(self):
        """
        Create sample medicine inventory data for demonstration
        """
        np.random.seed(42)
        n_samples = 10000
        
        # Generate sample data
        medicines = [
            'Paracetamol', 'Ibuprofen', 'Aspirin', 'Omeprazole', 'Metformin',
            'Amlodipine', 'Lisinopril', 'Atorvastatin', 'Metoprolol', 'Losartan',
            'Hydrochlorothiazide', 'Sertraline', 'Escitalopram', 'Bupropion', 'Venlafaxine',
            'Albuterol', 'Fluticasone', 'Montelukast', 'Cetirizine', 'Loratadine'
        ]
        
        categories = ['Pain Relief', 'Cardiovascular', 'Diabetes', 'Mental Health', 'Respiratory']
        
        data = {
            'medicine_id': range(1, n_samples + 1),
            'medicine_name': np.random.choice(medicines, n_samples),
            'category': np.random.choice(categories, n_samples),
            'current_stock': np.random.randint(0, 500, n_samples),
            'daily_consumption': np.random.randint(1, 50, n_samples),
            'days_since_last_restock': np.random.randint(1, 90, n_samples),
            'supplier_lead_time': np.random.randint(1, 30, n_samples),
            'unit_cost': np.random.uniform(0.5, 50, n_samples),
            'shelf_life_days': np.random.randint(30, 1095, n_samples),
            'temperature_sensitive': np.random.choice([0, 1], n_samples),
            'critical_medicine': np.random.choice([0, 1], n_samples),
            'seasonal_demand': np.random.choice([0, 1], n_samples),
            'month': np.random.randint(1, 13, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.choice([0, 1], n_samples),
            'days_to_expiry': np.random.randint(1, 365, n_samples),
            'restock_amount': np.random.randint(50, 1000, n_samples),
            'days_until_restock': np.random.randint(1, 30, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Add some realistic patterns
        df['stock_level_percentage'] = (df['current_stock'] / (df['daily_consumption'] * 30)) * 100
        df['consumption_rate'] = df['daily_consumption'] / df['current_stock'].replace(0, 1)
        df['urgency_score'] = (100 - df['stock_level_percentage']) + (df['critical_medicine'] * 50)
        
        return df
    
    def feature_engineering(self, df):
        """
        Create additional features for better prediction
        """
        print("Performing feature engineering...")
        
        # Create new features
        df['stock_to_consumption_ratio'] = df['current_stock'] / df['daily_consumption'].replace(0, 1)
        df['days_of_stock_remaining'] = df['current_stock'] / df['daily_consumption'].replace(0, 1)
        df['restock_urgency'] = np.where(df['days_of_stock_remaining'] < 7, 3,
                                        np.where(df['days_of_stock_remaining'] < 14, 2, 1))
        
        # Seasonal features
        df['is_winter'] = df['month'].isin([12, 1, 2]).astype(int)
        df['is_summer'] = df['month'].isin([6, 7, 8]).astype(int)
        df['is_flu_season'] = df['month'].isin([10, 11, 12, 1, 2, 3]).astype(int)
        
        # Risk features
        df['expiry_risk'] = np.where(df['days_to_expiry'] < 30, 3,
                                   np.where(df['days_to_expiry'] < 90, 2, 1))
        df['supply_risk'] = np.where(df['supplier_lead_time'] > 14, 3,
                                   np.where(df['supplier_lead_time'] > 7, 2, 1))
        
        # Interaction features
        df['critical_temp_sensitive'] = df['critical_medicine'] * df['temperature_sensitive']
        df['seasonal_critical'] = df['seasonal_demand'] * df['critical_medicine']
        
        return df
    
    def prepare_features(self, df):
        """
        Prepare features for ML models
        """
        print("Preparing features for ML models...")
        
        # Select features for prediction
        feature_columns = [
            'current_stock', 'daily_consumption', 'days_since_last_restock',
            'supplier_lead_time', 'unit_cost', 'shelf_life_days', 'temperature_sensitive',
            'critical_medicine', 'seasonal_demand', 'month', 'day_of_week', 'is_weekend',
            'days_to_expiry', 'stock_level_percentage', 'consumption_rate', 'urgency_score',
            'stock_to_consumption_ratio', 'days_of_stock_remaining', 'restock_urgency',
            'is_winter', 'is_summer', 'is_flu_season', 'expiry_risk', 'supply_risk',
            'critical_temp_sensitive', 'seasonal_critical'
        ]
        
        # Categorical features
        categorical_features = ['medicine_name', 'category']
        
        # Encode categorical features
        for feature in categorical_features:
            if feature in df.columns:
                le = LabelEncoder()
                df[f'{feature}_encoded'] = le.fit_transform(df[feature].astype(str))
                self.label_encoders[feature] = le
                feature_columns.append(f'{feature}_encoded')
        
        # Target variables
        y_restock_amount = df['restock_amount']
        y_days_until_restock = df['days_until_restock']
        
        # Prepare X
        X = df[feature_columns].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        return X, y_restock_amount, y_days_until_restock
    
    def train_models(self, X, y_restock_amount, y_days_until_restock):
        """
        Train multiple ML models for both restock amount and days until restock
        """
        print("Training ML models...")
        
        # Split data
        X_train, X_test, y_restock_train, y_restock_test = train_test_split(
            X, y_restock_amount, test_size=0.2, random_state=42
        )
        
        X_train, X_test, y_days_train, y_days_test = train_test_split(
            X, y_days_until_restock, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models
        models = {
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingRegressor(random_state=42),
            'XGBoost': xgb.XGBRegressor(random_state=42),
            'LightGBM': lgb.LGBMRegressor(random_state=42),
            'Linear Regression': LinearRegression(),
            'Ridge Regression': Ridge(),
            'Lasso Regression': Lasso()
        }
        
        # Train models for restock amount prediction
        print("\nTraining models for restock amount prediction...")
        restock_results = {}
        
        for name, model in models.items():
            print(f"Training {name}...")
            model.fit(X_train_scaled, y_restock_train)
            y_pred = model.predict(X_test_scaled)
            
            mse = mean_squared_error(y_restock_test, y_pred)
            mae = mean_absolute_error(y_restock_test, y_pred)
            r2 = r2_score(y_restock_test, y_pred)
            
            restock_results[name] = {
                'model': model,
                'mse': mse,
                'mae': mae,
                'r2': r2,
                'predictions': y_pred
            }
            
            print(f"  {name} - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.3f}")
        
        # Train models for days until restock prediction
        print("\nTraining models for days until restock prediction...")
        days_results = {}
        
        for name, model in models.items():
            print(f"Training {name}...")
            model.fit(X_train_scaled, y_days_train)
            y_pred = model.predict(X_test_scaled)
            
            mse = mean_squared_error(y_days_test, y_pred)
            mae = mean_absolute_error(y_days_test, y_pred)
            r2 = r2_score(y_days_test, y_pred)
            
            days_results[name] = {
                'model': model,
                'mse': mse,
                'mae': mae,
                'r2': r2,
                'predictions': y_pred
            }
            
            print(f"  {name} - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.3f}")
        
        # Find best models
        best_restock_model = max(restock_results.items(), key=lambda x: x[1]['r2'])
        best_days_model = max(days_results.items(), key=lambda x: x[1]['r2'])
        
        print(f"\nBest model for restock amount: {best_restock_model[0]} (R²: {best_restock_model[1]['r2']:.3f})")
        print(f"Best model for days until restock: {best_days_model[0]} (R²: {best_days_model[1]['r2']:.3f})")
        
        self.models = {
            'restock_amount': restock_results,
            'days_until_restock': days_results
        }
        
        return restock_results, days_results
    
    def feature_importance_analysis(self, X):
        """
        Analyze feature importance
        """
        print("Analyzing feature importance...")
        
        # Use Random Forest for feature importance
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        rf_model.fit(X, self.models['restock_amount']['Random Forest']['model'].predict(self.scaler.transform(X)))
        
        # Get feature importance
        importance = rf_model.feature_importances_
        feature_names = X.columns
        
        # Create feature importance DataFrame
        feature_importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        self.feature_importance = feature_importance_df
        
        return feature_importance_df
    
    def create_visualizations(self, df, restock_results, days_results, feature_importance_df):
        """
        Create comprehensive visualizations
        """
        print("Creating visualizations...")
        
        # Set up the plotting style
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 3, figsize=(20, 12))
        
        # 1. Stock Level Distribution
        axes[0, 0].hist(df['stock_level_percentage'], bins=30, alpha=0.7, color='skyblue')
        axes[0, 0].set_title('Stock Level Distribution')
        axes[0, 0].set_xlabel('Stock Level (%)')
        axes[0, 0].set_ylabel('Frequency')
        
        # 2. Consumption vs Stock
        axes[0, 1].scatter(df['current_stock'], df['daily_consumption'], alpha=0.6)
        axes[0, 1].set_title('Current Stock vs Daily Consumption')
        axes[0, 1].set_xlabel('Current Stock')
        axes[0, 1].set_ylabel('Daily Consumption')
        
        # 3. Restock Amount Distribution
        axes[0, 2].hist(df['restock_amount'], bins=30, alpha=0.7, color='lightgreen')
        axes[0, 2].set_title('Restock Amount Distribution')
        axes[0, 2].set_xlabel('Restock Amount')
        axes[0, 2].set_ylabel('Frequency')
        
        # 4. Model Performance Comparison (Restock Amount)
        model_names = list(restock_results.keys())
        r2_scores = [restock_results[name]['r2'] for name in model_names]
        
        axes[1, 0].bar(model_names, r2_scores, color='lightcoral')
        axes[1, 0].set_title('Model Performance - Restock Amount')
        axes[1, 0].set_ylabel('R² Score')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # 5. Model Performance Comparison (Days Until Restock)
        model_names = list(days_results.keys())
        r2_scores = [days_results[name]['r2'] for name in model_names]
        
        axes[1, 1].bar(model_names, r2_scores, color='lightblue')
        axes[1, 1].set_title('Model Performance - Days Until Restock')
        axes[1, 1].set_ylabel('R² Score')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        # 6. Feature Importance
        top_features = feature_importance_df.head(10)
        axes[1, 2].barh(top_features['feature'], top_features['importance'], color='lightyellow')
        axes[1, 2].set_title('Top 10 Feature Importance')
        axes[1, 2].set_xlabel('Importance')
        
        plt.tight_layout()
        plt.savefig('ml_models/medicine_restocking_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Create interactive Plotly visualizations
        self._create_interactive_plots(df, restock_results, days_results, feature_importance_df)
    
    def _create_interactive_plots(self, df, restock_results, days_results, feature_importance_df):
        """
        Create interactive Plotly visualizations
        """
        # 1. Stock Level vs Restock Amount
        fig1 = px.scatter(df, x='stock_level_percentage', y='restock_amount', 
                          color='critical_medicine', size='daily_consumption',
                          title='Stock Level vs Restock Amount',
                          labels={'stock_level_percentage': 'Stock Level (%)', 
                                 'restock_amount': 'Restock Amount'})
        fig1.write_html('ml_models/stock_vs_restock.html')
        
        # 2. Model Performance Comparison
        fig2 = make_subplots(rows=1, cols=2, subplot_titles=('Restock Amount Prediction', 'Days Until Restock Prediction'))
        
        # Restock amount models
        model_names = list(restock_results.keys())
        r2_scores = [restock_results[name]['r2'] for name in model_names]
        
        fig2.add_trace(go.Bar(x=model_names, y=r2_scores, name='Restock Amount'), row=1, col=1)
        
        # Days until restock models
        model_names = list(days_results.keys())
        r2_scores = [days_results[name]['r2'] for name in model_names]
        
        fig2.add_trace(go.Bar(x=model_names, y=r2_scores, name='Days Until Restock'), row=1, col=2)
        
        fig2.update_layout(title='Model Performance Comparison', height=500)
        fig2.write_html('ml_models/model_performance.html')
        
        # 3. Feature Importance
        top_features = feature_importance_df.head(15)
        fig3 = px.bar(top_features, x='importance', y='feature', orientation='h',
                      title='Feature Importance Analysis')
        fig3.write_html('ml_models/feature_importance.html')
        
        print("Interactive visualizations saved to ml_models/ directory")
    
    def predict_restocking_needs(self, medicine_data):
        """
        Predict restocking needs for new medicine data
        """
        print("Predicting restocking needs...")
        
        # Prepare features
        X_new = self.feature_engineering(medicine_data)
        X_new = self.prepare_features(X_new)[0]
        X_new_scaled = self.scaler.transform(X_new)
        
        # Get best models
        best_restock_model = max(self.models['restock_amount'].items(), key=lambda x: x[1]['r2'])[1]['model']
        best_days_model = max(self.models['days_until_restock'].items(), key=lambda x: x[1]['r2'])[1]['model']
        
        # Make predictions
        restock_amount_pred = best_restock_model.predict(X_new_scaled)
        days_until_restock_pred = best_days_model.predict(X_new_scaled)
        
        # Create prediction results
        predictions = pd.DataFrame({
            'medicine_name': medicine_data['medicine_name'],
            'current_stock': medicine_data['current_stock'],
            'predicted_restock_amount': restock_amount_pred,
            'predicted_days_until_restock': days_until_restock_pred,
            'urgency_level': np.where(days_until_restock_pred < 7, 'High',
                                    np.where(days_until_restock_pred < 14, 'Medium', 'Low'))
        })
        
        return predictions
    
    def save_models(self):
        """
        Save trained models
        """
        import joblib
        
        print("Saving models...")
        
        # Save the best models
        best_restock_model = max(self.models['restock_amount'].items(), key=lambda x: x[1]['r2'])[1]['model']
        best_days_model = max(self.models['days_until_restock'].items(), key=lambda x: x[1]['r2'])[1]['model']
        
        joblib.dump(best_restock_model, 'ml_models/best_restock_amount_model.pkl')
        joblib.dump(best_days_model, 'ml_models/best_days_until_restock_model.pkl')
        joblib.dump(self.scaler, 'ml_models/scaler.pkl')
        joblib.dump(self.label_encoders, 'ml_models/label_encoders.pkl')
        
        # Save feature importance
        self.feature_importance.to_csv('ml_models/feature_importance.csv', index=False)
        
        print("Models saved successfully!")

def main():
    """
    Main function to run the medicine restocking predictor
    """
    print("=== Medicine Restocking Prediction System ===")
    
    # Initialize the predictor
    predictor = MedicineRestockingPredictor()
    
    # Load and preprocess data
    df = predictor.load_and_preprocess_data('data/medicine_inventory.csv')
    
    # Feature engineering
    df = predictor.feature_engineering(df)
    
    # Prepare features
    X, y_restock_amount, y_days_until_restock = predictor.prepare_features(df)
    
    # Train models
    restock_results, days_results = predictor.train_models(X, y_restock_amount, y_days_until_restock)
    
    # Feature importance analysis
    feature_importance_df = predictor.feature_importance_analysis(X)
    
    # Create visualizations
    predictor.create_visualizations(df, restock_results, days_results, feature_importance_df)
    
    # Save models
    predictor.save_models()
    
    # Example prediction
    print("\n=== Example Prediction ===")
    sample_data = df.head(5)
    predictions = predictor.predict_restocking_needs(sample_data)
    print(predictions)
    
    print("\n=== System Complete ===")
    print("Models trained and saved successfully!")
    print("Visualizations created and saved!")
    print("Ready for production use!")

if __name__ == "__main__":
    main() 