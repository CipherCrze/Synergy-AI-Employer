// Enhanced Mock API Service for Synergy AI Dashboard
// Complete frontend mock implementation without backend dependencies

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
    
    // Start real-time updates with reduced frequency
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
    return mockDataService.getAlerts(params);
  }

  async getPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return mockDataService.getPredictions(metricType, forecastDays);
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
    return mockDataService.exportReport(reportType, timeRange, format);
  }

  // Employee management methods
  async addEmployee(employeeData: any) {
    return mockDataService.addEmployee(employeeData);
  }

  async updateEmployee(employeeId: number, employeeData: any) {
    return mockDataService.updateEmployee(employeeId, employeeData);
  }

  async deleteEmployee(employeeId: number) {
    return mockDataService.deleteEmployee(employeeId);
  }

  // Space management methods  
  async addSpace(spaceData: any) {
    return mockDataService.addSpace(spaceData);
  }
}

// Export singleton instance
export const apiService = new ApiService();