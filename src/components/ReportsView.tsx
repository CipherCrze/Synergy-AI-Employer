import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Calendar, Filter, FileText, TrendingUp, Users, Building2, DollarSign, Clock, Mail, Share2, Printer } from 'lucide-react';
import { apiService } from '../services/api';

interface ReportsViewProps {
  occupancyData: any[];
  spaceData: any[];
  environmentalData: any[];
  weeklyTrend: any[];
  userType: 'employer' | 'executive';
}

const ReportsView: React.FC<ReportsViewProps> = ({
  occupancyData,
  spaceData,
  environmentalData,
  weeklyTrend,
  userType
}) => {
  const [selectedReport, setSelectedReport] = useState('utilization');
  const [dateRange, setDateRange] = useState('month');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Generate report data
  const generateUtilizationReport = () => {
    return {
      title: 'Space Utilization Report',
      summary: {
        avgUtilization: 73.2,
        peakUtilization: 94.5,
        lowUtilization: 42.1,
        totalSpaces: spaceData.length,
        optimalSpaces: spaceData.filter(s => s.status === 'optimal').length,
        underutilizedSpaces: spaceData.filter(s => s.status === 'underutilized').length,
        overutilizedSpaces: spaceData.filter(s => s.status === 'overutilized').length
      },
      trends: weeklyTrend,
      recommendations: [
        'Consider converting 2 meeting rooms to open workspace areas',
        'Implement hot-desking in underutilized zones',
        'Add more collaborative spaces on Floor 2',
        'Optimize HVAC scheduling based on occupancy patterns'
      ]
    };
  };

  const generateCostReport = () => {
    return {
      title: 'Cost Analysis Report',
      summary: {
        totalCost: 2400000,
        costPerEmployee: 48000,
        savings: 360000,
        efficiency: 85.2
      },
      breakdown: [
        { category: 'Real Estate', amount: 1200000, percentage: 50 },
        { category: 'Utilities', amount: 480000, percentage: 20 },
        { category: 'Maintenance', amount: 360000, percentage: 15 },
        { category: 'Technology', amount: 240000, percentage: 10 },
        { category: 'Other', amount: 120000, percentage: 5 }
      ],
      trends: Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        cost: 180000 + Math.random() * 60000,
        savings: 20000 + Math.random() * 20000
      }))
    };
  };

  const generateProductivityReport = () => {
    return {
      title: 'Employee Productivity Report',
      summary: {
        avgProductivity: 78.5,
        highPerformers: 23,
        totalEmployees: 150,
        satisfactionScore: 4.2
      },
      departmentData: [
        { department: 'Engineering', productivity: 82, satisfaction: 4.3, utilization: 75 },
        { department: 'Sales', productivity: 79, satisfaction: 4.1, utilization: 68 },
        { department: 'Marketing', productivity: 76, satisfaction: 4.4, utilization: 72 },
        { department: 'HR', productivity: 74, satisfaction: 4.0, utilization: 65 },
        { department: 'Finance', productivity: 81, satisfaction: 4.2, utilization: 70 }
      ]
    };
  };

  const generateEnvironmentalReport = () => {
    return {
      title: 'Environmental Conditions Report',
      summary: {
        avgTemperature: 22.5,
        avgHumidity: 45.2,
        avgCO2: 420,
        avgNoise: 42.1,
        comfortScore: 87.3
      },
      trends: environmentalData,
      alerts: [
        { type: 'warning', message: 'CO2 levels exceeded 450ppm in Meeting Room B', time: '2 hours ago' },
        { type: 'info', message: 'Temperature optimization saved 12% energy this week', time: '1 day ago' }
      ]
    };
  };

  const getReportData = () => {
    switch (selectedReport) {
      case 'utilization': return generateUtilizationReport();
      case 'cost': return generateCostReport();
      case 'productivity': return generateProductivityReport();
      case 'environmental': return generateEnvironmentalReport();
      default: return generateUtilizationReport();
    }
  };

  const reportData = getReportData();

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);
    
    try {
      const response = await apiService.exportReport(selectedReport, dateRange, reportFormat);
      
      if (response.download_url) {
        window.open(response.download_url, '_blank');
        setExportSuccess(`Report exported successfully as ${response.filename}`);
      } else if (response.data && reportFormat === 'csv') {
        // Handle CSV download
        const csvData = atob(response.data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(`Report exported successfully as ${response.filename}`);
      } else {
        setExportSuccess('Report generated successfully');
      }
    } catch (error) {
      setExportError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleScheduleReport = () => {
    // Implement scheduling logic
    alert('Report scheduling feature will be implemented soon!');
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

  return (
    <div className="space-y-8">
      {/* Report Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600">Generate comprehensive workspace reports</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Report Type */}
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="utilization">Space Utilization</option>
              {userType === 'executive' && <option value="cost">Cost Analysis</option>}
              <option value="productivity">Employee Productivity</option>
              <option value="environmental">Environmental</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            {/* Format */}
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button
                onClick={handleScheduleReport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Success/Error Messages */}
        {exportSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{exportSuccess}</p>
          </div>
        )}
        {exportError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{exportError}</p>
          </div>
        )}
      </div>

      {/* Report Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{reportData.title}</h3>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()} • {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} view</p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Report ID: RPT-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'utilization' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgUtilization}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Peak Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.peakUtilization}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalSpaces}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Optimal Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.optimalSpaces}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Utilization Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Utilization Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.trends}>
                <defs>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="utilization"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#utilizationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-3">
              {reportData.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'cost' && userType === 'executive' && (
        <div className="space-y-8">
          {/* Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(reportData.summary.totalCost / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost per Employee</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(reportData.summary.costPerEmployee / 1000).toFixed(0)}K</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(reportData.summary.savings / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.efficiency}%</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.breakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                  >
                    {reportData.breakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'productivity' && (
        <div className="space-y-8">
          {/* Productivity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Productivity</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgProductivity}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Performers</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.highPerformers}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalEmployees}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.satisfactionScore}/5</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Department Performance</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="department" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="productivity" fill="#3b82f6" name="Productivity %" />
                <Bar dataKey="satisfaction" fill="#22c55e" name="Satisfaction" />
                <Bar dataKey="utilization" fill="#f59e0b" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'environmental' && (
        <div className="space-y-8">
          {/* Environmental Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgTemperature}°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Humidity</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgHumidity}%</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg CO2</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgCO2}ppm</p>
                </div>
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Noise</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.avgNoise}dB</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comfort Score</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.comfortScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Environmental Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Environmental Trends</h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity" />
                <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={2} name="CO2" />
                <Line type="monotone" dataKey="noise" stroke="#f59e0b" strokeWidth={2} name="Noise" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h4>
            <div className="space-y-3">
              {reportData.alerts.map((alert: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;