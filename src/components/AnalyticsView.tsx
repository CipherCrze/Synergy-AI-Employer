import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ComposedChart } from 'recharts';
import { TrendingUp, Users, Clock, Calendar, Filter, Download, RefreshCw, BarChart3, PieChart as PieChartIcon, Activity, Zap } from 'lucide-react';
import { usePredictions, useOptimizationSuggestions } from '../hooks/useApi';
import { apiService } from '../services/api';

interface AnalyticsViewProps {
  occupancyData: any[];
  spaceData: any[];
  environmentalData: any[];
  weeklyTrend: any[];
  userType: 'employer' | 'executive';
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  occupancyData,
  spaceData,
  environmentalData,
  weeklyTrend,
  userType
}) => {
  const [selectedMetric, setSelectedMetric] = useState('utilization');
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('line');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Use API hooks for predictions and optimization
  const {
    data: predictionsResponse,
    loading: predictionsLoading,
    refetch: refetchPredictions
  } = usePredictions(selectedMetric, 7);

  const {
    data: optimizationResponse,
    loading: optimizationLoading,
    refetch: refetchOptimization 
  } = useOptimizationSuggestions();

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Generate advanced analytics data
  const generatePredictiveData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      actual: Math.random() * 80 + 20,
      predicted: Math.random() * 80 + 25,
      confidence: Math.random() * 20 + 80
    }));
  };

  const generateCorrelationData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      utilization: Math.random() * 100,
      satisfaction: Math.random() * 100,
      productivity: Math.random() * 100,
      temperature: 20 + Math.random() * 8
    }));
  };

  const generateDepartmentData = () => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
    return departments.map(dept => ({
      department: dept,
      utilization: Math.random() * 80 + 20,
      efficiency: Math.random() * 90 + 10,
      satisfaction: Math.random() * 100,
      headcount: Math.floor(Math.random() * 50) + 10,
      cost: Math.floor(Math.random() * 100000) + 50000
    }));
  };

  const generateHourlyPatterns = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      monday: Math.random() * 100,
      tuesday: Math.random() * 100,
      wednesday: Math.random() * 100,
      thursday: Math.random() * 100,
      friday: Math.random() * 100,
      saturday: Math.random() * 50,
      sunday: Math.random() * 30
    }));
  };

  const predictiveData = generatePredictiveData();
  const correlationData = generateCorrelationData();
  const departmentData = generateDepartmentData();
  const hourlyPatterns = generateHourlyPatterns();

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      const response = await apiService.exportReport('analytics', timeRange, 'pdf');
      
      // Create download link
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      } else if (response.data) {
        // Handle base64 data download
        const blob = new Blob([atob(response.data)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setExportError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetchPredictions();
    refetchOptimization();
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

  const renderChart = () => {
    const data = selectedMetric === 'utilization' ? weeklyTrend : 
                 selectedMetric === 'occupancy' ? occupancyData :
                 selectedMetric === 'environment' ? environmentalData : weeklyTrend;

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={data === occupancyData ? 'hour' : data === weeklyTrend ? 'day' : 'hour'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={selectedMetric === 'environment' ? 'temperature' : 'utilization'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={data === occupancyData ? 'hour' : data === weeklyTrend ? 'day' : 'hour'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={selectedMetric === 'environment' ? 'temperature' : 'utilization'}
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={data === occupancyData ? 'hour' : data === weeklyTrend ? 'day' : 'hour'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={selectedMetric === 'environment' ? 'temperature' : 'utilization'} 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Analytics Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="utilization">Utilization</option>
                <option value="occupancy">Occupancy</option>
                <option value="environment">Environment</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              disabled={isExporting}
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {exportError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{exportError}</p>
          </div>
        )}
      </div>

      {/* Main Analytics Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Analytics
          </h3>
          <div className="text-sm text-gray-600">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Predictive Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
            {predictionsLoading && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Predicted</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={predictionsResponse?.historical_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="timestamp" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                fill="#e0f2fe"
                stroke="none"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          {predictionsResponse?.model_info && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Model: {predictionsResponse.model_info.name} | Accuracy: {(predictionsResponse.model_info.accuracy * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Correlation Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Utilization vs Satisfaction</h3>
            <div className="text-sm text-gray-600">Correlation: 0.73</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="utilization" 
                stroke="#6b7280" 
                fontSize={12}
                name="Utilization %"
              />
              <YAxis 
                dataKey="satisfaction" 
                stroke="#6b7280" 
                fontSize={12}
                name="Satisfaction %"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />
              <Scatter 
                dataKey="satisfaction" 
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Utilization</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Efficiency</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Satisfaction</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Headcount</th>
                {userType === 'executive' && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost</th>
                )}
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${dept.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{dept.utilization.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{dept.efficiency.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${dept.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{dept.satisfaction.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{dept.headcount}</td>
                  {userType === 'executive' && (
                    <td className="py-3 px-4 text-gray-900">₹{(dept.cost / 1000).toFixed(0)}K</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly Usage Patterns */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Usage Patterns</h3>
          <div className="text-sm text-gray-600">Hourly breakdown by day</div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={hourlyPatterns}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="monday" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="tuesday" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="wednesday" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="thursday" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="friday" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="saturday" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="sunday" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
            <div key={day} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm text-gray-600 capitalize">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;