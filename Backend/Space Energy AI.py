import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, silhouette_score
import warnings
warnings.filterwarnings('ignore')

class SpaceOptimizerAI:
    def __init__(self):
        self.scaler_features = MinMaxScaler()
        self.scaler_target = MinMaxScaler()
        self.kmeans_model = KMeans(n_clusters=4, random_state=42)
        self.lstm_model = None
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.feature_columns = []

    def generate_enhanced_mock_data(self, days=90):
        """Generate comprehensive mock data following the guide's data collection points"""
        np.random.seed(42)
        dates = pd.date_range(start='2024-03-01', periods=days)

        # 1. Core Occupancy Metrics - Desk/Room Utilization
        desk_data = []
        for date in dates:
            day_of_week = date.weekday()  # 0=Monday, 6=Sunday
            is_weekend = day_of_week >= 5

            # Simulate different patterns for weekdays vs weekends
            base_occupancy = 0.3 if is_weekend else 0.7
            seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * date.dayofyear / 365)

            for desk_id in range(1, 51):  # 50 desks
                # IoT sensor data simulation
                motion_detected = np.random.binomial(1, base_occupancy * seasonal_factor)
                usage_hours = np.random.exponential(6) if motion_detected else 0
                usage_hours = min(usage_hours, 10)  # Cap at 10 hours

                # Environmental factors
                noise_level = np.random.normal(45, 10)  # dB
                temperature = np.random.normal(22, 2)   # Celsius
                co2_level = np.random.normal(400, 50)   # ppm

                # Desk attributes
                desk_size = np.random.choice(['Small', 'Medium', 'Large'])
                has_monitor = np.random.choice([0, 1], p=[0.3, 0.7])
                proximity_score = np.random.uniform(0.3, 1.0)  # Distance to amenities

                desk_data.append({
                    'date': date,
                    'desk_id': desk_id,
                    'usage_hours': usage_hours,
                    'motion_detected': motion_detected,
                    'noise_level': noise_level,
                    'temperature': temperature,
                    'co2_level': co2_level,
                    'desk_size': desk_size,
                    'has_monitor': has_monitor,
                    'proximity_score': proximity_score,
                    'day_of_week': day_of_week,
                    'is_weekend': is_weekend
                })

        desk_df = pd.DataFrame(desk_data)

        # 2. Employee Behavioral Data
        employee_data = []
        departments = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance']
        for emp_id in range(1, 201):  # 200 employees
            dept = np.random.choice(departments)
            for date in dates:
                # Hybrid work patterns based on department
                wfh_prob = {'Engineering': 0.4, 'Sales': 0.2, 'HR': 0.3,
                           'Marketing': 0.35, 'Finance': 0.25}[dept]

                attendance_type = np.random.choice(['In-Office', 'WFH', 'Leave'],
                                                 p=[1-wfh_prob-0.1, wfh_prob, 0.1])

                # Badge-in/out times
                if attendance_type == 'In-Office':
                    badge_in = np.random.normal(9, 1)  # Around 9 AM
                    badge_out = np.random.normal(17.5, 1.5)  # Around 5:30 PM
                else:
                    badge_in = badge_out = None

                employee_data.append({
                    'date': date,
                    'employee_id': emp_id,
                    'department': dept,
                    'attendance_type': attendance_type,
                    'badge_in_hour': badge_in,
                    'badge_out_hour': badge_out
                })

        emp_df = pd.DataFrame(employee_data)

        # 3. Meeting Room Usage
        room_data = []
        rooms = ['Room_A', 'Room_B', 'Room_C', 'Room_D', 'Room_E']
        for room in rooms:
            room_capacity = np.random.choice([6, 8, 12, 16, 20])
            for date in dates:
                # Calendar integration simulation
                bookings = np.random.poisson(3) if not date.weekday() >= 5 else np.random.poisson(1)

                total_booked_hours = 0
                actual_usage_hours = 0
                total_attendees = 0

                for booking in range(bookings):
                    booked_duration = np.random.choice([0.5, 1, 1.5, 2, 3])
                    actual_duration = booked_duration * np.random.uniform(0.7, 1.2)  # No-show factor
                    attendees = min(np.random.poisson(room_capacity * 0.6), room_capacity)

                    total_booked_hours += booked_duration
                    actual_usage_hours += actual_duration
                    total_attendees += attendees

                room_data.append({
                    'date': date,
                    'room_id': room,
                    'room_capacity': room_capacity,
                    'bookings_count': bookings,
                    'booked_hours': total_booked_hours,
                    'actual_hours': actual_usage_hours,
                    'total_attendees': total_attendees,
                    'utilization_rate': min(actual_usage_hours / 8, 1.0),  # 8-hour workday
                    'no_show_rate': max(0, (total_booked_hours - actual_usage_hours) / max(total_booked_hours, 1))
                })

        room_df = pd.DataFrame(room_data)

        return desk_df, emp_df, room_df

    def feature_engineering(self, desk_df, emp_df, room_df):
        """Create advanced features for better prediction accuracy"""

        # Aggregate employee data by date
        emp_agg = emp_df.groupby('date').agg({
            'employee_id': 'count',
            'attendance_type': lambda x: (x == 'In-Office').sum()
        }).rename(columns={'employee_id': 'total_employees', 'attendance_type': 'in_office_count'})

        # Department-wise aggregation
        dept_agg = emp_df[emp_df['attendance_type'] == 'In-Office'].groupby(['date', 'department']).size().unstack(fill_value=0)
        dept_agg.columns = [f'{col}_in_office' for col in dept_agg.columns]

        # Merge all data
        desk_agg = desk_df.groupby('date').agg({
            'usage_hours': ['mean', 'std', 'sum'],
            'motion_detected': 'sum',
            'noise_level': 'mean',
            'temperature': 'mean',
            'co2_level': 'mean'
        })
        desk_agg.columns = ['_'.join(col).strip() for col in desk_agg.columns.values]

        room_agg = room_df.groupby('date').agg({
            'bookings_count': 'sum',
            'utilization_rate': 'mean',
            'no_show_rate': 'mean'
        })

        # Combine all features
        features_df = desk_agg.join(emp_agg).join(dept_agg).join(room_agg)
        features_df = features_df.fillna(0)

        # Time-based features
        features_df['day_of_week'] = features_df.index.dayofweek
        features_df['month'] = features_df.index.month
        features_df['day_of_month'] = features_df.index.day
        features_df['is_weekend'] = (features_df['day_of_week'] >= 5).astype(int)

        # Rolling averages (trend features)
        for window in [3, 7, 14]:
            features_df[f'usage_hours_mean_rolling_{window}d'] = features_df['usage_hours_mean'].rolling(window).mean()
            features_df[f'in_office_count_rolling_{window}d'] = features_df['in_office_count'].rolling(window).mean()

        # Lag features
        for lag in [1, 2, 7]:
            features_df[f'usage_hours_mean_lag_{lag}d'] = features_df['usage_hours_mean'].shift(lag)
            features_df[f'in_office_count_lag_{lag}d'] = features_df['in_office_count'].shift(lag)

        features_df = features_df.dropna()
        return features_df

    def space_clustering(self, desk_df):
        """Cluster spaces based on usage patterns and environmental factors"""

        # Aggregate desk-level features
        desk_features = desk_df.groupby('desk_id').agg({
            'usage_hours': ['mean', 'std'],
            'noise_level': 'mean',
            'temperature': 'mean',
            'co2_level': 'mean',
            'proximity_score': 'first',
            'has_monitor': 'first'
        })
        desk_features.columns = ['_'.join(col).strip() for col in desk_features.columns.values]
        desk_features = desk_features.fillna(0)

        # Scale features for clustering
        features_scaled = StandardScaler().fit_transform(desk_features)

        # Perform clustering
        clusters = self.kmeans_model.fit_predict(features_scaled)
        desk_features['cluster'] = clusters

        # Calculate silhouette score
        silhouette_avg = silhouette_score(features_scaled, clusters)
        print(f"Silhouette Score for Space Clustering: {silhouette_avg:.3f}")

        # Interpret clusters
        cluster_summary = desk_features.groupby('cluster').agg({
            'usage_hours_mean': 'mean',
            'noise_level_mean': 'mean',
            'temperature_mean': 'mean',
            'has_monitor_first': 'mean'
        }).round(2)

        # Label clusters based on characteristics
        cluster_labels = {}
        for cluster in range(4):
            usage = cluster_summary.loc[cluster, 'usage_hours_mean']
            noise = cluster_summary.loc[cluster, 'noise_level_mean']

            if usage > 6 and noise > 50:
                cluster_labels[cluster] = "High-Activity Collaborative"
            elif usage > 6 and noise <= 50:
                cluster_labels[cluster] = "High-Activity Focused"
            elif usage <= 4 and noise <= 45:
                cluster_labels[cluster] = "Quiet/Underutilized"
            else:
                cluster_labels[cluster] = "Moderate Activity"

        desk_features['cluster_label'] = desk_features['cluster'].map(cluster_labels)

        return desk_features, cluster_summary, cluster_labels

    def train_occupancy_predictor(self, features_df, target_col='usage_hours_mean'):
        """Train Random Forest model for occupancy prediction"""

        # Prepare data
        self.feature_columns = features_df.columns.drop(target_col).tolist()
        X = features_df[self.feature_columns].values
        y = features_df[target_col].values

        # Scale data
        X_scaled = self.scaler_features.fit_transform(X)
        y_scaled = self.scaler_target.fit_transform(y.reshape(-1, 1)).flatten()

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_scaled, test_size=0.2, random_state=42, shuffle=False
        )

        # Train Random Forest Model
        self.rf_model.fit(X_train, y_train)
        rf_pred = self.rf_model.predict(X_test)
        rf_mae = mean_absolute_error(y_test, rf_pred)
        print(f"Random Forest MAE: {rf_mae:.4f}")

        return {
            'rf_mae': rf_mae,
            'feature_importance': dict(zip(self.feature_columns, self.rf_model.feature_importances_))
        }

    def predict_future_demand(self, features_df, days_ahead=7):
        """Predict future space demand"""

        # Get last day's features for prediction
        last_day_features = features_df[self.feature_columns].iloc[-1].values.reshape(1, -1)
        last_day_features_scaled = self.scaler_features.transform(last_day_features)

        # Random Forest prediction
        rf_pred_scaled = self.rf_model.predict(last_day_features_scaled)
        rf_pred = self.scaler_target.inverse_transform(rf_pred_scaled.reshape(-1, 1))[0][0]

        return {
            'rf_prediction': rf_pred,
            'ensemble_prediction': rf_pred,  # Using RF as primary model
            'prediction_date': features_df.index[-1] + timedelta(days=1)
        }

    def generate_optimization_insights(self, desk_clusters, features_df, predictions):
        """Generate actionable insights for space optimization"""

        insights = {
            'underutilized_spaces': [],
            'high_demand_areas': [],
            'recommendations': [],
            'predicted_demand': predictions['ensemble_prediction'],
            'confidence_level': 'High'
        }

        # Identify underutilized spaces
        underutilized = desk_clusters[desk_clusters['usage_hours_mean'] < 2.0]
        insights['underutilized_spaces'] = underutilized.index.tolist()

        # High demand identification
        recent_usage = features_df['usage_hours_mean'].tail(7).mean()
        if recent_usage > 6:
            insights['high_demand_areas'] = ['All zones showing high demand']

        # Generate recommendations
        if len(insights['underutilized_spaces']) > 5:
            insights['recommendations'].append("Consider hot-desking for underutilized areas")
            insights['recommendations'].append("Reallocate resources from low-usage zones")

        if predictions['ensemble_prediction'] > recent_usage * 1.1:
            insights['recommendations'].append("Increase available workspace capacity")
            insights['recommendations'].append("Consider extending working hours or flexible schedules")

        return insights