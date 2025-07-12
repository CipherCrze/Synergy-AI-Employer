import React, { useState } from 'react';
import { Brain, Zap, TrendingUp, Target, Activity, BarChart3, PieChart, Settings, RefreshCw, Download, AlertTriangle, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar } from 'recharts';

interface AIModelsViewProps {
  spaceOptimizerData: any;
  energyPredictorData: any;
  userType: 'employer' | 'executive';
}

const AIModelsView: React.FC<AIModelsViewProps> = ({
  spaceOptimizerData,
  energyPredictorData,
  userType
}) => {
  const [selectedModel, setSelectedModel] = useState<'space' | 'energy'>('space');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const COLORS = ['#86BC25', '#0076A8', '#00A651', '#f59e0b', '#ef4444'];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-deloitte-gray-200 rounded-xl shadow-lg">
          <p className="font-semibold text-deloitte-dark mb-2">{label}</p>
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

  if (!spaceOptimizerData || !energyPredictorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-deloitte-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-deloitte-gray-600">Loading AI model analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-deloitte-dark mb-2">AI Models Dashboard</h2>
            <p className="text-deloitte-gray-600">Real-time insights from our advanced machine learning models</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-deloitte-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSelectedModel('space')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedModel === 'space'
                    ? 'bg-white text-deloitte-primary shadow-sm'
                    : 'text-deloitte-gray-600 hover:text-deloitte-dark'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Space Optimizer</span>
              </button>
              <button
                onClick={() => setSelectedModel('energy')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedModel === 'energy'
                    ? 'bg-white text-deloitte-primary shadow-sm'
                    : 'text-deloitte-gray-600 hover:text-deloitte-dark'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Energy Predictor</span>
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2.5 border border-deloitte-gray-300 rounded-xl hover:bg-deloitte-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2.5 deloitte-gradient text-white rounded-xl hover:shadow-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Space Optimizer AI */}
        <div className={`bg-white p-6 rounded-2xl card-shadow border-2 transition-all duration-200 ${
          selectedModel === 'space' ? 'border-deloitte-primary' : 'border-deloitte-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-deloitte-primary bg-opacity-10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-deloitte-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-deloitte-dark">{spaceOptimizerData.model_name}</h3>
                <p className="text-sm text-deloitte-gray-600">Space utilization & optimization</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-deloitte-primary">{(spaceOptimizerData.accuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-deloitte-gray-600">Accuracy</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-deloitte-gray-50 rounded-xl">
              <p className="text-sm text-deloitte-gray-600 mb-1">Next Week Utilization</p>
              <p className="text-xl font-bold text-deloitte-dark">{spaceOptimizerData.predictions.next_week_utilization}%</p>
            </div>
            <div className="p-4 bg-deloitte-gray-50 rounded-xl">
              <p className="text-sm text-deloitte-gray-600 mb-1">Optimization Score</p>
              <p className="text-xl font-bold text-deloitte-dark">{spaceOptimizerData.predictions.optimization_score}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-deloitte-dark">Key Insights</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-deloitte-gray-700">Peak hours: {spaceOptimizerData.predictions.peak_hours.join(', ')}:00</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-deloitte-accent" />
                <span className="text-deloitte-gray-700">{spaceOptimizerData.predictions.underutilized_spaces.length} underutilized spaces identified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Predictor AI */}
        <div className={`bg-white p-6 rounded-2xl card-shadow border-2 transition-all duration-200 ${
          selectedModel === 'energy' ? 'border-deloitte-primary' : 'border-deloitte-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-deloitte-secondary bg-opacity-10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-deloitte-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-deloitte-dark">{energyPredictorData.model_name}</h3>
                <p className="text-sm text-deloitte-gray-600">Energy consumption & optimization</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-deloitte-secondary">{(energyPredictorData.accuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-deloitte-gray-600">Accuracy</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-deloitte-gray-50 rounded-xl">
              <p className="text-sm text-deloitte-gray-600 mb-1">Next Day Consumption</p>
              <p className="text-xl font-bold text-deloitte-dark">{energyPredictorData.predictions.next_day_consumption.toFixed(0)} kWh</p>
            </div>
            <div className="p-4 bg-deloitte-gray-50 rounded-xl">
              <p className="text-sm text-deloitte-gray-600 mb-1">Efficiency Score</p>
              <p className="text-xl font-bold text-deloitte-dark">{energyPredictorData.predictions.efficiency_score}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-deloitte-dark">Key Insights</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-deloitte-accent" />
                <span className="text-deloitte-gray-700">Predicted cost: ₹{energyPredictorData.predictions.cost_prediction.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Lightbulb className="w-4 h-4 text-deloitte-primary" />
                <span className="text-deloitte-gray-700">{energyPredictorData.optimization_suggestions.length} optimization opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {selectedModel === 'space' && (
        <div className="space-y-8">
          
          {/* Space Clustering Results */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
            <h3 className="text-lg font-bold text-deloitte-dark mb-6">Space Clustering Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPieChart.Pie
                      data={[
                        { name: 'High Activity Collaborative', value: spaceOptimizerData.clustering_results.high_activity_collaborative },
                        { name: 'High Activity Focused', value: spaceOptimizerData.clustering_results.high_activity_focused },
                        { name: 'Moderate Activity', value: spaceOptimizerData.clustering_results.moderate_activity },
                        { name: 'Quiet/Underutilized', value: spaceOptimizerData.clustering_results.quiet_underutilized }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {Object.values(spaceOptimizerData.clustering_results).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart.Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-deloitte-dark">Space Categories</h4>
                {Object.entries(spaceOptimizerData.clustering_results).map(([key, value], index) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-deloitte-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-deloitte-dark">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-deloitte-dark">{value as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
            <h3 className="text-lg font-bold text-deloitte-dark mb-6">AI-Generated Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spaceOptimizerData.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-deloitte-primary bg-opacity-5 border border-deloitte-primary border-opacity-20 rounded-xl">
                  <div className="w-6 h-6 bg-deloitte-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <p className="text-sm text-deloitte-dark">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedModel === 'energy' && (
        <div className="space-y-8">
          
          {/* Energy Forecast */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
            <h3 className="text-lg font-bold text-deloitte-dark mb-6">Weekly Energy Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyPredictorData.predictions.weekly_forecast.map((value: number, index: number) => ({
                day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
                consumption: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="consumption" fill="#0076A8" radius={[4, 4, 0, 0]} name="Energy (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Importance */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
            <h3 className="text-lg font-bold text-deloitte-dark mb-6">Feature Importance Analysis</h3>
            <div className="space-y-4">
              {energyPredictorData.feature_importance.map((feature: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-deloitte-dark capitalize">
                    {feature.feature.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-deloitte-gray-200 rounded-full h-2">
                      <div 
                        className="bg-deloitte-secondary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(feature.importance * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-deloitte-dark w-12">
                      {(feature.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
            <h3 className="text-lg font-bold text-deloitte-dark mb-6">Energy Optimization Suggestions</h3>
            <div className="space-y-4">
              {energyPredictorData.optimization_suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-deloitte-secondary bg-opacity-5 border border-deloitte-secondary border-opacity-20 rounded-xl">
                  <div className="w-6 h-6 bg-deloitte-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-deloitte-dark">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Model Performance Metrics */}
      <div className="bg-white p-6 rounded-2xl card-shadow border border-deloitte-gray-200">
        <h3 className="text-lg font-bold text-deloitte-dark mb-6">Model Performance Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h4 className="font-semibold text-deloitte-dark">Space Optimizer AI</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Accuracy</span>
                <span className="text-sm font-bold text-deloitte-dark">{(spaceOptimizerData.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Predictions Generated</span>
                <span className="text-sm font-bold text-deloitte-dark">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Last Updated</span>
                <span className="text-sm font-bold text-deloitte-dark">2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-deloitte-dark">Energy Predictor AI</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Accuracy</span>
                <span className="text-sm font-bold text-deloitte-dark">{(energyPredictorData.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Predictions Generated</span>
                <span className="text-sm font-bold text-deloitte-dark">892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-deloitte-gray-600">Last Updated</span>
                <span className="text-sm font-bold text-deloitte-dark">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelsView;