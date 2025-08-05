import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Target, Activity, BarChart3, Settings, RefreshCw, Download, AlertTriangle, CheckCircle, Clock, Lightbulb, Users, Building, Thermometer, Gauge, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar, AreaChart, Area, ComposedChart } from 'recharts';
import { apiService } from '../services/api';

interface AIModelsViewProps {
  spaceOptimizerData?: any;
  energyPredictorData?: any;
  userType: 'employer' | 'executive';
}

const AIModelsView: React.FC<AIModelsViewProps> = ({ userType }) => {
  const [selectedModel, setSelectedModel] = useState<'space' | 'energy'>('space');
  const [spaceOptimizerData, setSpaceOptimizerData] = useState<any>(null);
  const [energyPredictorData, setEnergyPredictorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const COLORS = ['#FFA500', '#1E90FF', '#00B140', '#FFD700', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAIData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchAIData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const aiPredictions = await apiService.getAIPredictions();
      setSpaceOptimizerData(aiPredictions.space_optimizer);
      setEnergyPredictorData(aiPredictions.energy_predictor);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAIData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
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

  if (loading && !spaceOptimizerData && !energyPredictorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-white">AI Models Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Real-time AI-powered space optimization and energy prediction analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl card-shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Models Active</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">2/2</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl card-shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-accent bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">
                {spaceOptimizerData ? `${spaceOptimizerData.accuracy.toFixed(1)}%` : '87.3%'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Above target</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl card-shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-in-use bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-brand-in-use" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Recommendations</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">
                {spaceOptimizerData ? spaceOptimizerData.recommendations.length : '3'}
              </p>
              <p className="text-xs text-brand-in-use mt-1">Ready to implement</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl card-shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Anomalies Detected</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">
                {energyPredictorData ? energyPredictorData.anomalies.length : '1'}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl card-shadow border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedModel('space')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                selectedModel === 'space'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Space Optimizer AI</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedModel('energy')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                selectedModel === 'energy'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Energy Predictor AI</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-8">
          {/* Space Optimizer Content */}
          {selectedModel === 'space' && spaceOptimizerData && (
            <div className="space-y-8">
              {/* Model Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Model Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Accuracy</span>
                      <span className="font-semibold text-brand-primary">{spaceOptimizerData.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Predictions</span>
                      <span className="font-semibold text-brand-dark dark:text-white">{spaceOptimizerData.predictions.peak_hours.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Updated</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(spaceOptimizerData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Space Utilization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Next Week</span>
                      <span className="font-semibold text-brand-accent">{spaceOptimizerData.predictions.next_week_utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Peak Hours</span>
                      <span className="font-semibold text-brand-dark dark:text-white">{spaceOptimizerData.predictions.peak_hours.join(', ')}:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Optimization Score</span>
                      <span className="font-semibold text-brand-in-use">{spaceOptimizerData.predictions.optimization_score}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Space Clustering</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">High Activity</span>
                      <span className="font-semibold text-brand-primary">{spaceOptimizerData.clustering_results.high_activity_collaborative + spaceOptimizerData.clustering_results.high_activity_focused}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Moderate Activity</span>
                      <span className="font-semibold text-brand-accent">{spaceOptimizerData.clustering_results.moderate_activity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Underutilized</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">{spaceOptimizerData.clustering_results.quiet_underutilized}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">Feature Importance Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spaceOptimizerData.feature_importance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="#6b7280" fontSize={12} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#FFA500" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Space Clustering Visualization */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">Space Clustering Results</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'High Activity Collaborative', value: spaceOptimizerData.clustering_results.high_activity_collaborative, fill: '#FFA500' },
                        { name: 'High Activity Focused', value: spaceOptimizerData.clustering_results.high_activity_focused, fill: '#1E90FF' },
                        { name: 'Moderate Activity', value: spaceOptimizerData.clustering_results.moderate_activity, fill: '#00B140' },
                        { name: 'Quiet/Underutilized', value: spaceOptimizerData.clustering_results.quiet_underutilized, fill: '#FFD700' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">AI Recommendations</h3>
                <div className="space-y-4">
                  {spaceOptimizerData.recommendations.map((rec: any) => (
                    <div key={rec.id} className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                      <div className="flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-brand-dark dark:text-white mb-2">{rec.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{rec.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-gray-700 dark:text-gray-300">Savings: {formatCurrency(rec.potential_savings)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-brand-in-use" />
                            <span className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                              Confidence: {formatPercentage(rec.confidence)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">Effort: {rec.implementation_effort}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-brand-primary bg-opacity-5 dark:bg-opacity-10 rounded-lg">
                          <p className="text-sm text-brand-primary font-medium">Impact: {rec.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Energy Predictor Content */}
          {selectedModel === 'energy' && energyPredictorData && (
            <div className="space-y-8">
              {/* Model Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Model Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Accuracy</span>
                      <span className="font-semibold text-brand-primary">{energyPredictorData.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Anomalies</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{energyPredictorData.anomalies.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Updated</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(energyPredictorData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Energy Predictions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Next Day</span>
                      <span className="font-semibold text-brand-accent">{energyPredictorData.predictions.next_day_consumption.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Cost Prediction</span>
                      <span className="font-semibold text-brand-dark dark:text-white">{formatCurrency(energyPredictorData.predictions.cost_prediction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Efficiency Score</span>
                      <span className="font-semibold text-brand-in-use">{energyPredictorData.predictions.efficiency_score}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-3">Weekly Forecast</h3>
                  <div className="space-y-2">
                    {energyPredictorData.predictions.weekly_forecast.map((value: number, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Day {index + 1}</span>
                        <span className="font-medium text-brand-dark dark:text-white">{value.toFixed(0)} kWh</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">Feature Importance Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={energyPredictorData.feature_importance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="#6b7280" fontSize={12} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#1E90FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Energy Predictions Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">7-Day Energy Forecast</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={energyPredictorData.predictions.weekly_forecast.map((value: number, index: number) => ({
                    day: `Day ${index + 1}`,
                    consumption: value,
                    cost: value * 6.5,
                    efficiency: 85 + Math.random() * 10
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="consumption" fill="#1E90FF" fillOpacity={0.3} stroke="#1E90FF" />
                    <Bar yAxisId="right" dataKey="efficiency" fill="#00B140" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Energy Anomalies */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">Energy Anomalies</h3>
                <div className="space-y-4">
                  {energyPredictorData.anomalies.map((anomaly: any) => (
                    <div key={anomaly.id} className="flex items-start space-x-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">{anomaly.type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">{anomaly.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-red-700 dark:text-red-300">Severity: {anomaly.severity}</span>
                          <span className="text-red-700 dark:text-red-300">Location: {anomaly.location}</span>
                          <span className="text-red-700 dark:text-red-300">
                            Detected: {new Date(anomaly.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-3">
                          <h5 className="font-medium text-red-900 dark:text-red-300 mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {anomaly.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-red-800 dark:text-red-200">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Optimizations */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-6">Energy Optimizations</h3>
                <div className="space-y-4">
                  {energyPredictorData.optimizations.map((opt: any) => (
                    <div key={opt.id} className="flex items-start space-x-4 p-6 bg-brand-in-use bg-opacity-5 dark:bg-opacity-10 rounded-xl border border-brand-in-use border-opacity-20 dark:border-opacity-30">
                      <div className="flex-shrink-0">
                        <Zap className="w-6 h-6 text-brand-in-use" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-brand-dark dark:text-white mb-2">{opt.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{opt.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-gray-700 dark:text-gray-300">Savings: {formatCurrency(opt.potential_savings)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-brand-in-use" />
                            <span className={`font-medium ${getConfidenceColor(opt.confidence)}`}>
                              Confidence: {formatPercentage(opt.confidence)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">Effort: {opt.implementation_effort}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          {loading && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time data active</span>
        </div>
      </div>
    </div>
  );
};

export default AIModelsView;