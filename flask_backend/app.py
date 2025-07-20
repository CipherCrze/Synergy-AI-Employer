"""
Flask API for Synergy AI Platform
Converted from FastAPI with enhanced AI models and Firebase integration
"""

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta
import json
import threading
import time
import os
from typing import Dict, List, Any, Optional

# Import our enhanced AI models and Firebase service
from enhanced_space_optimizer import space_optimizer
from enhanced_energy_predictor import energy_predictor
from firebase_service import firebase_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'synergy-ai-secret-key-demo'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "*"])

# Global variables for real-time processing
ai_processing_thread = None
ai_processing_active = False

# Train AI models on startup
def initialize_ai_models():
    """
    Initialize and train AI models on startup
    """
    try:
        logger.info("Training Space Optimizer AI...")
        space_optimizer.train_model()
        
        logger.info("Training Energy Predictor AI...")
        energy_predictor.train_ensemble_model()
        
        logger.info("AI models trained successfully")
        
        # Start real-time processing
        start_real_time_processing()
        
    except Exception as e:
        logger.error(f"Error initializing AI models: {e}")

def start_real_time_processing():
    """
    Start real-time AI processing and conflict detection
    """
    global ai_processing_thread, ai_processing_active
    
    if not ai_processing_active:
        ai_processing_active = True
        ai_processing_thread = threading.Thread(target=real_time_ai_processor)
        ai_processing_thread.daemon = True
        ai_processing_thread.start()
        logger.info("Real-time AI processing started")

def real_time_ai_processor():
    """
    Continuous AI processing for real-time optimization
    """
    while ai_processing_active:
        try:
            # Get current data from Firebase
            company_id = 'demo_company'
            dashboard_data = firebase_service.get_dashboard_data(company_id)
            
            if dashboard_data and dashboard_data.get('company'):
                spaces = dashboard_data['company'].get('spaces', [])
                
                # Update space occupancy with realistic patterns
                current_hour = datetime.now().hour
                if 8 <= current_hour <= 18:
                    base_utilization = 0.8 if current_hour in [10, 11, 14, 15] else 0.6
                else:
                    base_utilization = 0.1
                
                for space in spaces:
                    # Simulate realistic occupancy changes
                    capacity = space.get('capacity', 1)
                    current_occupancy = int(capacity * base_utilization * (0.8 + 0.4 * (time.time() % 1)))
                    firebase_service.update_space_occupancy(company_id, space['id'], current_occupancy)
                
                # Detect and store conflicts
                conflicts = space_optimizer.detect_conflicts(spaces)
                for conflict in conflicts:
                    firebase_service.store_conflict(company_id, conflict)
                
                # Generate and store AI predictions
                space_analytics = space_optimizer.get_real_time_analytics(spaces)
                firebase_service.store_ai_prediction(company_id, 'space_optimizer', space_analytics)
                
                # Energy predictions
                base_conditions = {
                    'outdoor_temperature': 22,
                    'occupancy_rate': base_utilization,
                    'building_age': 10,
                    'floor_area': 50000
                }
                energy_prediction = energy_predictor.predict_energy_consumption(base_conditions)
                firebase_service.store_ai_prediction(company_id, 'energy_predictor', energy_prediction)
            
            # Sleep for 30 seconds before next processing cycle
            time.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in real-time processing: {e}")
            time.sleep(60)  # Wait longer if there's an error

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    User authentication endpoint
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Authenticate user
        user = firebase_service.authenticate_user(email, password)
        
        if user:
            # Create JWT token
            access_token = create_access_token(
                identity=user['id'],
                additional_claims={
                    'email': user['email'],
                    'company_id': user['company_id'],
                    'role': user['role']
                }
            )
            
            return jsonify({
                'access_token': access_token,
                'user': user
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    User logout endpoint
    """
    return jsonify({'message': 'Logged out successfully'})

# Data endpoints
@app.route('/api/data/occupancy', methods=['GET'])
@jwt_required()
def get_occupancy_data():
    """
    Get occupancy data
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        hours = int(request.args.get('hours', 24))
        
        space_data = firebase_service.get_space_data(company_id, hours)
        
        # Transform data for frontend
        occupancy_data = []
        for data_point in space_data:
            occupancy_data.append({
                'hour': datetime.fromisoformat(data_point['timestamp']).strftime('%H:%M'),
                'occupancy': data_point.get('total_occupancy', 0),
                'capacity': data_point.get('total_capacity', 200),
                'utilization': data_point.get('overall_utilization', 0),
                'predicted': data_point.get('overall_utilization', 0) * 1.1  # Simple prediction
            })
        
        return jsonify(occupancy_data)
    
    except Exception as e:
        logger.error(f"Error getting occupancy data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/spaces', methods=['GET'])
@jwt_required()
def get_spaces_data():
    """
    Get current spaces data
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        company_data = firebase_service.get_company_data(company_id)
        
        if not company_data or 'spaces' not in company_data:
            return jsonify([])
        
        # Calculate utilization and efficiency for each space
        spaces_data = []
        for space in company_data['spaces']:
            current = space.get('current_occupancy', 0)
            capacity = space.get('capacity', 1)
            utilization = current / capacity if capacity > 0 else 0
            
            # Mock environmental data
            space_data = {
                'name': space['name'],
                'current': current,
                'capacity': capacity,
                'utilization': utilization,
                'efficiency': max(60, min(100, utilization * 100 + (100 - abs(utilization - 0.7) * 100))),
                'status': 'occupied' if utilization > 0.1 else 'available'
            }
            spaces_data.append(space_data)
        
        return jsonify(spaces_data)
    
    except Exception as e:
        logger.error(f"Error getting spaces data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/environmental', methods=['GET'])
@jwt_required()
def get_environmental_data():
    """
    Get environmental conditions data
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        hours = int(request.args.get('hours', 24))
        
        space_data = firebase_service.get_space_data(company_id, hours)
        
        environmental_data = []
        for data_point in space_data:
            env_conditions = data_point.get('environmental_conditions', {})
            environmental_data.append({
                'hour': datetime.fromisoformat(data_point['timestamp']).strftime('%H:%M'),
                'temperature': env_conditions.get('average_temperature', 22),
                'humidity': env_conditions.get('average_humidity', 45),
                'co2': env_conditions.get('average_co2', 400),
                'noise': env_conditions.get('average_noise', 40),
                'comfort': min(100, max(0, 100 - abs(env_conditions.get('average_temperature', 22) - 22) * 5))
            })
        
        return jsonify(environmental_data)
    
    except Exception as e:
        logger.error(f"Error getting environmental data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/weekly-trend', methods=['GET'])
@jwt_required()
def get_weekly_trend():
    """
    Get weekly trend data
    """
    try:
        # Mock weekly trend data
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_data = []
        
        for i, day in enumerate(days):
            # Simulate realistic patterns
            if i < 5:  # Weekdays
                utilization = 0.7 + (i % 2) * 0.1
                efficiency = 85 + (i % 3) * 5
                satisfaction = 90 - (i % 2) * 5
            else:  # Weekends
                utilization = 0.2 + i * 0.05
                efficiency = 70 + i * 3
                satisfaction = 75 + i * 5
            
            weekly_data.append({
                'day': day,
                'utilization': utilization,
                'efficiency': efficiency,
                'satisfaction': satisfaction
            })
        
        return jsonify(weekly_data)
    
    except Exception as e:
        logger.error(f"Error getting weekly trend: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/zone-heatmap', methods=['GET'])
@jwt_required()
def get_zone_heatmap():
    """
    Get zone heatmap data
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        company_data = firebase_service.get_company_data(company_id)
        
        heatmap_data = []
        if company_data and 'spaces' in company_data:
            # Create a grid-based heatmap
            for i, space in enumerate(company_data['spaces'][:20]):  # Limit to first 20 spaces
                utilization = space.get('current_occupancy', 0) / space.get('capacity', 1)
                
                heatmap_data.append({
                    'id': space['id'],
                    'row': i // 5,
                    'col': i % 5,
                    'status': 'occupied' if utilization > 0.1 else 'available',
                    'employee': f"User {i+1}" if utilization > 0.1 else None,
                    'temperature': 22 + (i % 3) - 1
                })
        
        return jsonify(heatmap_data)
    
    except Exception as e:
        logger.error(f"Error getting zone heatmap: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# AI Analytics endpoints
@app.route('/api/analytics/predictions', methods=['GET'])
@jwt_required()
def get_ai_predictions():
    """
    Get AI model predictions and analytics
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        
        # Get recent predictions from Firebase
        space_predictions = firebase_service.get_recent_predictions(company_id, 'space_optimizer', 1)
        energy_predictions = firebase_service.get_recent_predictions(company_id, 'energy_predictor', 1)
        
        # Get current data for fresh predictions
        dashboard_data = firebase_service.get_dashboard_data(company_id)
        
        response_data = {
            'space_optimizer': {
                'status': 'active',
                'last_updated': datetime.now().isoformat(),
                'predictions': space_predictions[0] if space_predictions else {},
                'accuracy': space_optimizer.model_metrics.get('test_r2', 0.85) if space_optimizer.is_trained else 0
            },
            'energy_predictor': {
                'status': 'active', 
                'last_updated': datetime.now().isoformat(),
                'predictions': energy_predictions[0] if energy_predictions else {},
                'accuracy': energy_predictor.model_metrics.get('ensemble_test_r2', 0.91) if energy_predictor.is_trained else 0
            },
            'conflict_resolution': {
                'active_conflicts': len(firebase_service.get_active_conflicts(company_id)),
                'auto_resolution_rate': 0.85,
                'average_resolution_time': '4.2 minutes'
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error getting AI predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/analytics/optimization', methods=['GET'])
@jwt_required()
def get_optimization_analytics():
    """
    Get optimization recommendations
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        dashboard_data = firebase_service.get_dashboard_data(company_id)
        
        if dashboard_data and dashboard_data.get('company'):
            spaces = dashboard_data['company'].get('spaces', [])
            
            # Generate optimization recommendations
            space_recommendations = space_optimizer.generate_optimization_recommendations(spaces)
            
            # Add energy optimization
            base_conditions = {
                'outdoor_temperature': 22,
                'occupancy_rate': 0.7,
                'building_age': 10,
                'floor_area': 50000
            }
            energy_prediction = energy_predictor.predict_24h_consumption(base_conditions)
            
            optimization_data = {
                'space_optimization': space_recommendations,
                'energy_optimization': energy_prediction.get('optimization_opportunities', []),
                'cost_savings_potential': space_recommendations.get('cost_savings_potential', 0) + 
                                       (energy_prediction.get('summary', {}).get('total_cost_24h', 0) * 0.15),
                'sustainability_impact': {
                    'carbon_reduction': energy_prediction.get('summary', {}).get('carbon_footprint', 0) * 0.1,
                    'energy_savings': '12-18%',
                    'space_efficiency_gain': '15-25%'
                }
            }
            
            return jsonify(optimization_data)
        
        return jsonify({'error': 'No data available'}), 404
    
    except Exception as e:
        logger.error(f"Error getting optimization analytics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Energy-specific endpoints
@app.route('/api/energy/dashboard', methods=['GET'])
@jwt_required()
def get_energy_dashboard():
    """
    Get energy dashboard data
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        energy_data = firebase_service.get_energy_data(company_id, 24)
        
        if not energy_data:
            return jsonify({'error': 'No energy data available'}), 404
        
        # Calculate metrics
        latest = energy_data[-1]
        total_24h = sum(e.get('total_consumption', 0) for e in energy_data)
        avg_efficiency = sum(e.get('efficiency_score', 0) for e in energy_data) / len(energy_data)
        
        dashboard_data = {
            'current_consumption': latest.get('total_consumption', 0),
            'current_cost': latest.get('cost_per_hour', 0),
            'efficiency_score': latest.get('efficiency_score', 0),
            'total_consumption_24h': total_24h,
            'total_cost_24h': sum(e.get('cost_per_hour', 0) for e in energy_data),
            'average_efficiency': avg_efficiency,
            'carbon_footprint': sum(e.get('carbon_footprint', 0) for e in energy_data),
            'consumption_breakdown': {
                'hvac': latest.get('hvac_consumption', 0),
                'lighting': latest.get('lighting_consumption', 0),
                'equipment': latest.get('equipment_consumption', 0)
            },
            'hourly_data': [
                {
                    'hour': datetime.fromisoformat(e['timestamp']).strftime('%H:%M'),
                    'consumption': e.get('total_consumption', 0),
                    'cost': e.get('cost_per_hour', 0),
                    'efficiency': e.get('efficiency_score', 0)
                }
                for e in energy_data
            ]
        }
        
        return jsonify(dashboard_data)
    
    except Exception as e:
        logger.error(f"Error getting energy dashboard: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/energy/predictions', methods=['GET'])
@jwt_required()
def get_energy_predictions():
    """
    Get energy consumption predictions
    """
    try:
        # Get base conditions for prediction
        base_conditions = {
            'outdoor_temperature': request.args.get('temperature', 22, type=float),
            'occupancy_rate': request.args.get('occupancy', 0.7, type=float),
            'building_age': 10,
            'floor_area': 50000
        }
        
        # Get 24h prediction
        prediction_data = energy_predictor.predict_24h_consumption(base_conditions)
        
        return jsonify(prediction_data)
    
    except Exception as e:
        logger.error(f"Error getting energy predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/energy/optimization', methods=['GET'])
@jwt_required()
def get_energy_optimization():
    """
    Get energy optimization recommendations
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        recent_energy = firebase_service.get_energy_data(company_id, 24)
        
        # Detect anomalies in recent data
        anomalies = energy_predictor.detect_energy_anomalies(recent_energy)
        
        # Generate optimization recommendations
        base_conditions = {
            'outdoor_temperature': 22,
            'occupancy_rate': 0.7,
            'building_age': 10,
            'floor_area': 50000
        }
        prediction = energy_predictor.predict_energy_consumption(base_conditions)
        
        optimization_data = {
            'anomalies': anomalies,
            'recommendations': prediction.get('recommendations', []),
            'efficiency_opportunities': [
                {
                    'category': 'HVAC Optimization',
                    'potential_savings': '15-20%',
                    'description': 'Optimize temperature setpoints and scheduling'
                },
                {
                    'category': 'Lighting Control',
                    'potential_savings': '10-15%',
                    'description': 'Implement occupancy-based lighting controls'
                },
                {
                    'category': 'Equipment Scheduling',
                    'potential_savings': '8-12%',
                    'description': 'Schedule non-critical equipment during off-peak hours'
                }
            ]
        }
        
        return jsonify(optimization_data)
    
    except Exception as e:
        logger.error(f"Error getting energy optimization: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Conflict management endpoints
@app.route('/api/conflicts', methods=['GET'])
@jwt_required()
def get_conflicts():
    """
    Get active conflicts
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        conflicts = firebase_service.get_active_conflicts(company_id)
        
        return jsonify(conflicts)
    
    except Exception as e:
        logger.error(f"Error getting conflicts: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/conflicts/<conflict_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_conflict(conflict_id):
    """
    Resolve a specific conflict
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        data = request.get_json()
        resolution = data.get('resolution', 'Manually resolved')
        
        success = firebase_service.resolve_conflict(company_id, conflict_id, resolution)
        
        if success:
            return jsonify({'message': 'Conflict resolved successfully'})
        else:
            return jsonify({'error': 'Failed to resolve conflict'}), 500
    
    except Exception as e:
        logger.error(f"Error resolving conflict: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Dashboard summary endpoint
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """
    Get comprehensive dashboard summary
    """
    try:
        company_id = request.args.get('company_id', 'demo_company')
        dashboard_data = firebase_service.get_dashboard_data(company_id)
        
        if not dashboard_data:
            return jsonify({'error': 'No data available'}), 404
        
        return jsonify(dashboard_data)
    
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    try:
        firebase_health = firebase_service.health_check()
        
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {
                'flask_api': 'healthy',
                'firebase': firebase_health['status'],
                'space_optimizer': 'trained' if space_optimizer.is_trained else 'not_trained',
                'energy_predictor': 'trained' if energy_predictor.is_trained else 'not_trained'
            },
            'version': '1.0.0',
            'ai_processing': 'active' if ai_processing_active else 'inactive'
        }
        
        return jsonify(health_data)
    
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token required'}), 401

if __name__ == '__main__':
    # Initialize immediately for development
    logger.info("Initializing Synergy AI Flask API...")
    
    # Initialize AI models in a separate thread to avoid blocking
    threading.Thread(target=initialize_ai_models, daemon=True).start()
    
    logger.info("Synergy AI Flask API started successfully")
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=True,
        threaded=True
    )