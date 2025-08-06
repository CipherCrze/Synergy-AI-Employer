import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, User, Building2, TrendingUp, BarChart3, Wifi, Coffee, Monitor, CheckCircle, AlertCircle, XCircle, Plus, Search, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface WorkspaceManagementViewProps {
  userType: 'employer' | 'executive';
}

const WorkspaceManagementView: React.FC<WorkspaceManagementViewProps> = ({ userType }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [selectedSeatType, setSelectedSeatType] = useState('workstation');
  const [selectedHotSeat, setSelectedHotSeat] = useState<string | null>(null);
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    address: '',
    inTime: '09:00',
    outTime: '17:00',
    purpose: '',
    hostEmployee: ''
  });

  // Mock data for seats and bookings
  const workstations = Array.from({ length: 24 }, (_, i) => ({
    id: `WS-${(i + 1).toString().padStart(3, '0')}`,
    type: 'workstation',
    floor: Math.floor(i / 8) + 1,
    status: Math.random() > 0.6 ? 'available' : Math.random() > 0.5 ? 'booked' : 'unavailable',
    employee: Math.random() > 0.5 ? `Employee ${i + 1}` : null,
    amenities: ['monitor', 'wifi', 'storage']
  }));

  const discussionRooms = Array.from({ length: 8 }, (_, i) => ({
    id: `DR-${(i + 1).toString().padStart(2, '0')}`,
    type: 'discussion_room',
    floor: Math.floor(i / 3) + 1,
    capacity: [4, 6, 8, 10][i % 4],
    status: Math.random() > 0.7 ? 'available' : Math.random() > 0.5 ? 'booked' : 'unavailable',
    amenities: ['projector', 'whiteboard', 'video_conference']
  }));

  const hotSeats = Array.from({ length: 16 }, (_, i) => ({
    id: `HS-${(i + 1).toString().padStart(2, '0')}`,
    type: 'hot_seat',
    floor: Math.floor(i / 6) + 1,
    status: Math.random() > 0.5 ? 'available' : Math.random() > 0.7 ? 'booked' : 'unavailable',
    timeSlots: ['09:00-12:00', '12:00-15:00', '15:00-18:00']
  }));

  // Time slots for scheduling
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 6 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Mock insights data
  const optimalBookingTimes = [
    { time: '09:00', bookings: 85, productivity: 92 },
    { time: '10:00', bookings: 78, productivity: 88 },
    { time: '11:00', bookings: 65, productivity: 85 },
    { time: '14:00', bookings: 72, productivity: 82 },
    { time: '15:00', bookings: 68, productivity: 79 },
    { time: '16:00', bookings: 45, productivity: 75 }
  ];

  const teamProductivity = [
    { team: 'Engineering', productivity: 87, utilization: 92 },
    { team: 'Sales', productivity: 82, utilization: 78 },
    { team: 'Marketing', productivity: 79, utilization: 85 },
    { team: 'HR', productivity: 75, utilization: 68 }
  ];

  const utilizationStats = [
    { level: 'Floor 1', utilization: 85, total: 40, occupied: 34 },
    { level: 'Floor 2', utilization: 72, total: 35, occupied: 25 },
    { level: 'Floor 3', utilization: 68, total: 30, occupied: 20 },
    { level: 'Hot Seats', utilization: 45, total: 16, occupied: 7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4E6EF2'; // Blue
      case 'booked': return '#F9AE44'; // Orange  
      case 'unavailable': return '#3C3C3C'; // Grey
      default: return '#3C3C3C';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'booked': return <AlertCircle className="w-4 h-4" />;
      case 'unavailable': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const handleSeatBooking = (seatId: string) => {
    // Handle seat booking logic
    console.log(`Booking seat ${seatId} for ${selectedDate} at ${selectedTimeSlot}`);
  };

  const handleVisitorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Visitor pass created:', visitorForm);
    // Reset form
    setVisitorForm({
      name: '',
      phone: '',
      address: '',
      inTime: '09:00',
      outTime: '17:00',
      purpose: '',
      hostEmployee: ''
    });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage seat bookings, schedules, and workspace insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seat Booking & Scheduling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Seat Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seat Booking & Scheduling</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSeatType}
                  onChange={(e) => setSelectedSeatType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="workstation">Workstations</option>
                  <option value="discussion_room">Discussion Rooms</option>
                </select>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4E6EF2' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F9AE44' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3C3C3C' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unavailable</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
              {(selectedSeatType === 'workstation' ? workstations : discussionRooms).map((seat) => (
                <div
                  key={seat.id}
                  onClick={() => seat.status === 'available' && handleSeatBooking(seat.id)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                    seat.status === 'available' ? 'hover:scale-105 hover:shadow-md' : 'cursor-not-allowed'
                  }`}
                  style={{ 
                    backgroundColor: getStatusColor(seat.status),
                    borderColor: getStatusColor(seat.status)
                  }}
                >
                  <div className="text-white text-center">
                    {getStatusIcon(seat.status)}
                    <p className="text-xs font-medium mt-1">{seat.id}</p>
                    {seat.type === 'discussion_room' && (
                      <p className="text-xs opacity-80">{seat.capacity}p</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Schedule */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
              <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    onClick={() => setSelectedTimeSlot(time)}
                    className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
                      selectedTimeSlot === time
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <p className="text-xs font-medium">{time}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {Math.floor(Math.random() * 5) + 1} free
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hot-Seat Booking Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hot-Seat Booking</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Flexible seating • 2-4 hour slots
              </div>
            </div>

            {/* Hot Seat Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Booking Guidelines</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Maximum 4-hour booking slots</li>
                <li>• Clean desk policy - leave as you found it</li>
                <li>• First-come, first-served basis</li>
                <li>• Cancel if not using to help others</li>
              </ul>
            </div>

            {/* Hot Seat Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {hotSeats.map((seat) => (
                <div
                  key={seat.id}
                  onClick={() => seat.status === 'available' && setSelectedHotSeat(seat.id)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                    selectedHotSeat === seat.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                  } ${
                    seat.status === 'available' ? 'hover:scale-105 hover:shadow-md' : 'cursor-not-allowed'
                  }`}
                  style={{ 
                    backgroundColor: getStatusColor(seat.status),
                    borderColor: getStatusColor(seat.status)
                  }}
                >
                  <div className="text-white text-center">
                    {getStatusIcon(seat.status)}
                    <p className="text-xs font-medium mt-1">{seat.id}</p>
                    <p className="text-xs opacity-80">F{seat.floor}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Hot Seat Details */}
            {selectedHotSeat && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Selected: {selectedHotSeat}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {hotSeats.find(s => s.id === selectedHotSeat)?.timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className="p-3 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{slot}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Available</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visitor Pass Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Visitor Pass</h2>
          
          <form onSubmit={handleVisitorFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visitor Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter visitor name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={visitorForm.address}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter address"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  In Time
                </label>
                <select
                  value={visitorForm.inTime}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, inTime: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeSlots.slice(0, 12).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Out Time
                </label>
                <select
                  value={visitorForm.outTime}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, outTime: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeSlots.slice(6).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose of Visit
              </label>
              <input
                type="text"
                value={visitorForm.purpose}
                onChange={(e) => setVisitorForm(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Meeting, interview, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host Employee
              </label>
              <input
                type="text"
                value={visitorForm.hostEmployee}
                onChange={(e) => setVisitorForm(prev => ({ ...prev, hostEmployee: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Employee name or ID"
                required
              />
            </div>

            {/* Visitor Timeline */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Scheduled Duration</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {visitorForm.inTime} - {visitorForm.outTime}
                  </span>
                </div>
                <div className="flex-1 bg-blue-200 dark:bg-blue-800 h-2 rounded-full">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((parseInt(visitorForm.outTime) - parseInt(visitorForm.inTime)) / 12) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  {parseInt(visitorForm.outTime) - parseInt(visitorForm.inTime)}h
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Generate Visitor Pass
            </button>
          </form>
        </div>
      </div>

      {/* Workspace Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Optimal Booking Times */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimal Booking Times</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best times for productivity</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={optimalBookingTimes}>
              <defs>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4E6EF2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4E6EF2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="productivity"
                stroke="#4E6EF2"
                fillOpacity={1}
                fill="url(#productivityGradient)"
                name="Productivity %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Team Productivity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Productivity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Department performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamProductivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="team" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="productivity" fill="#F9AE44" radius={[4, 4, 0, 0]} name="Productivity %" />
              <Bar dataKey="utilization" fill="#4E6EF2" radius={[4, 4, 0, 0]} name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap-style Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Level-wise Utilization</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time occupancy metrics</p>
          </div>
        </div>

        <div className="space-y-4">
          {utilizationStats.map((level) => (
            <div key={level.level} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{level.level}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{level.utilization}%</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{level.occupied}/{level.total} occupied</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${level.utilization}%`,
                    backgroundColor: level.utilization > 80 ? '#F9AE44' : 
                                   level.utilization > 60 ? '#4E6EF2' : '#3C3C3C'
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {utilizationStats.reduce((sum, level) => sum + level.occupied, 0)}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Total Occupied</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {utilizationStats.reduce((sum, level) => sum + (level.total - level.occupied), 0)}
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-200">Available</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {Math.round(utilizationStats.reduce((sum, level) => sum + level.utilization, 0) / utilizationStats.length)}%
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">Avg Utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagementView;