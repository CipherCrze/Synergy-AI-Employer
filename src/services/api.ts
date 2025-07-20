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
  async login(email: string, password: string, userType: string, companyCode?: string) {
    // Mock successful login response - ignore backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const mockUser = {
      id: '1',
      name: userType === 'executive' ? 'Sarah Johnson' : 'Michael Chen',
      email: email,
      role: userType === 'executive' ? 'Chief Executive Officer' : 'HR Manager',
      company: 'Deloitte Digital',
      department: userType === 'executive' ? 'Executive' : 'Human Resources',
      avatar: `https://images.unsplash.com/photo-${userType === 'executive' ? '1494790108755-2616c5e29c5' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
      joinDate: '2022-01-15',
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      employeeId: userType === 'executive' ? 'EXE001' : 'HR001',
      permissions: userType === 'executive' 
        ? ['full_access', 'executive_dashboard', 'strategic_overview', 'cost_analysis']
        : ['manage_employees', 'view_analytics', 'space_allocation', 'reports']
    };

    // Store in localStorage
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    localStorage.setItem('user_type', userType);
    localStorage.setItem('auth_token', 'mock_token_' + Date.now());

    return {
      success: true,
      user: mockUser,
      user_type: userType,
      token: 'mock_token_' + Date.now()
    };
  }

  async logout() {
    // Clear localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
    localStorage.removeItem('auth_token');
    return { success: true };
  }

  // AI Model Analytics - Space Optimizer AI
  async getSpaceOptimizerAnalytics() {
    // Import the AI store to get real-time data
    const { useAIStore } = await import('./aiStore');
    const analytics = useAIStore.getState().getSpaceOptimizerAnalytics();
    return analytics;
  }

  // AI Model Analytics - Energy Predictor AI
  async getEnergyPredictorAnalytics() {
    // Import the AI store to get real-time data
    const { useAIStore } = await import('./aiStore');
    const analytics = useAIStore.getState().getEnergyPredictorAnalytics();
    return analytics;
  }

  // AI Model Analytics - Conflict Resolution
  async getConflictResolutionAnalytics() {
    // Import the AI store to get real-time data
    const { useAIStore } = await import('./aiStore');
    const analytics = useAIStore.getState().getConflictAnalytics();
    return analytics;
  }

  // Real-time AI data
  async getRealTimeAIData() {
    // Import the AI store to get real-time data
    const { useAIStore } = await import('./aiStore');
    const state = useAIStore.getState();
    
    return {
      spaceOptimizer: {
        allocations: state.spaceAllocations,
        recommendations: state.spaceRecommendations,
        metrics: state.spaceOptimizationMetrics
      },
      energyPredictor: {
        predictions: state.energyPredictions,
        anomalies: state.energyAnomalies,
        optimizations: state.energyOptimizations,
        metrics: state.energyMetrics,
        accuracy: state.predictionAccuracy
      },
      conflictResolution: {
        activeConflicts: state.activeConflicts,
        resolvedConflicts: state.resolvedConflicts,
        actions: state.resolutionActions,
        summary: state.conflictSummary
      },
      lastUpdated: state.lastUpdated,
      isLoading: state.isLoading,
      error: state.error
    };
  }

  // AI Model Management
  async initializeAI() {
    const { useAIStore } = await import('./aiStore');
    await useAIStore.getState().initializeAI();
    return { success: true };
  }

  async refreshAIData() {
    const { useAIStore } = await import('./aiStore');
    await useAIStore.getState().refreshData();
    return { success: true };
  }

  async resolveConflict(conflictId: string, resolution: string) {
    const { useAIStore } = await import('./aiStore');
    await useAIStore.getState().resolveConflict(conflictId, resolution);
    return { success: true };
  }

  async addBooking(booking: any) {
    const { useAIStore } = await import('./aiStore');
    const bookingId = await useAIStore.getState().addBooking(booking);
    return { success: true, bookingId };
  }

  async addEnergyReading(reading: any) {
    const { useAIStore } = await import('./aiStore');
    const readingId = await useAIStore.getState().addEnergyReading(reading);
    return { success: true, readingId };
  }
        { feature: "temperature", importance: 0.28 },
        { feature: "time_of_day", importance: 0.18 },
        { feature: "day_of_week", importance: 0.12 },
        { feature: "hvac_usage", importance: 0.07 }
      ],
      optimization_suggestions: [
        "Shift non-critical operations to off-peak hours (savings: ₹45,000/month)",
        "Implement smart temperature control (savings: ₹32,000/month)",
        "Install occupancy sensors (ROI: 14 months)",
        "Upgrade to LED lighting (savings: ₹28,000/month)"
      ]
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();