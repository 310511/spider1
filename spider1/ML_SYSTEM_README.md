# ML Medicine Restocking Prediction System

## Overview

This system uses machine learning to predict medicine restocking needs based on historical sales data from the archive folder. The ML models analyze patterns in pharmaceutical sales data to forecast demand and identify when restocking is needed.

## Features

### 🧠 **AI-Powered Predictions**
- **Time Series Analysis**: Analyzes daily, weekly, and monthly sales patterns
- **Demand Forecasting**: Predicts future demand for each medicine category
- **Restocking Alerts**: Identifies urgent, moderate, and safe stock levels
- **Smart Thresholds**: Automatically calculates restocking thresholds based on historical data

### 📊 **Medicine Categories Monitored**
- **M01AB**: Anti-inflammatory and antirheumatic products, non-steroids
- **M01AE**: Anti-inflammatory and antirheumatic products, acetic acid derivatives
- **N02BA**: Analgesics, anilides (paracetamol)
- **N02BE**: Analgesics, pyrazolones and pyrazolones with salicylic acid
- **N05B**: Anxiolytics, benzodiazepine derivatives
- **N05C**: Hypnotics and sedatives
- **R03**: Drugs for obstructive airway diseases
- **R06**: Antihistamines for systemic use

### 🎯 **Prediction Categories**
- **🚨 Urgent Restocking**: Items that need immediate attention (≤7 days until stockout)
- **⚠️ Moderate Restocking**: Items that need attention soon (8-14 days until stockout)
- **✅ Safe Stock Levels**: Items with adequate stock levels

## Data Sources

The system uses sales data from the `archive/` folder:

- **`salesdaily.csv`**: Daily sales data with 2,108 records
- **`salesweekly.csv`**: Weekly aggregated sales data with 304 records
- **`salesmonthly.csv`**: Monthly aggregated sales data with 72 records
- **`saleshourly.csv`**: Hourly sales data (2.5MB)

## ML Model Architecture

### 🔧 **Technical Stack**
- **Python**: Core ML implementation
- **Pandas**: Data preprocessing and manipulation
- **Scikit-learn**: Machine learning algorithms
- **Random Forest**: Primary prediction model
- **Joblib**: Model persistence and loading

### 📈 **Features Used**
- **Temporal Features**: Year, Month, Day, Weekday, Hour
- **Lag Features**: Previous day, week, and month sales
- **Rolling Averages**: 7-day and 30-day moving averages
- **Cross-Category Features**: Sales patterns from other medicine categories

### 🎯 **Model Performance**
- **Accuracy**: R² scores typically >0.8 for demand prediction
- **Robustness**: Handles missing data and outliers gracefully
- **Scalability**: Separate models for each medicine category

## File Structure

```
spider/
├── archive/                          # Sales data files
│   ├── salesdaily.csv               # Daily sales data
│   ├── salesweekly.csv              # Weekly sales data
│   ├── salesmonthly.csv             # Monthly sales data
│   └── saleshourly.csv              # Hourly sales data
├── ml_models/                       # ML system files
│   ├── medicine_restocking_predictor.py  # Main ML predictor
│   ├── trained_models/              # Saved ML models
│   ├── scalers/                     # Feature scalers
│   └── test_results.json           # Test results
├── run_ml_predictions.py           # ML prediction runner
├── test_ml_system.py               # System test script
└── ML_SYSTEM_README.md             # This file
```

## Usage

### 🚀 **Running ML Predictions**

1. **Train Models** (first time only):
   ```bash
   cd spider
   python run_ml_predictions.py
   ```

2. **Test System**:
   ```bash
   python test_ml_system.py
   ```

3. **Frontend Integration**:
   - Navigate to `/ml-predictions` in the web app
   - Click "Run Predictions" to generate new forecasts
   - View results in the dashboard

### 📊 **Understanding Results**

The system provides:

1. **Summary Statistics**:
   - Total categories monitored
   - Number of urgent restocking needs
   - Number of moderate restocking needs
   - Number of safe stock levels

2. **Detailed Predictions**:
   - Predicted demand for each category
   - Current stock levels
   - Days until stockout
   - Restocking thresholds

3. **Visual Indicators**:
   - Progress bars showing stock levels
   - Color-coded urgency badges
   - Categorized tabs (Urgent/Moderate/Safe)

## API Integration

### 🔌 **Frontend Integration**

The ML system integrates with the React frontend through:

1. **ML Predictions Dashboard** (`/ml-predictions`)
   - Real-time prediction generation
   - Interactive visualization of results
   - Categorized display of restocking needs

2. **Data Flow**:
   ```
   Archive Data → ML Models → Predictions → Frontend Dashboard
   ```

### 📡 **Backend Integration**

The system can be extended with:

1. **REST API**: Expose predictions via HTTP endpoints
2. **Database Integration**: Store predictions and historical data
3. **Real-time Updates**: WebSocket connections for live updates
4. **Automated Scheduling**: Regular prediction runs

## Configuration

### ⚙️ **Model Parameters**

```python
# In medicine_restocking_predictor.py
model = RandomForestRegressor(
    n_estimators=100,    # Number of trees
    max_depth=10,         # Maximum tree depth
    random_state=42,      # Reproducible results
    n_jobs=-1            # Use all CPU cores
)
```

### 🔧 **Threshold Settings**

```python
# Restocking thresholds
restocking_threshold = avg_demand * 7  # 7 days of average demand
urgent_threshold = 7                   # Days until stockout
moderate_threshold = 14                # Days until stockout
```

## Monitoring and Maintenance

### 📈 **Performance Monitoring**

1. **Model Accuracy**: Track R² scores and prediction errors
2. **Data Quality**: Monitor for missing or anomalous data
3. **System Health**: Check model loading and prediction generation

### 🔄 **Regular Updates**

1. **Retrain Models**: Monthly retraining with new data
2. **Update Thresholds**: Adjust based on business requirements
3. **Feature Engineering**: Add new features as needed

## Troubleshooting

### ❌ **Common Issues**

1. **Data Loading Errors**:
   - Check if archive files exist
   - Verify CSV format and encoding
   - Ensure required columns are present

2. **Model Training Failures**:
   - Check Python dependencies
   - Verify sufficient memory
   - Check for data quality issues

3. **Prediction Errors**:
   - Ensure models are trained
   - Check feature scaling
   - Verify input data format

### 🛠️ **Debugging Tools**

1. **Test Script**: `python test_ml_system.py`
2. **Log Files**: Check console output for errors
3. **Data Validation**: Verify data format and completeness

## Future Enhancements

### 🚀 **Planned Features**

1. **Advanced Models**:
   - LSTM neural networks for time series
   - Ensemble methods for better accuracy
   - Deep learning for complex patterns

2. **Real-time Features**:
   - Live data streaming
   - Real-time predictions
   - Automated alerts

3. **Enhanced Analytics**:
   - Seasonal trend analysis
   - Anomaly detection
   - Cost optimization recommendations

4. **Integration Features**:
   - Supplier API integration
   - Inventory system sync
   - Automated ordering

## Support

For issues or questions:

1. **Check the test script**: `python test_ml_system.py`
2. **Review logs**: Check console output for errors
3. **Verify data**: Ensure archive files are present and valid
4. **Test components**: Run individual tests for specific features

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅ 