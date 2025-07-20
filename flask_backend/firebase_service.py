"""
Firebase Integration Service for Synergy AI Platform
Handles real-time database operations and company-specific data management
"""

import firebase_admin
from firebase_admin import credentials, db
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import os
from pathlib import Path
import threading
import time

logger = logging.getLogger(__name__)

class FirebaseService:
    """
    Enhanced Firebase service for real-time data management
    Features:
    - Company-specific data isolation
    - Real-time listeners for AI model updates
    - Automatic conflict resolution tracking
    - Performance metrics collection
    """
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or "https://synergy-ai-platform-default-rtdb.firebaseio.com/"
        self.db = None
        self.listeners = {}
        self.is_connected = False
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """
        Initialize Firebase Admin SDK
        """
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # For demo purposes, we'll use anonymous authentication
                # In production, use proper service account credentials
                firebase_admin.initialize_app(options={
                    'databaseURL': self.database_url
                })
            
            self.db = db
            self.is_connected = True
            logger.info("Firebase initialized successfully")
            
            # Initialize database structure
            self._initialize_database_structure()
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            # Create mock database for development
            self._initialize_mock_database()
    
    def _initialize_mock_database(self):
        """
        Initialize mock database for development/testing
        """
        self.mock_data = {
            'companies': {},
            'space_data': {},
            'energy_data': {},
            'ai_predictions': {},
            'conflicts': {},
            'user_sessions': {}
        }
        self.is_connected = True
        logger.info("Mock database initialized for development")
    
    def _initialize_database_structure(self):
        """
        Initialize the database structure with sample data
        """
        try:
            # Create sample company data
            sample_company = {
                'company_id': 'demo_company',
                'name': 'Demo Corporation',
                'settings': {
                    'business_hours': {'start': 9, 'end': 17},
                    'time_zone': 'America/New_York',
                    'sustainability_goals': {
                        'energy_reduction_target': 0.15,
                        'space_efficiency_target': 0.85
                    }
                },
                'spaces': self._generate_sample_spaces(),
                'employees': self._generate_sample_employees()
            }
            
            # Store in database or mock
            if hasattr(self, 'mock_data'):
                self.mock_data['companies']['demo_company'] = sample_company
            else:
                ref = self.db.reference('companies/demo_company')
                ref.set(sample_company)
            
            # Generate and store sample data
            self._generate_and_store_sample_data()
            
            logger.info("Database structure initialized with sample data")
            
        except Exception as e:
            logger.error(f"Failed to initialize database structure: {e}")
    
    def _generate_sample_spaces(self) -> List[Dict[str, Any]]:
        """
        Generate sample space data for demo
        """
        spaces = []
        
        # Office floors
        for floor in range(1, 4):
            # Desks
            for desk_num in range(1, 21):
                spaces.append({
                    'id': f'desk_{floor}_{desk_num:02d}',
                    'name': f'Desk {floor}.{desk_num:02d}',
                    'type': 'desk',
                    'floor': floor,
                    'capacity': 1,
                    'current_occupancy': 0,
                    'department': ['engineering', 'sales', 'marketing', 'hr', 'finance'][desk_num % 5],
                    'amenities': ['monitor', 'ergonomic_chair', 'storage'],
                    'status': 'available'
                })
            
            # Meeting rooms
            for room_num in range(1, 6):
                capacity = [4, 6, 8, 10, 12][room_num - 1]
                spaces.append({
                    'id': f'meeting_{floor}_{room_num}',
                    'name': f'Meeting Room {floor}.{room_num}',
                    'type': 'meeting_room',
                    'floor': floor,
                    'capacity': capacity,
                    'current_occupancy': 0,
                    'amenities': ['projector', 'whiteboard', 'video_conference'],
                    'status': 'available'
                })
            
            # Common areas
            spaces.append({
                'id': f'common_{floor}',
                'name': f'Common Area Floor {floor}',
                'type': 'common_area',
                'floor': floor,
                'capacity': 15,
                'current_occupancy': 0,
                'amenities': ['coffee_machine', 'seating', 'printer'],
                'status': 'available'
            })
        
        # Phone booths
        for booth_num in range(1, 8):
            spaces.append({
                'id': f'booth_{booth_num}',
                'name': f'Phone Booth {booth_num}',
                'type': 'phone_booth',
                'floor': (booth_num - 1) // 3 + 1,
                'capacity': 1,
                'current_occupancy': 0,
                'amenities': ['sound_proof', 'power_outlet'],
                'status': 'available'
            })
        
        return spaces
    
    def _generate_sample_employees(self) -> List[Dict[str, Any]]:
        """
        Generate sample employee data
        """
        departments = ['engineering', 'sales', 'marketing', 'hr', 'finance']
        employees = []
        
        for i in range(1, 51):
            employees.append({
                'id': f'emp_{i:03d}',
                'name': f'Employee {i}',
                'email': f'employee{i}@demo.com',
                'department': departments[i % len(departments)],
                'role': 'Senior' if i % 3 == 0 else 'Junior',
                'status': 'active',
                'assigned_desk': f'desk_{((i-1)//20)+1}_{((i-1)%20)+1:02d}',
                'work_schedule': {
                    'start_time': '09:00',
                    'end_time': '17:00',
                    'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                }
            })
        
        return employees
    
    def _generate_and_store_sample_data(self):
        """
        Generate and store sample operational data
        """
        current_time = datetime.now()
        
        # Generate sample energy data for the last 24 hours
        energy_data = []
        space_data = []
        
        for hour in range(24):
            timestamp = current_time.replace(hour=hour, minute=0, second=0, microsecond=0)
            
            # Sample energy reading
            energy_reading = {
                'timestamp': timestamp.isoformat(),
                'total_consumption': 150 + (hour - 12) ** 2 * 2,  # Realistic daily pattern
                'hvac_consumption': 70 + (hour - 12) ** 2 * 1.2,
                'lighting_consumption': 25 if 6 <= hour <= 20 else 10,
                'equipment_consumption': 35 if 8 <= hour <= 18 else 15,
                'cost_per_hour': (150 + (hour - 12) ** 2 * 2) * 0.12,
                'efficiency_score': max(60, 100 - abs(hour - 14) * 3),
                'carbon_footprint': (150 + (hour - 12) ** 2 * 2) * 0.4
            }
            energy_data.append(energy_reading)
            
            # Sample space utilization
            if 8 <= hour <= 18:
                utilization_factor = 0.8 if hour in [10, 11, 14, 15] else 0.6
            else:
                utilization_factor = 0.1
            
            space_reading = {
                'timestamp': timestamp.isoformat(),
                'overall_utilization': utilization_factor,
                'total_occupancy': int(200 * utilization_factor),
                'total_capacity': 200,
                'environmental_conditions': {
                    'average_temperature': 22 + (hour - 12) * 0.5,
                    'average_humidity': 45,
                    'average_co2': 400 + utilization_factor * 200,
                    'average_noise': 40 + utilization_factor * 15
                }
            }
            space_data.append(space_reading)
        
        # Store the data
        if hasattr(self, 'mock_data'):
            self.mock_data['energy_data']['demo_company'] = energy_data
            self.mock_data['space_data']['demo_company'] = space_data
        else:
            # Store in Firebase
            energy_ref = self.db.reference('energy_data/demo_company')
            space_ref = self.db.reference('space_data/demo_company')
            energy_ref.set(energy_data)
            space_ref.set(space_data)
    
    def get_company_data(self, company_id: str) -> Optional[Dict[str, Any]]:
        """
        Get company configuration and data
        """
        try:
            if hasattr(self, 'mock_data'):
                return self.mock_data['companies'].get(company_id)
            else:
                ref = self.db.reference(f'companies/{company_id}')
                return ref.get()
        except Exception as e:
            logger.error(f"Error getting company data: {e}")
            return None
    
    def get_space_data(self, company_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get recent space utilization data
        """
        try:
            if hasattr(self, 'mock_data'):
                return self.mock_data['space_data'].get(company_id, [])[-hours:]
            else:
                ref = self.db.reference(f'space_data/{company_id}')
                data = ref.order_by_key().limit_to_last(hours).get()
                return list(data.values()) if data else []
        except Exception as e:
            logger.error(f"Error getting space data: {e}")
            return []
    
    def get_energy_data(self, company_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get recent energy consumption data
        """
        try:
            if hasattr(self, 'mock_data'):
                return self.mock_data['energy_data'].get(company_id, [])[-hours:]
            else:
                ref = self.db.reference(f'energy_data/{company_id}')
                data = ref.order_by_key().limit_to_last(hours).get()
                return list(data.values()) if data else []
        except Exception as e:
            logger.error(f"Error getting energy data: {e}")
            return []
    
    def store_ai_prediction(self, company_id: str, model_type: str, prediction_data: Dict[str, Any]):
        """
        Store AI model predictions
        """
        try:
            prediction_data['timestamp'] = datetime.now().isoformat()
            prediction_data['model_type'] = model_type
            
            if hasattr(self, 'mock_data'):
                if 'ai_predictions' not in self.mock_data:
                    self.mock_data['ai_predictions'] = {}
                if company_id not in self.mock_data['ai_predictions']:
                    self.mock_data['ai_predictions'][company_id] = []
                self.mock_data['ai_predictions'][company_id].append(prediction_data)
            else:
                ref = self.db.reference(f'ai_predictions/{company_id}')
                ref.push(prediction_data)
            
            logger.info(f"Stored {model_type} prediction for company {company_id}")
        
        except Exception as e:
            logger.error(f"Error storing AI prediction: {e}")
    
    def get_recent_predictions(self, company_id: str, model_type: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent AI predictions
        """
        try:
            if hasattr(self, 'mock_data'):
                predictions = self.mock_data.get('ai_predictions', {}).get(company_id, [])
                if model_type:
                    predictions = [p for p in predictions if p.get('model_type') == model_type]
                return predictions[-limit:]
            else:
                ref = self.db.reference(f'ai_predictions/{company_id}')
                data = ref.order_by_key().limit_to_last(limit).get()
                predictions = list(data.values()) if data else []
                if model_type:
                    predictions = [p for p in predictions if p.get('model_type') == model_type]
                return predictions
        
        except Exception as e:
            logger.error(f"Error getting predictions: {e}")
            return []
    
    def store_conflict(self, company_id: str, conflict_data: Dict[str, Any]) -> str:
        """
        Store detected conflict
        """
        try:
            conflict_id = f"conflict_{int(time.time())}"
            conflict_data['id'] = conflict_id
            conflict_data['timestamp'] = datetime.now().isoformat()
            conflict_data['status'] = 'open'
            conflict_data['company_id'] = company_id
            
            if hasattr(self, 'mock_data'):
                if 'conflicts' not in self.mock_data:
                    self.mock_data['conflicts'] = {}
                if company_id not in self.mock_data['conflicts']:
                    self.mock_data['conflicts'][company_id] = {}
                self.mock_data['conflicts'][company_id][conflict_id] = conflict_data
            else:
                ref = self.db.reference(f'conflicts/{company_id}/{conflict_id}')
                ref.set(conflict_data)
            
            logger.info(f"Stored conflict {conflict_id} for company {company_id}")
            return conflict_id
        
        except Exception as e:
            logger.error(f"Error storing conflict: {e}")
            return None
    
    def get_active_conflicts(self, company_id: str) -> List[Dict[str, Any]]:
        """
        Get active conflicts for a company
        """
        try:
            if hasattr(self, 'mock_data'):
                conflicts = self.mock_data.get('conflicts', {}).get(company_id, {})
                return [c for c in conflicts.values() if c.get('status') == 'open']
            else:
                ref = self.db.reference(f'conflicts/{company_id}')
                data = ref.order_by_child('status').equal_to('open').get()
                return list(data.values()) if data else []
        
        except Exception as e:
            logger.error(f"Error getting conflicts: {e}")
            return []
    
    def resolve_conflict(self, company_id: str, conflict_id: str, resolution: str) -> bool:
        """
        Mark conflict as resolved
        """
        try:
            if hasattr(self, 'mock_data'):
                if (company_id in self.mock_data.get('conflicts', {}) and 
                    conflict_id in self.mock_data['conflicts'][company_id]):
                    self.mock_data['conflicts'][company_id][conflict_id]['status'] = 'resolved'
                    self.mock_data['conflicts'][company_id][conflict_id]['resolution'] = resolution
                    self.mock_data['conflicts'][company_id][conflict_id]['resolved_at'] = datetime.now().isoformat()
                    return True
            else:
                ref = self.db.reference(f'conflicts/{company_id}/{conflict_id}')
                ref.update({
                    'status': 'resolved',
                    'resolution': resolution,
                    'resolved_at': datetime.now().isoformat()
                })
                return True
        
        except Exception as e:
            logger.error(f"Error resolving conflict: {e}")
            return False
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user (demo implementation)
        """
        # Demo authentication
        if email == "admin@demo.com" and password == "password":
            return {
                'id': 'admin_001',
                'email': email,
                'name': 'Admin User',
                'role': 'admin',
                'company_id': 'demo_company',
                'permissions': ['read', 'write', 'admin'],
                'last_login': datetime.now().isoformat()
            }
        
        # Check if user exists in company employee list
        company_data = self.get_company_data('demo_company')
        if company_data and 'employees' in company_data:
            for employee in company_data['employees']:
                if employee.get('email') == email:
                    # Simple password check (in production, use proper hashing)
                    if password == "password":  # Demo password
                        return {
                            'id': employee['id'],
                            'email': email,
                            'name': employee['name'],
                            'role': employee['role'],
                            'department': employee['department'],
                            'company_id': 'demo_company',
                            'permissions': ['read', 'write'] if employee['role'] == 'Senior' else ['read'],
                            'last_login': datetime.now().isoformat()
                        }
        
        return None
    
    def update_space_occupancy(self, company_id: str, space_id: str, occupancy: int):
        """
        Update real-time space occupancy
        """
        try:
            if hasattr(self, 'mock_data'):
                # Update mock data
                company = self.mock_data['companies'].get(company_id, {})
                spaces = company.get('spaces', [])
                for space in spaces:
                    if space['id'] == space_id:
                        space['current_occupancy'] = occupancy
                        break
            else:
                ref = self.db.reference(f'companies/{company_id}/spaces')
                spaces = ref.get()
                if spaces:
                    for key, space in spaces.items():
                        if space.get('id') == space_id:
                            ref.child(key).update({'current_occupancy': occupancy})
                            break
        
        except Exception as e:
            logger.error(f"Error updating space occupancy: {e}")
    
    def get_dashboard_data(self, company_id: str) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data
        """
        try:
            company_data = self.get_company_data(company_id)
            recent_energy = self.get_energy_data(company_id, 24)
            recent_space = self.get_space_data(company_id, 24)
            active_conflicts = self.get_active_conflicts(company_id)
            recent_predictions = self.get_recent_predictions(company_id, limit=5)
            
            # Calculate summary metrics
            if recent_energy:
                latest_energy = recent_energy[-1]
                total_consumption_24h = sum(e.get('total_consumption', 0) for e in recent_energy)
                avg_efficiency = sum(e.get('efficiency_score', 0) for e in recent_energy) / len(recent_energy)
            else:
                latest_energy = {}
                total_consumption_24h = 0
                avg_efficiency = 0
            
            if recent_space:
                latest_space = recent_space[-1]
                avg_utilization = sum(s.get('overall_utilization', 0) for s in recent_space) / len(recent_space)
            else:
                latest_space = {}
                avg_utilization = 0
            
            return {
                'company': company_data,
                'current_metrics': {
                    'energy_consumption': latest_energy.get('total_consumption', 0),
                    'energy_cost': latest_energy.get('cost_per_hour', 0),
                    'space_utilization': latest_space.get('overall_utilization', 0),
                    'total_occupancy': latest_space.get('total_occupancy', 0),
                    'efficiency_score': latest_energy.get('efficiency_score', 0)
                },
                'trends_24h': {
                    'total_energy_consumption': total_consumption_24h,
                    'average_efficiency': avg_efficiency,
                    'average_utilization': avg_utilization
                },
                'active_conflicts': len(active_conflicts),
                'recent_energy': recent_energy,
                'recent_space': recent_space,
                'conflicts': active_conflicts,
                'ai_predictions': recent_predictions,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error getting dashboard data: {e}")
            return {}
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check service health
        """
        return {
            'status': 'healthy' if self.is_connected else 'disconnected',
            'database_url': self.database_url,
            'timestamp': datetime.now().isoformat(),
            'using_mock': hasattr(self, 'mock_data')
        }

# Initialize global instance
firebase_service = FirebaseService()

# Export for use in Flask app
__all__ = ['FirebaseService', 'firebase_service']