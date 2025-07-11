from fastapi import FastAPI, HTTPException, Depends, Query, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
from enum import Enum
import json
import io
import base64
from energy_predictor import energy_predictor
import uvicorn
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initialize FastAPI app
app = FastAPI(
    title="Synergy AI - Space Optimization API",
    description="AI-powered workspace optimization and analytics platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()


# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str
    user_type: str
    company_code: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    company: str
    department: str
    avatar: str
    join_date: str
    location: str
    phone: str
    employee_id: str
    permissions: List[str]

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

class FilterRequest(BaseModel):
    time_range: TimeRange = TimeRange.WEEK
    departments: Optional[List[str]] = None
    space_types: Optional[List[str]] = None
    floors: Optional[List[int]] = None
    zones: Optional[List[str]] = None

class OccupancyData(BaseModel):
    hour: str
    occupancy: float
    capacity: int
    utilization: float
    predicted: float

class SpaceData(BaseModel):
    name: str
    current: int
    capacity: int
    utilization: float
    efficiency: float
    status: str

class EnvironmentalData(BaseModel):
    hour: str
    temperature: float
    humidity: float
    co2: float
    noise: float
    comfort: float

class WeeklyTrend(BaseModel):
    day: str
    utilization: float
    efficiency: float
    satisfaction: float

class ZoneHeatmap(BaseModel):
    id: str
    row: int
    col: int
    status: str
    employee: Optional[str]
    temperature: float

class AlertData(BaseModel):
    alert_id: str
    severity: str
    title: str
    description: str
    affected_spaces: List[str]
    timestamp: datetime
    resolved: bool = False

class EmployeeData(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    department: str
    role: str
    status: str
    join_date: datetime
    location: str
    desk_assignment: str
    last_seen: datetime
    hours_today: float
    hours_week: float
    productivity: float
    avatar: str
    skills: List[str]
    projects: int
    rating: float

class SpaceDetail(BaseModel):
    id: int
    name: str
    type: str
    floor: int
    capacity: int
    current: int
    utilization: float
    efficiency: float
    status: str
    temperature: float
    humidity: float
    noise: float
    air_quality: float
    last_cleaned: datetime
    next_maintenance: datetime
    bookings: int
    rating: float
    amenities: List[str]

# Extended Pydantic Models for Dashboard API
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

class FilterRequest(BaseModel):
    time_range: TimeRange = TimeRange.WEEK
    departments: Optional[List[str]] = None
    space_types: Optional[List[str]] = None
    floors: Optional[List[int]] = None
    zones: Optional[List[str]] = None

class HeatmapData(BaseModel):
    space_id: str
    x_coordinate: int
    y_coordinate: int
    value: float
    status: str
    timestamp: datetime

class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    value: float
    predicted: bool = False

class ComparisonMetric(BaseModel):
    metric_name: str
    current_value: float
    previous_value: float
    change_percent: float
    trend: str

class BenchmarkData(BaseModel):
    metric: str
    current_value: float
    industry_average: float
    best_in_class: float
    percentile_rank: int

class CostAnalysis(BaseModel):
    total_cost: float
    cost_per_sqft: float
    cost_per_employee: float
    breakdown: Dict[str, float]
    savings_opportunity: float

class EnergyMetrics(BaseModel):
    consumption_kwh: float
    cost_usd: float
    carbon_footprint_kg: float
    efficiency_score: float
    renewable_percentage: float

class PredictionModel(BaseModel):
    model_name: str
    accuracy: float
    confidence: float
    predictions: List[TimeSeriesPoint]

class OptimizationSuggestion(BaseModel):
    suggestion_id: str
    category: str
    title: str
    description: str
    potential_savings: float
    implementation_effort: str
    priority: int

class UserActivity(BaseModel):
    user_id: str
    activity_type: str
    timestamp: datetime
    location: str
    duration_minutes: Optional[int] = None

class SpaceRecommendation(BaseModel):
    space_id: str
    space_type: str
    recommended_action: str
    reason: str
    expected_impact: str
    confidence_score: float

# Global data storage (in production, use a proper database)
current_data = {
    "occupancy": [],
    "spaces": [],
    "environmental": [],
    "weekly_trend": [],
    "zone_heatmap": [],
    "employees": [],
    "spaces_detailed": []
}

# Authentication endpoints
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Authenticate user and return user data"""
    try:
        # Simulate authentication logic
        if request.email and request.password:
            user_data = {
                "id": "1",
                "name": "Sarah Johnson" if request.user_type == "employer" else "Michael Chen",
                "email": request.email,
                "role": "HR Manager" if request.user_type == "employer" else "Chief Executive Officer",
                "company": "Deloitte India",
                "department": "Human Resources" if request.user_type == "employer" else "Executive Office",
                "avatar": f"https://images.pexels.com/photos/{'774909' if request.user_type == 'employer' else '2379004'}/pexels-photo-{'774909' if request.user_type == 'employer' else '2379004'}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "join_date": "2022-03-15",
                "location": "Mumbai, India",
                "phone": "+91 98765 43210",
                "employee_id": "HR001" if request.user_type == "employer" else "EXE001",
                "permissions": ["manage_employees", "view_analytics", "space_allocation"] if request.user_type == "employer" else ["full_access", "executive_dashboard", "strategic_overview"]
            }
            
            return {
                "success": True,
                "user": user_data,
                "token": "mock_jwt_token_12345",
                "user_type": request.user_type
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/logout")
async def logout():
    """Logout user"""
    return {"success": True, "message": "Logged out successfully"}

# Data generation endpoints
@app.get("/api/data/occupancy")
async def get_occupancy_data(time_range: TimeRange = Query(TimeRange.TODAY)):
    """Get occupancy data for charts"""
    try:
        hours = list(range(24))
        data = []
        for hour in hours:
            data.append({
                "hour": f"{hour}:00",
                "occupancy": max(20, min(100, 70 + 20 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 10))),
                "capacity": 150,
                "utilization": max(0.2, min(0.9, 0.6 + 0.2 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 0.1))),
                "predicted": max(15, min(100, 65 + 15 * np.sin(2 * np.pi * (hour + 1) / 24) + np.random.normal(0, 8)))
            })
        
        current_data["occupancy"] = data
        return {"data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/spaces")
async def get_space_data():
    """Get space utilization data"""
    try:
        spaces = ['Open Desks', 'Meeting Rooms', 'Quiet Zones', 'Collaborative Areas']
        data = []
        for space in spaces:
            current = np.random.randint(10, 60)
            capacity = np.random.randint(50, 80)
            utilization = current / capacity
            
            status = 'overutilized' if utilization > 0.8 else 'optimal' if utilization > 0.4 else 'underutilized'
            
            data.append({
                "name": space,
                "current": current,
                "capacity": capacity,
                "utilization": utilization,
                "efficiency": np.random.uniform(60, 100),
                "status": status
            })
        
        current_data["spaces"] = data
        return {"data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/environmental")
async def get_environmental_data():
    """Get environmental sensor data"""
    try:
        hours = list(range(24))
        data = []
        for hour in hours:
            data.append({
                "hour": f"{hour}:00",
                "temperature": 20 + 8 * np.random.random(),
                "humidity": 40 + 30 * np.random.random(),
                "co2": 350 + 300 * np.random.random(),
                "noise": 30 + 40 * np.random.random(),
                "comfort": np.random.uniform(70, 100)
            })
        
        current_data["environmental"] = data
        return {"data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/weekly-trend")
async def get_weekly_trend():
    """Get weekly utilization trends"""
    try:
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        data = []
        for day in days:
            data.append({
                "day": day,
                "utilization": np.random.uniform(20, 90),
                "efficiency": np.random.uniform(60, 95),
                "satisfaction": np.random.uniform(70, 100)
            })
        
        current_data["weekly_trend"] = data
        return {"data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/zone-heatmap")
async def get_zone_heatmap():
    """Get zone heatmap data"""
    try:
        zones = []
        for row in range(8):
            for col in range(12):
                rand = np.random.random()
                status = 'occupied' if rand > 0.7 else 'assigned' if rand > 0.5 else 'hotdesk' if rand > 0.3 else 'free'
                
                zones.append({
                    "id": f"{row}-{col}",
                    "row": row,
                    "col": col,
                    "status": status,
                    "employee": f"Emp {np.random.randint(1, 100)}" if status == 'occupied' else None,
                    "temperature": 20 + 8 * np.random.random()
                })
        
        current_data["zone_heatmap"] = zones
        return {"data": zones, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/employees")
async def get_employees(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get employee data"""
    try:
        departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']
        roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Associate', 'Director']
        statuses = ['active', 'inactive', 'remote', 'on_leave']
        
        employees = []
        for i in range(limit):
            emp_dept = np.random.choice(departments)
            emp_status = np.random.choice(statuses)
            
            # Apply filters
            if department and emp_dept != department:
                continue
            if status and emp_status != status:
                continue
            
            employee = {
                "id": i + 1,
                "name": f"Employee {i + 1}",
                "email": f"employee{i + 1}@deloitte.com",
                "phone": f"+91 {np.random.randint(7000000000, 9999999999)}",
                "department": emp_dept,
                "role": np.random.choice(roles),
                "status": emp_status,
                "join_date": (datetime.now() - timedelta(days=np.random.randint(30, 1460))).isoformat(),
                "location": "Remote" if np.random.random() > 0.7 else f"Floor {np.random.randint(1, 6)}",
                "desk_assignment": f"Desk {np.random.randint(1, 101)}" if np.random.random() > 0.3 else "Hot Desk",
                "last_seen": (datetime.now() - timedelta(hours=np.random.randint(1, 168))).isoformat(),
                "hours_today": np.random.uniform(0, 8),
                "hours_week": np.random.uniform(0, 40),
                "productivity": np.random.uniform(60, 100),
                "avatar": f"https://images.pexels.com/photos/{774909 + i}/pexels-photo-{774909 + i}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                "skills": np.random.choice(['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Sales'], size=np.random.randint(1, 4)).tolist(),
                "projects": np.random.randint(1, 6),
                "rating": 3 + 2 * np.random.random()
            }
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                if not (search_lower in employee["name"].lower() or 
                       search_lower in employee["email"].lower() or 
                       search_lower in employee["department"].lower()):
                    continue
            
            employees.append(employee)
        
        current_data["employees"] = employees
        return {
            "employees": employees,
            "total": len(employees),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spaces/detailed")
async def get_detailed_spaces(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50)
):
    """Get detailed space information"""
    try:
        space_types = [
            {"name": "Open Workspace A", "type": "open_desk", "floor": 1, "capacity": 45, "amenities": ["wifi", "coffee", "printer"]},
            {"name": "Meeting Room Alpha", "type": "meeting_room", "floor": 2, "capacity": 12, "amenities": ["projector", "whiteboard", "video_conf"]},
            {"name": "Quiet Zone Beta", "type": "quiet_zone", "floor": 1, "capacity": 20, "amenities": ["wifi", "charging"]},
            {"name": "Collaboration Hub", "type": "collaborative", "floor": 3, "capacity": 30, "amenities": ["wifi", "coffee", "whiteboard"]},
            {"name": "Executive Boardroom", "type": "meeting_room", "floor": 4, "capacity": 16, "amenities": ["projector", "video_conf", "catering"]},
            {"name": "Hot Desk Area", "type": "hot_desk", "floor": 2, "capacity": 25, "amenities": ["wifi", "locker", "coffee"]},
            {"name": "Focus Pods", "type": "quiet_zone", "floor": 1, "capacity": 8, "amenities": ["wifi", "noise_cancel"]},
            {"name": "Innovation Lab", "type": "collaborative", "floor": 3, "capacity": 35, "amenities": ["wifi", "tools", "whiteboard"]}
        ]
        
        spaces = []
        for i, space_type in enumerate(space_types[:limit]):
            current = np.random.randint(0, int(space_type["capacity"] * 0.8))
            utilization = current / space_type["capacity"]
            status = 'overutilized' if utilization > 0.8 else 'optimal' if utilization > 0.4 else 'underutilized'
            
            # Apply filters
            if status_filter and status != status_filter:
                continue
            
            space = {
                "id": i + 1,
                "name": space_type["name"],
                "type": space_type["type"],
                "floor": space_type["floor"],
                "capacity": space_type["capacity"],
                "current": current,
                "utilization": utilization,
                "efficiency": np.random.uniform(60, 100),
                "status": status,
                "temperature": 20 + 8 * np.random.random(),
                "humidity": 40 + 30 * np.random.random(),
                "noise": 30 + 40 * np.random.random(),
                "air_quality": np.random.uniform(70, 100),
                "last_cleaned": (datetime.now() - timedelta(hours=np.random.randint(1, 48))).isoformat(),
                "next_maintenance": (datetime.now() + timedelta(days=np.random.randint(1, 30))).isoformat(),
                "bookings": np.random.randint(0, 10),
                "rating": 3.5 + 1.5 * np.random.random(),
                "amenities": space_type["amenities"]
            }
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                if not (search_lower in space["name"].lower() or 
                       search_lower in space["type"].lower()):
                    continue
            
            spaces.append(space)
        
        current_data["spaces_detailed"] = spaces
        return {
            "spaces": spaces,
            "total": len(spaces),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts")
async def get_alerts(
    severity: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """Get system alerts"""
    try:
        alert_types = [
            {
                "severity": "critical",
                "title": "HVAC System Failure",
                "description": "Air conditioning unit offline in Zone A",
                "spaces": ["ZONE_A_01", "ZONE_A_02", "ZONE_A_03"]
            },
            {
                "severity": "high",
                "title": "High Energy Consumption",
                "description": "Energy usage 25% above normal levels",
                "spaces": ["FLOOR_3", "FLOOR_4"]
            },
            {
                "severity": "medium",
                "title": "Low Space Utilization",
                "description": "Meeting rooms showing consistent underutilization",
                "spaces": ["MEETING_ROOM_A", "MEETING_ROOM_B"]
            },
            {
                "severity": "low",
                "title": "Maintenance Reminder",
                "description": "Scheduled maintenance due for elevator systems",
                "spaces": ["ELEVATOR_01", "ELEVATOR_02"]
            }
        ]
        
        alerts = []
        for i, alert_type in enumerate(alert_types):
            if severity and alert_type["severity"] != severity:
                continue
            
            is_resolved = np.random.choice([True, False], p=[0.3, 0.7])
            if resolved is not None and is_resolved != resolved:
                continue
            
            alert = {
                "alert_id": f"ALERT_{i+1:04d}",
                "severity": alert_type["severity"],
                "title": alert_type["title"],
                "description": alert_type["description"],
                "affected_spaces": alert_type["spaces"],
                "timestamp": (datetime.now() - timedelta(hours=np.random.randint(1, 48))).isoformat(),
                "resolved": is_resolved
            }
            alerts.append(alert)
            
            if len(alerts) >= limit:
                break
        
        return {
            "alerts": alerts,
            "metadata": {
                "total_alerts": len(alerts),
                "unresolved_count": len([a for a in alerts if not a["resolved"]]),
                "critical_count": len([a for a in alerts if a["severity"] == "critical"])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/predictions")
async def get_predictions(
    metric_type: MetricType = Query(MetricType.OCCUPANCY),
    forecast_days: int = Query(7, ge=1, le=30)
):
    """Get AI predictions"""
    try:
        # Generate historical data
        historical_data = []
        current_time = datetime.now()
        
        for i in range(30):
            timestamp = current_time - timedelta(days=30-i)
            base_value = 75 + 10 * np.sin(2 * np.pi * i / 7)
            value = base_value + np.random.normal(0, 5)
            value = max(0, min(100, value))
            
            historical_data.append({
                "timestamp": timestamp.isoformat(),
                "value": round(value, 1),
                "predicted": False
            })
        
        # Generate predictions
        predictions = []
        last_value = historical_data[-1]["value"]
        
        for i in range(forecast_days):
            future_timestamp = current_time + timedelta(days=i+1)
            trend = 0.1 * i
            seasonal = 10 * np.sin(2 * np.pi * i / 7)
            noise = np.random.normal(0, 3)
            
            predicted_value = last_value + trend + seasonal + noise
            predicted_value = max(0, min(100, predicted_value))
            
            predictions.append({
                "timestamp": future_timestamp.isoformat(),
                "value": round(predicted_value, 1),
                "predicted": True
            })
        
        return {
            "historical_data": historical_data[-7:],
            "predictions": predictions,
            "model_info": {
                "name": "LSTM_Space_Predictor_v2.1",
                "accuracy": 0.87,
                "confidence": 0.82
            },
            "metadata": {
                "metric_type": metric_type,
                "forecast_period": forecast_days,
                "generated_at": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/optimization")
async def get_optimization_suggestions(
    category: Optional[str] = Query(None),
    priority: Optional[int] = Query(None, ge=1, le=5)
):
    """Get optimization suggestions"""
    try:
        optimization_data = {
            "space": [
                {
                    "title": "Consolidate Underutilized Meeting Rooms",
                    "description": "Combine 3 low-usage meeting rooms into flexible co-working space",
                    "savings": 15000,
                    "effort": "medium",
                    "priority": 2
                },
                {
                    "title": "Implement Hot Desking in Sales Department",
                    "description": "Reduce dedicated desks by 30% based on remote work patterns",
                    "savings": 25000,
                    "effort": "high",
                    "priority": 1
                }
            ],
            "energy": [
                {
                    "title": "Upgrade to LED Lighting",
                    "description": "Replace fluorescent fixtures with smart LED systems",
                    "savings": 8000,
                    "effort": "medium",
                    "priority": 3
                },
                {
                    "title": "Install Smart Thermostats",
                    "description": "Implement zone-based temperature control",
                    "savings": 12000,
                    "effort": "low",
                    "priority": 2
                }
            ],
            "cost": [
                {
                    "title": "Renegotiate Cleaning Contracts",
                    "description": "Optimize cleaning schedules based on actual usage data",
                    "savings": 6000,
                    "effort": "low",
                    "priority": 4
                }
            ]
        }
        
        suggestions = []
        categories_to_include = [category] if category else optimization_data.keys()
        
        suggestion_id = 1
        for cat in categories_to_include:
            if cat in optimization_data:
                for item in optimization_data[cat]:
                    if priority and item["priority"] != priority:
                        continue
                    
                    suggestion = {
                        "suggestion_id": f"OPT_{suggestion_id:04d}",
                        "category": cat,
                        "title": item["title"],
                        "description": item["description"],
                        "potential_savings": item["savings"],
                        "implementation_effort": item["effort"],
                        "priority": item["priority"]
                    }
                    suggestions.append(suggestion)
                    suggestion_id += 1
        
        suggestions.sort(key=lambda x: x["priority"])
        
        return {
            "suggestions": suggestions,
            "metadata": {
                "total_suggestions": len(suggestions),
                "total_potential_savings": sum(s["potential_savings"] for s in suggestions),
                "categories": list(set(s["category"] for s in suggestions))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/export/{report_type}")
async def export_report(
    report_type: str,
    time_range: TimeRange = Query(TimeRange.WEEK),
    format_type: str = Query("pdf", description="pdf, excel, csv")
):
    """Export reports"""
    try:
        # Generate sample report data
        report_data = {
            "title": f"{report_type.title()} Report",
            "generated_at": datetime.now().isoformat(),
            "time_range": time_range,
            "format": format_type,
            "summary": {
                "total_spaces": 250,
                "avg_utilization": 73.2,
                "efficiency_score": 85.7,
                "cost_savings": 240000
            }
        }
        
        if format_type == "csv":
            # Simulate CSV generation
            csv_data = "timestamp,space_id,occupancy,efficiency\n"
            for i in range(10):
                csv_data += f"{datetime.now().isoformat()},SPACE_{i},{np.random.randint(0,100)},{np.random.randint(60,100)}\n"
            
            return {
                "file_type": "csv",
                "data": base64.b64encode(csv_data.encode()).decode(),
                "filename": f"{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                "size": len(csv_data)
            }
        
        return {
            "file_type": format_type,
            "filename": f"{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}",
            "data": report_data,
            "download_url": f"/api/reports/download/{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/employees/add")
async def add_employee(employee_data: dict):
    """Add new employee"""
    try:
        new_employee = {
            "id": len(current_data.get("employees", [])) + 1,
            "name": employee_data.get("name"),
            "email": employee_data.get("email"),
            "department": employee_data.get("department"),
            "role": employee_data.get("role"),
            "status": "active",
            "join_date": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        if "employees" not in current_data:
            current_data["employees"] = []
        current_data["employees"].append(new_employee)
        
        return {
            "success": True,
            "employee": new_employee,
            "message": "Employee added successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/employees/{employee_id}")
async def update_employee(employee_id: int, employee_data: dict):
    """Update employee information"""
    try:
        employees = current_data.get("employees", [])
        for i, emp in enumerate(employees):
            if emp["id"] == employee_id:
                employees[i].update(employee_data)
                employees[i]["updated_at"] = datetime.now().isoformat()
                return {
                    "success": True,
                    "employee": employees[i],
                    "message": "Employee updated successfully"
                }
        
        raise HTTPException(status_code=404, detail="Employee not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: int):
    """Delete employee"""
    try:
        employees = current_data.get("employees", [])
        for i, emp in enumerate(employees):
            if emp["id"] == employee_id:
                deleted_employee = employees.pop(i)
                return {
                    "success": True,
                    "message": "Employee deleted successfully",
                    "deleted_employee": deleted_employee
                }
        
        raise HTTPException(status_code=404, detail="Employee not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/spaces/add")
async def add_space(space_data: dict):
    """Add new space"""
    try:
        new_space = {
            "id": len(current_data.get("spaces_detailed", [])) + 1,
            "name": space_data.get("name"),
            "type": space_data.get("type"),
            "floor": space_data.get("floor"),
            "capacity": space_data.get("capacity"),
            "current": 0,
            "utilization": 0,
            "status": "available",
            "created_at": datetime.now().isoformat()
        }
        
        if "spaces_detailed" not in current_data:
            current_data["spaces_detailed"] = []
        current_data["spaces_detailed"].append(new_space)
        
        return {
            "success": True,
            "space": new_space,
            "message": "Space added successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """Get dashboard summary metrics"""
    try:
        return {
            "summary": {
                "total_spaces": 250,
                "active_alerts": np.random.randint(5, 15),
                "avg_occupancy": round(np.random.uniform(70, 85), 1),
                "energy_efficiency": round(np.random.uniform(80, 95), 1),
                "cost_per_sqft": round(np.random.uniform(40, 60), 1),
                "sustainability_score": round(np.random.uniform(75, 90), 1),
                "last_updated": datetime.now().isoformat()
            },
            "trends": {
                "occupancy_trend": np.random.choice(["increasing", "decreasing", "stable"]),
                "energy_trend": np.random.choice(["increasing", "decreasing", "stable"]),
                "cost_trend": np.random.choice(["increasing", "decreasing", "stable"]),
                "efficiency_trend": np.random.choice(["improving", "declining", "stable"])
            },
            "quick_stats": {
                "employees_present": np.random.randint(120, 180),
                "meeting_rooms_booked": np.random.randint(8, 15),
                "energy_consumption": round(np.random.uniform(80, 120), 1),
                "cost_savings_today": np.random.randint(5000, 15000)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Advanced Dashboard API Endpoints
@app.get("/api/dashboard/export/{report_type}")
async def export_report(
    report_type: str = Query(..., description="csv, pdf, or excel"),
    time_range: TimeRange = Query(TimeRange.WEEK),
    metric_types: Optional[List[MetricType]] = Query(None)
):
    """Export dashboard data in various formats"""
    try:
        # Generate sample data for export
        data = []
        
        # Create sample dataset
        for i in range(100):
            timestamp = datetime.now() - timedelta(hours=i)
            data.append({
                "timestamp": timestamp,
                "space_id": f"SPACE_{i%10}",
                "occupancy": np.random.uniform(0, 100),
                "efficiency": np.random.uniform(70, 95),
                "utilization": np.random.uniform(60, 90),
                "cost": np.random.uniform(40, 60),
                "energy": np.random.uniform(10, 20)
            })
        
        df = pd.DataFrame(data)
        
        if report_type == "csv":
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_data = csv_buffer.getvalue()
            return {
                "file_type": "csv",
                "data": base64.b64encode(csv_data.encode()).decode(),
                "filename": f"dashboard_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        
        elif report_type == "excel":
            excel_buffer = io.BytesIO()
            df.to_excel(excel_buffer, index=False, engine='openpyxl')
            excel_data = excel_buffer.getvalue()
            return {
                "file_type": "excel",
                "data": base64.b64encode(excel_data).decode(),
                "filename": f"dashboard_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        
        elif report_type == "pdf":
            # For PDF, return metadata for PDF generation
            return {
                "file_type": "pdf",
                "data": "PDF generation requires additional libraries",
                "filename": f"dashboard_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                "summary": {
                    "total_records": len(data),
                    "avg_occupancy": round(df['occupancy'].mean(), 1),
                    "avg_efficiency": round(df['efficiency'].mean(), 1)
                }
            }
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported report type")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/alerts")
async def get_dashboard_alerts(
    severity: Optional[str] = Query(None, description="low, medium, high, critical"),
    resolved: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get system alerts and notifications"""
    try:
        alerts = []
        
        # Generate sample alerts
        alert_types = [
            {
                "severity": "critical",
                "title": "HVAC System Failure",
                "description": "Air conditioning unit offline in Zone A",
                "spaces": ["ZONE_A_01", "ZONE_A_02", "ZONE_A_03"]
            },
            {
                "severity": "high",
                "title": "High Energy Consumption",
                "description": "Energy usage 25% above normal levels",
                "spaces": ["FLOOR_3", "FLOOR_4"]
            },
            {
                "severity": "medium",
                "title": "Low Space Utilization",
                "description": "Meeting rooms showing consistent underutilization",
                "spaces": ["MEETING_ROOM_A", "MEETING_ROOM_B"]
            },
            {
                "severity": "low",
                "title": "Maintenance Reminder",
                "description": "Scheduled maintenance due for elevator systems",
                "spaces": ["ELEVATOR_01", "ELEVATOR_02"]
            }
        ]
        
        for i, alert_type in enumerate(alert_types):
            if severity and alert_type["severity"] != severity:
                continue
                
            is_resolved = np.random.choice([True, False], p=[0.3, 0.7])
            if resolved is not None and is_resolved != resolved:
                continue
            
            alert = {
                "alert_id": f"ALERT_{i+1:04d}",
                "severity": alert_type["severity"],
                "title": alert_type["title"],
                "description": alert_type["description"],
                "affected_spaces": alert_type["spaces"],
                "timestamp": (datetime.now() - timedelta(hours=np.random.randint(1, 48))).isoformat(),
                "resolved": is_resolved
            }
            alerts.append(alert)
            
            if len(alerts) >= limit:
                break
        
        return {
            "alerts": alerts,
            "metadata": {
                "total_alerts": len(alerts),
                "unresolved_count": len([a for a in alerts if not a["resolved"]]),
                "critical_count": len([a for a in alerts if a["severity"] == "critical"])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dashboard/predictions")
async def get_dashboard_predictions(
    filter_request: FilterRequest = Body(...),
    metric_type: MetricType = Query(MetricType.OCCUPANCY),
    forecast_days: int = Query(7, ge=1, le=30)
):
    """Get AI-powered predictions for space metrics"""
    try:
        # Generate base timeseries data
        current_time = datetime.now()
        historical_data = []
        
        # Generate 30 days of historical data
        for i in range(30):
            timestamp = current_time - timedelta(days=30-i)
            base_value = 75 + 10 * np.sin(2 * np.pi * i / 7)  # Weekly pattern
            value = base_value + np.random.normal(0, 5)
            value = max(0, min(100, value))
            
            historical_data.append({
                "timestamp": timestamp.isoformat(),
                "value": round(value, 1),
                "predicted": False
            })
        
        # Generate predictions
        predictions = []
        last_value = historical_data[-1]["value"]
        
        for i in range(forecast_days):
            future_timestamp = current_time + timedelta(days=i+1)
            
            # Add trend and seasonality
            trend = 0.1 * i  # Slight upward trend
            seasonal = 10 * np.sin(2 * np.pi * i / 7)  # Weekly pattern
            noise = np.random.normal(0, 3)
            
            predicted_value = last_value + trend + seasonal + noise
            predicted_value = max(0, min(100, predicted_value))
            
            predictions.append({
                "timestamp": future_timestamp.isoformat(),
                "value": round(predicted_value, 1),
                "predicted": True
            })
        
        # Create prediction model metadata
        model = {
            "model_name": "LSTM_Space_Predictor_v2.1",
            "accuracy": 0.87,
            "confidence": 0.82,
            "predictions": predictions
        }
        
        return {
            "historical_data": historical_data[-7:],  # Last 7 days
            "prediction_model": model,
            "metadata": {
                "metric_type": metric_type,
                "forecast_period": forecast_days,
                "model_last_trained": (datetime.now() - timedelta(days=3)).isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/optimization")
async def get_dashboard_optimization_suggestions(
    category: Optional[str] = Query(None, description="space, energy, cost, efficiency"),
    priority: Optional[int] = Query(None, ge=1, le=5)
):
    """Get AI-generated optimization suggestions"""
    try:
        suggestions = []
        
        # Define optimization categories
        optimization_data = {
            "space": [
                {
                    "title": "Consolidate Underutilized Meeting Rooms",
                    "description": "Combine 3 low-usage meeting rooms into flexible co-working space",
                    "savings": 15000,
                    "effort": "medium",
                    "priority": 2
                },
                {
                    "title": "Implement Hot Desking in Sales Department",
                    "description": "Reduce dedicated desks by 30% based on remote work patterns",
                    "savings": 25000,
                    "effort": "high",
                    "priority": 1
                }
            ],
            "energy": [
                {
                    "title": "Upgrade to LED Lighting",
                    "description": "Replace fluorescent fixtures with smart LED systems",
                    "savings": 8000,
                    "effort": "medium",
                    "priority": 3
                },
                {
                    "title": "Install Smart Thermostats",
                    "description": "Implement zone-based temperature control",
                    "savings": 12000,
                    "effort": "low",
                    "priority": 2
                }
            ],
            "cost": [
                {
                    "title": "Renegotiate Cleaning Contracts",
                    "description": "Optimize cleaning schedules based on actual usage data",
                    "savings": 6000,
                    "effort": "low",
                    "priority": 4
                },
                {
                    "title": "Implement Space Sharing Program",
                    "description": "Allow external companies to rent unused spaces",
                    "savings": 30000,
                    "effort": "high",
                    "priority": 1
                }
            ],
            "efficiency": [
                {
                    "title": "Deploy Smart Room Booking System",
                    "description": "Reduce no-shows and optimize room allocation",
                    "savings": 10000,
                    "effort": "medium",
                    "priority": 3
                },
                {
                    "title": "Install Occupancy Sensors",
                    "description": "Automate lighting and HVAC based on real-time occupancy",
                    "savings": 18000,
                    "effort": "medium",
                    "priority": 2
                }
            ]
        }
        
        # Filter by category if specified
        categories_to_include = [category] if category else optimization_data.keys()
        
        suggestion_id = 1
        for cat in categories_to_include:
            if cat in optimization_data:
                for item in optimization_data[cat]:
                    if priority and item["priority"] != priority:
                        continue
                    
                    suggestion = {
                        "suggestion_id": f"OPT_{suggestion_id:04d}",
                        "category": cat,
                        "title": item["title"],
                        "description": item["description"],
                        "potential_savings": item["savings"],
                        "implementation_effort": item["effort"],
                        "priority": item["priority"]
                    }
                    suggestions.append(suggestion)
                    suggestion_id += 1
        
        # Sort by priority
        suggestions.sort(key=lambda x: x["priority"])
        
        return {
            "suggestions": suggestions,
            "metadata": {
                "total_suggestions": len(suggestions),
                "total_potential_savings": sum(s["potential_savings"] for s in suggestions),
                "categories": list(set(s["category"] for s in suggestions))
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/user-activity")
async def get_dashboard_user_activity(
    time_range: TimeRange = Query(TimeRange.TODAY),
    department: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    """Get user activity and movement patterns"""
    try:
        activities = []
        
        # Generate sample user activities
        departments = ["Engineering", "Sales", "Marketing", "HR", "Finance"]
        activity_types = ["badge_in", "badge_out", "meeting_checkin", "desk_booking", "room_booking"]
        locations = ["FLOOR_1", "FLOOR_2", "FLOOR_3", "MEETING_ROOM_A", "CAFETERIA", "LOBBY"]
        
        for i in range(limit):
            dept = department if department else np.random.choice(departments)
            activity_type = np.random.choice(activity_types)
            location = np.random.choice(locations)
            
            # Generate realistic timestamps
            hours_ago = np.random.exponential(2)  # More recent activities more likely
            timestamp = datetime.now() - timedelta(hours=hours_ago)
            
            # Generate duration for applicable activities
            duration = None
            if activity_type in ["meeting_checkin", "desk_booking"]:
                duration = np.random.randint(30, 480)  # 30 minutes to 8 hours
            
            activity = {
                "user_id": f"USER_{i%50:03d}",  # 50 unique users
                "activity_type": activity_type,
                "timestamp": timestamp.isoformat(),
                "location": location,
                "duration_minutes": duration
            }
            activities.append(activity)
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Calculate summary statistics
        unique_users = len(set(a["user_id"] for a in activities))
        avg_duration = np.mean([a["duration_minutes"] for a in activities if a["duration_minutes"]])
        
        return {
            "activities": activities,
            "metadata": {
                "total_activities": len(activities),
                "unique_users": unique_users,
                "time_range": time_range,
                "avg_duration_minutes": round(avg_duration, 1) if avg_duration else None
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dashboard/recommendations")
async def get_dashboard_space_recommendations(
    filter_request: FilterRequest = Body(...),
    recommendation_type: str = Query("optimization", description="optimization, allocation, or maintenance")
):
    """Get AI-powered space recommendations"""
    try:
        recommendations = []
        
        # Generate space recommendations based on type
        if recommendation_type == "optimization":
            space_data = [
                {
                    "space_id": "MEETING_ROOM_A",
                    "space_type": "meeting_room",
                    "action": "convert_to_phone_booth",
                    "reason": "Low utilization (15%) and single-person usage pattern",
                    "impact": "Increase space efficiency by 40%",
                    "confidence": 0.85
                },
                {
                    "space_id": "OPEN_AREA_3F",
                    "space_type": "open_workspace",
                    "action": "add_collaborative_zones",
                    "reason": "High foot traffic but limited collaboration spaces",
                    "impact": "Improve team productivity by 25%",
                    "confidence": 0.78
                }
            ]
        
        elif recommendation_type == "allocation":
            space_data = [
                {
                    "space_id": "FLOOR_2_EAST",
                    "space_type": "office_space",
                    "action": "relocate_marketing_team",
                    "reason": "Current location has 30% lower natural light",
                    "impact": "Increase employee satisfaction by 15%",
                    "confidence": 0.72
                },
                {
                    "space_id": "CONFERENCE_ROOM_B",
                    "space_type": "conference_room",
                    "action": "reserve_for_client_meetings",
                    "reason": "Premium location with best AV equipment",
                    "impact": "Improve client impression scores",
                    "confidence": 0.91
                }
            ]
        
        else:  # maintenance
            space_data = [
                {
                    "space_id": "HVAC_ZONE_A",
                    "space_type": "hvac_system",
                    "action": "schedule_preventive_maintenance",
                    "reason": "Energy consumption trending 20% above normal",
                    "impact": "Prevent system failure and reduce energy costs",
                    "confidence": 0.88
                },
                {
                    "space_id": "ELEVATOR_01",
                    "space_type": "elevator",
                    "action": "upgrade_control_system",
                    "reason": "Frequent delays during peak hours",
                    "impact": "Reduce wait times by 40%",
                    "confidence": 0.76
                }
            ]
        
        for space in space_data:
            recommendation = {
                "space_id": space["space_id"],
                "space_type": space["space_type"],
                "recommended_action": space["action"],
                "reason": space["reason"],
                "expected_impact": space["impact"],
                "confidence_score": space["confidence"]
            }
            recommendations.append(recommendation)
        
        return {
            "recommendations": recommendations,
            "metadata": {
                "recommendation_type": recommendation_type,
                "total_recommendations": len(recommendations),
                "avg_confidence": round(np.mean([r["confidence_score"] for r in recommendations]), 2),
                "generated_at": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/health")
async def dashboard_health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "analytics_engine": "running",
            "prediction_model": "loaded"
        }
    }

@app.get("/api/dashboard/metrics/summary")
async def get_dashboard_metrics_summary():
    """Get high-level summary of all key metrics"""
    try:
        return {
            "summary": {
                "total_spaces": 250,
                "active_alerts": 12,
                "avg_occupancy": 78.5,
                "energy_efficiency": 87.3,
                "cost_per_sqft": 45.2,
                "sustainability_score": 82.1,
                "last_updated": datetime.now().isoformat()
            },
            "trends": {
                "occupancy_trend": "increasing",
                "energy_trend": "stable",
                "cost_trend": "decreasing",
                "efficiency_trend": "improving"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Energy Analytics Endpoints
@app.get("/api/energy/dashboard")
async def get_energy_dashboard():
    """Get energy dashboard data with predictions and analysis"""
    try:
        # Generate current energy data
        current_data = energy_predictor.generate_mock_data(n_samples=168)  # Last week
        
        # Get predictions for next 24 hours
        future_data = energy_predictor.generate_mock_data(n_samples=24, start_date=datetime.now().strftime('%Y-%m-%d'))
        future_data = future_data.drop('energy_consumption', axis=1)  # Remove target for prediction
        predictions = energy_predictor.predict(future_data)
        
        # Analyze patterns
        analysis = energy_predictor.analyze_energy_patterns(current_data)
        
        # Generate optimization solutions
        current_costs = {
            'annual_cost': 1200000,
            'peak_tariff': 12.5,
            'off_peak_tariff': 8.0
        }
        solutions = energy_predictor.generate_optimization_solutions(current_data, current_costs)
        
        # Prepare dashboard data
        dashboard_data = {
            'current_consumption': current_data['energy_consumption'].iloc[-1],
            'daily_average': current_data['energy_consumption'].mean(),
            'weekly_total': current_data['energy_consumption'].sum(),
            'cost_today': current_data['energy_consumption'].iloc[-24:].sum() * 10.5,  # Average rate
            'predictions': [
                {
                    'hour': i,
                    'predicted_consumption': float(predictions[i]),
                    'timestamp': (datetime.now() + timedelta(hours=i)).isoformat()
                }
                for i in range(len(predictions))
            ],
            'hourly_pattern': [
                {
                    'hour': hour,
                    'average_consumption': float(current_data[current_data['hour'] == hour]['energy_consumption'].mean())
                }
                for hour in range(24)
            ],
            'analysis': analysis,
            'optimization_solutions': solutions,
            'feature_importance': energy_predictor.feature_importance.to_dict('records') if energy_predictor.feature_importance is not None else []
        }
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/energy/predictions")
async def get_energy_predictions(hours: int = 24):
    """Get energy consumption predictions for specified hours"""
    try:
        # Generate future data for prediction
        future_data = energy_predictor.generate_mock_data(
            n_samples=hours, 
            start_date=datetime.now().strftime('%Y-%m-%d')
        )
        future_data = future_data.drop('energy_consumption', axis=1)
        
        # Make predictions
        predictions = energy_predictor.predict(future_data)
        
        # Format response
        prediction_data = [
            {
                'timestamp': (datetime.now() + timedelta(hours=i)).isoformat(),
                'predicted_consumption': float(predictions[i]),
                'hour': (datetime.now() + timedelta(hours=i)).hour,
                'confidence': 0.85 + np.random.normal(0, 0.05)  # Mock confidence
            }
            for i in range(len(predictions))
        ]
        
        return {
            'predictions': prediction_data,
            'model_info': {
                'model_type': energy_predictor.model_type,
                'is_trained': energy_predictor.is_trained,
                'accuracy': 0.87
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/energy/optimization")
async def get_energy_optimization():
    """Get energy optimization recommendations"""
    try:
        # Generate recent data for analysis
        recent_data = energy_predictor.generate_mock_data(n_samples=720)  # Last month
        
        # Get optimization solutions
        current_costs = {
            'annual_cost': 1200000,
            'peak_tariff': 12.5,
            'off_peak_tariff': 8.0
        }
        solutions = energy_predictor.generate_optimization_solutions(recent_data, current_costs)
        
        return solutions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/energy/analysis")
async def get_energy_analysis():
    """Get detailed energy consumption analysis"""
    try:
        # Generate historical data
        historical_data = energy_predictor.generate_mock_data(n_samples=8760)  # Full year
        
        # Analyze patterns
        analysis = energy_predictor.analyze_energy_patterns(historical_data)
        
        # Additional insights
        insights = {
            'total_consumption': float(historical_data['energy_consumption'].sum()),
            'average_daily': float(historical_data['energy_consumption'].mean() * 24),
            'peak_consumption': float(historical_data['energy_consumption'].max()),
            'min_consumption': float(historical_data['energy_consumption'].min()),
            'consumption_variance': float(historical_data['energy_consumption'].var()),
            'seasonal_patterns': {
                'summer_avg': float(historical_data[historical_data['month'].isin([4, 5, 6])]['energy_consumption'].mean()),
                'winter_avg': float(historical_data[historical_data['month'].isin([12, 1, 2])]['energy_consumption'].mean()),
                'monsoon_avg': float(historical_data[historical_data['month'].isin([7, 8, 9])]['energy_consumption'].mean())
            }
        }
        
        return {
            'analysis': analysis,
            'insights': insights,
            'data_points': len(historical_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "analytics_engine": "running",
            "prediction_model": "loaded"
        }
    }

# Background task to refresh data
async def refresh_data_periodically():
    """Background task to refresh data every 30 seconds"""
    while True:
        try:
            # Refresh occupancy data
            await get_occupancy_data()
            # Refresh space data
            await get_space_data()
            # Refresh environmental data
            await get_environmental_data()
            # Wait 30 seconds
            await asyncio.sleep(30)
        except Exception as e:
            logger.error(f"Error refreshing data: {e}")
            await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(refresh_data_periodically())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)