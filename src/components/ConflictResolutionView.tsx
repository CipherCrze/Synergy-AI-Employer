import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Users, Zap, Filter, Search, RefreshCw, TrendingDown, MapPin, Calendar, User, Settings, Target, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { spaceOptimizerConflicts, energyPredictorConflicts, resolutionHistory, aiModelMetrics, conflictTrends } from '../data/mockConflicts';

interface ConflictResolutionViewProps {
  userType: 'employer' | 'executive';
}

const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState<'space' | 'energy' | 'history' | 'analytics'>('space');
  const [spaceConflicts, setSpaceConflicts] = useState(spaceOptimizerConflicts);
  const [energyConflicts, setEnergyConflicts] = useState(energyPredictorConflicts);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isResolving, setIsResolving] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleResolveConflict = async (conflictId: number, type: 'space' | 'energy') => {
    setIsResolving(conflictId);
    
    // Simulate resolution process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (type === 'space') {
      setSpaceConflicts(prev => prev.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: 'resolved' }
          : conflict
      ));
    } else {
      setEnergyConflicts(prev => prev.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: 'resolved' }
          : conflict
      ));
    }
    
    setIsResolving(null);
  };

  const filterConflicts = (conflicts: any[]) => {
    return conflicts.filter(conflict => {
      const matchesSeverity = severityFilter === 'all' || conflict.severity.toLowerCase() === severityFilter;
      const matchesSearch = searchTerm === '' || 
        conflict.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conflict.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conflict.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSeverity && matchesSearch && conflict.status === 'unresolved';
    });
  };

  const getUnresolvedCount = (conflicts: any[]) => {
    return conflicts.filter(c => c.status === 'unresolved').length;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const SpaceConflictCard = ({ conflict }: { conflict: any }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getSeverityIcon(conflict.severity)}
          <div>
            <h3 className="font-semibold text-gray-900">{conflict.type}</h3>
            <p className="text-sm text-gray-600">{conflict.location}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(conflict.severity)}`}>
          {conflict.severity}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4">{conflict.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Detected: {conflict.timestamp}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Affected: {conflict.affectedUsers.join(', ')}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Est. Resolution: {conflict.estimatedResolutionTime}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Impact: {conflict.potentialImpact}</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Recommended Action</h4>
        <p className="text-sm text-blue-800">{conflict.recommendedAction}</p>
      </div>

      <button
        onClick={() => handleResolveConflict(conflict.id, 'space')}
        disabled={isResolving === conflict.id}
        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isResolving === conflict.id ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Resolving...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Simulate Resolution</span>
          </>
        )}
      </button>
    </div>
  );

  const EnergyConflictCard = ({ conflict }: { conflict: any }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getSeverityIcon(conflict.severity)}
          <div>
            <h3 className="font-semibold text-gray-900">{conflict.type}</h3>
            <p className="text-sm text-gray-600">{conflict.time}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(conflict.severity)}`}>
          {conflict.severity}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4">{conflict.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Zones: {conflict.affectedZones.join(', ')}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <TrendingDown className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Potential Savings: {conflict.estimatedSavings}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Est. Resolution: {conflict.estimatedResolutionTime}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Current: {conflict.currentUsage} | Limit: {conflict.thresholdLimit}</span>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-green-900 mb-2">Recommended Action</h4>
        <p className="text-sm text-green-800">{conflict.recommendedAction}</p>
      </div>

      <button
        onClick={() => handleResolveConflict(conflict.id, 'energy')}
        disabled={isResolving === conflict.id}
        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isResolving === conflict.id ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Resolving...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Simulate Resolution</span>
          </>
        )}
      </button>
    </div>
  );

  const ConflictTable = ({ conflicts, type }: { conflicts: any[], type: 'space' | 'energy' }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Severity</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Location/Time</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Recommended Action</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status/Action</th>
          </tr>
        </thead>
        <tbody>
          {conflicts.map((conflict) => (
            <tr key={conflict.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(conflict.severity)}
                  <span className="font-medium text-gray-900">{conflict.type}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(conflict.severity)}`}>
                  {conflict.severity}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-900">
                {type === 'space' ? conflict.location : conflict.time}
              </td>
              <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                {conflict.recommendedAction}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleResolveConflict(conflict.id, type)}
                  disabled={isResolving === conflict.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isResolving === conflict.id ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  <span>Resolve</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Conflict Resolution Center</h2>
            <p className="text-gray-600">Real-time conflict detection and resolution recommendations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conflicts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Table
              </button>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Space Conflicts</p>
              <p className="text-2xl font-bold text-orange-600">{getUnresolvedCount(spaceConflicts)}</p>
              <p className="text-sm text-gray-500 mt-1">Unresolved issues</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Energy Conflicts</p>
              <p className="text-2xl font-bold text-red-600">{getUnresolvedCount(energyConflicts)}</p>
              <p className="text-sm text-gray-500 mt-1">Optimization needed</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{resolutionHistory.length}</p>
              <p className="text-sm text-gray-500 mt-1">Successfully handled</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-blue-600">15min</p>
              <p className="text-sm text-gray-500 mt-1">Response time</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('space')}
            className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
              activeTab === 'space'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Space Optimizer AI ({getUnresolvedCount(spaceConflicts)})</span>
          </button>
          <button
            onClick={() => setActiveTab('energy')}
            className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
              activeTab === 'energy'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Energy Predictor AI ({getUnresolvedCount(energyConflicts)})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Resolution History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        <div className="p-6">
          {/* Space Optimizer Conflicts */}
          {activeTab === 'space' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Space Optimizer AI Conflicts</h3>
                <div className="text-sm text-gray-600">
                  {filterConflicts(spaceConflicts).length} conflicts found
                </div>
              </div>
              
              {filterConflicts(spaceConflicts).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Found</h3>
                  <p className="text-gray-600">All space-related issues have been resolved or no conflicts match your filters.</p>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterConflicts(spaceConflicts).map((conflict) => (
                    <SpaceConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              ) : (
                <ConflictTable conflicts={filterConflicts(spaceConflicts)} type="space" />
              )}
            </div>
          )}

          {/* Energy Predictor Conflicts */}
          {activeTab === 'energy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Energy Predictor AI Conflicts</h3>
                <div className="text-sm text-gray-600">
                  {filterConflicts(energyConflicts).length} conflicts found
                </div>
              </div>
              
              {filterConflicts(energyConflicts).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Found</h3>
                  <p className="text-gray-600">All energy-related issues have been resolved or no conflicts match your filters.</p>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterConflicts(energyConflicts).map((conflict) => (
                    <EnergyConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              ) : (
                <ConflictTable conflicts={filterConflicts(energyConflicts)} type="energy" />
              )}
            </div>
          )}

          {/* Resolution History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Resolution History</h3>
              
              <div className="space-y-4">
                {resolutionHistory.map((resolution) => (
                  <div key={resolution.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">{resolution.type}</h4>
                          <p className="text-sm text-gray-600">Resolved by {resolution.resolvedBy} • {resolution.aiModel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{resolution.resolvedAt}</p>
                        <p className="text-xs text-green-600">Completed in {resolution.timeTaken}</p>
                        <p className="text-xs text-blue-600">Success: {resolution.successRate}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 ml-8">{resolution.resolutionAction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900">Conflict Analytics</h3>
              
              {/* AI Model Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Space Optimizer AI Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Conflicts Detected</span>
                      <span className="font-medium">{aiModelMetrics.spaceOptimizer.totalConflictsDetected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved Today</span>
                      <span className="font-medium">{aiModelMetrics.spaceOptimizer.resolvedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">{aiModelMetrics.spaceOptimizer.successRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Resolution Time</span>
                      <span className="font-medium">{aiModelMetrics.spaceOptimizer.averageResolutionTime}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Energy Predictor AI Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Conflicts Detected</span>
                      <span className="font-medium">{aiModelMetrics.energyPredictor.totalConflictsDetected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved Today</span>
                      <span className="font-medium">{aiModelMetrics.energyPredictor.resolvedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">{aiModelMetrics.energyPredictor.successRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Resolution Time</span>
                      <span className="font-medium">{aiModelMetrics.energyPredictor.averageResolutionTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Conflict Trends */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-6">Weekly Conflict Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conflictTrends.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="spaceConflicts" fill="#f59e0b" name="Space Conflicts" />
                    <Bar dataKey="energyConflicts" fill="#ef4444" name="Energy Conflicts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionView;