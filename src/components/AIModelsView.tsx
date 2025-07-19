import React, { useState, useEffect } from 'react';
import { useAIStore } from '../services/aiStore';
import { apiService } from '../services/api';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Activity,
  Lightbulb,
  Shield,
  Users,
  Building,
  Thermometer,
  Gauge,
  DollarSign
} from 'lucide-react';

const AIModelsView: React.FC = () => {
  const {
    spaceAllocations,
    spaceRecommendations,
    spaceOptimizationMetrics,
    energyPredictions,
    energyAnomalies,
    energyOptimizations,
    energyMetrics,
    predictionAccuracy,
    activeConflicts,
    resolvedConflicts,
    resolutionActions,
    conflictSummary,
    isLoading,
    lastUpdated,
    error,
    initializeAI,
    refreshData,
    resolveConflict
  } = useAIStore();

  const [selectedModel, setSelectedModel] = useState<'space' | 'energy' | 'conflicts'>('space');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    initializeAI();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        refreshData();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      await resolveConflict(conflictId, resolution);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Models Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time AI-powered space optimization and energy prediction
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Models Active</p>
              <p className="text-2xl font-bold text-gray-900">3/3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Conflicts</p>
              <p className="text-2xl font-bold text-gray-900">{activeConflicts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">{energyAnomalies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{predictionAccuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedModel('space')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedModel === 'space'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Space Optimizer</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedModel('energy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedModel === 'energy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Energy Predictor</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedModel('conflicts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedModel === 'conflicts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Conflict Resolution</span>
                {activeConflicts.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {activeConflicts.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Space Optimizer Content */}
          {selectedModel === 'space' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Space Utilization</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {spaceOptimizationMetrics?.averageUtilization ? 
                      formatPercentage(spaceOptimizationMetrics.averageUtilization) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {spaceOptimizationMetrics?.totalSpaces || 0} total spaces
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Environmental Score</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {spaceOptimizationMetrics?.averageEnvironmentalScore?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average across all spaces</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {spaceRecommendations.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Active optimizations</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Optimization Recommendations</h3>
                </div>
                <div className="p-4 space-y-4">
                  {spaceRecommendations.length > 0 ? (
                    spaceRecommendations.map((rec) => (
                      <div key={rec.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Potential savings: {formatCurrency(rec.potentialSavings)}
                            </span>
                            <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                              Confidence: {formatPercentage(rec.confidence)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Effort: {rec.implementationEffort}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No active recommendations</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Energy Predictor Content */}
          {selectedModel === 'energy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Total Consumption</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {energyMetrics.totalConsumption.toFixed(0)} kWh
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Current period</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Total Cost</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(energyMetrics.totalCost)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Current period</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Efficiency Score</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {energyMetrics.efficiencyScore.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Out of 100</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Carbon Footprint</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {energyMetrics.carbonFootprint.toFixed(0)} kg CO₂
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Current period</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Energy Anomalies</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {energyAnomalies.length > 0 ? (
                      energyAnomalies.map((anomaly) => (
                        <div key={anomaly.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{anomaly.description}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {anomaly.location} • {anomaly.source} • {anomaly.deviation.toFixed(1)}% deviation
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No anomalies detected</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Energy Optimizations</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {energyOptimizations.length > 0 ? (
                      energyOptimizations.map((opt) => (
                        <div key={opt.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{opt.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{opt.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                Savings: {formatCurrency(opt.potentialSavings)}
                              </span>
                              <span className={`text-xs font-medium ${getConfidenceColor(opt.confidence)}`}>
                                {formatPercentage(opt.confidence)} confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No optimizations available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conflict Resolution Content */}
          {selectedModel === 'conflicts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Total Conflicts</h3>
                  <p className="text-2xl font-bold text-gray-900">{conflictSummary.totalConflicts}</p>
                  <p className="text-sm text-gray-600 mt-1">All time</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Active Conflicts</h3>
                  <p className="text-2xl font-bold text-red-600">{conflictSummary.activeConflicts}</p>
                  <p className="text-sm text-gray-600 mt-1">Requiring attention</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Resolution Rate</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(conflictSummary.resolvedConflicts / Math.max(conflictSummary.totalConflicts, 1))}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Success rate</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Avg Resolution Time</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {conflictSummary.averageResolutionTime.toFixed(0)} min
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Active Conflicts</h3>
                </div>
                <div className="p-4 space-y-3">
                  {activeConflicts.length > 0 ? (
                    activeConflicts.map((conflict) => (
                      <div key={conflict.id} className="flex items-start justify-between space-x-4 p-4 bg-red-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-gray-900">{conflict.description}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(conflict.severity)}`}>
                              {conflict.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Affected spaces: {conflict.affectedSpaces.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Detected: {new Date(conflict.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleResolveConflict(conflict.id, 'Manually resolved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No active conflicts</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          {isLoading && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-600">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModelsView;