import React, { useState, useEffect } from 'react';
import { Activity, Search, Bell, RefreshCw, Brain, Zap, Moon, Sun, Building2 } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { apiService } from './services/api';
import { useDashboardSummary, useOccupancyData, useSpaceData, useEnvironmentalData, useWeeklyTrend, useZoneHeatmap } from './hooks/useAPI';
import { useTheme } from './hooks/useTheme';
import LoginPage from './components/LoginPage';
import ProfileSidebar from './components/ProfileSidebar';
import OverviewView from './components/OverviewView';
import AnalyticsView from './components/AnalyticsView';
import SpacesView from './components/SpacesView';
import EmployeesView from './components/EmployeesView';
import ReportsView from './components/ReportsView';
import EnergyAnalyticsView from './components/EnergyAnalyticsView';
import AIModelsView from './components/AIModelsView';
import ConflictResolutionView from './components/ConflictResolutionView';
import WorkspaceManagementView from './components/WorkspaceManagementView';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  department: string;
  avatar: string;
  joinDate: string;
  location: string;
  phone: string;
  employeeId: string;
  permissions: string[];
}

const SpaceOptimizerDashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userType, setUserType] = useState<'employer' | 'executive' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spaceOptimizerData, setSpaceOptimizerData] = useState<any>(null);
  const [energyPredictorData, setEnergyPredictorData] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  // API hooks for real-time data
  const { data: occupancyResponse, refetch: refetchOccupancy } = useOccupancyData(selectedTimeRange);
  const { data: spaceResponse, refetch: refetchSpaces } = useSpaceData();
  const { data: environmentalResponse, refetch: refetchEnvironmental } = useEnvironmentalData();
  const { data: weeklyResponse, refetch: refetchWeekly } = useWeeklyTrend();
  const { data: heatmapResponse, refetch: refetchHeatmap } = useZoneHeatmap();
  const { data: summaryResponse, refetch: refetchSummary } = useDashboardSummary();

  // Extract data from API responses
  const occupancyData = occupancyResponse?.data || [];
  const spaceData = spaceResponse?.data || [];
  const environmentalData = environmentalResponse?.data || [];
  const weeklyTrend = weeklyResponse?.data || [];
  const zoneHeatmap = heatmapResponse?.data || [];

  // Fetch AI model analytics
  useEffect(() => {
    const fetchAIAnalytics = async () => {
      try {
        const [aiPredictions, optimizationAnalytics] = await Promise.all([
          apiService.getAIPredictions(),
          apiService.getOptimizationAnalytics()
        ]);
        setSpaceOptimizerData(aiPredictions.space_optimizer || null);
        setEnergyPredictorData(aiPredictions.energy_predictor || null);
      } catch (error) {
        console.error('Failed to fetch AI analytics:', error);
      }
    };

    if (user) {
      fetchAIAnalytics();
    }
  }, [user]);

  // Check for stored user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    const storedUserType = localStorage.getItem('user_type');
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedUser && storedUserType && storedToken) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType as 'employer' | 'executive');
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      refetchOccupancy();
      refetchSpaces();
      refetchEnvironmental();
      refetchWeekly();
      refetchHeatmap();
      refetchSummary();
    }, 45000); // 45 seconds for stability

    return () => clearInterval(interval);
  }, [user, refetchOccupancy, refetchSpaces, refetchEnvironmental, refetchWeekly, refetchHeatmap, refetchSummary]);

  const handleLogin = async (type: 'employer' | 'executive', email: string, password: string, companyCode?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.access_token && response.user) {
        setUser(response.user);
        setUserType('employer'); // Default to employer for now
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(response.user));
        localStorage.setItem('user_type', 'employer');
        localStorage.setItem('auth_token', response.access_token);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_type');
      localStorage.removeItem('auth_token');
      setUser(null);
      setUserType(null);
      setIsProfileOpen(false);
      setActiveTab('overview');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_type');
      localStorage.removeItem('auth_token');
      setUser(null);
      setUserType(null);
      setIsProfileOpen(false);
      setActiveTab('overview');
    }
  };

  const handleUpdateProfile = (updatedUser: UserData) => {
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  const handleRefresh = () => {
    refetchOccupancy();
    refetchSpaces();
    refetchEnvironmental();
    refetchWeekly();
    refetchHeatmap();
    refetchSummary();
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setSelectedTimeRange(newTimeRange);
  };

  // If not logged in, show login page
  if (!user) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        isLoading={isLoading}
        error={error}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewView
            occupancyData={occupancyData}
            spaceData={spaceData}
            environmentalData={environmentalData}
            weeklyTrend={weeklyTrend}
            zoneHeatmap={zoneHeatmap}
            userType={userType!}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            occupancyData={occupancyData}
            spaceData={spaceData}
            environmentalData={environmentalData}
            weeklyTrend={weeklyTrend}
            userType={userType!}
          />
        );
      case 'spaces':
        return (
          <SpacesView
            spaceData={spaceData}
            zoneHeatmap={zoneHeatmap}
            userType={userType!}
          />
        );
      case 'employees':
        return <EmployeesView userType={userType!} />;
      case 'reports':
        return (
          <ReportsView
            occupancyData={occupancyData}
            spaceData={spaceData}
            environmentalData={environmentalData}
            weeklyTrend={weeklyTrend}
            userType={userType!}
          />
        );
      case 'energy':
        return <EnergyAnalyticsView userType={userType!} />;
      case 'ai-models':
        return (
          <AIModelsView 
            spaceOptimizerData={spaceOptimizerData}
            energyPredictorData={energyPredictorData}
            userType={userType!}
          />
        );
      case 'conflicts':
        return <ConflictResolutionView userType={userType!} />;
      case 'workspace':
        return <WorkspaceManagementView userType={userType!} />;
      default:
        return (
          <OverviewView
            occupancyData={occupancyData}
            spaceData={spaceData}
            environmentalData={environmentalData}
            weeklyTrend={weeklyTrend}
            zoneHeatmap={zoneHeatmap}
            userType={userType!}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-dark dark:text-white">Synergy AI</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Workspace Intelligence</p>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search spaces, employees, or analytics..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-3">
              
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-brand-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-brand-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-brand-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-gray-200"
                />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-brand-dark dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{user.role}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: null },
              { id: 'spaces', label: 'Spaces', icon: null },
              { id: 'employees', label: 'Employees', icon: null },
              { id: 'energy', label: 'Energy', icon: Zap },
              { id: 'ai-models', label: 'AI Models', icon: Brain },
              { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
              { id: 'reports', label: 'Reports', icon: null },
              { id: 'workspace', label: 'Workspace', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-4 border-b-3 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary bg-brand-primary bg-opacity-5'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 transition-colors duration-200">
        {renderActiveView()}
      </main>

      {/* Profile Sidebar */}
      <ProfileSidebar
        user={user}
        userType={userType!}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default SpaceOptimizerDashboard;
