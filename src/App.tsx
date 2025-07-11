import React, { useState, useEffect } from 'react';
import { Activity, Search, Bell, Filter, Calendar, Download, RefreshCw, User, Settings } from 'lucide-react';
import { apiService } from './services/api';
import { useDashboardSummary, useOccupancyData, useSpaceData, useEnvironmentalData, useWeeklyTrend, useZoneHeatmap } from './hooks/useAPI';
import LoginPage from './components/LoginPage';
import ProfileSidebar from './components/ProfileSidebar';
import OverviewView from './components/OverviewView';
import AnalyticsView from './components/AnalyticsView';
import SpacesView from './components/SpacesView';
import EmployeesView from './components/EmployeesView';
import ReportsView from './components/ReportsView';
import EnergyAnalyticsView from './components/EnergyAnalyticsView';

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
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, refetchOccupancy, refetchSpaces, refetchEnvironmental, refetchWeekly, refetchHeatmap, refetchSummary]);

  const handleLogin = async (type: 'employer' | 'executive', email: string, password: string, companyCode?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password, type, companyCode);
      
      if (response.success) {
        setUser(response.user);
        setUserType(response.user_type as 'employer' | 'executive');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setUserType(null);
      setIsProfileOpen(false);
      setActiveTab('overview');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Synergy AI</h1>
                <p className="text-sm text-gray-600">Workspace Intelligence</p>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search spaces, employees, or analytics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4">
              
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              {/* Filter Button */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>

              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'analytics', 'spaces', 'employees', 'energy', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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