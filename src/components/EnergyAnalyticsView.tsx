import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Zap, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const EnergyAnalyticsView: React.FC = () => {
  const [showMoreImmediate, setShowMoreImmediate] = useState(false);
  const [showMoreMedium, setShowMoreMedium] = useState(false);
  const [showMoreLong, setShowMoreLong] = useState(false);

  // 24-hour consumption data
  const hourlyConsumption = [
    { hour: '00:00', consumption: 45, efficiency: 85 },
    { hour: '01:00', consumption: 42, efficiency: 88 },
    { hour: '02:00', consumption: 40, efficiency: 90 },
    { hour: '03:00', consumption: 38, efficiency: 92 },
    { hour: '04:00', consumption: 36, efficiency: 94 },
    { hour: '05:00', consumption: 35, efficiency: 95 },
    { hour: '06:00', consumption: 48, efficiency: 82 },
    { hour: '07:00', consumption: 65, efficiency: 75 },
    { hour: '08:00', consumption: 85, efficiency: 68 },
    { hour: '09:00', consumption: 95, efficiency: 65 },
    { hour: '10:00', consumption: 100, efficiency: 62 },
    { hour: '11:00', consumption: 105, efficiency: 60 },
    { hour: '12:00', consumption: 110, efficiency: 58 },
    { hour: '13:00', consumption: 108, efficiency: 59 },
    { hour: '14:00', consumption: 112, efficiency: 57 },
    { hour: '15:00', consumption: 115, efficiency: 55 },
    { hour: '16:00', consumption: 118, efficiency: 53 },
    { hour: '17:00', consumption: 120, efficiency: 52 },
    { hour: '18:00', consumption: 95, efficiency: 65 },
    { hour: '19:00', consumption: 75, efficiency: 72 },
    { hour: '20:00', consumption: 65, efficiency: 78 },
    { hour: '21:00', consumption: 55, efficiency: 82 },
    { hour: '22:00', consumption: 50, efficiency: 85 },
    { hour: '23:00', consumption: 47, efficiency: 87 }
  ];

  // Key factors affecting energy consumption
  const keyFactors = [
    { factor: 'Occupancy Level', impact: 85, color: '#4E6EF2' },
    { factor: 'HVAC Usage', impact: 78, color: '#F9AE44' },
    { factor: 'Temperature Control', impact: 72, color: '#10B981' },
    { factor: 'Lighting Systems', impact: 65, color: '#8B5CF6' },
    { factor: 'Equipment Usage', impact: 58, color: '#F59E0B' },
    { factor: 'Time of Day', impact: 52, color: '#EF4444' }
  ];

  // AI Recommendations
  const immediateActions = [
    { title: 'Optimize HVAC Schedule', impact: 'High', savings: '15-20%', description: 'Adjust heating/cooling based on occupancy patterns' },
    { title: 'LED Lighting Upgrade', impact: 'Medium', savings: '10-15%', description: 'Replace remaining fluorescent lights with LED' },
    { title: 'Smart Power Strips', impact: 'Medium', savings: '8-12%', description: 'Eliminate phantom loads from electronics' },
    { title: 'Temperature Setback', impact: 'High', savings: '12-18%', description: 'Implement automated temperature adjustments' }
  ];

  const mediumTermStrategies = [
    { title: 'Smart Building Automation', impact: 'High', savings: '20-25%', roi: '18 months', description: 'Implement IoT sensors for automated control' },
    { title: 'Energy Storage System', impact: 'High', savings: '15-22%', roi: '24 months', description: 'Battery storage for peak shaving' },
    { title: 'Window Film Installation', impact: 'Medium', savings: '8-15%', roi: '12 months', description: 'Reduce solar heat gain' },
    { title: 'Variable Speed Drives', impact: 'Medium', savings: '10-18%', roi: '15 months', description: 'Optimize motor efficiency' }
  ];

  const longTermInvestments = [
    { title: 'Solar Panel Installation', impact: 'Very High', savings: '30-40%', roi: '5-7 years', description: 'Renewable energy generation' },
    { title: 'Geothermal System', impact: 'Very High', savings: '25-35%', roi: '6-8 years', description: 'Ground-source heat pump system' },
    { title: 'Building Envelope Upgrade', impact: 'High', savings: '20-30%', roi: '4-6 years', description: 'Improved insulation and windows' },
    { title: 'Smart Grid Integration', impact: 'High', savings: '15-25%', roi: '3-5 years', description: 'Demand response capabilities' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Energy Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor and optimize energy consumption</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Current: 118 kWh</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Efficiency: 53%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Energy Consumption */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">24-Hour Energy Consumption</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Consumption (kWh)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Efficiency (%)</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyConsumption}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Factors Affecting Energy */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Key Factors Affecting Energy Consumption</h2>
        <div className="space-y-4">
          {keyFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{factor.factor}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{factor.impact}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${factor.impact}%`,
                      backgroundColor: factor.color
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Immediate Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Immediate Actions</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {immediateActions.slice(0, showMoreImmediate ? immediateActions.length : 2).map((action, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    action.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {action.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{action.description}</p>
                <div className="text-xs font-medium text-green-600 dark:text-green-400">
                  Potential Savings: {action.savings}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowMoreImmediate(!showMoreImmediate)}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span>{showMoreImmediate ? 'Show Less' : 'Show More'}</span>
            {showMoreImmediate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Medium-term Strategies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medium-term Strategies</h3>
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {mediumTermStrategies.slice(0, showMoreMedium ? mediumTermStrategies.length : 2).map((strategy, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{strategy.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    strategy.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {strategy.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{strategy.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Savings: {strategy.savings}
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    ROI: {strategy.roi}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowMoreMedium(!showMoreMedium)}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span>{showMoreMedium ? 'Show Less' : 'Show More'}</span>
            {showMoreMedium ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Long-term Investments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Long-term Investments</h3>
            <Lightbulb className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {longTermInvestments.slice(0, showMoreLong ? longTermInvestments.length : 2).map((investment, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{investment.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {investment.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{investment.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Savings: {investment.savings}
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    ROI: {investment.roi}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowMoreLong(!showMoreLong)}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span>{showMoreLong ? 'Show Less' : 'Show More'}</span>
            {showMoreLong ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalyticsView;