// API Service for Synergy AI Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

interface AuthTokens {
  access_token: string;
  user: any;
}

class ApiService {
  private authToken: string | null = null;

  constructor() {
    // Load auth token from localStorage
    this.authToken = localStorage.getItem('auth_token');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear auth token if unauthorized
          this.clearAuthToken();
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, user_type: 'admin' }),
    });
    
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuthToken();
    }
  }

  // Dashboard Summary  
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  // Occupancy Data
  async getOccupancyData(timeRange: string = 'today') {
    return this.request(`/data/occupancy?hours=24`);
  }

  // Space Data
  async getSpaceData() {
    return this.request('/data/spaces');
  }

  // Environmental Data
  async getEnvironmentalData() {
    return this.request('/data/environmental');
  }

  // Weekly Trend
  async getWeeklyTrend() {
    return this.request('/data/weekly-trend');
  }

  // Zone Heatmap
  async getZoneHeatmap() {
    return this.request('/data/zone-heatmap');
  }

  // AI Analytics and Predictions
  async getAIPredictions() {
    return this.request('/analytics/predictions');
  }

  async getOptimizationAnalytics() {
    return this.request('/analytics/optimization');
  }

  // Energy APIs
  async getEnergyDashboard() {
    return this.request('/energy/dashboard');
  }

  async getEnergyPredictions(temperature?: number, occupancy?: number) {
    let url = '/energy/predictions';
    const params = new URLSearchParams();
    if (temperature !== undefined) params.append('temperature', temperature.toString());
    if (occupancy !== undefined) params.append('occupancy', occupancy.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return this.request(url);
  }

  async getEnergyOptimization() {
    return this.request('/energy/optimization');
  }

  // Conflicts
  async getConflicts() {
    return this.request('/conflicts');
  }

  async resolveConflict(conflictId: string, resolution: string) {
    return this.request(`/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  // Health check
  async getHealthCheck() {
    return this.request('/health');
  }

  // Additional API methods for hooks
  async getEmployees(params: {
    search?: string;
    department?: string;
    status?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.department) queryParams.append('department', params.department);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/employees${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(url);
  }

  async getDetailedSpaces(params: {
    search?: string;
    status_filter?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/spaces/detailed${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(url);
  }

  async getAlerts(params: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/conflicts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(url);
  }

  async getPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return this.request(`/analytics/predictions?metric=${metricType}&days=${forecastDays}`);
  }

  async getDashboardPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return this.request(`/analytics/predictions?metric=${metricType}&days=${forecastDays}`);
  }

  async getDashboardOptimization(params: {
    category?: string;
    priority?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.priority) queryParams.append('priority', params.priority.toString());
    
    const url = `/analytics/optimization${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(url);
  }

  async getOptimizationSuggestions(params: {
    category?: string;
    priority?: number;
  } = {}) {
    return this.getDashboardOptimization(params);
  }

  async exportReport(reportType: string, timeRange: string = 'week', format: string = 'pdf') {
    return this.request(`/reports/export/${reportType}?time_range=${timeRange}&format=${format}`);
  }

  // Employee management methods
  async addEmployee(employeeData: any) {
    return this.request('/employees/add', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId: number, employeeData: any) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId: number) {
    return this.request(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Space management methods  
  async addSpace(spaceData: any) {
    return this.request('/spaces/add', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
