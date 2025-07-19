import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO
from firebase_service import fetch_energy_data, write_energy_data
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit

class EnergyPredictorAI:
    """
    Energy Predictor AI for Synergy AI System
    Predicts energy consumption based on historical data and environmental factors
    Now supports direct Firebase integration, improved accuracy, and visualization.
    """
    def __init__(self, model_type='random_forest'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.is_trained = False
        self.feature_importance = None
        self.isolation_forest = IsolationForest(contamination=0.05, random_state=42)
        self.best_params = None
        if model_type == 'random_forest':
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif model_type == 'gradient_boost':
            self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        elif model_type == 'linear':
            self.model = LinearRegression()
        else:
            raise ValueError("Model type must be 'random_forest', 'gradient_boost', or 'linear'")

    def generate_mock_data(self, n_samples=10000, start_date='2023-01-01'):
        """
        Generate mock training data with realistic energy consumption patterns

        Args:
            n_samples (int): Number of samples to generate
            start_date (str): Start date for time series data

        Returns:
            pd.DataFrame: Mock dataset with all required features
        """
        print("Generating mock energy consumption data...")

        # Generate time series
        start = pd.to_datetime(start_date)
        dates = pd.date_range(start=start, periods=n_samples, freq='H')

        # Base features
        data = {
            'timestamp': dates,
            'hour': dates.hour,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'is_weekend': (dates.dayofweek >= 5).astype(int),
            'is_holiday': np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
        }

        # Environmental factors
        # Temperature varies by season and time of day
        seasonal_temp = 25 + 10 * np.sin(2 * np.pi * data['month'] / 12)
        daily_temp_var = 5 * np.sin(2 * np.pi * data['hour'] / 24)
        data['temperature'] = seasonal_temp + daily_temp_var + np.random.normal(0, 2, n_samples)

        # Humidity (inversely correlated with temperature)
        data['humidity'] = np.clip(80 - 0.5 * data['temperature'] + np.random.normal(0, 5, n_samples), 20, 95)

        # Occupancy patterns (higher during business hours, lower at night)
        base_occupancy = 50
        hourly_factor = np.where(
            (data['hour'] >= 9) & (data['hour'] <= 17) & (data['day_of_week'] < 5),
            1.5,  # Business hours
            np.where(
                (data['hour'] >= 18) & (data['hour'] <= 22),
                0.8,  # Evening
                0.3   # Night/early morning
            )
        )
        weekend_factor = np.where(data['is_weekend'], 0.4, 1.0)
        data['occupancy_count'] = np.clip(
            base_occupancy * hourly_factor * weekend_factor + np.random.normal(0, 10, n_samples),
            0, 150
        ).astype(int)

        # Tariff rates (peak/off-peak pricing)
        data['tariff_rate'] = np.where(
            (data['hour'] >= 9) & (data['hour'] <= 17) & (data['day_of_week'] < 5),
            12.5,  # Peak rate (₹/kWh)
            8.0    # Off-peak rate
        ) + np.random.normal(0, 0.5, n_samples)

        # HVAC and Lighting usage
        # HVAC depends on temperature and occupancy
        hvac_temp_factor = np.where(
            (data['temperature'] > 26) | (data['temperature'] < 20),
            1.5,  # High HVAC usage for extreme temperatures
            0.5   # Low HVAC usage for comfortable temperatures
        )
        data['hvac_usage'] = (data['occupancy_count'] * 0.3 * hvac_temp_factor +
                             np.random.normal(0, 5, n_samples)).clip(0, None)

        # Lighting depends on occupancy and time of day
        lighting_factor = np.where(
            (data['hour'] >= 6) & (data['hour'] <= 18),
            0.5,  # Lower lighting during daylight
            1.2   # Higher lighting at night
        )
        data['lighting_usage'] = (data['occupancy_count'] * 0.2 * lighting_factor +
                                 np.random.normal(0, 3, n_samples)).clip(0, None)

        # Historical energy consumption (target variable)
        # Complex relationship with all factors
        base_consumption = (
            data['occupancy_count'] * 2.5 +  # Base load from occupancy
            data['hvac_usage'] * 1.8 +        # HVAC contribution
            data['lighting_usage'] * 1.2 +    # Lighting contribution
            (data['temperature'] - 22) ** 2 * 0.5 +  # Temperature effect
            data['humidity'] * 0.1 +          # Humidity effect
            data['is_weekend'] * -20 +        # Weekend reduction
            data['is_holiday'] * -30          # Holiday reduction
        )

        # Add seasonal and daily patterns
        seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * data['month'] / 12)
        daily_factor = 1 + 0.2 * np.sin(2 * np.pi * data['hour'] / 24)

        data['energy_consumption'] = np.clip(
            base_consumption * seasonal_factor * daily_factor + np.random.normal(0, 15, n_samples),
            10, 1000
        )

        # Weather data (optional)
        data['wind_speed'] = np.random.normal(10, 3, n_samples).clip(0, None)
        data['solar_radiation'] = np.where(
            (data['hour'] >= 6) & (data['hour'] <= 18),
            np.random.normal(500, 100, n_samples).clip(0, None),
            0
        )

        df = pd.DataFrame(data)
        print(f"Generated {len(df)} samples of mock energy data")
        return df

    def fetch_data_from_firebase(self):
        """Fetch energy readings from Firebase."""
        energy = fetch_energy_data()
        return pd.DataFrame(energy.values()) if isinstance(energy, dict) else pd.DataFrame(energy)

    def retrain_from_firebase(self, target_column='energy_consumption'):
        """Retrain the model using the latest data from Firebase."""
        df = self.fetch_data_from_firebase()
        if not df.empty:
            self.train(df, target_column=target_column)

    def preprocess_data(self, df, target_column='energy_consumption'):
        """
        Preprocess the data for training/prediction

        Args:
            df (pd.DataFrame): Raw dataset
            target_column (str): Name of target variable

        Returns:
            tuple: (X, y) processed features and target
        """
        df_processed = df.copy()

        # Create additional time features
        if 'timestamp' in df_processed.columns:
            df_processed['timestamp'] = pd.to_datetime(df_processed['timestamp'])
            df_processed['quarter'] = df_processed['timestamp'].dt.quarter
            df_processed['week_of_year'] = df_processed['timestamp'].dt.isocalendar().week
            # Drop timestamp after extracting features
            df_processed = df_processed.drop('timestamp', axis=1)

        # Encode categorical variables
        categorical_columns = ['day_of_week', 'month', 'quarter', 'is_weekend', 'is_holiday']
        for col in categorical_columns:
            if col in df_processed.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_processed[col] = self.label_encoders[col].fit_transform(df_processed[col])
                else:
                    # Handle unseen labels in prediction data gracefully
                    try:
                         df_processed[col] = self.label_encoders[col].transform(df_processed[col])
                    except ValueError:
                         print(f"Warning: Unseen labels in column '{col}' during transformation.")
                         pass

        # Separate features and target
        if target_column in df_processed.columns:
            y = df_processed[target_column]
            X = df_processed.drop(target_column, axis=1)
        else:
            # If target column is not present (e.g., for prediction on new data)
            y = None
            X = df_processed

        # Store feature columns from training data only
        if y is not None:
          self.feature_columns = X.columns.tolist()

        # Scale numerical features
        # Only fit the scaler during training
        if y is not None:
            X_scaled = self.scaler.fit_transform(X)
        else:
            # Transform using the fitted scaler during prediction
            X_scaled = self.scaler.transform(X)

        X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

        return X_scaled, y

    def train(self, df, target_column='energy_consumption', test_size=0.2):
        """Train the energy prediction model with hyperparameter tuning, anomaly removal, and time series CV."""
        print("Training Energy Predictor AI...")
        X, y = self.preprocess_data(df, target_column)
        # Remove anomalies
        if X.shape[0] > 10:
            anomalies = self.isolation_forest.fit_predict(X)
            X, y = X[anomalies == 1], y[anomalies == 1]
        # Time series split
        tscv = TimeSeriesSplit(n_splits=3)
        param_grid = {'n_estimators': [50, 100, 200], 'max_depth': [5, 10, None]}
        if self.model_type == 'random_forest':
            grid = GridSearchCV(self.model, param_grid, cv=tscv, scoring='neg_mean_absolute_error')
            grid.fit(X, y)
            self.model = grid.best_estimator_
            self.best_params = grid.best_params_
            print(f"Best RF params: {self.best_params}")
        else:
            self.model.fit(X, y)
        self.is_trained = True

    def predict(self, df):
        """
        Make energy consumption predictions

        Args:
            df (pd.DataFrame): Input data for prediction

        Returns:
            np.array: Predicted energy consumption values
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")

        # Preprocess input data using the same logic as training
        X_processed, _ = self.preprocess_data(df, target_column=None)

        # Ensure the order and presence of columns match training data features
        X_prediction = X_processed[self.feature_columns]

        # Make predictions
        predictions = self.model.predict(X_prediction)

        return predictions

    def analyze_energy_patterns(self, df):
        """
        Analyze energy consumption patterns to identify optimization opportunities

        Args:
            df (pd.DataFrame): Historical energy data

        Returns:
            dict: Analysis results and insights
        """
        print("Analyzing energy consumption patterns...")

        analysis = {}

        # Peak consumption analysis
        df_analysis = df.copy()
        if 'timestamp' in df_analysis.columns:
             df_analysis['hour'] = pd.to_datetime(df_analysis['timestamp']).dt.hour
        elif 'hour' not in df_analysis.columns:
             print("Warning: 'hour' column not found for hourly analysis.")
             analysis['peak_hours'] = []
             analysis['off_peak_hours'] = []
        else:
            pass

        if 'hour' in df_analysis.columns:
            hourly_avg = df_analysis.groupby('hour')['energy_consumption'].mean()
            analysis['peak_hours'] = hourly_avg.nlargest(5).index.tolist()
            analysis['off_peak_hours'] = hourly_avg.nsmallest(5).index.tolist()

        # Day-of-week analysis
        if 'day_of_week' in df_analysis.columns:
            daily_avg = df_analysis.groupby('day_of_week')['energy_consumption'].mean()
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            analysis['high_consumption_days'] = [day_names[i] for i in daily_avg.nlargest(3).index.tolist()]
            analysis['low_consumption_days'] = [day_names[i] for i in daily_avg.nsmallest(3).index.tolist()]

        # Temperature correlation
        if 'temperature' in df_analysis.columns and 'energy_consumption' in df_analysis.columns:
            temp_corr = df_analysis['energy_consumption'].corr(df_analysis['temperature'])
            analysis['temperature_correlation'] = temp_corr
        else:
             print("Warning: 'temperature' or 'energy_consumption' column not found for temperature correlation analysis.")

        # Occupancy efficiency
        if 'occupancy_count' in df_analysis.columns and 'energy_consumption' in df_analysis.columns:
            df_analysis['energy_per_person'] = df_analysis['energy_consumption'] / (df_analysis['occupancy_count'].replace(0, 1))
            analysis['avg_energy_per_person'] = df_analysis['energy_per_person'].mean()
        else:
            print("Warning: 'occupancy_count' or 'energy_consumption' column not found for occupancy analysis.")

        # HVAC and Lighting efficiency
        if ('hvac_usage' in df_analysis.columns and
            'lighting_usage' in df_analysis.columns and
            'energy_consumption' in df_analysis.columns and
             df_analysis['energy_consumption'].sum() > 0):
            analysis['hvac_contribution'] = (df_analysis['hvac_usage'] * 1.8).sum() / df_analysis['energy_consumption'].sum()
            analysis['lighting_contribution'] = (df_analysis['lighting_usage'] * 1.2).sum() / df_analysis['energy_consumption'].sum()
        else:
             print("Warning: HVAC, Lighting, or Energy Consumption columns not found or energy consumption sum is zero for efficiency analysis.")

        return analysis

    def generate_optimization_solutions(self, df, current_costs=None):
        """
        Generate actionable solutions for energy optimization and revenue improvement

        Args:
            df (pd.DataFrame): Historical energy data
            current_costs (dict): Current energy costs and tariff information

        Returns:
            dict: Optimization recommendations
        """
        print("Generating optimization solutions...")

        analysis = self.analyze_energy_patterns(df)
        solutions = {
            'immediate_actions': [],
            'medium_term_strategies': [],
            'long_term_investments': [],
            'revenue_optimization': [],
            'cost_savings_potential': {}
        }

        # Immediate Actions
        if 'peak_hours' in analysis and analysis['peak_hours']:
            solutions['immediate_actions'].append({
                'action': 'Load Shifting',
                'description': f"Shift non-critical operations away from peak hours: {analysis['peak_hours']}",
                'potential_savings': '15-25% reduction in peak demand charges',
                'implementation': 'Reschedule equipment maintenance, data backups, and non-essential processes'
            })

        if 'temperature_correlation' in analysis and abs(analysis['temperature_correlation']) > 0.6:
            solutions['immediate_actions'].append({
                'action': 'Temperature Optimization',
                'description': 'Implement smart temperature control to reduce HVAC load',
                'potential_savings': '10-20% reduction in HVAC energy consumption',
                'implementation': 'Set optimal temperature ranges: 22-24°C in summer, 20-22°C in winter'
            })

        # Medium-term Strategies
        solutions['medium_term_strategies'].append({
            'strategy': 'Occupancy-Based Control',
            'description': 'Implement occupancy sensors for lighting and HVAC control',
            'potential_savings': '20-30% reduction in lighting and HVAC costs',
            'roi_period': '12-18 months',
            'implementation': 'Install motion sensors, smart lighting systems, and zone-based HVAC'
        })

        solutions['medium_term_strategies'].append({
            'strategy': 'Energy Management System (EMS)',
            'description': 'Deploy comprehensive energy monitoring and control system',
            'potential_savings': '25-35% overall energy reduction',
            'roi_period': '18-24 months',
            'implementation': 'Real-time monitoring, automated controls, demand response capabilities'
        })

        # Long-term Investments
        solutions['long_term_investments'].append({
            'investment': 'Renewable Energy Integration',
            'description': 'Install solar panels and energy storage systems',
            'potential_savings': '40-60% reduction in electricity bills',
            'roi_period': '5-7 years',
            'implementation': 'Rooftop solar installation, battery storage, grid-tie systems'
        })

        solutions['long_term_investments'].append({
            'investment': 'Building Automation System (BAS)',
            'description': 'Comprehensive building automation with AI-driven optimization',
            'potential_savings': '30-50% overall energy reduction',
            'roi_period': '3-5 years',
            'implementation': 'Smart building systems, predictive maintenance, automated optimization'
        })

        # Revenue Optimization
        solutions['revenue_optimization'].append({
            'strategy': 'Demand Response Programs',
            'description': 'Participate in utility demand response programs',
            'revenue_potential': '₹50,000-200,000 per year',
            'implementation': 'Enroll in utility programs, automated load curtailment during peak events'
        })

        solutions['revenue_optimization'].append({
            'strategy': 'Time-of-Use Optimization',
            'description': 'Optimize energy usage based on tariff rates',
            'revenue_potential': '10-15% reduction in electricity costs',
            'implementation': 'Schedule high-energy processes during off-peak hours'
        })

        # Calculate potential cost savings
        if current_costs:
            base_cost = current_costs.get('annual_cost', 1000000)
            solutions['cost_savings_potential'] = {
                'immediate_savings': base_cost * 0.15,
                'medium_term_savings': base_cost * 0.30,
                'long_term_savings': base_cost * 0.50,
                'revenue_generation': 150000
            }
        else:
             print("Warning: Current costs not provided. Cannot calculate cost savings potential.")

        return solutions

    def plot_feature_importance(self):
        """Return a base64-encoded PNG of feature importances."""
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            indices = np.argsort(importances)[::-1]
            plt.figure(figsize=(8, 4))
            plt.title('Feature Importances')
            plt.bar(range(len(importances)), importances[indices], align='center')
            plt.xticks(range(len(importances)), [self.feature_columns[i] for i in indices], rotation=45, ha='right')
            plt.tight_layout()
            buf = BytesIO()
            plt.savefig(buf, format='png')
            plt.close()
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')
        return None

    def plot_prediction_vs_actual(self, df, target_column='energy_consumption'):
        """Return a base64-encoded PNG of prediction vs. actual."""
        X, y = self.preprocess_data(df, target_column)
        y_pred = self.model.predict(X)
        plt.figure(figsize=(8, 4))
        plt.plot(y, label='Actual')
        plt.plot(y_pred, label='Predicted')
        plt.title('Prediction vs. Actual')
        plt.legend()
        plt.tight_layout()
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

# Global instance for the API
energy_predictor = EnergyPredictorAI()

# Initialize and train the model with mock data
def initialize_energy_predictor():
    """Initialize the energy predictor with mock data"""
    global energy_predictor
    try:
        # Generate training data
        mock_data = energy_predictor.generate_mock_data(n_samples=8760)  # One year of hourly data
        
        # Train the model
        training_results = energy_predictor.train(mock_data)
        
        print("Energy Predictor AI initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing Energy Predictor AI: {e}")
        return False

# Initialize on import
initialize_energy_predictor()