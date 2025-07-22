"""
Flask API for Synergy AI Platform - Employer Portal
Updated with comprehensive mock data structure and all required endpoints
"""

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta
import json
import io
import base64
import random
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'synergy-ai-secret-key-demo'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "*"])

# Enhanced Mock Database with your provided structure
mock_database = {
    "organization": {
        "organization_id": "DEL",
        "organization_name": "Deloitte",
        "organization_code": "DEL",
        "tier_model": "Premium",
        "features_availed": ["Dashboard", "SpaceOptimizer"],
        "email": "Deloitte@synergyai",
        "password": "********"
    },

    "employees": [
        {
            "emp_ID": "DEL127",
            "email": "ananya@deloitte.com",
            "name": "Ananya Sharma",
            "role": "Employee",
            "entity_type": "User",
            "password": "********",
            "department": "Engineering",
            "join_date": "2023-03-15",
            "location": "Floor 2",
            "phone": "+91 98765 43210",
            "desk_assignment": "WS001/A1",
            "last_seen": datetime.now().isoformat(),
            "hours_today": 7.5,
            "hours_week": 37.5,
            "productivity": 87.5,
            "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            "skills": ["React", "Python", "Data Analysis"],
            "projects": 3,
            "rating": 4.2,
            "status": "active"
        },
        {
            "emp_ID": "DEL100",
            "email": "rohit@deloitte.com",
            "name": "Rohit Mehra",
            "role": "Manager",
            "entity_type": "User",
            "password": "********",
            "department": "Sales",
            "join_date": "2022-01-10",
            "location": "Floor 3",
            "phone": "+91 87654 32109",
            "desk_assignment": "WS002/B1",
            "last_seen": datetime.now().isoformat(),
            "hours_today": 8.0,
            "hours_week": 40.0,
            "productivity": 92.3,
            "avatar": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            "skills": ["Management", "Sales", "Strategy"],
            "projects": 5,
            "rating": 4.7,
            "status": "active"
        }
    ],

    "teams": [
        {"team_ID": "T-0001", "team_name": "Byte Coders"},
        {"team_ID": "T-0002", "team_name": "Deloitte Camp"}
    ],

    "employee_team_mapping": [
        {"team_ID": "T-0001", "emp_ID": "DEL127"},
        {"team_ID": "T-0001", "emp_ID": "DEL100"},
        {"team_ID": "T-0002", "emp_ID": "DEL100"}
    ],

    "attendance": {
        "DEL127": {
            "2025-01-01": "Office",
            "2025-01-02": "WFH",
            "2025-01-03": "Leave",
            "2025-01-04": "Office",
            "2025-01-05": "Office",
            "2025-01-06": None,
            "2025-01-07": "Leave"
        },
        "DEL100": {
            "2025-01-01": "Office",
            "2025-01-02": "Office",
            "2025-01-03": "Office",
            "2025-01-04": "Leave",
            "2025-01-05": "Leave",
            "2025-01-06": None,
            "2025-01-07": "Office"
        }
    },

    "visitors": [
        {
            "emp_ID": "DEL127",
            "visitor_name": "Visitor1",
            "time_allocated_start": "10:00",
            "time_allocated_end": "16:00",
            "time_utilized_start": "11:00",
            "time_utilized_end": "15:00",
            "photo": None
        }
    ],

    "workspace_booking": [
        {
            "workspace_ID": "WS001/A1",
            "required_ID": "DEL127",
            "start_datetime": "2025-01-01T10:00:00",
            "end_datetime": "2025-01-01T12:00:00",
            "purpose": "Focus work",
            "in_use": True
        },
        {
            "workspace_ID": "WS001/A1",
            "required_ID": "DEL100",
            "start_datetime": "2025-01-01T15:00:00",
            "end_datetime": "2025-01-01T18:00:00",
            "purpose": "Focus work",
            "in_use": True
        },
        {
            "workspace_ID": "DR001",
            "required_ID": "T-0001",
            "start_datetime": "2025-01-01T13:00:00",
            "end_datetime": "2025-01-01T15:00:00",
            "purpose": "Team meeting",
            "in_use": False
        }
    ],

    "workspaces": [
        {"workspace_ID": "WS001/A1", "workspace_type": "Work Station", "level": "01", "capacity": 1, "current_occupancy": 1},
        {"workspace_ID": "WH002/A2", "workspace_type": "Hot Seats", "level": "01", "capacity": 20, "current_occupancy": 8},
        {"workspace_ID": "DR001", "workspace_type": "Discussion Room", "level": "02", "capacity": 12, "current_occupancy": 0}
    ],

    "scheduling": [
        {
            "emp_ID": "DEL127",
            "workspace_ID": "DR001",
            "start_time": "12:00",
            "end_time": "14:00",
            "booking_pattern": ["Mo", "Tu", "We", "Th", "Fr"]
        }
    ],

    "conflicts": [
        {
            "conflict_id": "CONF_001",
            "workspace_ID": "WS001/A1",
            "workspace_type": "Work Station",
            "conflict": "Unscheduled tests",
            "raiser": "DEL127",
            "user": "DEL122",
            "status": "Resolved",
            "timestamp": datetime.now().isoformat(),
            "severity": "medium",
            "resolution": "Automatically rescheduled booking to next available slot"
        }
    ]
}

# Generate additional sample data for demo
def generate_sample_employees(count=50):
    """Generate additional sample employees for demo"""
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']
    roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Associate', 'Director']
    
    additional_employees = []
    for i in range(3, count + 3):
        emp = {
            "emp_ID": f"DEL{i:03d}",
            "email": f"employee{i}@deloitte.com",
            "name": f"Employee {i}",
            "role": random.choice(roles),
            "entity_type": "User",
            "password": "********",
            "department": random.choice(departments),
            "join_date": (datetime.now() - timedelta(days=random.randint(30, 1460))).strftime('%Y-%m-%d'),
            "location": f"Floor {random.randint(1, 5)}",
            "phone": f"+91 {random.randint(7000000000, 9999999999)}",
            "desk_assignment": f"WS{random.randint(1, 100):03d}/A{random.randint(1, 10)}",
            "last_seen": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
            "hours_today": round(random.uniform(0, 8), 1),
            "hours_week": round(random.uniform(0, 40), 1),
            "productivity": round(random.uniform(60, 100), 1),
            "avatar": f"https://images.pexels.com/photos/{774909 + i}/pexels-photo-{774909 + i}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            "skills": random.sample(['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Sales'], random.randint(1, 3)),
            "projects": random.randint(1, 6),
            "rating": round(3 + 2 * random.random(), 1),
            "status": random.choice(['active', 'inactive', 'remote', 'on_leave'])
        }
        additional_employees.append(emp)
    
    return mock_database["employees"] + additional_employees

def generate_additional_workspaces():
    """Generate additional workspaces for demo"""
    workspace_types = [
        {"type": "Work Station", "capacity_range": (1, 2)},
        {"type": "Hot Seats", "capacity_range": (15, 25)},
        {"type": "Discussion Room", "capacity_range": (8, 16)},
        {"type": "Meeting Room", "capacity_range": (6, 12)},
        {"type": "Quiet Zone", "capacity_range": (10, 20)},
        {"type": "Collaborative Area", "capacity_range": (20, 40)}
    ]
    
    additional_workspaces = []
    for i in range(10, 50):
        ws_type = random.choice(workspace_types)
        capacity = random.randint(ws_type["capacity_range"][0], ws_type["capacity_range"][1])
        current = random.randint(0, int(capacity * 0.8))
        
        workspace = {
            "workspace_ID": f"WS{i:03d}/A{random.randint(1, 5)}",
            "workspace_type": ws_type["type"],
            "level": f"{random.randint(1, 5):02d}",
            "capacity": capacity,
            "current_occupancy": current
        }
        additional_workspaces.append(workspace)
    
    return mock_database["workspaces"] + additional_workspaces

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """User authentication endpoint"""
    try:
        data = request.get_json()
        email = data.get('demo@company.com')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Mock authentication - accept any valid email format
        if '@' in email and password:
            user_data = {
                "id": "1",
                "name": "Aisha Sharma",
                "email": email,
                "role": "HR Manager",
                "company": "Deloitte India",
                "department": "Human Resources",
                "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "join_date": "2022-03-15",
                "location": "Mumbai, India",
                "phone": "+91 98765 43210",
                "employee_id": "HR001",
                "permissions": ["manage_employees", "view_analytics", "space_allocation"]
            }
            
            # Create JWT token
            access_token = create_access_token(
                identity=user_data['id'],
                additional_claims={
                    'email': user_data['email'],
                    'role': user_data['role']
                }
            )
            
            return jsonify({
                'access_token': access_token,
                'user': user_data
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    return jsonify({'message': 'Logged out successfully'})

# Dashboard and Data endpoints
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """Get dashboard summary metrics"""
    try:
        all_employees = generate_sample_employees(50)
        all_workspaces = generate_additional_workspaces()
        
        # Calculate real metrics from mock data
        total_employees = len(all_employees)
        active_employees = len([e for e in all_employees if e['status'] == 'active'])
        total_workspaces = len(all_workspaces)
        occupied_workspaces = len([w for w in all_workspaces if w['current_occupancy'] > 0])
        
        avg_occupancy = sum(w['current_occupancy'] for w in all_workspaces) / sum(w['capacity'] for w in all_workspaces) * 100
        
        return jsonify({
            "summary": {
                "total_employees": total_employees,
                "active_employees": active_employees,
                "total_spaces": total_workspaces,
                "occupied_spaces": occupied_workspaces,
                "active_alerts": random.randint(3, 8),
                "avg_occupancy": round(avg_occupancy, 1),
                "energy_efficiency": round(random.uniform(80, 95), 1),
                "cost_per_sqft": round(random.uniform(40, 60), 1),
                "sustainability_score": round(random.uniform(75, 90), 1),
                "last_updated": datetime.now().isoformat()
            },
            "trends": {
                "occupancy_trend": random.choice(["increasing", "decreasing", "stable"]),
                "energy_trend": random.choice(["increasing", "decreasing", "stable"]),
                "cost_trend": random.choice(["increasing", "decreasing", "stable"]),
                "efficiency_trend": random.choice(["improving", "declining", "stable"])
            },
            "quick_stats": {
                "employees_present": active_employees,
                "meeting_rooms_booked": random.randint(8, 15),
                "energy_consumption": round(random.uniform(80, 120), 1),
                "cost_savings_today": random.randint(5000, 15000)
            }
        })
    
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/occupancy', methods=['GET'])
@jwt_required()
def get_occupancy_data():
    """Get occupancy data for charts"""
    try:
        hours = int(request.args.get('hours', 24))
        
        # Generate hourly occupancy data
        occupancy_data = []
        for i in range(hours):
            hour_time = datetime.now() - timedelta(hours=hours-i-1)
            
            # Simulate realistic patterns
            hour = hour_time.hour
            base_occupancy = 70 + 20 * np.sin(2 * np.pi * hour / 24) + random.uniform(-10, 10)
            base_occupancy = max(10, min(95, base_occupancy))
            
            predicted = base_occupancy + random.uniform(-5, 5)
            predicted = max(5, min(100, predicted))
            
            occupancy_data.append({
                "hour": hour_time.strftime('%H:%M'),
                "occupancy": round(base_occupancy, 1),
                "capacity": 200,
                "utilization": round(base_occupancy / 100, 2),
                "predicted": round(predicted, 1)
            })
        
        return jsonify(occupancy_data)
    
    except Exception as e:
        logger.error(f"Error getting occupancy data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/spaces', methods=['GET'])
@jwt_required()
def get_spaces_data():
    """Get current spaces data"""
    try:
        all_workspaces = generate_additional_workspaces()
        
        # Group by workspace type and calculate metrics
        space_types = {}
        for workspace in all_workspaces:
            ws_type = workspace['workspace_type']
            if ws_type not in space_types:
                space_types[ws_type] = {
                    'total_capacity': 0,
                    'total_current': 0,
                    'count': 0
                }
            
            space_types[ws_type]['total_capacity'] += workspace['capacity']
            space_types[ws_type]['total_current'] += workspace['current_occupancy']
            space_types[ws_type]['count'] += 1
        
        spaces_data = []
        for space_type, data in space_types.items():
            current = data['total_current']
            capacity = data['total_capacity']
            utilization = current / capacity if capacity > 0 else 0
            
            # Determine status
            if utilization > 0.8:
                status = 'overutilized'
            elif utilization > 0.4:
                status = 'optimal'
            else:
                status = 'underutilized'
            
            spaces_data.append({
                'name': space_type,
                'current': current,
                'capacity': capacity,
                'utilization': round(utilization, 2),
                'efficiency': round(max(60, min(100, utilization * 100 + random.uniform(-10, 10))), 1),
                'status': status
            })
        
        return jsonify(spaces_data)
    
    except Exception as e:
        logger.error(f"Error getting spaces data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/environmental', methods=['GET'])
@jwt_required()
def get_environmental_data():
    """Get environmental conditions data"""
    try:
        hours = int(request.args.get('hours', 24))
        
        environmental_data = []
        for i in range(hours):
            hour_time = datetime.now() - timedelta(hours=hours-i-1)
            
            # Generate realistic environmental data
            temp = 20 + 8 * random.random()
            humidity = 40 + 30 * random.random()
            co2 = 350 + 300 * random.random()
            noise = 30 + 40 * random.random()
            
            # Calculate comfort index
            temp_comfort = max(0, 100 - abs(temp - 22) * 10)
            humidity_comfort = max(0, 100 - abs(humidity - 50) * 2)
            co2_comfort = max(0, 100 - (co2 - 400) * 0.1)
            comfort = (temp_comfort + humidity_comfort + co2_comfort) / 3
            
            environmental_data.append({
                'hour': hour_time.strftime('%H:%M'),
                'temperature': round(temp, 1),
                'humidity': round(humidity, 1),
                'co2': round(co2, 1),
                'noise': round(noise, 1),
                'comfort': round(comfort, 1)
            })
        
        return jsonify(environmental_data)
    
    except Exception as e:
        logger.error(f"Error getting environmental data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/weekly-trend', methods=['GET'])
@jwt_required()
def get_weekly_trend():
    """Get weekly utilization trends"""
    try:
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekly_data = []
        
        for i, day in enumerate(days):
            # Simulate realistic weekly patterns
            if i < 5:  # Weekdays
                base_util = 0.7 + (i % 2) * 0.1 + random.uniform(-0.1, 0.1)
                base_eff = 85 + (i % 3) * 5 + random.uniform(-5, 5)
                base_sat = 90 - (i % 2) * 5 + random.uniform(-5, 5)
            else:  # Weekends
                base_util = 0.2 + i * 0.05 + random.uniform(-0.05, 0.05)
                base_eff = 70 + i * 3 + random.uniform(-3, 3)
                base_sat = 75 + i * 5 + random.uniform(-5, 5)
            
            weekly_data.append({
                'day': day,
                'utilization': round(max(0, min(100, base_util * 100)), 1),
                'efficiency': round(max(0, min(100, base_eff)), 1),
                'satisfaction': round(max(0, min(100, base_sat)), 1)
            })
        
        return jsonify(weekly_data)
    
    except Exception as e:
        logger.error(f"Error getting weekly trend: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/data/zone-heatmap', methods=['GET'])
@jwt_required()
def get_zone_heatmap():
    """Get zone heatmap data"""
    try:
        zones = []
        
        # Create a realistic office layout heatmap (8x12 grid)
        for row in range(8):
            for col in range(12):
                # Simulate different occupancy patterns
                rand = random.random()
                
                # More realistic distribution
                if rand > 0.75:
                    status = 'occupied'
                    employee = f"EMP {random.randint(100, 999)}"
                elif rand > 0.55:
                    status = 'assigned'
                    employee = None
                elif rand > 0.35:
                    status = 'hotdesk'
                    employee = None
                else:
                    status = 'free'
                    employee = None
                
                zones.append({
                    'id': f"{row}-{col}",
                    'row': row,
                    'col': col,
                    'status': status,
                    'employee': employee,
                    'temperature': round(20 + 8 * random.random(), 1)
                })
        
        return jsonify(zones)
    
    except Exception as e:
        logger.error(f"Error getting zone heatmap: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Employee Management Endpoints
@app.route('/api/employees', methods=['GET'])
@jwt_required()
def get_employees():
    """Get employee data with filtering and pagination"""
    try:
        # Get query parameters
        search = request.args.get('search', '').lower()
        department = request.args.get('department')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        all_employees = generate_sample_employees(100)
        filtered_employees = []
        
        for emp in all_employees:
            # Apply filters
            if department and emp['department'] != department:
                continue
            if status and emp['status'] != status:
                continue
            if search and not (
                search in emp['name'].lower() or 
                search in emp['email'].lower() or 
                search in emp['department'].lower()
            ):
                continue
            
            filtered_employees.append(emp)
        
        # Apply limit
        result = filtered_employees[:limit]
        
        return jsonify({
            'employees': result,
            'total': len(result),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error getting employees: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/spaces/detailed', methods=['GET'])
@jwt_required()
def get_detailed_spaces():
    """Get detailed space information"""
    try:
        search = request.args.get('search', '').lower()
        status_filter = request.args.get('status_filter')
        limit = int(request.args.get('limit', 20))
        
        all_workspaces = generate_additional_workspaces()
        detailed_spaces = []
        
        for i, workspace in enumerate(all_workspaces[:limit]):
            current = workspace['current_occupancy']
            capacity = workspace['capacity']
            utilization = current / capacity if capacity > 0 else 0
            
            # Determine status
            if utilization > 0.8:
                status = 'overutilized'
            elif utilization > 0.4:
                status = 'optimal'
            else:
                status = 'underutilized'
            
            # Apply status filter
            if status_filter and status != status_filter:
                continue
            
            # Generate detailed space information
            space_detail = {
                'id': i + 1,
                'name': f"{workspace['workspace_type']} {workspace['workspace_ID']}",
                'type': workspace['workspace_type'].lower().replace(' ', '_'),
                'floor': int(workspace['level']),
                'capacity': capacity,
                'current': current,
                'utilization': round(utilization, 2),
                'efficiency': round(random.uniform(60, 100), 1),
                'status': status,
                'temperature': round(20 + 8 * random.random(), 1),
                'humidity': round(40 + 30 * random.random(), 1),
                'noise': round(30 + 40 * random.random(), 1),
                'air_quality': round(random.uniform(70, 100), 1),
                'last_cleaned': (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                'next_maintenance': (datetime.now() + timedelta(days=random.randint(1, 30))).isoformat(),
                'bookings': random.randint(0, 10),
                'rating': round(3.5 + 1.5 * random.random(), 1),
                'amenities': random.sample(['wifi', 'coffee', 'printer', 'projector', 'whiteboard', 'video_conf'], random.randint(2, 4))
            }
            
            # Apply search filter
            if search and not (
                search in space_detail['name'].lower() or 
                search in space_detail['type'].lower()
            ):
                continue
            
            detailed_spaces.append(space_detail)
        
        return jsonify({
            'spaces': detailed_spaces,
            'total': len(detailed_spaces),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error getting detailed spaces: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Analytics and AI Endpoints
@app.route('/api/analytics/predictions', methods=['GET'])
@jwt_required()
def get_ai_predictions():
    """Get AI model predictions and analytics"""
    try:
        # Generate predictions for the next 7 days
        predictions = []
        for i in range(7):
            future_date = datetime.now() + timedelta(days=i+1)
            base_value = 75 + 10 * np.sin(2 * np.pi * i / 7) + random.uniform(-5, 5)
            
            predictions.append({
                'timestamp': future_date.isoformat(),
                'value': round(max(0, min(100, base_value)), 1),
                'predicted': True
            })
        
        # Generate historical data
        historical = []
        for i in range(7):
            past_date = datetime.now() - timedelta(days=7-i)
            value = 75 + 10 * np.sin(2 * np.pi * i / 7) + random.uniform(-5, 5)
            
            historical.append({
                'timestamp': past_date.isoformat(),
                'value': round(max(0, min(100, value)), 1),
                'predicted': False
            })
        
        response_data = {
            'space_optimizer': {
                'status': 'active',
                'last_updated': datetime.now().isoformat(),
                'predictions': predictions,
                'accuracy': 0.87
            },
            'energy_predictor': {
                'status': 'active',
                'last_updated': datetime.now().isoformat(),
                'predictions': predictions,
                'accuracy': 0.91
            },
            'historical_data': historical,
            'model_info': {
                'name': 'LSTM_Space_Predictor_v2.1',
                'accuracy': 0.87,
                'confidence': 0.82
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error getting AI predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/analytics/optimization', methods=['GET'])
@jwt_required()
def get_optimization_analytics():
    """Get optimization recommendations"""
    try:
        optimization_suggestions = [
            {
                'suggestion_id': 'OPT_001',
                'category': 'space',
                'title': 'Consolidate Underutilized Meeting Rooms',
                'description': 'Combine 3 low-usage meeting rooms into flexible co-working space',
                'potential_savings': 15000,
                'implementation_effort': 'medium',
                'priority': 2
            },
            {
                'suggestion_id': 'OPT_002',
                'category': 'energy',
                'title': 'Implement Smart Lighting Controls',
                'description': 'Install occupancy-based lighting in 70% of workspace areas',
                'potential_savings': 12000,
                'implementation_effort': 'low',
                'priority': 1
            },
            {
                'suggestion_id': 'OPT_003',
                'category': 'space',
                'title': 'Optimize Hot Desk Allocation',
                'description': 'Reduce dedicated desks by 25% based on remote work patterns',
                'potential_savings': 25000,
                'implementation_effort': 'high',
                'priority': 1
            }
        ]
        
        optimization_data = {
            'suggestions': optimization_suggestions,
            'cost_savings_potential': sum(s['potential_savings'] for s in optimization_suggestions),
            'space_optimization': {
                'current_utilization': 73.2,
                'optimal_utilization': 85.0,
                'potential_space_reduction': '15-20%'
            },
            'energy_optimization': {
                'current_efficiency': 78.5,
                'target_efficiency': 90.0,
                'potential_energy_savings': '12-18%'
            },
            'sustainability_impact': {
                'carbon_reduction': 2.5,  # tons CO2
                'energy_savings': '15%',
                'space_efficiency_gain': '20%'
            }
        }
        
        return jsonify(optimization_data)
    
    except Exception as e:
        logger.error(f"Error getting optimization analytics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Energy Analytics Endpoints
@app.route('/api/energy/dashboard', methods=['GET'])
@jwt_required()
def get_energy_dashboard():
    """Get energy dashboard data"""
    try:
        # Generate hourly energy data for last 24 hours
        hourly_data = []
        total_consumption = 0
        total_cost = 0
        
        for i in range(24):
            hour_time = datetime.now() - timedelta(hours=24-i)
            
            # Simulate realistic energy patterns
            hour = hour_time.hour
            base_consumption = 50 + 30 * np.sin(2 * np.pi * hour / 24) + random.uniform(-5, 5)
            base_consumption = max(20, base_consumption)
            
            cost_per_kwh = 10.5 + random.uniform(-1, 1)  # ₹/kWh
            hour_cost = base_consumption * cost_per_kwh
            
            total_consumption += base_consumption
            total_cost += hour_cost
            
            hourly_data.append({
                'hour': hour_time.strftime('%H:%M'),
                'consumption': round(base_consumption, 1),
                'cost': round(hour_cost, 1),
                'efficiency': round(random.uniform(75, 95), 1)
            })
        
        # Calculate breakdown
        hvac_percent = 0.45
        lighting_percent = 0.25
        equipment_percent = 0.30
        
        dashboard_data = {
            'current_consumption': hourly_data[-1]['consumption'],
            'current_cost': hourly_data[-1]['cost'],
            'efficiency_score': round(sum(h['efficiency'] for h in hourly_data) / 24, 1),
            'total_consumption_24h': round(total_consumption, 1),
            'total_cost_24h': round(total_cost, 1),
            'average_efficiency': round(sum(h['efficiency'] for h in hourly_data) / 24, 1),
            'carbon_footprint': round(total_consumption * 0.82, 1),  # kg CO2
            'consumption_breakdown': {
                'hvac': round(total_consumption * hvac_percent, 1),
                'lighting': round(total_consumption * lighting_percent, 1),
                'equipment': round(total_consumption * equipment_percent, 1)
            },
            'hourly_data': hourly_data,
            'predictions': [
                {
                    'hour': i,
                    'predicted_consumption': round(50 + 30 * np.sin(2 * np.pi * i / 24) + random.uniform(-3, 3), 1),
                    'timestamp': (datetime.now() + timedelta(hours=i)).isoformat()
                }
                for i in range(1, 25)
            ]
        }
        
        return jsonify(dashboard_data)
    
    except Exception as e:
        logger.error(f"Error getting energy dashboard: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/energy/predictions', methods=['GET'])
@jwt_required()
def get_energy_predictions():
    """Get energy consumption predictions"""
    try:
        hours = int(request.args.get('hours', 24))
        temperature = float(request.args.get('temperature', 22))
        occupancy = float(request.args.get('occupancy', 0.7))
        
        prediction_data = []
        for i in range(hours):
            future_time = datetime.now() + timedelta(hours=i+1)
            
            # Factor in temperature and occupancy
            base_consumption = 50 + 30 * np.sin(2 * np.pi * future_time.hour / 24)
            temp_factor = 1 + (abs(temperature - 22) * 0.1)  # AC usage increases with temperature deviation
            occupancy_factor = 0.5 + (occupancy * 0.5)  # More people = more consumption
            
            predicted = base_consumption * temp_factor * occupancy_factor + random.uniform(-5, 5)
            predicted = max(20, predicted)
            
            prediction_data.append({
                'timestamp': future_time.isoformat(),
                'predicted_consumption': round(predicted, 1),
                'hour': future_time.hour,
                'confidence': round(0.85 + random.uniform(-0.1, 0.1), 2)
            })
        
        return jsonify({
            'predictions': prediction_data,
            'model_info': {
                'model_type': 'Energy Predictor v2.1',
                'is_trained': True,
                'accuracy': 0.89
            },
            'summary': {
                'total_predicted_24h': sum(p['predicted_consumption'] for p in prediction_data),
                'avg_consumption': round(sum(p['predicted_consumption'] for p in prediction_data) / len(prediction_data), 1),
                'peak_hour': max(prediction_data, key=lambda x: x['predicted_consumption'])['hour']
            }
        })
    
    except Exception as e:
        logger.error(f"Error getting energy predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/energy/optimization', methods=['GET'])
@jwt_required()
def get_energy_optimization():
    """Get energy optimization recommendations"""
    try:
        optimization_data = {
            'anomalies': [
                {
                    'type': 'consumption_spike',
                    'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
                    'severity': 'medium',
                    'description': 'HVAC consumption 25% above normal',
                    'location': 'Floor 3'
                }
            ],
            'recommendations': [
                {
                    'category': 'HVAC Optimization',
                    'title': 'Adjust Temperature Setpoints',
                    'description': 'Increase cooling setpoint by 2°C during peak hours',
                    'potential_savings': '15-20%',
                    'estimated_cost_savings': 8000
                },
                {
                    'category': 'Lighting Control',
                    'title': 'Implement Occupancy Sensors',
                    'description': 'Install motion sensors in 15 underutilized areas',
                    'potential_savings': '10-15%',
                    'estimated_cost_savings': 5500
                },
                {
                    'category': 'Equipment Scheduling',
                    'title': 'Non-Critical Load Shifting',
                    'description': 'Schedule equipment usage during off-peak hours',
                    'potential_savings': '8-12%',
                    'estimated_cost_savings': 4200
                }
            ],
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

# Conflict Management
@app.route('/api/conflicts', methods=['GET'])
@jwt_required()
def get_conflicts():
    """Get active conflicts"""
    try:
        # Generate some sample conflicts
        active_conflicts = [
            {
                'conflict_id': 'CONF_001',
                'workspace_ID': 'WS001/A1',
                'workspace_type': 'Work Station',
                'conflict': 'Double booking detected',
                'raiser': 'DEL127',
                'user': 'DEL100',
                'status': 'Active',
                'severity': 'high',
                'timestamp': datetime.now().isoformat(),
                'description': 'Two employees scheduled for same desk at overlapping times'
            },
            {
                'conflict_id': 'CONF_002',
                'workspace_ID': 'DR001',
                'workspace_type': 'Discussion Room',
                'conflict': 'Room overbooked',
                'raiser': 'System',
                'user': 'T-0001',
                'status': 'Active',
                'severity': 'medium',
                'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'description': 'Meeting room booked beyond capacity limits'
            }
        ]
        
        # Add resolved conflicts from mock database
        resolved_conflicts = [conf for conf in mock_database['conflicts']]
        
        all_conflicts = active_conflicts + resolved_conflicts
        
        return jsonify(all_conflicts)
    
    except Exception as e:
        logger.error(f"Error getting conflicts: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/conflicts/<conflict_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_conflict(conflict_id):
    """Resolve a specific conflict"""
    try:
        data = request.get_json()
        resolution = data.get('resolution', 'Manually resolved')
        
        # In a real system, you'd update the database
        # For mock, we'll just return success
        
        return jsonify({
            'message': 'Conflict resolved successfully',
            'conflict_id': conflict_id,
            'resolution': resolution,
            'resolved_at': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error resolving conflict: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Export functionality
@app.route('/api/reports/export/<report_type>', methods=['GET'])
@jwt_required()
def export_report(report_type):
    """Export reports in various formats"""
    try:
        time_range = request.args.get('time_range', 'week')
        format_type = request.args.get('format', 'pdf')
        
        # Generate sample report data
        if report_type == 'analytics':
            data = generate_sample_employees(50)
            df = pd.DataFrame(data)
        elif report_type == 'spaces':
            data = generate_additional_workspaces()
            df = pd.DataFrame(data)
        else:
            # Default dashboard data
            data = {
                'timestamp': datetime.now().isoformat(),
                'total_employees': 150,
                'total_spaces': 200,
                'avg_occupancy': 73.2,
                'efficiency_score': 85.7
            }
            df = pd.DataFrame([data])
        
        if format_type == 'csv':
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_data = csv_buffer.getvalue()
            
            return jsonify({
                'file_type': 'csv',
                'data': base64.b64encode(csv_data.encode()).decode(),
                'filename': f'{report_type}_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv',
                'size': len(csv_data)
            })
        
        elif format_type == 'excel':
            excel_buffer = io.BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name=report_type.title())
            excel_data = excel_buffer.getvalue()
            
            return jsonify({
                'file_type': 'excel',
                'data': base64.b64encode(excel_data).decode(),
                'filename': f'{report_type}_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx',
                'size': len(excel_data)
            })
        
        else:  # PDF or other formats
            return jsonify({
                'file_type': format_type,
                'filename': f'{report_type}_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.{format_type}',
                'summary': {
                    'total_records': len(df),
                    'generated_at': datetime.now().isoformat(),
                    'time_range': time_range
                },
                'download_url': f'/api/reports/download/{report_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.{format_type}'
            })
    
    except Exception as e:
        logger.error(f"Error exporting report: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {
                'flask_api': 'healthy',
                'mock_database': 'active',
                'auth_service': 'active'
            },
            'version': '2.0.0',
            'mock_data_loaded': True
        })
    
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Employee and Space Management Endpoints
@app.route('/api/employees/add', methods=['POST'])
@jwt_required()
def add_employee():
    """Add new employee"""
    try:
        data = request.get_json()
        new_employee = {
            "id": random.randint(1000, 9999),
            "emp_ID": f"DEL{random.randint(100, 999)}",
            "name": data.get("name"),
            "email": data.get("email"),
            "role": data.get("role"),
            "department": data.get("department"),
            "status": "active",
            "join_date": datetime.now().strftime('%Y-%m-%d'),
            "location": data.get("location", "Floor 1"),
            "phone": data.get("phone"),
            "desk_assignment": f"WS{random.randint(1, 100):03d}/A{random.randint(1, 10)}",
            "last_seen": datetime.now().isoformat(),
            "hours_today": 0,
            "hours_week": 0,
            "productivity": 75,
            "avatar": f"https://images.pexels.com/photos/{random.randint(774909, 774999)}/pexels-photo-{random.randint(774909, 774999)}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            "skills": data.get("skills", []),
            "projects": random.randint(1, 5),
            "rating": 4.0,
            "entity_type": "User",
            "password": "********"
        }
        
        return jsonify({
            "success": True,
            "employee": new_employee,
            "message": "Employee added successfully"
        })
    
    except Exception as e:
        logger.error(f"Error adding employee: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    """Update employee information"""
    try:
        data = request.get_json()
        
        # In a real system, you'd update the database
        updated_employee = {
            "id": employee_id,
            "updated_at": datetime.now().isoformat(),
            **data
        }
        
        return jsonify({
            "success": True,
            "employee": updated_employee,
            "message": "Employee updated successfully"
        })
    
    except Exception as e:
        logger.error(f"Error updating employee: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    """Delete employee"""
    try:
        # In a real system, you'd delete from database
        return jsonify({
            "success": True,
            "message": "Employee deleted successfully",
            "deleted_employee_id": employee_id
        })
    
    except Exception as e:
        logger.error(f"Error deleting employee: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/spaces/add', methods=['POST'])
@jwt_required()
def add_space():
    """Add new space"""
    try:
        data = request.get_json()
        new_space = {
            "id": random.randint(1000, 9999),
            "workspace_ID": f"WS{random.randint(100, 999)}/A{random.randint(1, 10)}",
            "name": data.get("name"),
            "workspace_type": data.get("type", "Work Station"),
            "level": data.get("floor", "01"),
            "capacity": data.get("capacity", 1),
            "current_occupancy": 0,
            "utilization": 0,
            "status": "available",
            "temperature": 22.0,
            "humidity": 45.0,
            "noise": 35.0,
            "air_quality": 95.0,
            "rating": 4.0,
            "amenities": data.get("amenities", ["wifi"]),
            "created_at": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "space": new_space,
            "message": "Space added successfully"
        })
    
    except Exception as e:
        logger.error(f"Error adding space: {e}")
        return jsonify({'error': 'Internal server error'}), 500
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
    logger.info("Starting Synergy AI Flask API with Mock Data...")
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=True,
        threaded=True
    )
