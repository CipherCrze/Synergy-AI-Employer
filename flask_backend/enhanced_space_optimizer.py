"""
Enhanced Space Optimizer AI for Synergy AI Platform
Improved accuracy and real-time optimization capabilities
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class EnhancedSpaceOptimizerAI:
    """
    Enhanced Space Optimizer AI with improved accuracy and real-time capabilities
    Features:
    - Company-specific model training
    - Real-time conflict detection
    - Advanced environmental monitoring
    - Predictive space allocation
    - Multi-objective optimization
    """
    
    def __init__(self, company_id: str = "default"):
        self.company_id = company_id
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_trained = False
        self.feature_importance = None
        self.model_metrics = {}
        
        # Enhanced model configuration for better accuracy
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            random_state=42,
            subsample=0.8
        )
        
        # Real-time optimization parameters
        self.optimization_thresholds = {
            'occupancy_warning': 0.85,
            'occupancy_critical': 0.95,
            'temperature_min': 20.0,
            'temperature_max': 26.0,
            'humidity_min': 30.0,
            'humidity_max': 70.0,
            'co2_max': 1000.0,
            'noise_max': 70.0
        }
        
        # Company-specific configuration
        self.company_config = {
            'business_hours': {'start': '09:00', 'end': '18:00'},
            'peak_hours': ['10:00-12:00', '14:00-16:00'],
            'space_types': ['desk', 'meeting_room', 'common_area', 'phone_booth'],
            'departments': ['engineering', 'sales', 'marketing', 'hr', 'finance']
        }
        
        logger.info(f"Enhanced Space Optimizer AI initialized for company: {company_id}")
    
    def generate_enhanced_training_data(self, n_samples: int = 15000, 
                                      start_date: str = '2023-01-01') -> pd.DataFrame:
        """
        Generate enhanced training data with realistic patterns and company-specific variations
        """
        np.random.seed(42)
        
        # Generate time-based data
        start = pd.to_datetime(start_date)
        dates = pd.date_range(start, periods=n_samples, freq='H')
        
        # Base features
        data = {
            'timestamp': dates,
            'hour': dates.hour,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'is_weekend': dates.dayofweek >= 5,
            'is_holiday': np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
        }
        
        # Space-related features
        space_types = ['desk', 'meeting_room', 'common_area', 'phone_booth']
        departments = ['engineering', 'sales', 'marketing', 'hr', 'finance']
        floors = [1, 2, 3, 4, 5]
        
        data['space_type'] = np.random.choice(space_types, n_samples)
        data['department'] = np.random.choice(departments, n_samples)
        data['floor'] = np.random.choice(floors, n_samples)
        data['capacity'] = np.random.randint(1, 21, n_samples)
        
        # Environmental features with realistic variations
        base_temp = 22 + np.random.normal(0, 2, n_samples)
        data['temperature'] = np.clip(base_temp, 18, 28)
        
        base_humidity = 45 + np.random.normal(0, 10, n_samples)
        data['humidity'] = np.clip(base_humidity, 30, 80)
        
        base_co2 = 400 + np.random.normal(0, 150, n_samples)
        data['co2_level'] = np.clip(base_co2, 300, 1500)
        
        base_noise = 45 + np.random.normal(0, 10, n_samples)
        data['noise_level'] = np.clip(base_noise, 30, 80)
        
        # Air quality index (0-100, higher is better)
        data['air_quality'] = np.random.normal(75, 15, n_samples)
        data['air_quality'] = np.clip(data['air_quality'], 0, 100)
        
        # Create realistic utilization patterns
        df = pd.DataFrame(data)
        
        # Enhanced utilization calculation with multiple factors
        utilization = self._calculate_enhanced_utilization(df)
        df['utilization'] = utilization
        
        # Current occupancy based on utilization and capacity
        df['current_occupancy'] = (df['utilization'] * df['capacity']).round().astype(int)
        
        # Efficiency score (0-100)
        df['efficiency'] = self._calculate_efficiency_score(df)
        
        # Add booking and conflict data
        df['booking_conflicts'] = np.random.poisson(0.1, n_samples)
        df['maintenance_due'] = np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
        
        logger.info(f"Generated {n_samples} training samples with enhanced features")
        return df
    
    def _calculate_enhanced_utilization(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate realistic utilization patterns with multiple influencing factors
        """
        n_samples = len(df)
        utilization = np.zeros(n_samples)
        
        for i in range(n_samples):
            row = df.iloc[i]
            
            # Base utilization by hour (business hours pattern)
            if row['hour'] < 8 or row['hour'] > 18:
                base_util = 0.1  # Low utilization outside business hours
            elif row['hour'] in [9, 10, 11, 14, 15, 16]:
                base_util = 0.8  # Peak hours
            elif row['hour'] in [8, 12, 13, 17, 18]:
                base_util = 0.6  # Medium hours
            else:
                base_util = 0.4  # Other hours
            
            # Weekend factor
            if row['is_weekend']:
                base_util *= 0.2
            
            # Holiday factor
            if row['is_holiday']:
                base_util *= 0.1
            
            # Space type factor
            if row['space_type'] == 'desk':
                space_factor = 1.0
            elif row['space_type'] == 'meeting_room':
                space_factor = 0.6
            elif row['space_type'] == 'common_area':
                space_factor = 0.4
            else:  # phone_booth
                space_factor = 0.3
            
            # Department factor (some departments work different hours)
            if row['department'] in ['engineering', 'sales']:
                dept_factor = 1.1
            elif row['department'] in ['marketing']:
                dept_factor = 1.0
            else:
                dept_factor = 0.9
            
            # Environmental comfort factor
            comfort_factor = 1.0
            if row['temperature'] < 20 or row['temperature'] > 26:
                comfort_factor *= 0.8
            if row['humidity'] < 30 or row['humidity'] > 70:
                comfort_factor *= 0.9
            if row['co2_level'] > 1000:
                comfort_factor *= 0.7
            if row['noise_level'] > 65:
                comfort_factor *= 0.8
            
            # Calculate final utilization
            final_util = base_util * space_factor * dept_factor * comfort_factor
            
            # Add some random variation
            final_util += np.random.normal(0, 0.1)
            
            # Ensure utilization is between 0 and 1
            utilization[i] = np.clip(final_util, 0, 1)
        
        return utilization
    
    def _calculate_efficiency_score(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate efficiency score based on utilization and environmental factors
        """
        efficiency = df['utilization'] * 100  # Base efficiency from utilization
        
        # Environmental penalties
        temp_penalty = np.where((df['temperature'] < 20) | (df['temperature'] > 26), 10, 0)
        humidity_penalty = np.where((df['humidity'] < 30) | (df['humidity'] > 70), 5, 0)
        co2_penalty = np.where(df['co2_level'] > 1000, 15, 0)
        noise_penalty = np.where(df['noise_level'] > 65, 8, 0)
        
        # Apply penalties
        efficiency = efficiency - temp_penalty - humidity_penalty - co2_penalty - noise_penalty
        
        # Add air quality bonus
        air_quality_bonus = (df['air_quality'] - 50) * 0.2
        efficiency = efficiency + air_quality_bonus
        
        return np.clip(efficiency, 0, 100)
    
    def train_model(self, training_data: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        """
        Train the enhanced model with company-specific data
        """
        if training_data is None:
            logger.info("Generating training data...")
            training_data = self.generate_enhanced_training_data()
        
        # Prepare features and target
        feature_columns = [
            'hour', 'day_of_week', 'month', 'is_weekend', 'is_holiday',
            'capacity', 'temperature', 'humidity', 'co2_level', 'noise_level',
            'air_quality', 'booking_conflicts', 'maintenance_due'
        ]
        
        # Encode categorical features
        categorical_features = ['space_type', 'department', 'floor']
        for feature in categorical_features:
            le = LabelEncoder()
            training_data[f'{feature}_encoded'] = le.fit_transform(training_data[feature])
            self.label_encoders[feature] = le
            feature_columns.append(f'{feature}_encoded')
        
        X = training_data[feature_columns]
        y = training_data['utilization']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        train_pred = self.model.predict(X_train_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        metrics = {
            'train_mse': mean_squared_error(y_train, train_pred),
            'test_mse': mean_squared_error(y_test, test_pred),
            'train_r2': r2_score(y_train, train_pred),
            'test_r2': r2_score(y_test, test_pred),
            'feature_importance': dict(zip(feature_columns, self.model.feature_importances_))
        }
        
        self.model_metrics = metrics
        self.feature_columns = feature_columns
        self.is_trained = True
        
        logger.info(f"Model trained successfully. Test R²: {metrics['test_r2']:.4f}")
        return metrics
    
    def predict_utilization(self, space_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict space utilization with confidence intervals
        """
        if not self.is_trained:
            logger.warning("Model not trained. Training with default data...")
            self.train_model()
        
        # Prepare input data
        input_data = pd.DataFrame([space_data])
        
        # Encode categorical features
        for feature, encoder in self.label_encoders.items():
            if feature in input_data.columns:
                input_data[f'{feature}_encoded'] = encoder.transform(input_data[feature])
        
        # Select features and scale
        X = input_data[self.feature_columns].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        
        # Calculate confidence (simplified approach)
        confidence = min(0.95, max(0.6, 1.0 - abs(prediction - 0.5) * 0.5))
        
        return {
            'predicted_utilization': float(prediction),
            'confidence': float(confidence),
            'recommended_capacity': int(space_data.get('capacity', 10) * prediction),
            'efficiency_score': self._calculate_single_efficiency(space_data, prediction)
        }
    
    def _calculate_single_efficiency(self, space_data: Dict, utilization: float) -> float:
        """
        Calculate efficiency score for a single prediction
        """
        efficiency = utilization * 100
        
        # Environmental factors
        temp = space_data.get('temperature', 22)
        humidity = space_data.get('humidity', 45)
        co2 = space_data.get('co2_level', 400)
        noise = space_data.get('noise_level', 45)
        air_quality = space_data.get('air_quality', 75)
        
        if temp < 20 or temp > 26:
            efficiency -= 10
        if humidity < 30 or humidity > 70:
            efficiency -= 5
        if co2 > 1000:
            efficiency -= 15
        if noise > 65:
            efficiency -= 8
        
        efficiency += (air_quality - 50) * 0.2
        
        return max(0, min(100, efficiency))
    
    def detect_conflicts(self, current_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Real-time conflict detection with enhanced algorithms
        """
        conflicts = []
        
        for space in current_data:
            space_conflicts = []
            
            # Overcrowding detection
            current_occupancy = space.get('current_occupancy', 0)
            capacity = space.get('capacity', 10)
            utilization = current_occupancy / capacity if capacity > 0 else 0
            
            if utilization > self.optimization_thresholds['occupancy_critical']:
                space_conflicts.append({
                    'type': 'critical_overcrowding',
                    'severity': 'high',
                    'message': f"Critical overcrowding: {utilization:.1%} capacity",
                    'recommendation': 'Immediately redirect bookings to alternate spaces'
                })
            elif utilization > self.optimization_thresholds['occupancy_warning']:
                space_conflicts.append({
                    'type': 'overcrowding_warning',
                    'severity': 'medium',
                    'message': f"High occupancy: {utilization:.1%} capacity",
                    'recommendation': 'Consider preparing alternate spaces'
                })
            
            # Environmental conflicts
            temp = space.get('temperature', 22)
            if temp < self.optimization_thresholds['temperature_min'] or temp > self.optimization_thresholds['temperature_max']:
                space_conflicts.append({
                    'type': 'temperature_issue',
                    'severity': 'medium',
                    'message': f"Temperature out of comfort range: {temp}°C",
                    'recommendation': 'Adjust HVAC settings for optimal comfort'
                })
            
            humidity = space.get('humidity', 45)
            if humidity < self.optimization_thresholds['humidity_min'] or humidity > self.optimization_thresholds['humidity_max']:
                space_conflicts.append({
                    'type': 'humidity_issue',
                    'severity': 'low',
                    'message': f"Humidity out of optimal range: {humidity}%",
                    'recommendation': 'Adjust humidification system'
                })
            
            co2 = space.get('co2_level', 400)
            if co2 > self.optimization_thresholds['co2_max']:
                space_conflicts.append({
                    'type': 'air_quality_issue',
                    'severity': 'high',
                    'message': f"High CO2 levels: {co2} ppm",
                    'recommendation': 'Increase ventilation immediately'
                })
            
            noise = space.get('noise_level', 45)
            if noise > self.optimization_thresholds['noise_max']:
                space_conflicts.append({
                    'type': 'noise_issue',
                    'severity': 'medium',
                    'message': f"High noise levels: {noise} dB",
                    'recommendation': 'Implement noise reduction measures'
                })
            
            # Add conflicts for this space
            if space_conflicts:
                conflicts.append({
                    'space_id': space.get('id', 'unknown'),
                    'space_name': space.get('name', 'Unknown Space'),
                    'conflicts': space_conflicts,
                    'timestamp': datetime.now().isoformat(),
                    'total_severity': len([c for c in space_conflicts if c['severity'] == 'high']) * 3 +
                                   len([c for c in space_conflicts if c['severity'] == 'medium']) * 2 +
                                   len([c for c in space_conflicts if c['severity'] == 'low'])
                })
        
        return sorted(conflicts, key=lambda x: x['total_severity'], reverse=True)
    
    def generate_optimization_recommendations(self, space_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate comprehensive optimization recommendations
        """
        recommendations = {
            'immediate_actions': [],
            'short_term_optimizations': [],
            'long_term_strategies': [],
            'cost_savings_potential': 0,
            'efficiency_improvements': {}
        }
        
        total_spaces = len(space_data)
        high_utilization_spaces = 0
        low_utilization_spaces = 0
        environmental_issues = 0
        
        for space in space_data:
            current_occupancy = space.get('current_occupancy', 0)
            capacity = space.get('capacity', 10)
            utilization = current_occupancy / capacity if capacity > 0 else 0
            
            # Utilization analysis
            if utilization > 0.85:
                high_utilization_spaces += 1
                recommendations['immediate_actions'].append({
                    'space': space.get('name', 'Unknown'),
                    'action': 'Consider expanding capacity or redistributing load',
                    'priority': 'high'
                })
            elif utilization < 0.3:
                low_utilization_spaces += 1
                recommendations['short_term_optimizations'].append({
                    'space': space.get('name', 'Unknown'),
                    'action': 'Reassign to different function or consolidate usage',
                    'potential_savings': capacity * 100  # Simplified calculation
                })
            
            # Environmental analysis
            temp = space.get('temperature', 22)
            if temp < 20 or temp > 26:
                environmental_issues += 1
                recommendations['immediate_actions'].append({
                    'space': space.get('name', 'Unknown'),
                    'action': f'Adjust temperature from {temp}°C to 22-24°C range',
                    'priority': 'medium'
                })
        
        # Calculate potential improvements
        if total_spaces > 0:
            underutilization_rate = low_utilization_spaces / total_spaces
            recommendations['cost_savings_potential'] = underutilization_rate * 50000  # Estimated annual savings
            
            recommendations['efficiency_improvements'] = {
                'space_utilization': f"{((total_spaces - low_utilization_spaces) / total_spaces) * 100:.1f}%",
                'environmental_compliance': f"{((total_spaces - environmental_issues) / total_spaces) * 100:.1f}%",
                'overall_efficiency': f"{((total_spaces - low_utilization_spaces - environmental_issues) / total_spaces) * 100:.1f}%"
            }
        
        # Long-term strategies
        if high_utilization_spaces > total_spaces * 0.3:
            recommendations['long_term_strategies'].append({
                'strategy': 'Capacity expansion planning',
                'description': 'Consider adding flexible workspaces or hybrid work policies',
                'timeline': '3-6 months'
            })
        
        if low_utilization_spaces > total_spaces * 0.4:
            recommendations['long_term_strategies'].append({
                'strategy': 'Space consolidation',
                'description': 'Consolidate underutilized spaces to reduce operational costs',
                'timeline': '2-4 months'
            })
        
        return recommendations
    
    def get_real_time_analytics(self, space_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate real-time analytics dashboard data
        """
        if not space_data:
            return {'error': 'No space data provided'}
        
        total_spaces = len(space_data)
        total_capacity = sum(space.get('capacity', 0) for space in space_data)
        total_occupancy = sum(space.get('current_occupancy', 0) for space in space_data)
        
        # Calculate metrics
        overall_utilization = total_occupancy / total_capacity if total_capacity > 0 else 0
        
        # Space type breakdown
        space_types = {}
        for space in space_data:
            space_type = space.get('type', 'unknown')
            if space_type not in space_types:
                space_types[space_type] = {'count': 0, 'utilization': 0, 'capacity': 0}
            space_types[space_type]['count'] += 1
            space_types[space_type]['capacity'] += space.get('capacity', 0)
            space_types[space_type]['utilization'] += space.get('current_occupancy', 0)
        
        # Calculate average environmental conditions
        avg_temp = np.mean([space.get('temperature', 22) for space in space_data])
        avg_humidity = np.mean([space.get('humidity', 45) for space in space_data])
        avg_co2 = np.mean([space.get('co2_level', 400) for space in space_data])
        avg_noise = np.mean([space.get('noise_level', 45) for space in space_data])
        
        # Predict next hour utilization
        future_predictions = []
        current_time = datetime.now()
        
        for i in range(1, 6):  # Next 5 hours
            future_time = current_time + timedelta(hours=i)
            future_data = {
                'hour': future_time.hour,
                'day_of_week': future_time.weekday(),
                'month': future_time.month,
                'is_weekend': future_time.weekday() >= 5,
                'is_holiday': 0,  # Simplified
                'capacity': total_capacity / total_spaces if total_spaces > 0 else 10,
                'temperature': avg_temp,
                'humidity': avg_humidity,
                'co2_level': avg_co2,
                'noise_level': avg_noise,
                'air_quality': 75,
                'booking_conflicts': 0,
                'maintenance_due': 0,
                'space_type': 'desk',  # Default
                'department': 'engineering',  # Default
                'floor': 1  # Default
            }
            
            prediction = self.predict_utilization(future_data)
            future_predictions.append({
                'time': future_time.strftime('%H:%M'),
                'predicted_utilization': prediction['predicted_utilization'],
                'confidence': prediction['confidence']
            })
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overview': {
                'total_spaces': total_spaces,
                'total_capacity': total_capacity,
                'current_occupancy': total_occupancy,
                'overall_utilization': overall_utilization,
                'efficiency_score': np.mean([self._calculate_single_efficiency(space, 
                                           space.get('current_occupancy', 0) / space.get('capacity', 1))
                                          for space in space_data])
            },
            'space_breakdown': space_types,
            'environmental': {
                'average_temperature': avg_temp,
                'average_humidity': avg_humidity,
                'average_co2': avg_co2,
                'average_noise': avg_noise,
                'comfort_score': self._calculate_comfort_score(avg_temp, avg_humidity, avg_co2, avg_noise)
            },
            'predictions': future_predictions,
            'model_info': {
                'company_id': self.company_id,
                'model_accuracy': self.model_metrics.get('test_r2', 0) if self.is_trained else 0,
                'last_trained': datetime.now().isoformat() if self.is_trained else None
            }
        }
    
    def _calculate_comfort_score(self, temp: float, humidity: float, co2: float, noise: float) -> float:
        """
        Calculate environmental comfort score (0-100)
        """
        score = 100
        
        # Temperature penalty
        if temp < 20 or temp > 26:
            score -= abs(temp - 23) * 5
        
        # Humidity penalty
        if humidity < 30 or humidity > 70:
            if humidity < 30:
                score -= (30 - humidity) * 0.5
            else:
                score -= (humidity - 70) * 0.3
        
        # CO2 penalty
        if co2 > 1000:
            score -= (co2 - 1000) * 0.02
        
        # Noise penalty
        if noise > 50:
            score -= (noise - 50) * 0.5
        
        return max(0, min(100, score))

# Initialize global instance
space_optimizer = EnhancedSpaceOptimizerAI()

# Export for use in Flask app
__all__ = ['EnhancedSpaceOptimizerAI', 'space_optimizer']