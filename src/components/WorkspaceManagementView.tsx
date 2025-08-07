import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, User, Building2, TrendingUp, BarChart3, Wifi, Coffee, Monitor, CheckCircle, AlertCircle, XCircle, Plus, Search, Filter, Eye, Check, X, UserCheck, Bell } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface WorkspaceManagementViewProps {
  userType: 'employer' | 'executive';
}

interface Booking {
  id: string;
  seatId: string;
  seatType: string;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  timeSlot: string;
  duration: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  avatar: string;
}

const WorkspaceManagementView: React.FC<WorkspaceManagementViewProps> = ({ userType }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [selectedSeatType, setSelectedSeatType] = useState('workstation');
  const [selectedHotSeat, setSelectedHotSeat] = useState<string | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    address: '',
    inTime: '09:00',
    outTime: '17:00',
    purpose: '',
    hostEmployee: ''
  });

  // Generate mock bookings with employee details
  const generateMockBookings = (): Booking[] => {
    const employees = [
      { name: 'Rajesh Kumar', id: 'DEL001', dept: 'Engineering', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { name: 'Priya Singh', id: 'DEL002', dept: 'Sales', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { name: 'Amit Patel', id: 'DEL003', dept: 'Marketing', avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { name: 'Sneha Gupta', id: 'DEL004', dept: 'HR', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { name: 'Vikram Sharma', id: 'DEL005', dept: 'Finance', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const employee = employees[i % employees.length];
      const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
      const status = statuses[Math.floor(Math.random() * 3)];
      
      return {
        id: `booking_${i + 1}`,
        seatId: `WS-${(i + 1).toString().padStart(3, '0')}`,
        seatType: Math.random() > 0.7 ? 'discussion_room' : 'workstation',
        employeeName: employee.name,
        employeeId: employee.id,
        department: employee.dept,
        date: selectedDate,
        timeSlot: ['09:00', '10:00', '14:00', '15:00'][Math.floor(Math.random() * 4)],
        duration: ['2 hours', '4 hours', '8 hours'][Math.floor(Math.random() * 3)],
        purpose: ['Team Meeting', 'Client Call', 'Focus Work', 'Collaboration'][Math.floor(Math.random() * 4)],
        status,
        requestedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        avatar: employee.avatar
      };
    });
  };

  useEffect(() => {
    setPendingBookings(generateMockBookings());
  }, [selectedDate]);

  // Mock data for seats and bookings
  const workstations = Array.from({ length: 24 }, (_, i) => {
    const bookingForSeat = pendingBookings.find(b => b.seatId === `WS-${(i + 1).toString().padStart(3, '0')}`);
    return {
      id: `WS-${(i + 1).toString().padStart(3, '0')}`,
      type: 'workstation',
      floor: Math.floor(i / 8) + 1,
      status: bookingForSeat ? 
        (bookingForSeat.status === 'approved' ? 'booked' : 
         bookingForSeat.status === 'pending' ? 'pending' : 'available') : 
        (Math.random() > 0.7 ? 'available' : Math.random() > 0.5 ? 'booked' : 'unavailable'),
      employee: bookingForSeat?.employeeName || (Math.random() > 0.5 ? `Employee ${i + 1}` : null),
      booking: bookingForSeat,
      amenities: ['monitor', 'wifi', 'storage']
    };
  });

  const discussionRooms = Array.from({ length: 8 }, (_, i) => {
    const bookingForRoom = pendingBookings.find(b => b.seatId === `DR-${(i + 1).toString().padStart(2, '0')}`);
    return {
      id: `DR-${(i + 1).toString().padStart(2, '0')}`,
      type: 'discussion_room',
      floor: Math.floor(i / 3) + 1,
      capacity: [4, 6, 8, 10][i % 4],
      status: bookingForRoom ? 
        (bookingForRoom.status === 'approved' ? 'booked' : 
         bookingForRoom.status === 'pending' ? 'pending' : 'available') : 
        (Math.random() > 0.7 ? 'available' : Math.random() > 0.5 ? 'booked' : 'unavailable'),
      booking: bookingForRoom,
      amenities: ['projector', 'whiteboard', 'video_conference']
    };
  });

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
      case 'pending': return '#8B5CF6'; // Purple for pending approval
      case 'unavailable': return '#3C3C3C'; // Grey
      default: return '#3C3C3C';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'booked': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'unavailable': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'booked': return 'Booked';
      case 'pending': return 'Pending';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  const handleSeatBooking = (seatId: string) => {
    const seat = [...workstations, ...discussionRooms].find(s => s.id === seatId);
    if (seat?.booking) {
      setSelectedBooking(seat.booking);
      setShowBookingDetails(true);
    } else {
      console.log(`Booking seat ${seatId} for ${selectedDate} at ${selectedTimeSlot}`);
    }
  };

  const handleApproveBooking = (bookingId: string) => {
    setPendingBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'approved' }
        : booking
    ));
    setShowBookingDetails(false);
  };

  const handleRejectBooking = (bookingId: string) => {
    setPendingBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'rejected' }
        : booking
    ));
    setShowBookingDetails(false);
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

  const pendingCount = pendingBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage seat bookings, schedules, and workspace insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Pending Approvals Badge */}
            {userType === 'employer' && pendingCount > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Bookings Section */}
      {userType === 'employer' && pendingBookings.filter(b => b.status === 'pending').length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Booking Approvals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Review and approve employee booking requests</p>
            </div>
          </div>

          <div className="space-y-4">
            {pendingBookings.filter(b => b.status === 'pending').map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <img
                    src={booking.avatar}
                    alt={booking.employeeName}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{booking.employeeName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{booking.employeeId} • {booking.department}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Seat: {booking.seatId}</span>
                      <span>Time: {booking.timeSlot}</span>
                      <span>Duration: {booking.duration}</span>
                      <span>Purpose: {booking.purpose}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingDetails(true);
                    }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApproveBooking(booking.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectBooking(booking.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Booking & Scheduling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Seat Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seat Booking & Scheduling</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSeatType}
                  onChange={(e) => setSelectedSeatType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  <option value="workstation">Workstations</option>
                  <option value="discussion_room">Discussion Rooms</option>
                </select>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4E6EF2' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F9AE44' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
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
                  onClick={() => handleSeatBooking(seat.id)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 cursor-pointer relative ${
                    seat.status === 'available' ? 'hover:scale-105 hover:shadow-md' : 'cursor-pointer'
                  }`}
                  style={{ 
                    backgroundColor: getStatusColor(seat.status),
                    borderColor: getStatusColor(seat.status)
                  }}
                  title={seat.booking ? `${seat.booking.employeeName} (${seat.booking.department})` : getStatusLabel(seat.status)}
                >
                  <div className="text-white text-center">
                    {getStatusIcon(seat.status)}
                    <p className="text-xs font-medium mt-1">{seat.id}</p>
                    {seat.type === 'discussion_room' && (
                      <p className="text-xs opacity-80">{seat.capacity}p</p>
                    )}
                  </div>
                  {seat.booking && seat.status === 'pending' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hot-Seat Booking</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Flexible seating • 2-4 hour slots
              </div>
            </div>

            {/* Hot Seat Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800 transition-colors duration-200">
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
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Visitor Pass</h2>
          
          <form onSubmit={handleVisitorFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visitor Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="tel"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
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
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <textarea
                  value={visitorForm.address}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
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
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
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
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="Employee name or ID"
                required
              />
            </div>

            {/* Visitor Timeline */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors duration-200">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
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
            <div key={level.level} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
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
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors duration-200">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {utilizationStats.reduce((sum, level) => sum + level.occupied, 0)}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Total Occupied</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 transition-colors duration-200">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {utilizationStats.reduce((sum, level) => sum + (level.total - level.occupied), 0)}
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-200">Available</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {Math.round(utilizationStats.reduce((sum, level) => sum + level.utilization, 0) / utilizationStats.length)}%
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">Avg Utilization</p>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Request Details</h2>
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedBooking.avatar}
                  alt={selectedBooking.employeeName}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.employeeName}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{selectedBooking.employeeId} • {selectedBooking.department}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Requested {new Date(selectedBooking.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Booking Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Seat:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBooking.seatId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBooking.seatType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBooking.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBooking.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Purpose</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedBooking.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl transition-colors duration-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Pending Approval</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This booking request is waiting for your approval.
                </p>
              </div>

              {/* Action Buttons */}
              {userType === 'employer' && selectedBooking.status === 'pending' && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleApproveBooking(selectedBooking.id)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Booking</span>
                  </button>
                  <button
                    onClick={() => handleRejectBooking(selectedBooking.id)}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Booking</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManagementView;