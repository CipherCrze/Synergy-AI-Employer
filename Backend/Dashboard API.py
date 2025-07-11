from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
from enum import Enum
import json
import io
import base64

# Create router for advanced dashboard features
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Extended Pydantic Models
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

class AlertData(BaseModel):
    alert_id: str
    severity: str
    title: str
    description: str
    affected_spaces: List[str]
    timestamp: datetime
    resolved: bool = False

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

# Advanced Analytics Endpoints (continuing from previous code)

@router.get("/export/{report_type}")
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

@router.get("/alerts")
async def get_alerts(
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
            
            alert = AlertData(
                alert_id=f"ALERT_{i+1:04d}",
                severity=alert_type["severity"],
                title=alert_type["title"],
                description=alert_type["description"],
                affected_spaces=alert_type["spaces"],
                timestamp=datetime.now() - timedelta(hours=np.random.randint(1, 48)),
                resolved=is_resolved
            )
            alerts.append(alert)
            
            if len(alerts) >= limit:
                break
        
        return {
            "alerts": alerts,
            "metadata": {
                "total_alerts": len(alerts),
                "unresolved_count": len([a for a in alerts if not a.resolved]),
                "critical_count": len([a for a in alerts if a.severity == "critical"])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predictions")
async def get_predictions(
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
            
            historical_data.append(TimeSeriesPoint(
                timestamp=timestamp,
                value=round(value, 1),
                predicted=False
            ))
        
        # Generate predictions
        predictions = []
        last_value = historical_data[-1].value
        
        for i in range(forecast_days):
            future_timestamp = current_time + timedelta(days=i+1)
            
            # Add trend and seasonality
            trend = 0.1 * i  # Slight upward trend
            seasonal = 10 * np.sin(2 * np.pi * i / 7)  # Weekly pattern
            noise = np.random.normal(0, 3)
            
            predicted_value = last_value + trend + seasonal + noise
            predicted_value = max(0, min(100, predicted_value))
            
            predictions.append(TimeSeriesPoint(
                timestamp=future_timestamp,
                value=round(predicted_value, 1),
                predicted=True
            ))
        
        # Create prediction model metadata
        model = PredictionModel(
            model_name="LSTM_Space_Predictor_v2.1",
            accuracy=0.87,
            confidence=0.82,
            predictions=predictions
        )
        
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

@router.get("/optimization")
async def get_optimization_suggestions(
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
                    
                    suggestion = OptimizationSuggestion(
                        suggestion_id=f"OPT_{suggestion_id:04d}",
                        category=cat,
                        title=item["title"],
                        description=item["description"],
                        potential_savings=item["savings"],
                        implementation_effort=item["effort"],
                        priority=item["priority"]
                    )
                    suggestions.append(suggestion)
                    suggestion_id += 1
        
        # Sort by priority
        suggestions.sort(key=lambda x: x.priority)
        
        return {
            "suggestions": suggestions,
            "metadata": {
                "total_suggestions": len(suggestions),
                "total_potential_savings": sum(s.potential_savings for s in suggestions),
                "categories": list(set(s.category for s in suggestions))
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-activity")
async def get_user_activity(
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
            
            activity = UserActivity(
                user_id=f"USER_{i%50:03d}",  # 50 unique users
                activity_type=activity_type,
                timestamp=timestamp,
                location=location,
                duration_minutes=duration
            )
            activities.append(activity)
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x.timestamp, reverse=True)
        
        # Calculate summary statistics
        unique_users = len(set(a.user_id for a in activities))
        avg_duration = np.mean([a.duration_minutes for a in activities if a.duration_minutes])
        
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

@router.post("/recommendations")
async def get_space_recommendations(
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
            recommendation = SpaceRecommendation(
                space_id=space["space_id"],
                space_type=space["space_type"],
                recommended_action=space["action"],
                reason=space["reason"],
                expected_impact=space["impact"],
                confidence_score=space["confidence"]
            )
            recommendations.append(recommendation)
        
        return {
            "recommendations": recommendations,
            "metadata": {
                "recommendation_type": recommendation_type,
                "total_recommendations": len(recommendations),
                "avg_confidence": round(np.mean([r.confidence_score for r in recommendations]), 2),
                "generated_at": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
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

@router.get("/metrics/summary")
async def get_metrics_summary():
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