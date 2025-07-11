import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { Zap, TrendingUp, DollarSign, Clock, Lightbulb, Thermometer, Activity, AlertTriangle, CheckCircle, Download, RefreshCw, Settings, Target } from 'lucide-react';
import { apiService } from '../services/api';

interface EnergyAnalyticsViewProps {
  userType: 'employer' | 'executive';
}

const EnergyAnalyticsView: React.FC<EnergyAnalyticsViewProps> = ({ userType }) => {
  const [energyData, setEnergyData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchEnergyData();
  }, [selectedTimeRange]);

  const fetchEnergyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboardData, predictionsData, optimizationData, analysisData] = await Promise.all([
        apiService.getEnergyDashboard(),
        apiService.getEnergyPredictions(selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : 720),
        apiService.getEnergyOptimization(),
        apiService.getEnergyAnalysis()
      ]);

      setEnergyData(dashboardData);
      setPredictions(predictionsData);
      setOptimization(optimizationData);
      setAnalysis(analysisData);
    } catch (error) {
      setError('Failed to fetch energy data');
      console.error('Energy data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEnergyData();
    setIsRefreshing(false);
  };

  const handleExport = async () => {
    try {
      await apiService.exportReport('energy', selectedTimeRange, 'pdf');
    } catch (error) {
      console.error('Export error:', error);
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
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} kWh
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading energy analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchEnergyData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Energy Analytics & Optimization</h2>
            <p className="text-gray-600">AI-powered energy consumption analysis and predictions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Next 24 Hours</option>
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Energy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Consumption</p>
              <p className="text-2xl font-bold text-gray-900">{energyData?.current_consumption?.toFixed(1)} kWh</p>
              <p className="text-sm text-green-600 mt-1">↓ 8% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">{energyData?.daily_average?.toFixed(1)} kWh</p>
              <p className="text-sm text-blue-600 mt-1">↑ 3% from last week</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Today</p>
              <p className="text-2xl font-bold text-gray-900">₹{energyData?.cost_today?.toFixed(0)}</p>
              <p className="text-sm text-green-600 mt-1">↓ ₹120 saved</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-green-600 mt-1">↑ 5% improvement</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Energy Predictions Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Energy Consumption Predictions</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Predicted</span>
            </div>
            <div className="text-gray-600">
              Model Accuracy: {predictions?.model_info?.accuracy ? (predictions.model_info.accuracy * 100).toFixed(1) : '87'}%
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictions?.predictions || []}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="hour" 
              stroke="#6b7280" 
              fontSize={12}
              tickFormatter={(value) => `${value}:00`}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="predicted_consumption"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#energyGradient)"
              name="Predicted Consumption"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Pattern and Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hourly Consumption Pattern */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">24-Hour Consumption Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyData?.hourly_pattern || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="average_consumption" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Average Consumption"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Factors Affecting Energy</h3>
          <div className="space-y-4">
            {energyData?.feature_importance?.slice(0, 8).map((feature: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {feature.feature.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(feature.importance * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Optimization Recommendations</h3>
          <div className="text-sm text-gray-600">
            Potential Annual Savings: ₹{optimization?.cost_savings_potential?.long_term_savings?.toLocaleString() || '6,00,000'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Immediate Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Immediate Actions
            </h4>
            {optimization?.immediate_actions?.map((action: any, index: number) => (
              <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">{action.action}</h5>
                <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                <p className="text-sm font-medium text-orange-600">{action.potential_savings}</p>
              </div>
            ))}
          </div>

          {/* Medium-term Strategies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              Medium-term Strategies
            </h4>
            {optimization?.medium_term_strategies?.map((strategy: any, index: number) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">{strategy.strategy}</h5>
                <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                <p className="text-sm font-medium text-blue-600">{strategy.potential_savings}</p>
                <p className="text-xs text-gray-500 mt-1">ROI: {strategy.roi_period}</p>
              </div>
            ))}
          </div>

          {/* Long-term Investments */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Long-term Investments
            </h4>
            {optimization?.long_term_investments?.map((investment: any, index: number) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">{investment.investment}</h5>
                <p className="text-sm text-gray-600 mb-2">{investment.description}</p>
                <p className="text-sm font-medium text-green-600">{investment.potential_savings}</p>
                <p className="text-xs text-gray-500 mt-1">ROI: {investment.roi_period}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Analysis Insights */}
      {analysis && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Energy Consumption Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Temperature Impact</h4>
              <p className="text-sm text-gray-600 mt-1">
                {analysis.analysis?.temperature_correlation ? 
                  `${(analysis.analysis.temperature_correlation * 100).toFixed(1)}% correlation` : 
                  'Moderate correlation'
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Peak Hours</h4>
              <p className="text-sm text-gray-600 mt-1">
                {analysis.analysis?.peak_hours?.slice(0, 3).join(', ') || '9, 14, 16'}:00
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Efficiency Rating</h4>
              <p className="text-sm text-gray-600 mt-1">
                {analysis.insights?.seasonal_patterns ? 'Seasonal optimized' : 'Good efficiency'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyAnalyticsView;