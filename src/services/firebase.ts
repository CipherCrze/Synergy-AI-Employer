import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, update, off, Database } from 'firebase/database';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxG",
  authDomain: "synergy-ai-platform.firebaseapp.com",
  databaseURL: "https://synergy-ai-platform-default-rtdb.firebaseio.com",
  projectId: "synergy-ai-platform",
  storageBucket: "synergy-ai-platform.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app);

// Firebase Realtime Database paths
export const FIREBASE_PATHS = {
  // Space Optimizer data
  WORKSPACE_ALLOCATIONS: 'workspaceAllocations',
  BOOKINGS: 'bookings',
  OCCUPANCY_DATA: 'occupancyData',
  DESK_UTILIZATION: 'deskUtilization',
  MEETING_ROOMS: 'meetingRooms',
  
  // Energy Predictor data
  ENERGY_READINGS: 'energyReadings',
  ENERGY_ALERTS: 'energyAlerts',
  ENVIRONMENTAL_DATA: 'environmentalData',
  HVAC_DATA: 'hvacData',
  
  // Shared data
  CONFLICTS: 'conflicts',
  USER_PROFILES: 'userProfiles',
  BOOKING_HISTORY: 'bookingHistory',
  FEEDBACK: 'feedback',
  
  // AI Model outputs
  AI_PREDICTIONS: 'aiPredictions',
  AI_RECOMMENDATIONS: 'aiRecommendations',
  MODEL_METRICS: 'modelMetrics'
};

export interface FirebaseData {
  [key: string]: any;
}

export interface BookingData {
  id: string;
  employeeId: string;
  spaceId: string;
  spaceType: 'desk' | 'meeting_room' | 'hot_seat';
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  timestamp: string;
}

export interface OccupancyData {
  spaceId: string;
  currentOccupancy: number;
  capacity: number;
  utilization: number;
  timestamp: string;
  environmentalFactors: {
    temperature: number;
    humidity: number;
    co2: number;
    noise: number;
  };
}

export interface EnergyReading {
  id: string;
  consumption: number;
  cost: number;
  timestamp: string;
  source: 'hvac' | 'lighting' | 'equipment' | 'total';
  location: string;
}

export interface ConflictData {
  id: string;
  type: 'booking_overlap' | 'overcrowding' | 'energy_spike' | 'environmental_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSpaces: string[];
  resolution: string;
  status: 'detected' | 'resolving' | 'resolved';
  timestamp: string;
  resolvedAt?: string;
}

class FirebaseService {
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      await signInAnonymously(auth);
      console.log('Firebase authenticated successfully');
    } catch (error) {
      console.error('Firebase authentication failed:', error);
    }
  }

  // Generic data operations
  async setData(path: string, data: FirebaseData): Promise<void> {
    try {
      await set(ref(database, path), data);
    } catch (error) {
      console.error(`Error setting data at ${path}:`, error);
      throw error;
    }
  }

  async pushData(path: string, data: FirebaseData): Promise<string> {
    try {
      const newRef = push(ref(database, path));
      await set(newRef, data);
      return newRef.key || '';
    } catch (error) {
      console.error(`Error pushing data to ${path}:`, error);
      throw error;
    }
  }

  async updateData(path: string, updates: FirebaseData): Promise<void> {
    try {
      await update(ref(database, path), updates);
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToData(path: string, callback: (data: any) => void): () => void {
    const dataRef = ref(database, path);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    }, (error) => {
      console.error(`Error listening to ${path}:`, error);
    });

    // Store the unsubscribe function
    this.listeners.set(path, unsubscribe);
    
    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.listeners.delete(path);
    };
  }

  // Space Optimizer specific methods
  async addBooking(booking: BookingData): Promise<string> {
    return this.pushData(FIREBASE_PATHS.BOOKINGS, booking);
  }

  async updateOccupancy(occupancy: OccupancyData): Promise<void> {
    await this.setData(`${FIREBASE_PATHS.OCCUPANCY_DATA}/${occupancy.spaceId}`, occupancy);
  }

  subscribeToBookings(callback: (bookings: BookingData[]) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.BOOKINGS, callback);
  }

  subscribeToOccupancy(callback: (occupancy: { [key: string]: OccupancyData }) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.OCCUPANCY_DATA, callback);
  }

  // Energy Predictor specific methods
  async addEnergyReading(reading: EnergyReading): Promise<string> {
    return this.pushData(FIREBASE_PATHS.ENERGY_READINGS, reading);
  }

  async addEnergyAlert(alert: any): Promise<string> {
    return this.pushData(FIREBASE_PATHS.ENERGY_ALERTS, alert);
  }

  subscribeToEnergyReadings(callback: (readings: EnergyReading[]) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.ENERGY_READINGS, callback);
  }

  subscribeToEnergyAlerts(callback: (alerts: any[]) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.ENERGY_ALERTS, callback);
  }

  // Conflict resolution methods
  async addConflict(conflict: ConflictData): Promise<string> {
    return this.pushData(FIREBASE_PATHS.CONFLICTS, conflict);
  }

  async resolveConflict(conflictId: string, resolution: string): Promise<void> {
    const updates = {
      status: 'resolved',
      resolution,
      resolvedAt: new Date().toISOString()
    };
    await this.updateData(`${FIREBASE_PATHS.CONFLICTS}/${conflictId}`, updates);
  }

  subscribeToConflicts(callback: (conflicts: ConflictData[]) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.CONFLICTS, callback);
  }

  // AI Model outputs
  async updateAIPredictions(predictions: any): Promise<void> {
    await this.setData(FIREBASE_PATHS.AI_PREDICTIONS, predictions);
  }

  async updateAIRecommendations(recommendations: any): Promise<void> {
    await this.setData(FIREBASE_PATHS.AI_RECOMMENDATIONS, recommendations);
  }

  async updateModelMetrics(metrics: any): Promise<void> {
    await this.setData(FIREBASE_PATHS.MODEL_METRICS, metrics);
  }

  subscribeToAIPredictions(callback: (predictions: any) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.AI_PREDICTIONS, callback);
  }

  subscribeToAIRecommendations(callback: (recommendations: any) => void): () => void {
    return this.subscribeToData(FIREBASE_PATHS.AI_RECOMMENDATIONS, callback);
  }

  // Cleanup
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;