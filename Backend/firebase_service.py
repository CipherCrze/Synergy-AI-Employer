import firebase_admin
from firebase_admin import credentials, db
import os

FIREBASE_CRED_PATH = os.environ.get('FIREBASE_CRED_PATH', 'firebase-credentials.json')
FIREBASE_DB_URL = os.environ.get('FIREBASE_DB_URL', 'https://your-project-default-rtdb.firebaseio.com/')

# Singleton pattern for Firebase app
firebase_app = None

def initialize_firebase():
    global firebase_app
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CRED_PATH)
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_DB_URL
        })
    return firebase_app

# Data access helpers

def get_db_ref(path):
    initialize_firebase()
    return db.reference(path)

# Occupancy data

def fetch_occupancy_data():
    ref = get_db_ref('occupancyData')
    return ref.get() or {}

def write_occupancy_data(data):
    ref = get_db_ref('occupancyData')
    ref.set(data)

# Booking data

def fetch_booking_data():
    ref = get_db_ref('bookings')
    return ref.get() or {}

def write_booking_data(data):
    ref = get_db_ref('bookings')
    ref.set(data)

# Sensor/environmental data

def fetch_sensor_data():
    ref = get_db_ref('sensorData')
    return ref.get() or {}

def write_sensor_data(data):
    ref = get_db_ref('sensorData')
    ref.set(data)

# Energy readings

def fetch_energy_data():
    ref = get_db_ref('energyReadings')
    return ref.get() or {}

def write_energy_data(data):
    ref = get_db_ref('energyReadings')
    ref.set(data)

# Utility: fetch any path

def fetch_data(path):
    ref = get_db_ref(path)
    return ref.get() or {}

def write_data(path, data):
    ref = get_db_ref(path)
    ref.set(data)