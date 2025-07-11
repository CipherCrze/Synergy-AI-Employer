// API Service for Synergy AI Dashboard
const API_BASE_URL = 'http://localhost:8000'; // Adjust based on your backend URL

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard Summary
  async getDashboardSummary() {
    return this.request('/api/dashboard/summary');
  }

  // Occupancy Data
  async getOccupancyData(timeRange: string = 'today') {
    return this.request(`/api/occupancy?timeRange=${timeRange}`);
  }

  // Space Data
  async getSpaceData() {
    return this.request('/api/spaces');
  }

  // Environmental Data
  async getEnvironmentalData() {
    return this.request('/api/environmental');
  }

  // Weekly Trend
  async getWeeklyTrend() {
    return this.request('/api/trends/weekly');
  }

  // Zone Heatmap
  async getZoneHeatmap() {
    return this.request('/api/zones/heatmap');
  }

  // Employees
  async getEmployees(params: {
    search?: string;
    department?: string;
    status?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/api/employees${queryString ? `?${queryString}` : ''}`);
  }

  // Detailed Spaces
  async getDetailedSpaces(params: {
    search?: string;
    status_filter?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/api/spaces/detailed${queryString ? `?${queryString}` : ''}`);
  }

  // Alerts
  async getAlerts(params: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/api/alerts${queryString ? `?${queryString}` : ''}`);
  }

  // Predictions
  async getPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return this.request(`/api/predictions?metricType=${metricType}&forecastDays=${forecastDays}`);
  }

  // Dashboard Predictions
  async getDashboardPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    return this.request(`/api/dashboard/predictions?metricType=${metricType}&forecastDays=${forecastDays}`);
  }

  // Dashboard Optimization
  async getDashboardOptimization(params: {
    category?: string;
    priority?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/api/dashboard/optimization${queryString ? `?${queryString}` : ''}`);
  }

  // Optimization Suggestions
  async getOptimizationSuggestions(params: {
    category?: string;
    priority?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/api/optimization/suggestions${queryString ? `?${queryString}` : ''}`);
  }

  // Energy Analytics
  async getEnergyData(timeRange: string = 'today') {
    return this.request(`/api/energy?timeRange=${timeRange}`);
  }

  // Reports
  async generateReport(reportType: string, params: any = {}) {
    return this.request('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ reportType, ...params }),
    });
  }

  // Authentication
  async login(credentials: { username: string; password: string; userType: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();