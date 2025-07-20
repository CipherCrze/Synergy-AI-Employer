"""
Enhanced Energy Predictor AI for Synergy AI Platform
Improved accuracy, real-time optimization, and company-specific modeling
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class EnhancedEnergyPredictorAI:
    """
    Enhanced Energy Predictor AI with improved accuracy and company-specific optimization
    Features:
    - Multi-model ensemble for better accuracy
    - Company-specific energy patterns
    - Real-time anomaly detection
    - Cost optimization recommendations
    - Seasonal and weather adaptation
    - Equipment-specific monitoring
    """
    
    def __init__(self, company_id: str = "default"):
        self.company_id = company_id
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.is_trained = False
        self.model_metrics = {}
        self.feature_columns = []
        
        # Initialize ensemble of models for better accuracy
        self.models = {
            'primary': GradientBoostingRegressor(
                n_estimators=300,
                learning_rate=0.08,
                max_depth=8,
                random_state=42,
                subsample=0.8
            ),
            'secondary': RandomForestRegressor(
                n_estimators=200,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            ),
            'linear': LinearRegression()
        }
        
        # Initialize scalers for each model
        self.scalers = {model_name: StandardScaler() for model_name in self.models.keys()}
        
        # Company-specific configuration
        self.company_config = {
            'business_hours': {'start': 8, 'end': 18},
            'peak_demand_hours': [9, 10, 11, 14, 15, 16],
            'equipment_types': ['hvac', 'lighting', 'computers', 'servers', 'kitchen'],
            'energy_rates': {
                'peak': 0.15,      # $/kWh during peak hours
                'off_peak': 0.08,  # $/kWh during off-peak
                'weekend': 0.06    # $/kWh during weekends
            },
            'sustainability_targets': {
                'daily_reduction': 0.05,  # 5% daily reduction target
                'carbon_intensity': 0.4   # kg CO2/kWh
            }
        }
        
        # Real-time optimization thresholds
        self.optimization_thresholds = {
            'consumption_spike': 1.5,    # 50% above normal
            'cost_anomaly': 1.3,         # 30% above expected cost
            'efficiency_warning': 0.7,   # Below 70% efficiency
            'demand_peak': 0.9           # 90% of max capacity
        }
        
        logger.info(f"Enhanced Energy Predictor AI initialized for company: {company_id}")
    
    def generate_enhanced_training_data(self, n_samples: int = 20000, 
                                      start_date: str = '2023-01-01') -> pd.DataFrame:
        """
        Generate enhanced training data with realistic energy consumption patterns
        """
        np.random.seed(42)
        
        # Generate time-based data
        start = pd.to_datetime(start_date)
        dates = pd.date_range(start, periods=n_samples, freq='H')
        
        # Base temporal features
        data = {
            'timestamp': dates,
            'hour': dates.hour,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'is_weekend': dates.dayofweek >= 5,
            'is_holiday': np.random.choice([0, 1], size=n_samples, p=[0.97, 0.03]),
            'season': ((dates.month % 12) // 3)  # 0-3 for seasons
        }
        
        # Weather and environmental features (major factors for energy consumption)
        base_temp = 15 + 10 * np.sin(2 * np.pi * dates.dayofyear / 365) + np.random.normal(0, 3, n_samples)
        data['outdoor_temperature'] = np.clip(base_temp, -10, 40)
        
        base_humidity = 50 + 20 * np.sin(2 * np.pi * dates.dayofyear / 365 + np.pi/4) + np.random.normal(0, 10, n_samples)
        data['outdoor_humidity'] = np.clip(base_humidity, 20, 90)
        
        # Solar radiation (affects both lighting needs and cooling loads)
        data['solar_radiation'] = np.maximum(0, 
            800 * np.sin(np.pi * dates.hour / 12) * 
            (1 + 0.3 * np.sin(2 * np.pi * dates.dayofyear / 365)) + 
            np.random.normal(0, 100, n_samples)
        )
        data['solar_radiation'] = np.clip(data['solar_radiation'], 0, 1000)
        
        # Building occupancy (major driver of energy consumption)
        data['occupancy_rate'] = np.random.beta(2, 5, n_samples)
        data['total_occupants'] = np.random.randint(50, 500, n_samples) * data['occupancy_rate']
        
        # Equipment and infrastructure
        equipment_types = ['hvac', 'lighting', 'computers', 'servers', 'kitchen']
        for equipment in equipment_types:
            data[f'{equipment}_load'] = np.random.beta(2, 3, n_samples)
        
        # Building characteristics
        data['building_age'] = np.random.randint(1, 30, n_samples)
        data['floor_area'] = np.random.normal(50000, 10000, n_samples)  # sq ft
        data['insulation_rating'] = np.random.normal(0.7, 0.1, n_samples)  # 0-1 scale
        
        # Economic factors
        data['electricity_rate'] = np.random.normal(0.12, 0.02, n_samples)  # $/kWh
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Calculate realistic energy consumption based on multiple factors
        df['energy_consumption'] = self._calculate_realistic_energy_consumption(df)
        
        # Calculate cost
        df['energy_cost'] = df['energy_consumption'] * df['electricity_rate']
        
        # Calculate efficiency score (0-100)
        df['efficiency_score'] = self._calculate_energy_efficiency(df)
        
        # Add anomalies (5% of data)
        anomaly_indices = np.random.choice(df.index, size=int(0.05 * len(df)), replace=False)
        df.loc[anomaly_indices, 'energy_consumption'] *= np.random.uniform(1.5, 3.0, len(anomaly_indices))
        df.loc[anomaly_indices, 'anomaly'] = 1
        df['anomaly'] = df['anomaly'].fillna(0)
        
        # Add demand response events (2% of data)
        dr_indices = np.random.choice(df.index, size=int(0.02 * len(df)), replace=False)
        df.loc[dr_indices, 'demand_response_active'] = 1
        df['demand_response_active'] = df['demand_response_active'].fillna(0)
        
        logger.info(f"Generated {n_samples} training samples with enhanced energy patterns")
        return df
    
    def _calculate_realistic_energy_consumption(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate realistic energy consumption based on multiple factors
        """
        n_samples = len(df)
        consumption = np.zeros(n_samples)
        
        for i in range(n_samples):
            row = df.iloc[i]
            
            # Base load (servers, emergency systems, etc.)
            base_load = 50  # kWh
            
            # HVAC load (temperature dependent)
            outdoor_temp = row['outdoor_temperature']
            target_temp = 22  # Target indoor temperature
            temp_diff = abs(outdoor_temp - target_temp)
            
            # Cooling load (higher when outdoor temp > target)
            cooling_load = max(0, (outdoor_temp - target_temp) ** 1.5 * 2) if outdoor_temp > target_temp else 0
            
            # Heating load (higher when outdoor temp < target)  
            heating_load = max(0, (target_temp - outdoor_temp) ** 1.5 * 1.5) if outdoor_temp < target_temp else 0
            
            hvac_load = base_load * 0.4 + cooling_load + heating_load
            hvac_load *= row['hvac_load']  # Apply HVAC efficiency factor
            hvac_load *= (row['floor_area'] / 50000)  # Scale by building size
            hvac_load *= (2 - row['insulation_rating'])  # Poor insulation increases load
            
            # Lighting load (solar radiation and occupancy dependent)
            lighting_base = 30  # kWh
            solar_factor = max(0.3, 1 - row['solar_radiation'] / 800)  # More lighting needed when less solar
            occupancy_factor = 0.3 + 0.7 * row['occupancy_rate']  # Scale with occupancy
            lighting_load = lighting_base * solar_factor * occupancy_factor * row['lighting_load']
            
            # Computer and office equipment load
            computer_base = 40  # kWh
            computer_load = computer_base * row['occupancy_rate'] * row['computers_load']
            
            # Server load (relatively constant but varies with demand)
            server_base = 25  # kWh
            server_load = server_base * (0.7 + 0.3 * row['occupancy_rate']) * row['servers_load']
            
            # Kitchen and other facilities
            kitchen_base = 15  # kWh
            kitchen_load = kitchen_base * row['occupancy_rate'] * row['kitchen_load']
            
            # Time-of-day factors
            if row['hour'] in self.company_config['peak_demand_hours']:
                time_factor = 1.2
            elif 6 <= row['hour'] <= 20:
                time_factor = 1.0
            else:
                time_factor = 0.6
            
            # Weekend factor
            if row['is_weekend']:
                time_factor *= 0.4
            
            # Holiday factor
            if row['is_holiday']:
                time_factor *= 0.2
            
            # Total consumption
            total_consumption = (hvac_load + lighting_load + computer_load + 
                               server_load + kitchen_load) * time_factor
            
            # Add some random variation
            total_consumption *= np.random.normal(1.0, 0.05)
            
            # Ensure positive consumption
            consumption[i] = max(5, total_consumption)  # Minimum 5 kWh
        
        return consumption
    
    def _calculate_energy_efficiency(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate energy efficiency score (0-100) based on consumption patterns
        """
        # Normalize consumption by building size and occupancy
        normalized_consumption = df['energy_consumption'] / (df['floor_area'] / 1000) / np.maximum(1, df['total_occupants'])
        
        # Calculate efficiency based on percentiles (lower consumption = higher efficiency)
        efficiency_percentile = 100 - (pd.Series(normalized_consumption).rank(pct=True) * 100)
        
        # Adjust for building characteristics
        insulation_bonus = (df['insulation_rating'] - 0.5) * 20  # Better insulation = higher efficiency
        age_penalty = np.maximum(0, (df['building_age'] - 10) * 0.5)  # Older buildings less efficient
        
        efficiency = efficiency_percentile + insulation_bonus - age_penalty
        
        return np.clip(efficiency, 0, 100)
    
    def train_ensemble_model(self, training_data: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        """
        Train the ensemble of models for improved accuracy
        """
        if training_data is None:
            logger.info("Generating training data...")
            training_data = self.generate_enhanced_training_data()
        
        # Prepare features
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend', 'is_holiday', 'season',
            'outdoor_temperature', 'outdoor_humidity', 'solar_radiation',
            'occupancy_rate', 'total_occupants', 'hvac_load', 'lighting_load',
            'computers_load', 'servers_load', 'kitchen_load', 'building_age',
            'floor_area', 'insulation_rating', 'electricity_rate',
            'demand_response_active'
        ]
        
        X = training_data[feature_columns]
        y = training_data['energy_consumption']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train each model in ensemble
        ensemble_predictions_train = np.zeros(len(X_train))
        ensemble_predictions_test = np.zeros(len(X_test))
        
        model_metrics = {}
        
        for model_name, model in self.models.items():
            # Scale features
            X_train_scaled = self.scalers[model_name].fit_transform(X_train)
            X_test_scaled = self.scalers[model_name].transform(X_test)
            
            # Train model
            model.fit(X_train_scaled, y_train)
            
            # Predictions
            train_pred = model.predict(X_train_scaled)
            test_pred = model.predict(X_test_scaled)
            
            # Store metrics
            model_metrics[model_name] = {
                'train_mse': mean_squared_error(y_train, train_pred),
                'test_mse': mean_squared_error(y_test, test_pred),
                'train_r2': r2_score(y_train, train_pred),
                'test_r2': r2_score(y_test, test_pred),
                'test_mae': mean_absolute_error(y_test, test_pred)
            }
            
            # Add to ensemble (weighted by R² score)
            weight = max(0.1, model_metrics[model_name]['test_r2'])
            ensemble_predictions_train += train_pred * weight
            ensemble_predictions_test += test_pred * weight
        
        # Normalize ensemble predictions
        total_weight = sum(max(0.1, metrics['test_r2']) for metrics in model_metrics.values())
        ensemble_predictions_train /= total_weight
        ensemble_predictions_test /= total_weight
        
        # Calculate ensemble metrics
        ensemble_metrics = {
            'ensemble_train_mse': mean_squared_error(y_train, ensemble_predictions_train),
            'ensemble_test_mse': mean_squared_error(y_test, ensemble_predictions_test),
            'ensemble_train_r2': r2_score(y_train, ensemble_predictions_train),
            'ensemble_test_r2': r2_score(y_test, ensemble_predictions_test),
            'ensemble_test_mae': mean_absolute_error(y_test, ensemble_predictions_test),
            'individual_models': model_metrics
        }
        
        self.model_metrics = ensemble_metrics
        self.feature_columns = feature_columns
        self.is_trained = True
        
        logger.info(f"Ensemble model trained. Test R²: {ensemble_metrics['ensemble_test_r2']:.4f}")
        return ensemble_metrics
    
    def predict_energy_consumption(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict energy consumption using ensemble model
        """
        if not self.is_trained:
            logger.warning("Model not trained. Training with default data...")
            self.train_ensemble_model()
        
        # Prepare input data
        input_df = pd.DataFrame([input_data])
        
        # Fill missing values with defaults
        defaults = {
            'hour': datetime.now().hour,
            'day_of_week': datetime.now().weekday(),
            'month': datetime.now().month,
            'is_weekend': datetime.now().weekday() >= 5,
            'is_holiday': 0,
            'season': (datetime.now().month % 12) // 3,
            'outdoor_temperature': 22,
            'outdoor_humidity': 50,
            'solar_radiation': 500,
            'occupancy_rate': 0.7,
            'total_occupants': 200,
            'hvac_load': 0.8,
            'lighting_load': 0.7,
            'computers_load': 0.8,
            'servers_load': 0.9,
            'kitchen_load': 0.6,
            'building_age': 15,
            'floor_area': 50000,
            'insulation_rating': 0.7,
            'electricity_rate': 0.12,
            'demand_response_active': 0
        }
        
        for feature in self.feature_columns:
            if feature not in input_df.columns:
                input_df[feature] = defaults.get(feature, 0)
        
        X = input_df[self.feature_columns]
        
        # Ensemble prediction
        ensemble_prediction = 0
        total_weight = 0
        
        for model_name, model in self.models.items():
            X_scaled = self.scalers[model_name].transform(X)
            prediction = model.predict(X_scaled)[0]
            
            # Weight by model performance
            weight = max(0.1, self.model_metrics['individual_models'][model_name]['test_r2'])
            ensemble_prediction += prediction * weight
            total_weight += weight
        
        ensemble_prediction /= total_weight
        
        # Calculate cost
        rate = input_data.get('electricity_rate', 0.12)
        predicted_cost = ensemble_prediction * rate
        
        # Calculate efficiency score
        efficiency = self._calculate_single_efficiency_score(input_data, ensemble_prediction)
        
        # Confidence calculation based on ensemble agreement
        individual_predictions = []
        for model_name, model in self.models.items():
            X_scaled = self.scalers[model_name].transform(X)
            pred = model.predict(X_scaled)[0]
            individual_predictions.append(pred)
        
        prediction_std = np.std(individual_predictions)
        confidence = max(0.5, min(0.98, 1.0 - (prediction_std / ensemble_prediction) * 2))
        
        return {
            'predicted_consumption': float(ensemble_prediction),
            'predicted_cost': float(predicted_cost),
            'efficiency_score': float(efficiency),
            'confidence': float(confidence),
            'individual_predictions': {
                name: float(pred) for name, pred in zip(self.models.keys(), individual_predictions)
            },
            'cost_breakdown': self._calculate_cost_breakdown(ensemble_prediction, rate),
            'recommendations': self._generate_energy_recommendations(input_data, ensemble_prediction)
        }
    
    def _calculate_single_efficiency_score(self, input_data: Dict, consumption: float) -> float:
        """
        Calculate efficiency score for a single prediction
        """
        floor_area = input_data.get('floor_area', 50000)
        occupancy = input_data.get('total_occupants', 200)
        
        # Normalize consumption
        normalized_consumption = consumption / (floor_area / 1000) / max(1, occupancy)
        
        # Calculate efficiency (lower consumption = higher efficiency)
        # Assume typical range is 0.5-3.0 kWh per 1000 sq ft per person
        if normalized_consumption < 0.5:
            efficiency = 100
        elif normalized_consumption > 3.0:
            efficiency = 20
        else:
            efficiency = 100 - (normalized_consumption - 0.5) * 32  # Linear scale
        
        # Adjustments
        insulation = input_data.get('insulation_rating', 0.7)
        efficiency += (insulation - 0.5) * 20
        
        building_age = input_data.get('building_age', 15)
        efficiency -= max(0, (building_age - 10) * 0.5)
        
        return max(0, min(100, efficiency))
    
    def _calculate_cost_breakdown(self, consumption: float, rate: float) -> Dict[str, float]:
        """
        Calculate cost breakdown by energy source/usage
        """
        total_cost = consumption * rate
        
        # Approximate breakdown based on typical commercial buildings
        return {
            'hvac': total_cost * 0.45,
            'lighting': total_cost * 0.20,
            'computers': total_cost * 0.15,
            'servers': total_cost * 0.12,
            'kitchen': total_cost * 0.05,
            'other': total_cost * 0.03
        }
    
    def _generate_energy_recommendations(self, input_data: Dict, predicted_consumption: float) -> List[Dict[str, str]]:
        """
        Generate energy optimization recommendations
        """
        recommendations = []
        
        # Temperature-based recommendations
        temp = input_data.get('outdoor_temperature', 22)
        if temp > 26:
            recommendations.append({
                'category': 'HVAC',
                'priority': 'high',
                'action': 'Consider pre-cooling building before peak hours',
                'potential_savings': '10-15%'
            })
        elif temp < 16:
            recommendations.append({
                'category': 'HVAC',
                'priority': 'medium',
                'action': 'Optimize heating schedule and zone control',
                'potential_savings': '8-12%'
            })
        
        # Occupancy-based recommendations
        occupancy = input_data.get('occupancy_rate', 0.7)
        if occupancy < 0.3:
            recommendations.append({
                'category': 'General',
                'priority': 'medium',
                'action': 'Reduce lighting and HVAC in unoccupied areas',
                'potential_savings': '15-25%'
            })
        
        # Lighting recommendations based on solar radiation
        solar = input_data.get('solar_radiation', 500)
        if solar > 600:
            recommendations.append({
                'category': 'Lighting',
                'priority': 'low',
                'action': 'Implement daylight harvesting controls',
                'potential_savings': '5-10%'
            })
        
        # Equipment efficiency recommendations
        building_age = input_data.get('building_age', 15)
        if building_age > 20:
            recommendations.append({
                'category': 'Equipment',
                'priority': 'high',
                'action': 'Consider upgrading to high-efficiency equipment',
                'potential_savings': '20-30%'
            })
        
        return recommendations
    
    def detect_energy_anomalies(self, recent_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect energy consumption anomalies and efficiency issues
        """
        if not recent_data:
            return []
        
        anomalies = []
        
        for i, data_point in enumerate(recent_data):
            # Predict expected consumption
            prediction = self.predict_energy_consumption(data_point)
            expected_consumption = prediction['predicted_consumption']
            actual_consumption = data_point.get('energy_consumption', expected_consumption)
            
            # Calculate deviation
            deviation = abs(actual_consumption - expected_consumption) / expected_consumption
            
            # Anomaly detection
            if deviation > self.optimization_thresholds['consumption_spike'] - 1:
                severity = 'high' if deviation > 1.0 else 'medium'
                anomalies.append({
                    'type': 'consumption_anomaly',
                    'severity': severity,
                    'timestamp': data_point.get('timestamp', datetime.now().isoformat()),
                    'expected': expected_consumption,
                    'actual': actual_consumption,
                    'deviation_percent': deviation * 100,
                    'message': f"Energy consumption {deviation:.1%} above expected",
                    'recommendations': prediction['recommendations']
                })
            
            # Cost anomaly detection
            expected_cost = prediction['predicted_cost']
            actual_cost = data_point.get('energy_cost', expected_cost)
            cost_deviation = abs(actual_cost - expected_cost) / expected_cost
            
            if cost_deviation > self.optimization_thresholds['cost_anomaly'] - 1:
                anomalies.append({
                    'type': 'cost_anomaly',
                    'severity': 'medium',
                    'timestamp': data_point.get('timestamp', datetime.now().isoformat()),
                    'expected_cost': expected_cost,
                    'actual_cost': actual_cost,
                    'deviation_percent': cost_deviation * 100,
                    'message': f"Energy cost {cost_deviation:.1%} above expected"
                })
            
            # Efficiency warning
            efficiency = prediction['efficiency_score']
            if efficiency < self.optimization_thresholds['efficiency_warning'] * 100:
                anomalies.append({
                    'type': 'efficiency_warning',
                    'severity': 'low',
                    'timestamp': data_point.get('timestamp', datetime.now().isoformat()),
                    'efficiency_score': efficiency,
                    'message': f"Low energy efficiency: {efficiency:.1f}/100",
                    'recommendations': prediction['recommendations']
                })
        
        return anomalies
    
    def predict_24h_consumption(self, base_conditions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict energy consumption for the next 24 hours
        """
        if not self.is_trained:
            self.train_ensemble_model()
        
        predictions = []
        current_time = datetime.now()
        total_predicted_consumption = 0
        total_predicted_cost = 0
        
        for hour in range(24):
            future_time = current_time + timedelta(hours=hour)
            
            # Create prediction input based on time and base conditions
            prediction_input = base_conditions.copy()
            prediction_input.update({
                'hour': future_time.hour,
                'day_of_week': future_time.weekday(),
                'month': future_time.month,
                'is_weekend': future_time.weekday() >= 5,
                'is_holiday': base_conditions.get('is_holiday', 0)
            })
            
            # Adjust occupancy and loads based on hour
            if prediction_input['hour'] in self.company_config['peak_demand_hours']:
                prediction_input['occupancy_rate'] = base_conditions.get('occupancy_rate', 0.7) * 1.2
            elif 6 <= prediction_input['hour'] <= 20:
                prediction_input['occupancy_rate'] = base_conditions.get('occupancy_rate', 0.7)
            else:
                prediction_input['occupancy_rate'] = base_conditions.get('occupancy_rate', 0.7) * 0.3
            
            # Make prediction
            prediction = self.predict_energy_consumption(prediction_input)
            
            predictions.append({
                'hour': future_time.strftime('%H:%M'),
                'predicted_consumption': prediction['predicted_consumption'],
                'predicted_cost': prediction['predicted_cost'],
                'efficiency_score': prediction['efficiency_score'],
                'confidence': prediction['confidence']
            })
            
            total_predicted_consumption += prediction['predicted_consumption']
            total_predicted_cost += prediction['predicted_cost']
        
        # Calculate peak demand period
        peak_hours = [p for p in predictions if int(p['hour'].split(':')[0]) in self.company_config['peak_demand_hours']]
        peak_consumption = sum(p['predicted_consumption'] for p in peak_hours)
        
        return {
            'predictions': predictions,
            'summary': {
                'total_consumption_24h': total_predicted_consumption,
                'total_cost_24h': total_predicted_cost,
                'average_efficiency': np.mean([p['efficiency_score'] for p in predictions]),
                'peak_consumption': peak_consumption,
                'off_peak_consumption': total_predicted_consumption - peak_consumption,
                'carbon_footprint': total_predicted_consumption * self.company_config['sustainability_targets']['carbon_intensity']
            },
            'optimization_opportunities': self._identify_optimization_opportunities(predictions)
        }
    
    def _identify_optimization_opportunities(self, predictions: List[Dict]) -> List[Dict[str, str]]:
        """
        Identify optimization opportunities based on 24h predictions
        """
        opportunities = []
        
        # Find peak consumption periods
        peak_consumption = max(p['predicted_consumption'] for p in predictions)
        peak_times = [p for p in predictions if p['predicted_consumption'] > peak_consumption * 0.9]
        
        if len(peak_times) > 1:
            opportunities.append({
                'category': 'Load Shifting',
                'description': f"Consider shifting non-critical loads from {len(peak_times)} peak hours",
                'potential_savings': '5-15%',
                'implementation': 'Schedule equipment during off-peak hours'
            })
        
        # Check for low efficiency periods
        low_efficiency_periods = [p for p in predictions if p['efficiency_score'] < 60]
        if low_efficiency_periods:
            opportunities.append({
                'category': 'Efficiency Improvement',
                'description': f"{len(low_efficiency_periods)} hours show low efficiency",
                'potential_savings': '10-20%',
                'implementation': 'Optimize HVAC and equipment scheduling'
            })
        
        # Identify demand response opportunities
        high_cost_periods = sorted(predictions, key=lambda x: x['predicted_cost'], reverse=True)[:4]
        if high_cost_periods:
            opportunities.append({
                'category': 'Demand Response',
                'description': "Participate in demand response programs during peak cost periods",
                'potential_savings': '8-12%',
                'implementation': 'Reduce non-essential loads during peak rate hours'
            })
        
        return opportunities

# Initialize global instance
energy_predictor = EnhancedEnergyPredictorAI()

# Export for use in Flask app
__all__ = ['EnhancedEnergyPredictorAI', 'energy_predictor']