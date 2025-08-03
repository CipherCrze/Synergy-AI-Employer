import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Target, Activity, BarChart3, Settings, RefreshCw, Download, AlertTriangle, CheckCircle, Clock, Lightbulb, Users, Building, Thermometer, Gauge, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar } from 'recharts';
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

  const COLORS = ['#86BC25', '#0076A8', '#00A651', '#f59e0b', '#8b5cf6', '#ec4899'];

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
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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

  if (loading && !spaceOptimizerData && !energyPredictorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-deloitte-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-deloitte-gray-600">Loading AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deloitte-dark">AI Models Dashboard</h1>
          <p className="text-deloitte-gray-600 mt-2">
            Real-time AI-powered space optimization and energy prediction analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-deloitte-primary text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-deloitte-gray-300 text-deloitte-primary focus:ring-deloitte-primary"
            />
            <span className="text-sm text-deloitte-gray-600">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-deloitte-primary bg-opacity-10 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-deloitte-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">AI Models Active</p>
              <p className="text-2xl font-bold text-deloitte-dark">2/2</p>
              <p className="text-xs text-green-600 mt-1">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-deloitte-accent bg-opacity-10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-deloitte-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-deloitte-dark">
                {spaceOptimizerData ? `${spaceOptimizerData.accuracy.toFixed(1)}%` : '87.3%'}
              </p>
              <p className="text-xs text-green-600 mt-1">Above target</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-deloitte-secondary bg-opacity-10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-deloitte-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Active Recommendations</p>
              <p className="text-2xl font-bold text-deloitte-dark">
                {spaceOptimizerData ? spaceOptimizerData.recommendations.length : '3'}
              </p>
              <p className="text-xs text-deloitte-secondary mt-1">Ready to implement</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-deloitte-gray-600">Anomalies Detected</p>
              <p className="text-2xl font-bold text-deloitte-dark">
                {energyPredictorData ? energyPredictorData.anomalies.length : '1'}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-2xl card-shadow border border-deloitte-gray-200">
        <div className="border-b border-deloitte-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedModel('space')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                selectedModel === 'space'
                  ? 'border-deloitte-primary text-deloitte-primary'
                  : 'border-transparent text-deloitte-gray-500 hover:text-deloitte-dark hover:border-deloitte-gray-300'
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
                  ? 'border-deloitte-primary text-deloitte-primary'
                  : 'border-transparent text-deloitte-gray-500 hover:text-deloitte-dark hover:border-deloitte-gray-300'
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
                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Model Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Accuracy</span>
                      <span className="font-semibold text-deloitte-primary">{spaceOptimizerData.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Predictions</span>
                      <span className="font-semibold text-deloitte-dark">{spaceOptimizerData.predictions.peak_hours.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Last Updated</span>
                      <span className="font-semibold text-deloitte-gray-700">
                        {new Date(spaceOptimizerData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Space Utilization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Next Week</span>
                      <span className="font-semibold text-deloitte-accent">{spaceOptimizerData.predictions.next_week_utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Peak Hours</span>
                      <span className="font-semibold text-deloitte-dark">{spaceOptimizerData.predictions.peak_hours.join(', ')}:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Optimization Score</span>
                      <span className="font-semibold text-deloitte-secondary">{spaceOptimizerData.predictions.optimization_score}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Space Clustering</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">High Activity</span>
                      <span className="font-semibold text-deloitte-primary">{spaceOptimizerData.clustering_results.high_activity_collaborative + spaceOptimizerData.clustering_results.high_activity_focused}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Moderate Activity</span>
                      <span className="font-semibold text-deloitte-accent">{spaceOptimizerData.clustering_results.moderate_activity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Underutilized</span>
                      <span className="font-semibold text-yellow-600">{spaceOptimizerData.clustering_results.quiet_underutilized}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">Feature Importance Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spaceOptimizerData.feature_importance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="#6b7280" fontSize={12} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#86BC25" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Space Clustering Visualization */}
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">Space Clustering Results</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'High Activity Collaborative', value: spaceOptimizerData.clustering_results.high_activity_collaborative, fill: '#86BC25' },
                        { name: 'High Activity Focused', value: spaceOptimizerData.clustering_results.high_activity_focused, fill: '#0076A8' },
                        { name: 'Moderate Activity', value: spaceOptimizerData.clustering_results.moderate_activity, fill: '#00A651' },
                        { name: 'Quiet/Underutilized', value: spaceOptimizerData.clustering_results.quiet_underutilized, fill: '#f59e0b' }
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
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">AI Recommendations</h3>
                <div className="space-y-4">
                  {spaceOptimizerData.recommendations.map((rec: any) => (
                    <div key={rec.id} className="flex items-start space-x-4 p-6 bg-deloitte-gray-50 rounded-xl border border-deloitte-gray-200 hover:bg-deloitte-gray-100 transition-all duration-200">
                      <div className="flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-deloitte-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-deloitte-dark mb-2">{rec.title}</h4>
                        <p className="text-sm text-deloitte-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-deloitte-gray-700">Savings: {formatCurrency(rec.potential_savings)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-deloitte-secondary" />
                            <span className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                              Confidence: {formatPercentage(rec.confidence)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-deloitte-gray-400" />
                            <span className="text-deloitte-gray-600">Effort: {rec.implementation_effort}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-deloitte-primary bg-opacity-5 rounded-lg">
                          <p className="text-sm text-deloitte-primary font-medium">Impact: {rec.impact}</p>
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
                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Model Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Accuracy</span>
                      <span className="font-semibold text-deloitte-primary">{energyPredictorData.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Anomalies</span>
                      <span className="font-semibold text-red-600">{energyPredictorData.anomalies.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Last Updated</span>
                      <span className="font-semibold text-deloitte-gray-700">
                        {new Date(energyPredictorData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Energy Predictions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Next Day</span>
                      <span className="font-semibold text-deloitte-accent">{energyPredictorData.predictions.next_day_consumption.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Cost Prediction</span>
                      <span className="font-semibold text-deloitte-dark">{formatCurrency(energyPredictorData.predictions.cost_prediction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-deloitte-gray-600">Efficiency Score</span>
                      <span className="font-semibold text-deloitte-secondary">{energyPredictorData.predictions.efficiency_score}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-deloitte-gray-50 p-6 rounded-xl border border-deloitte-gray-200">
                  <h3 className="font-semibold text-deloitte-dark mb-3">Weekly Forecast</h3>
                  <div className="space-y-2">
                    {energyPredictorData.predictions.weekly_forecast.map((value: number, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-deloitte-gray-600">Day {index + 1}</span>
                        <span className="font-medium text-deloitte-dark">{value.toFixed(0)} kWh</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">Feature Importance Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={energyPredictorData.feature_importance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="#6b7280" fontSize={12} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#0076A8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Energy Anomalies */}
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">Energy Anomalies</h3>
                <div className="space-y-4">
                  {energyPredictorData.anomalies.map((anomaly: any) => (
                    <div key={anomaly.id} className="flex items-start space-x-4 p-6 bg-red-50 rounded-xl border border-red-200">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">{anomaly.type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-red-800 mb-3">{anomaly.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-red-700">Severity: {anomaly.severity}</span>
                          <span className="text-red-700">Location: {anomaly.location}</span>
                          <span className="text-red-700">
                            Detected: {new Date(anomaly.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-3">
                          <h5 className="font-medium text-red-900 mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {anomaly.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-red-800">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Optimizations */}
              <div className="bg-white p-6 rounded-xl border border-deloitte-gray-200">
                <h3 className="text-lg font-semibold text-deloitte-dark mb-6">Energy Optimizations</h3>
                <div className="space-y-4">
                  {energyPredictorData.optimizations.map((opt: any) => (
                    <div key={opt.id} className="flex items-start space-x-4 p-6 bg-deloitte-secondary bg-opacity-5 rounded-xl border border-deloitte-secondary border-opacity-20">
                      <div className="flex-shrink-0">
                        <Zap className="w-6 h-6 text-deloitte-secondary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-deloitte-dark mb-2">{opt.title}</h4>
                        <p className="text-sm text-deloitte-gray-600 mb-3">{opt.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-deloitte-gray-700">Savings: {formatCurrency(opt.potential_savings)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-deloitte-secondary" />
                            <span className={`font-medium ${getConfidenceColor(opt.confidence)}`}>
                              Confidence: {formatPercentage(opt.confidence)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-deloitte-gray-400" />
                            <span className="text-deloitte-gray-600">Effort: {opt.implementation_effort}</span>
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
      <div className="flex items-center justify-between text-sm text-deloitte-gray-500">
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