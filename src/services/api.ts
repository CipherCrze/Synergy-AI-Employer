// Mock API Service for Synergy AI Dashboard
// Replaces backend API calls with frontend mock data

import { mockDataService } from './mockData';

interface AuthTokens {
  access_token: string;
  user: any;
}

class ApiService {
  private authToken: string | null = null;

  constructor() {
    // Load auth token from localStorage
    this.authToken = localStorage.getItem('auth_token');
    
    // Start real-time updates
    mockDataService.startRealTimeUpdates();
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await mockDataService.login(email, password);
    
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await mockDataService.logout();
    } finally {
      this.clearAuthToken();
    }
  }

  // Dashboard Summary  
  async getDashboardSummary() {
    return mockDataService.getDashboardSummary();
  }

  // Occupancy Data
  async getOccupancyData(timeRange: string = 'today') {
    return mockDataService.getOccupancyData(timeRange);
  }

  // Space Data
  async getSpaceData() {
    return mockDataService.getSpaceData();
  }

  // Environmental Data
  async getEnvironmentalData() {
    return mockDataService.getEnvironmentalData();
  }

  // Weekly Trend
  async getWeeklyTrend() {
    return mockDataService.getWeeklyTrend();
  }

  // Zone Heatmap
  async getZoneHeatmap() {
    return mockDataService.getZoneHeatmap();
  }

  // AI Analytics and Predictions
  async getAIPredictions() {
    return mockDataService.getAIPredictions();
  }

  async getOptimizationAnalytics() {
    return mockDataService.getOptimizationAnalytics();
  }

  // Energy APIs
  async getEnergyDashboard() {
    return mockDataService.getEnergyDashboard();
  }

  async getEnergyPredictions(hours: number = 24) {
    return mockDataService.getEnergyPredictions(hours);
  }

  async getEnergyOptimization() {
    return mockDataService.getEnergyOptimization();
  }

  // Conflicts
  async getConflicts() {
    return mockDataService.getConflicts();
  }

  async resolveConflict(conflictId: string, resolution: string) {
    return mockDataService.resolveConflict(conflictId, resolution);
  }

  // Employee management
  async getEmployees(params: {
    search?: string;
    department?: string;
    status?: string;
    limit?: number;
  } = {}) {
    return mockDataService.getEmployees(params);
  }

  async getDetailedSpaces(params: {
    search?: string;
    status_filter?: string;
    limit?: number;
  } = {}) {
    return mockDataService.getDetailedSpaces(params);
  }

  async getAlerts(params: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}) {
    // Mock alerts data
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const alerts = [
      {
        alert_id: 'ALERT_001',
        severity: 'high',
        title: 'High CO2 Levels',
        description: 'Meeting Room B shows elevated CO2 levels (450 ppm)',
        affected_spaces: ['Meeting Room B'],
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        alert_id: 'ALERT_002',
        severity: 'medium',
        title: 'Hot Seat Conflict',
        description: 'Double booking detected for Hot Seat 2.05',
        affected_spaces: ['Hot Seat 2.05'],
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];
    
    return alerts;
  }

  async getPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const predictions = [];
    for (let i = 1; i <= forecastDays; i++) {
      const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const baseValue = 75 + 10 * Math.sin(2 * Math.PI * i / 7);
      const value = baseValue + (Math.random() - 0.5) * 10;
      
      predictions.push({
        timestamp: futureDate.toISOString(),
        value: Math.max(0, Math.min(100, value)),
        predicted: true
      });
    }
    
    return {
      historical_data: predictions.slice(-7),
      prediction_model: {
        model_name: "LSTM_Space_Predictor_v2.1",
        accuracy: 0.87,
        confidence: 0.82,
        predictions
      },
      metadata: {
        metric_type: metricType,
        forecast_period: forecastDays,
        model_last_trained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  async getDashboardPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return this.getPredictions(metricType, forecastDays);
  }

  async getDashboardOptimization(params: any = {}) {
    return this.getOptimizationAnalytics();
  }

  async getOptimizationSuggestions(params: any = {}) {
    return this.getOptimizationAnalytics();
  }

  async exportReport(reportType: string, timeRange: string = 'week', format: string = 'pdf') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      file_type: format,
      filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`,
      summary: {
        total_records: 100,
        generated_at: new Date().toISOString(),
        time_range: timeRange
      },
      download_url: `#download-${reportType}-${format}`
    };
  }

  // Employee management methods
  async addEmployee(employeeData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      employee: {
        id: Math.floor(Math.random() * 9999) + 1000,
        ...employeeData,
        created_at: new Date().toISOString()
      },
      message: "Employee added successfully"
    };
  }

  async updateEmployee(employeeId: number, employeeData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      employee: {
        id: employeeId,
        ...employeeData,
        updated_at: new Date().toISOString()
      },
      message: "Employee updated successfully"
    };
  }

  async deleteEmployee(employeeId: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: "Employee deleted successfully",
      deleted_employee_id: employeeId
    };
  }

  // Space management methods  
  async addSpace(spaceData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      space: {
        id: Math.floor(Math.random() * 9999) + 1000,
        ...spaceData,
        created_at: new Date().toISOString()
      },
      message: "Space added successfully"
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();