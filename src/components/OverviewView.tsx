import React from 'react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Users, Thermometer, Volume2, Activity, Zap, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface OverviewViewProps {
  occupancyData: any[];
  spaceData: any[];
  environmentalData: any[];
  weeklyTrend: any[];
  zoneHeatmap: any[];
  userType: 'employer' | 'executive';
}

const OverviewView: React.FC<OverviewViewProps> = ({
  occupancyData,
  spaceData,
  environmentalData,
  weeklyTrend,
  zoneHeatmap,
  userType
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overutilized': return '#ef4444';
      case 'optimal': return '#22c55e';
      case 'underutilized': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getZoneColor = (status: string) => {
    switch (status) {
      case 'free': return '#1e40af';
      case 'assigned': return '#60a5fa';
      case 'occupied': return '#6b7280';
      case 'hotdesk': return '#f59e0b';
      default: return '#e5e7eb';
    }
  };

  const getZoneLabel = (status: string) => {
    switch (status) {
      case 'free': return 'Free';
      case 'assigned': return 'Assigned';
      case 'occupied': return 'Occupied';
      case 'hotdesk': return 'Hot Desk';
      default: return 'Unknown';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate alerts based on user type
  const getAlerts = () => {
    const baseAlerts = [
      {
        type: 'warning',
        title: 'High CO2 Levels',
        message: 'Meeting Room B shows elevated CO2 levels (450 ppm)',
        time: '5 minutes ago',
        action: 'Check Ventilation'
      },
      {
        type: 'info',
        title: 'Peak Hours Approaching',
        message: 'Expected 85% utilization in next 2 hours',
        time: '10 minutes ago',
        action: 'Prepare Resources'
      }
    ];

    if (userType === 'executive') {
      return [
        ...baseAlerts,
        {
          type: 'success',
          title: 'Cost Savings Target Met',
          message: 'Monthly savings exceeded target by 15%',
          time: '1 hour ago',
          action: 'View Report'
        }
      ];
    }

    return [
      ...baseAlerts,
      {
        type: 'warning',
        title: 'Desk Assignment Conflict',
        message: '3 employees assigned to same hot desk',
        time: '15 minutes ago',
        action: 'Resolve Conflict'
      }
    ];
  };

  const alerts = getAlerts();

  // Show loading state if no data
  if (!occupancyData.length && !spaceData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200 hover:card-shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Overall Utilization</p>
              <p className="text-3xl font-bold text-deloitte-dark">
                {spaceData.length > 0 ? 
                  (spaceData.reduce((sum, space) => sum + space.current, 0) / 
                   spaceData.reduce((sum, space) => sum + space.capacity, 0) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">↑ 12% from last week</p>
            </div>
            <div className="w-14 h-14 bg-deloitte-primary bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
              <TrendingUp className="w-7 h-7 text-deloitte-primary" />
            </div>
          </div>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend.slice(0, 5)}>
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#86BC25" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200 hover:card-shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-deloitte-dark">
                {spaceData.length > 0 ? spaceData.reduce((sum, space) => sum + space.current, 0) : 0}
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">↑ 8% from yesterday</p>
            </div>
            <div className="w-14 h-14 bg-deloitte-accent bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
              <Users className="w-7 h-7 text-deloitte-accent" />
            </div>
          </div>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spaceData.slice(0, 4)}>
                <Bar dataKey="current" fill="#00A651" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200 hover:card-shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Cost Savings</p>
              <p className="text-3xl font-bold text-deloitte-dark">₹2.4L</p>
              <p className="text-sm text-green-600 font-medium mt-1">↑ ₹45K this month</p>
            </div>
            <div className="w-14 h-14 bg-deloitte-secondary bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
              <Thermometer className="w-7 h-7 text-deloitte-secondary" />
            </div>
          </div>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmentalData.slice(0, 12)}>
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#0076A8" 
                  fill="#0076A8" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200 hover:card-shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Efficiency Score</p>
              <p className="text-3xl font-bold text-deloitte-dark">
                {spaceData.length > 0 ? 
                  (spaceData.reduce((sum, space) => sum + space.efficiency, 0) / spaceData.length).toFixed(0) : '0'}
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">↑ 5 points</p>
            </div>
            <div className="w-14 h-14 bg-yellow-500 bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
              <Zap className="w-7 h-7 text-yellow-600" />
            </div>
          </div>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={[{value: 85, fill: '#f59e0b'}]} innerRadius="60%" outerRadius="90%">
                <RadialBar dataKey="value" fill="#f59e0b" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-deloitte-dark">Recent Alerts</h3>
          <button className="text-sm text-deloitte-primary hover:text-deloitte-accent font-semibold transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start space-x-4 p-5 bg-deloitte-gray-50 rounded-xl hover:bg-deloitte-gray-100 transition-all duration-200 cursor-pointer border border-deloitte-gray-200">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                alert.type === 'warning' ? 'bg-yellow-100' :
                alert.type === 'success' ? 'bg-deloitte-accent bg-opacity-10' : 'bg-deloitte-primary bg-opacity-10'
              }`}>
                {alert.type === 'warning' ? (
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'warning' ? 'text-yellow-600' : ''
                  }`} />
                ) : alert.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-deloitte-accent" />
                ) : (
                  <Activity className="w-5 h-5 text-deloitte-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-deloitte-dark">{alert.title}</h4>
                  <span className="text-xs text-deloitte-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm text-deloitte-gray-600 mt-1">{alert.message}</p>
                <button className="text-sm text-deloitte-primary hover:text-deloitte-accent font-semibold mt-2 transition-colors">
                  {alert.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Occupancy Trend */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-deloitte-dark">24-Hour Occupancy Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-deloitte-primary rounded-full"></div>
                <span className="text-deloitte-gray-600 font-medium">Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-deloitte-gray-600 font-medium">Predicted</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#86BC25" 
                strokeWidth={3}
                dot={{ fill: '#86BC25', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#86BC25', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Utilization Trend */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-deloitte-dark">Weekly Utilization Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-deloitte-primary rounded-full"></div>
                <span className="text-deloitte-gray-600 font-medium">Utilization %</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-deloitte-accent rounded-full"></div>
                <span className="text-deloitte-gray-600 font-medium">Efficiency %</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorUtilization" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86BC25" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#86BC25" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A651" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00A651" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="utilization"
                stroke="#86BC25"
                fillOpacity={1}
                fill="url(#colorUtilization)"
                name="Utilization %"
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="#00A651"
                fillOpacity={1}
                fill="url(#colorEfficiency)"
                name="Efficiency %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Activity Heatmap */}
      <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-deloitte-dark">Zone Activity Heatmap</h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-deloitte-secondary rounded"></div>
                <span className="text-deloitte-gray-600 font-medium">Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-deloitte-primary rounded"></div>
                <span className="text-deloitte-gray-600 font-medium">Assigned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-deloitte-gray-500 rounded"></div>
                <span className="text-deloitte-gray-600 font-medium">Occupied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-deloitte-gray-600 font-medium">Hot Desk</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-1 max-w-4xl mx-auto">
          {zoneHeatmap.map((zone) => (
            <div
              key={zone.id}
              className="aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: getZoneColor(zone.status) }}
              title={`Zone ${zone.id}: ${getZoneLabel(zone.status)}${zone.employee ? ` - ${zone.employee}` : ''}`}
            />
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 bg-deloitte-secondary bg-opacity-10 rounded-xl cursor-pointer hover:bg-opacity-20 transition-all duration-200 border border-deloitte-secondary border-opacity-20">
            <p className="text-2xl font-bold text-deloitte-secondary">
              {zoneHeatmap.filter(z => z.status === 'free').length}
            </p>
            <p className="text-sm text-deloitte-secondary font-semibold">Free Spaces</p>
          </div>
          <div className="p-5 bg-deloitte-primary bg-opacity-10 rounded-xl cursor-pointer hover:bg-opacity-20 transition-all duration-200 border border-deloitte-primary border-opacity-20">
            <p className="text-2xl font-bold text-deloitte-primary">
              {zoneHeatmap.filter(z => z.status === 'assigned').length}
            </p>
            <p className="text-sm text-deloitte-primary font-semibold">Assigned</p>
          </div>
          <div className="p-5 bg-deloitte-gray-100 rounded-xl cursor-pointer hover:bg-deloitte-gray-200 transition-all duration-200 border border-deloitte-gray-300">
            <p className="text-2xl font-bold text-deloitte-gray-700">
              {zoneHeatmap.filter(z => z.status === 'occupied').length}
            </p>
            <p className="text-sm text-deloitte-gray-600 font-semibold">Currently Occupied</p>
          </div>
          <div className="p-5 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-all duration-200 border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-700">
              {zoneHeatmap.filter(z => z.status === 'hotdesk').length}
            </p>
            <p className="text-sm text-yellow-600 font-semibold">Hot Desks Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;