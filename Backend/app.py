from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import json
import io
import base64
import logging
from typing import List, Dict, Optional, Any
from enum import Enum
import uuid
import random
from energy_predictor import energy_predictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# CORS middleware
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "*"])

# Enums
class TimeRange(str, Enum):
    TODAY = "today"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"

class MetricType(str, Enum):
    OCCUPANCY = "occupancy"
    EFFICIENCY = "efficiency"
    UTILIZATION = "utilization"
    COST = "cost"
    ENERGY = "energy"

# Mock data storage
mock_users = {
    "admin@synergy.com": {
        "id": "admin_001",
        "name": "Admin User",
        "email": "admin@synergy.com",
        "password": "admin123",
        "role": "admin",
        "company": "Synergy AI",
        "department": "IT",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "join_date": "2023-01-15",
        "location": "San Francisco",
        "phone": "+1-555-0123",
        "employee_id": "EMP001",
        "permissions": ["read", "write", "admin", "export"]
    },
    "employee@synergy.com": {
        "id": "emp_001",
        "name": "John Employee",
        "email": "employee@synergy.com",
        "password": "emp123",
        "role": "employee",
        "company": "Synergy AI",
        "department": "Engineering",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "join_date": "2023-03-20",
        "location": "San Francisco",
        "phone": "+1-555-0124",
        "employee_id": "EMP002",
        "permissions": ["read", "book"]
    }
}

# Mock data generators
def generate_occupancy_data(time_range: str = "today"):
    hours = list(range(24))
    data = []
    
    for hour in hours:
        base_occupancy = 0.3 if 9 <= hour <= 17 else 0.1
        noise = random.uniform(-0.1, 0.1)
        occupancy = max(0, min(1, base_occupancy + noise))
        
        data.append({
            "hour": f"{hour:02d}:00",
            "occupancy": round(occupancy * 100, 1),
            "capacity": 150,
            "utilization": round(occupancy * 100, 1),
            "predicted": round(occupancy * 100 + random.uniform(-5, 5), 1)
        })
    
    return data

def generate_space_data():
    spaces = [
        {"name": "Conference Room A", "type": "meeting", "floor": 1},
        {"name": "Open Office Area", "type": "workspace", "floor": 1},
        {"name": "Quiet Zone", "type": "workspace", "floor": 2},
        {"name": "Break Room", "type": "amenity", "floor": 1},
        {"name": "Training Room", "type": "meeting", "floor": 2},
        {"name": "Executive Suite", "type": "private", "floor": 3}
    ]
    
    data = []
    for space in spaces:
        current = random.randint(0, 20)
        capacity = random.randint(10, 30)
        utilization = (current / capacity) * 100 if capacity > 0 else 0
        efficiency = random.uniform(70, 95)
        
        data.append({
            "name": space["name"],
            "current": current,
            "capacity": capacity,
            "utilization": round(utilization, 1),
            "efficiency": round(efficiency, 1),
            "status": "active" if utilization > 0 else "available"
        })
    
    return data

def generate_environmental_data():
    hours = list(range(24))
    data = []
    
    for hour in hours:
        # Base temperature varies throughout the day
        base_temp = 22 + 2 * np.sin((hour - 6) * np.pi / 12)
        temp = base_temp + random.uniform(-1, 1)
        
        data.append({
            "hour": f"{hour:02d}:00",
            "temperature": round(temp, 1),
            "humidity": round(random.uniform(40, 60), 1),
            "co2": round(random.uniform(400, 800), 0),
            "noise": round(random.uniform(45, 65), 1),
            "comfort": round(random.uniform(70, 90), 1)
        })
    
    return data

def generate_weekly_trend():
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    data = []
    
    for day in days:
        if day in ["Saturday", "Sunday"]:
            utilization = random.uniform(5, 15)
            efficiency = random.uniform(60, 80)
            satisfaction = random.uniform(70, 85)
        else:
            utilization = random.uniform(60, 85)
            efficiency = random.uniform(75, 95)
            satisfaction = random.uniform(80, 95)
        
        data.append({
            "day": day,
            "utilization": round(utilization, 1),
            "efficiency": round(efficiency, 1),
            "satisfaction": round(satisfaction, 1)
        })
    
    return data

def generate_zone_heatmap():
    data = []
    statuses = ["occupied", "available", "reserved", "maintenance"]
    
    for row in range(8):
        for col in range(12):
            status = random.choices(statuses, weights=[0.4, 0.4, 0.15, 0.05])[0]
            employee = f"EMP{random.randint(100, 999)}" if status == "occupied" else None
            temperature = random.uniform(20, 25)
            
            data.append({
                "id": f"zone_{row}_{col}",
                "row": row,
                "col": col,
                "status": status,
                "employee": employee,
                "temperature": round(temperature, 1)
            })
    
    return data

def generate_employees():
    departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"]
    roles = ["Developer", "Manager", "Analyst", "Designer", "Coordinator"]
    statuses = ["active", "away", "offline"]
    
    employees = []
    for i in range(50):
        dept = random.choice(departments)
        role = random.choice(roles)
        status = random.choice(statuses)
        
        employee = {
            "id": i + 1,
            "name": f"Employee {i + 1}",
            "email": f"employee{i+1}@synergy.com",
            "phone": f"+1-555-{random.randint(1000, 9999)}",
            "department": dept,
            "role": role,
            "status": status,
            "join_date": datetime.now() - timedelta(days=random.randint(30, 1000)),
            "location": "San Francisco",
            "desk_assignment": f"Desk {random.randint(1, 100)}",
            "last_seen": datetime.now() - timedelta(hours=random.randint(0, 8)),
            "hours_today": round(random.uniform(0, 8), 1),
            "hours_week": round(random.uniform(20, 40), 1),
            "productivity": round(random.uniform(60, 95), 1),
            "avatar": f"https://images.unsplash.com/photo-{random.randint(1000000000, 9999999999)}?w=150&h=150&fit=crop&crop=face",
            "skills": random.sample(["JavaScript", "Python", "React", "Node.js", "SQL", "AWS"], random.randint(2, 4)),
            "projects": random.randint(1, 5),
            "rating": round(random.uniform(3.5, 5.0), 1)
        }
        employees.append(employee)
    
    return employees

def generate_alerts():
    severities = ["low", "medium", "high", "critical"]
    alert_types = [
        "High occupancy detected",
        "Temperature anomaly",
        "Energy consumption spike",
        "Maintenance required",
        "Security alert",
        "System offline"
    ]
    
    alerts = []
    for i in range(10):
        severity = random.choice(severities)
        alert_type = random.choice(alert_types)
        
        alert = {
            "alert_id": f"alert_{i+1}",
            "severity": severity,
            "title": alert_type,
            "description": f"This is a {severity} priority alert about {alert_type.lower()}.",
            "affected_spaces": [f"Space {random.randint(1, 10)}" for _ in range(random.randint(1, 3))],
            "timestamp": datetime.now() - timedelta(hours=random.randint(0, 24)),
            "resolved": random.choice([True, False])
        }
        alerts.append(alert)
    
    return alerts

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type', 'employee')
        
        if email in mock_users and mock_users[email]['password'] == password:
            user = mock_users[email]
            return jsonify({
                "success": True,
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email'],
                    "role": user['role'],
                    "company": user['company'],
                    "department": user['department'],
                    "avatar": user['avatar'],
                    "join_date": user['join_date'],
                    "location": user['location'],
                    "phone": user['phone'],
                    "employee_id": user['employee_id'],
                    "permissions": user['permissions']
                },
                "token": f"mock_token_{uuid.uuid4()}"
            })
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"})

# Data endpoints
@app.route('/api/data/occupancy')
def get_occupancy_data():
    try:
        time_range = request.args.get('time_range', 'today')
        data = generate_occupancy_data(time_range)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Occupancy data error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching occupancy data"}), 500

@app.route('/api/data/spaces')
def get_space_data():
    try:
        data = generate_space_data()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Space data error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching space data"}), 500

@app.route('/api/data/environmental')
def get_environmental_data():
    try:
        data = generate_environmental_data()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Environmental data error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching environmental data"}), 500

@app.route('/api/data/weekly-trend')
def get_weekly_trend():
    try:
        data = generate_weekly_trend()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Weekly trend error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching weekly trend"}), 500

@app.route('/api/data/zone-heatmap')
def get_zone_heatmap():
    try:
        data = generate_zone_heatmap()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.error(f"Zone heatmap error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching zone heatmap"}), 500

# Employee endpoints
@app.route('/api/employees')
def get_employees():
    try:
        search = request.args.get('search')
        department = request.args.get('department')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        employees = generate_employees()
        
        # Apply filters
        if search:
            employees = [e for e in employees if search.lower() in e['name'].lower() or search.lower() in e['email'].lower()]
        
        if department:
            employees = [e for e in employees if e['department'].lower() == department.lower()]
        
        if status:
            employees = [e for e in employees if e['status'].lower() == status.lower()]
        
        # Apply limit
        employees = employees[:limit]
        
        return jsonify({"success": True, "data": employees})
    except Exception as e:
        logger.error(f"Employees error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching employees"}), 500

@app.route('/api/employees/add', methods=['POST'])
def add_employee():
    try:
        employee_data = request.get_json()
        # In a real app, you would save to database
        return jsonify({"success": True, "message": "Employee added successfully"})
    except Exception as e:
        logger.error(f"Add employee error: {str(e)}")
        return jsonify({"success": False, "message": "Error adding employee"}), 500

@app.route('/api/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    try:
        employee_data = request.get_json()
        # In a real app, you would update in database
        return jsonify({"success": True, "message": "Employee updated successfully"})
    except Exception as e:
        logger.error(f"Update employee error: {str(e)}")
        return jsonify({"success": False, "message": "Error updating employee"}), 500

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        # In a real app, you would delete from database
        return jsonify({"success": True, "message": "Employee deleted successfully"})
    except Exception as e:
        logger.error(f"Delete employee error: {str(e)}")
        return jsonify({"success": False, "message": "Error deleting employee"}), 500

# Space endpoints
@app.route('/api/spaces/detailed')
def get_detailed_spaces():
    try:
        search = request.args.get('search')
        status_filter = request.args.get('status_filter')
        limit = int(request.args.get('limit', 20))
        
        spaces = []
        for i in range(20):
            space = {
                "id": i + 1,
                "name": f"Space {i + 1}",
                "type": random.choice(["meeting", "workspace", "amenity", "private"]),
                "floor": random.randint(1, 5),
                "capacity": random.randint(5, 50),
                "current": random.randint(0, 30),
                "utilization": round(random.uniform(0, 100), 1),
                "efficiency": round(random.uniform(60, 95), 1),
                "status": random.choice(["active", "available", "maintenance", "reserved"]),
                "temperature": round(random.uniform(20, 25), 1),
                "humidity": round(random.uniform(40, 60), 1),
                "noise": round(random.uniform(45, 65), 1),
                "air_quality": round(random.uniform(80, 95), 1),
                "last_cleaned": datetime.now() - timedelta(days=random.randint(1, 30)),
                "next_maintenance": datetime.now() + timedelta(days=random.randint(1, 90)),
                "bookings": random.randint(0, 10),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "amenities": random.sample(["WiFi", "Projector", "Whiteboard", "Coffee", "Printer"], random.randint(1, 3))
            }
            spaces.append(space)
        
        # Apply filters
        if search:
            spaces = [s for s in spaces if search.lower() in s['name'].lower()]
        
        if status_filter:
            spaces = [s for s in spaces if s['status'].lower() == status_filter.lower()]
        
        # Apply limit
        spaces = spaces[:limit]
        
        return jsonify({"success": True, "data": spaces})
    except Exception as e:
        logger.error(f"Detailed spaces error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching detailed spaces"}), 500

@app.route('/api/spaces/add', methods=['POST'])
def add_space():
    try:
        space_data = request.get_json()
        # In a real app, you would save to database
        return jsonify({"success": True, "message": "Space added successfully"})
    except Exception as e:
        logger.error(f"Add space error: {str(e)}")
        return jsonify({"success": False, "message": "Error adding space"}), 500

# Alert endpoints
@app.route('/api/alerts')
def get_alerts():
    try:
        severity = request.args.get('severity')
        resolved = request.args.get('resolved')
        limit = int(request.args.get('limit', 10))
        
        alerts = generate_alerts()
        
        # Apply filters
        if severity:
            alerts = [a for a in alerts if a['severity'].lower() == severity.lower()]
        
        if resolved is not None:
            resolved_bool = resolved.lower() == 'true'
            alerts = [a for a in alerts if a['resolved'] == resolved_bool]
        
        # Apply limit
        alerts = alerts[:limit]
        
        return jsonify({"success": True, "data": alerts})
    except Exception as e:
        logger.error(f"Alerts error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching alerts"}), 500

# Analytics endpoints
@app.route('/api/analytics/predictions')
def get_predictions():
    try:
        metric_type = request.args.get('metric_type', 'occupancy')
        forecast_days = int(request.args.get('forecast_days', 7))
        
        # Generate mock predictions
        predictions = []
        for i in range(forecast_days * 24):
            timestamp = datetime.now() + timedelta(hours=i)
            value = random.uniform(50, 80)
            predicted = random.choice([True, False])
            
            predictions.append({
                "timestamp": timestamp.isoformat(),
                "value": round(value, 1),
                "predicted": predicted
            })
        
        return jsonify({
            "success": True,
            "data": {
                "metric_type": metric_type,
                "forecast_days": forecast_days,
                "predictions": predictions
            }
        })
    except Exception as e:
        logger.error(f"Predictions error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching predictions"}), 500

@app.route('/api/analytics/optimization')
def get_optimization_suggestions():
    try:
        category = request.args.get('category')
        priority = request.args.get('priority')
        
        suggestions = [
            {
                "suggestion_id": "opt_001",
                "category": "space",
                "title": "Optimize Conference Room Usage",
                "description": "Conference rooms are underutilized during off-peak hours. Consider flexible booking policies.",
                "potential_savings": 15000.0,
                "implementation_effort": "medium",
                "priority": 1
            },
            {
                "suggestion_id": "opt_002",
                "category": "energy",
                "title": "Implement Smart Lighting",
                "description": "Install motion sensors to reduce energy consumption in low-traffic areas.",
                "potential_savings": 8000.0,
                "implementation_effort": "low",
                "priority": 2
            },
            {
                "suggestion_id": "opt_003",
                "category": "efficiency",
                "title": "Redesign Workspace Layout",
                "description": "Current layout causes traffic bottlenecks. Consider open floor plan redesign.",
                "potential_savings": 25000.0,
                "implementation_effort": "high",
                "priority": 3
            }
        ]
        
        # Apply filters
        if category:
            suggestions = [s for s in suggestions if s['category'].lower() == category.lower()]
        
        if priority:
            priority_int = int(priority)
            suggestions = [s for s in suggestions if s['priority'] == priority_int]
        
        return jsonify({"success": True, "data": suggestions})
    except Exception as e:
        logger.error(f"Optimization suggestions error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching optimization suggestions"}), 500

# Dashboard endpoints
@app.route('/api/dashboard/summary')
def get_dashboard_summary():
    try:
        summary = {
            "total_employees": 150,
            "active_spaces": 25,
            "current_occupancy": 78.5,
            "energy_consumption": 245.3,
            "cost_savings": 12500.0,
            "efficiency_score": 87.2,
            "alerts_count": 3,
            "bookings_today": 45
        }
        
        return jsonify({"success": True, "data": summary})
    except Exception as e:
        logger.error(f"Dashboard summary error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching dashboard summary"}), 500

@app.route('/api/dashboard/alerts')
def get_dashboard_alerts():
    try:
        severity = request.args.get('severity')
        resolved = request.args.get('resolved')
        limit = int(request.args.get('limit', 50))
        
        alerts = generate_alerts()
        
        # Apply filters
        if severity:
            alerts = [a for a in alerts if a['severity'].lower() == severity.lower()]
        
        if resolved is not None:
            resolved_bool = resolved.lower() == 'true'
            alerts = [a for a in alerts if a['resolved'] == resolved_bool]
        
        # Apply limit
        alerts = alerts[:limit]
        
        return jsonify({"success": True, "data": alerts})
    except Exception as e:
        logger.error(f"Dashboard alerts error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching dashboard alerts"}), 500

@app.route('/api/dashboard/predictions', methods=['POST'])
def get_dashboard_predictions():
    try:
        data = request.get_json()
        metric_type = request.args.get('metric_type', 'occupancy')
        forecast_days = int(request.args.get('forecast_days', 7))
        
        # Generate mock predictions
        predictions = []
        for i in range(forecast_days * 24):
            timestamp = datetime.now() + timedelta(hours=i)
            value = random.uniform(50, 80)
            predicted = random.choice([True, False])
            
            predictions.append({
                "timestamp": timestamp.isoformat(),
                "value": round(value, 1),
                "predicted": predicted
            })
        
        return jsonify({
            "success": True,
            "data": {
                "metric_type": metric_type,
                "forecast_days": forecast_days,
                "predictions": predictions
            }
        })
    except Exception as e:
        logger.error(f"Dashboard predictions error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching dashboard predictions"}), 500

@app.route('/api/dashboard/optimization')
def get_dashboard_optimization_suggestions():
    try:
        category = request.args.get('category')
        priority = request.args.get('priority')
        
        suggestions = [
            {
                "suggestion_id": "opt_001",
                "category": "space",
                "title": "Optimize Conference Room Usage",
                "description": "Conference rooms are underutilized during off-peak hours. Consider flexible booking policies.",
                "potential_savings": 15000.0,
                "implementation_effort": "medium",
                "priority": 1
            },
            {
                "suggestion_id": "opt_002",
                "category": "energy",
                "title": "Implement Smart Lighting",
                "description": "Install motion sensors to reduce energy consumption in low-traffic areas.",
                "potential_savings": 8000.0,
                "implementation_effort": "low",
                "priority": 2
            },
            {
                "suggestion_id": "opt_003",
                "category": "efficiency",
                "title": "Redesign Workspace Layout",
                "description": "Current layout causes traffic bottlenecks. Consider open floor plan redesign.",
                "potential_savings": 25000.0,
                "implementation_effort": "high",
                "priority": 3
            }
        ]
        
        # Apply filters
        if category:
            suggestions = [s for s in suggestions if s['category'].lower() == category.lower()]
        
        if priority:
            priority_int = int(priority)
            suggestions = [s for s in suggestions if s['priority'] == priority_int]
        
        return jsonify({"success": True, "data": suggestions})
    except Exception as e:
        logger.error(f"Dashboard optimization error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching optimization suggestions"}), 500

@app.route('/api/dashboard/user-activity')
def get_dashboard_user_activity():
    try:
        time_range = request.args.get('time_range', 'today')
        department = request.args.get('department')
        limit = int(request.args.get('limit', 100))
        
        activities = []
        for i in range(limit):
            activity = {
                "user_id": f"user_{i+1}",
                "activity_type": random.choice(["login", "booking", "movement", "logout"]),
                "timestamp": datetime.now() - timedelta(minutes=random.randint(0, 480)),
                "location": random.choice(["Floor 1", "Floor 2", "Floor 3"]),
                "duration_minutes": random.randint(5, 120) if random.choice([True, False]) else None
            }
            activities.append(activity)
        
        # Sort by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({"success": True, "data": activities})
    except Exception as e:
        logger.error(f"User activity error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching user activity"}), 500

@app.route('/api/dashboard/recommendations', methods=['POST'])
def get_dashboard_space_recommendations():
    try:
        data = request.get_json()
        recommendation_type = request.args.get('recommendation_type', 'optimization')
        
        recommendations = [
            {
                "space_id": "space_001",
                "space_type": "conference",
                "recommended_action": "reduce_booking_duration",
                "reason": "High no-show rate for long bookings",
                "expected_impact": "Increase availability by 20%",
                "confidence_score": 0.85
            },
            {
                "space_id": "space_002",
                "space_type": "workspace",
                "recommended_action": "relocate_team",
                "reason": "Better proximity to amenities",
                "expected_impact": "Improve productivity by 15%",
                "confidence_score": 0.72
            }
        ]
        
        return jsonify({"success": True, "data": recommendations})
    except Exception as e:
        logger.error(f"Space recommendations error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching space recommendations"}), 500

@app.route('/api/dashboard/health')
def dashboard_health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/dashboard/metrics/summary')
def get_dashboard_metrics_summary():
    try:
        metrics = {
            "occupancy_rate": 78.5,
            "energy_efficiency": 87.2,
            "cost_per_sqft": 45.30,
            "employee_satisfaction": 4.2,
            "space_utilization": 82.1,
            "maintenance_score": 91.5
        }
        
        return jsonify({"success": True, "data": metrics})
    except Exception as e:
        logger.error(f"Metrics summary error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching metrics summary"}), 500

# Energy endpoints
@app.route('/api/energy/dashboard')
def get_energy_dashboard():
    try:
        dashboard_data = {
            "current_consumption": 245.3,
            "daily_average": 230.1,
            "monthly_total": 6903.0,
            "cost_today": 45.20,
            "cost_month": 1356.0,
            "efficiency_score": 87.2,
            "renewable_percentage": 35.0,
            "carbon_footprint": 1250.5,
            "peak_hours": ["09:00", "14:00", "18:00"],
            "optimization_opportunities": [
                "Reduce HVAC usage during off-peak hours",
                "Implement smart lighting controls",
                "Upgrade to energy-efficient equipment"
            ]
        }
        
        return jsonify({"success": True, "data": dashboard_data})
    except Exception as e:
        logger.error(f"Energy dashboard error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching energy dashboard"}), 500

@app.route('/api/energy/predictions')
def get_energy_predictions():
    try:
        hours = int(request.args.get('hours', 24))
        
        predictions = []
        for i in range(hours):
            timestamp = datetime.now() + timedelta(hours=i)
            consumption = random.uniform(200, 300)
            cost = consumption * 0.12  # Mock rate
            
            predictions.append({
                "timestamp": timestamp.isoformat(),
                "consumption_kwh": round(consumption, 1),
                "cost_usd": round(cost, 2),
                "confidence": round(random.uniform(0.7, 0.95), 2)
            })
        
        return jsonify({"success": True, "data": predictions})
    except Exception as e:
        logger.error(f"Energy predictions error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching energy predictions"}), 500

@app.route('/api/energy/optimization')
def get_energy_optimization():
    try:
        optimization_data = {
            "current_efficiency": 87.2,
            "potential_improvement": 12.8,
            "savings_opportunity": 18000.0,
            "recommendations": [
                {
                    "title": "Smart HVAC Control",
                    "description": "Implement AI-driven temperature control",
                    "savings": 8000.0,
                    "implementation_cost": 15000.0,
                    "payback_period": "1.9 years"
                },
                {
                    "title": "LED Lighting Upgrade",
                    "description": "Replace all lighting with LED fixtures",
                    "savings": 5000.0,
                    "implementation_cost": 12000.0,
                    "payback_period": "2.4 years"
                },
                {
                    "title": "Energy Monitoring System",
                    "description": "Install real-time energy monitoring",
                    "savings": 5000.0,
                    "implementation_cost": 8000.0,
                    "payback_period": "1.6 years"
                }
            ]
        }
        
        return jsonify({"success": True, "data": optimization_data})
    except Exception as e:
        logger.error(f"Energy optimization error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching energy optimization"}), 500

@app.route('/api/energy/analysis')
def get_energy_analysis():
    try:
        analysis_data = {
            "consumption_trends": {
                "daily": [220, 235, 245, 230, 250, 240, 225],
                "weekly": [1650, 1720, 1680, 1750, 1690, 1710, 1680],
                "monthly": [6900, 7200, 6800, 7100]
            },
            "cost_breakdown": {
                "lighting": 25.0,
                "hvac": 45.0,
                "equipment": 20.0,
                "other": 10.0
            },
            "peak_usage_hours": [9, 10, 11, 14, 15, 16],
            "efficiency_metrics": {
                "kwh_per_sqft": 0.85,
                "kwh_per_employee": 1.65,
                "cost_per_kwh": 0.12
            }
        }
        
        return jsonify({"success": True, "data": analysis_data})
    except Exception as e:
        logger.error(f"Energy analysis error: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching energy analysis"}), 500

# Report export endpoints
@app.route('/api/reports/export/<report_type>')
def export_report(report_type):
    try:
        time_range = request.args.get('time_range', 'week')
        format_type = request.args.get('format_type', 'pdf')
        
        # Mock report generation
        report_data = {
            "report_type": report_type,
            "time_range": time_range,
            "format": format_type,
            "generated_at": datetime.now().isoformat(),
            "data": "Mock report data would be here"
        }
        
        if format_type == 'csv':
            # Return CSV file
            csv_data = "timestamp,value,metric\n2024-01-01,75.5,occupancy\n2024-01-02,78.2,occupancy"
            return csv_data, 200, {'Content-Type': 'text/csv', 'Content-Disposition': f'attachment; filename={report_type}_{time_range}.csv'}
        
        elif format_type == 'excel':
            # Return Excel file (mock)
            return jsonify({"success": True, "message": "Excel report generated", "download_url": f"/downloads/{report_type}_{time_range}.xlsx"})
        
        else:  # PDF
            return jsonify({"success": True, "message": "PDF report generated", "download_url": f"/downloads/{report_type}_{time_range}.pdf"})
    
    except Exception as e:
        logger.error(f"Export report error: {str(e)}")
        return jsonify({"success": False, "message": "Error generating report"}), 500

@app.route('/api/dashboard/export/<report_type>')
def export_dashboard_report(report_type):
    try:
        time_range = request.args.get('time_range', 'week')
        metric_types = request.args.getlist('metric_types')
        
        # Mock report generation
        report_data = {
            "report_type": report_type,
            "time_range": time_range,
            "metric_types": metric_types,
            "generated_at": datetime.now().isoformat(),
            "data": "Mock dashboard report data would be here"
        }
        
        return jsonify({"success": True, "message": "Dashboard report generated", "download_url": f"/downloads/dashboard_{report_type}_{time_range}.pdf"})
    
    except Exception as e:
        logger.error(f"Dashboard export error: {str(e)}")
        return jsonify({"success": False, "message": "Error generating dashboard report"}), 500

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "ai_models": "active",
            "firebase": "connected"
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)