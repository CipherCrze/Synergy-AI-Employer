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
}

// Export singleton instance
export const apiService = new ApiService();