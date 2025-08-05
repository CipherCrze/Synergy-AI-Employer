// Enhanced Mock Data Service for Synergy AI Platform
// Comprehensive mock data to replace backend API calls and Firebase

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  department: string;
  avatar: string;
  joinDate: string;
  location: string;
  phone: string;
  employeeId: string;
  permissions: string[];
}

export interface MockSpace {
  id: number;
  name: string;
  type: string;
  floor: number;
  capacity: number;
  current: number;
  utilization: number;
  efficiency: number;
  status: 'optimal' | 'underutilized' | 'overutilized';
  temperature: number;
  humidity: number;
  noise: number;
  air_quality: number;
  last_cleaned: string;
  next_maintenance: string;
  bookings: number;
  rating: number;
  amenities: string[];
}

export interface MockEmployee {
  id: number;
  emp_ID: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'remote' | 'on_leave';
  location: string;
  phone: string;
  desk_assignment: string;
  last_seen: string;
  hours_today: number;
  hours_week: number;
  productivity: number;
  avatar: string;
  skills: string[];
  projects: number;
  rating: number;
  join_date: string;
}

export interface MockOccupancyData {
  hour: string;
  occupancy: number;
  capacity: number;
  utilization: number;
  predicted: number;
}

export interface MockEnvironmentalData {
  hour: string;
  temperature: number;
  humidity: number;
  co2: number;
  noise: number;
  comfort: number;
}

export interface MockEnergyData {
  hour: string;
  consumption: number;
  cost: number;
  efficiency: number;
  predicted_consumption?: number;
  confidence?: number;
}

export interface MockZoneData {
  id: string;
  row: number;
  col: number;
  status: 'free' | 'assigned' | 'occupied' | 'hotdesk';
  employee?: string;
  temperature: number;
}

class MockDataService {
  private baseTime = new Date();
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  // Mock user data
  private mockUser: MockUser = {
    id: "1",
    name: "Aisha Sharma",
    email: "aisha.sharma@deloitte.com",
    role: "HR Manager",
    company: "Deloitte India",
    department: "Human Resources",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    joinDate: "2022-03-15",
    location: "Mumbai, India",
    phone: "+91 9876543210",
    employeeId: "HR001",
    permissions: ["manage_employees", "view_analytics", "space_allocation"]
  };

  // Generate mock spaces with accurate hotseats
  private generateMockSpaces(): MockSpace[] {
    const spaces: MockSpace[] = [];
    let spaceId = 1;

    // Regular desks (60 spaces)
    for (let floor = 1; floor <= 3; floor++) {
      for (let desk = 1; desk <= 20; desk++) {
        const current = Math.random() > 0.3 ? 1 : 0;
        const utilization = current;
        spaces.push({
          id: spaceId++,
          name: `Desk ${floor}.${desk.toString().padStart(2, '0')}`,
          type: 'desk',
          floor,
          capacity: 1,
          current,
          utilization,
          efficiency: 70 + Math.random() * 25,
          status: utilization > 0.8 ? 'overutilized' : utilization > 0.4 ? 'optimal' : 'underutilized',
          temperature: 20 + Math.random() * 6,
          humidity: 40 + Math.random() * 20,
          noise: 35 + Math.random() * 20,
          air_quality: 70 + Math.random() * 25,
          last_cleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          bookings: Math.floor(Math.random() * 5),
          rating: 3.5 + Math.random() * 1.5,
          amenities: ['wifi', 'monitor', 'storage']
        });
      }
    }

    // Hot seats (30 spaces) - Accurate 2-person capacity
    for (let floor = 1; floor <= 3; floor++) {
      for (let hotdesk = 1; hotdesk <= 10; hotdesk++) {
        const current = Math.floor(Math.random() * 3); // 0-2 people
        const capacity = 2;
        const utilization = current / capacity;
        spaces.push({
          id: spaceId++,
          name: `Hot Seat ${floor}.${hotdesk.toString().padStart(2, '0')}`,
          type: 'hot_seat',
          floor,
          capacity,
          current,
          utilization,
          efficiency: 65 + Math.random() * 30,
          status: utilization > 0.8 ? 'overutilized' : utilization > 0.4 ? 'optimal' : 'underutilized',
          temperature: 20 + Math.random() * 6,
          humidity: 40 + Math.random() * 20,
          noise: 40 + Math.random() * 25,
          air_quality: 70 + Math.random() * 25,
          last_cleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          bookings: Math.floor(Math.random() * 8),
          rating: 3.8 + Math.random() * 1.2,
          amenities: ['wifi', 'flexible_seating', 'power_outlets']
        });
      }
    }

    // Meeting rooms (15 spaces)
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 5; room++) {
        const capacity = [4, 6, 8, 10, 12][room - 1];
        const current = Math.floor(Math.random() * (capacity + 1));
        const utilization = current / capacity;
        spaces.push({
          id: spaceId++,
          name: `Meeting Room ${floor}.${room}`,
          type: 'meeting_room',
          floor,
          capacity,
          current,
          utilization,
          efficiency: 75 + Math.random() * 20,
          status: utilization > 0.8 ? 'overutilized' : utilization > 0.4 ? 'optimal' : 'underutilized',
          temperature: 21 + Math.random() * 4,
          humidity: 45 + Math.random() * 15,
          noise: 30 + Math.random() * 15,
          air_quality: 80 + Math.random() * 15,
          last_cleaned: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          bookings: Math.floor(Math.random() * 6),
          rating: 4.0 + Math.random() * 1.0,
          amenities: ['wifi', 'projector', 'whiteboard', 'video_conference']
        });
      }
    }

    return spaces;
  }

  // Generate mock employees
  private generateMockEmployees(): MockEmployee[] {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
    const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Associate', 'Director'];
    const skills = ['JavaScript', 'React', 'Python', 'Data Analysis', 'Project Management', 'Sales', 'Marketing', 'Design'];
    const names = [
      'Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Gupta', 'Vikram Sharma', 'Anita Reddy',
      'Suresh Nair', 'Kavya Iyer', 'Rohit Joshi', 'Meera Agarwal', 'Arjun Rao', 'Divya Menon',
      'Kiran Desai', 'Pooja Verma', 'Sanjay Pillai', 'Ritu Kapoor', 'Manoj Tiwari', 'Shweta Jain'
    ];
    
    const employees: MockEmployee[] = [];
    
    for (let i = 1; i <= 150; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = Math.random() > 0.1 ? 'active' : ['inactive', 'remote', 'on_leave'][Math.floor(Math.random() * 3)] as any;
      const name = names[Math.floor(Math.random() * names.length)] || `Employee ${i}`;
      
      employees.push({
        id: i,
        emp_ID: `DEL${i.toString().padStart(3, '0')}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@deloitte.com`,
        role,
        department: dept,
        status,
        location: `Floor ${Math.floor(Math.random() * 3) + 1}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        desk_assignment: `WS${Math.floor(Math.random() * 100).toString().padStart(3, '0')}/A${Math.floor(Math.random() * 10) + 1}`,
        last_seen: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        hours_today: Math.random() * 8,
        hours_week: Math.random() * 40,
        productivity: 60 + Math.random() * 40,
        avatar: `https://images.pexels.com/photos/${774909 + (i % 50)}/pexels-photo-${774909 + (i % 50)}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
        skills: skills.slice(0, Math.floor(Math.random() * 4) + 1),
        projects: Math.floor(Math.random() * 6) + 1,
        rating: 3 + Math.random() * 2,
        join_date: new Date(Date.now() - Math.random() * 1460 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return employees;
  }

  // Generate stable occupancy data
  generateOccupancyData(): MockOccupancyData[] {
    const data: MockOccupancyData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourNum = hour.getHours();
      
      // Realistic occupancy pattern
      let baseOccupancy = 30;
      if (hourNum >= 9 && hourNum <= 17) {
        baseOccupancy = 70 + 20 * Math.sin((hourNum - 9) * Math.PI / 8);
      } else if (hourNum >= 7 && hourNum <= 8) {
        baseOccupancy = 40;
      } else if (hourNum >= 18 && hourNum <= 20) {
        baseOccupancy = 35;
      } else {
        baseOccupancy = 15;
      }
      
      const occupancy = Math.max(10, baseOccupancy + (Math.random() - 0.5) * 5); // Reduced volatility
      const predicted = occupancy + (Math.random() - 0.5) * 3; // Reduced prediction variance
      
      data.push({
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        occupancy: Math.round(occupancy),
        capacity: 200,
        utilization: occupancy / 100,
        predicted: Math.max(5, Math.round(predicted))
      });
    }
    
    return data;
  }

  // Generate stable environmental data
  generateEnvironmentalData(): MockEnvironmentalData[] {
    const data: MockEnvironmentalData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourNum = hour.getHours();
      
      // Temperature varies throughout the day
      const baseTemp = 22 + 2 * Math.sin((hourNum - 6) * Math.PI / 12);
      const temperature = baseTemp + (Math.random() - 0.5) * 1; // Reduced variance
      
      // Humidity inversely related to temperature
      const humidity = 60 - (temperature - 22) * 2 + (Math.random() - 0.5) * 5; // Reduced variance
      
      // CO2 increases with occupancy
      const occupancyFactor = hourNum >= 9 && hourNum <= 17 ? 1.5 : 0.5;
      const co2 = 400 + occupancyFactor * 200 + (Math.random() - 0.5) * 50; // Reduced variance
      
      // Noise correlates with occupancy
      const noise = 35 + occupancyFactor * 15 + (Math.random() - 0.5) * 5; // Reduced variance
      
      // Comfort score based on all factors
      const tempComfort = Math.max(0, 100 - Math.abs(temperature - 22) * 10);
      const humidityComfort = Math.max(0, 100 - Math.abs(humidity - 50) * 2);
      const co2Comfort = Math.max(0, 100 - Math.max(0, co2 - 400) * 0.1);
      const comfort = (tempComfort + humidityComfort + co2Comfort) / 3;
      
      data.push({
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        co2: Math.round(co2),
        noise: Math.round(noise),
        comfort: Math.round(comfort)
      });
    }
    
    return data;
  }

  // Generate stable energy data
  generateEnergyData(): MockEnergyData[] {
    const data: MockEnergyData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourNum = hour.getHours();
      
      // Energy consumption pattern
      let baseConsumption = 80;
      if (hourNum >= 8 && hourNum <= 18) {
        baseConsumption = 120 + 30 * Math.sin((hourNum - 8) * Math.PI / 10);
      } else if (hourNum >= 19 && hourNum <= 22) {
        baseConsumption = 90;
      } else {
        baseConsumption = 60;
      }
      
      const consumption = baseConsumption + (Math.random() - 0.5) * 10; // Reduced variance
      const cost = consumption * (10.5 + (Math.random() - 0.5) * 1); // Reduced variance
      const efficiency = 70 + Math.random() * 25;
      const predicted = consumption + (Math.random() - 0.5) * 5; // Reduced variance
      
      data.push({
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        consumption: Math.round(consumption * 10) / 10,
        cost: Math.round(cost * 10) / 10,
        efficiency: Math.round(efficiency),
        predicted_consumption: Math.round(predicted * 10) / 10,
        confidence: 0.8 + Math.random() * 0.15
      });
    }
    
    return data;
  }

  // Generate accurate zone heatmap data with proper hotseats
  generateZoneHeatmap(): MockZoneData[] {
    const zones: MockZoneData[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        const rand = Math.random();
        let status: 'free' | 'assigned' | 'occupied' | 'hotdesk';
        let employee: string | undefined;
        
        // Last 4 columns are hotseats (accurate representation)
        if (col >= 8) {
          if (rand > 0.6) {
            status = 'hotdesk';
            employee = Math.random() > 0.5 ? `EMP ${Math.floor(Math.random() * 999) + 100}` : undefined;
          } else if (rand > 0.4) {
            status = 'occupied';
            employee = `EMP ${Math.floor(Math.random() * 999) + 100}`;
          } else {
            status = 'free';
          }
        } else {
          // Regular desk areas
          if (rand > 0.7) {
            status = 'occupied';
            employee = `EMP ${Math.floor(Math.random() * 999) + 100}`;
          } else if (rand > 0.5) {
            status = 'assigned';
          } else {
            status = 'free';
          }
        }
        
        zones.push({
          id: `${row}-${col}`,
          row,
          col,
          status,
          employee,
          temperature: 20 + Math.random() * 6
        });
      }
    }
    
    return zones;
  }

  // Generate weekly trend data
  generateWeeklyTrend() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const isWeekend = index >= 5;
      const baseUtil = isWeekend ? 20 + Math.random() * 10 : 65 + Math.random() * 15; // Reduced variance
      const baseEff = isWeekend ? 60 + Math.random() * 10 : 80 + Math.random() * 10; // Reduced variance
      const baseSat = isWeekend ? 70 + Math.random() * 10 : 85 + Math.random() * 8; // Reduced variance
      
      return {
        day,
        utilization: Math.round(baseUtil),
        efficiency: Math.round(baseEff),
        satisfaction: Math.round(baseSat)
      };
    });
  }

  // Enhanced AI Model Analytics
  getSpaceOptimizerAnalytics() {
    return {
      modelName: "Space Optimizer AI v2.1",
      accuracy: 87.3,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      predictions: {
        next_week_utilization: 78.5,
        peak_hours: [9, 14, 16],
        underutilized_spaces: ['Meeting Room 1.3', 'Meeting Room 2.4', 'Desk 3.15'],
        optimization_score: 85.2
      },
      clustering_results: {
        high_activity_collaborative: 12,
        high_activity_focused: 18,
        moderate_activity: 25,
        quiet_underutilized: 8
      },
      recommendations: [
        {
          id: 'rec_001',
          title: 'Convert Underutilized Meeting Rooms',
          description: 'Convert 2 low-usage meeting rooms to flexible workspace areas',
          impact: 'Increase space efficiency by 25%',
          confidence: 0.89,
          potential_savings: 15000,
          implementation_effort: 'medium'
        },
        {
          id: 'rec_002',
          title: 'Optimize Hot Desk Allocation',
          description: 'Implement dynamic hot desk allocation based on real-time demand',
          impact: 'Reduce booking conflicts by 40%',
          confidence: 0.82,
          potential_savings: 8000,
          implementation_effort: 'low'
        },
        {
          id: 'rec_003',
          title: 'Environmental Optimization',
          description: 'Adjust HVAC settings in underutilized zones to save energy',
          impact: 'Reduce energy costs by 12%',
          confidence: 0.91,
          potential_savings: 12000,
          implementation_effort: 'low'
        }
      ],
      feature_importance: [
        { feature: 'occupancy_count', importance: 0.35 },
        { feature: 'time_of_day', importance: 0.28 },
        { feature: 'day_of_week', importance: 0.22 },
        { feature: 'environmental_score', importance: 0.15 }
      ]
    };
  }

  getEnergyPredictorAnalytics() {
    return {
      modelName: "Energy Predictor AI v1.8",
      accuracy: 91.2,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      predictions: {
        next_day_consumption: 2847.3,
        weekly_forecast: [2800, 2650, 2750, 2900, 2850, 1200, 1100],
        cost_prediction: 18420,
        efficiency_score: 87.5
      },
      feature_importance: [
        { feature: 'occupancy_count', importance: 0.35 },
        { feature: 'temperature', importance: 0.28 },
        { feature: 'time_of_day', importance: 0.22 },
        { feature: 'hvac_usage', importance: 0.15 }
      ],
      anomalies: [
        {
          id: 'anom_001',
          type: 'consumption_spike',
          severity: 'medium',
          description: 'HVAC consumption 25% above normal in Zone A',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recommendations: ['Check HVAC system settings', 'Verify temperature sensors']
        }
      ],
      optimizations: [
        {
          id: 'opt_001',
          title: 'HVAC Schedule Optimization',
          description: 'Adjust HVAC pre-cooling schedule to reduce peak demand',
          potential_savings: 12000,
          confidence: 0.85,
          implementation_effort: 'low'
        },
        {
          id: 'opt_002',
          title: 'Lighting Control Enhancement',
          description: 'Install occupancy sensors in 15 underutilized areas',
          potential_savings: 8500,
          confidence: 0.78,
          implementation_effort: 'medium'
        }
      ]
    };
  }

  // API simulation methods
  async login(email: string, password: string): Promise<{ access_token: string; user: MockUser }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Always succeed for demo
    return {
      access_token: 'mock_token_' + Date.now(),
      user: this.mockUser
    };
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
  }

  async getDashboardSummary() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const spaces = this.generateMockSpaces();
    const employees = this.generateMockEmployees();
    
    return {
      summary: {
        total_employees: employees.length,
        active_employees: employees.filter(e => e.status === 'active').length,
        total_spaces: spaces.length,
        occupied_spaces: spaces.filter(s => s.current > 0).length,
        active_alerts: Math.floor(Math.random() * 3) + 2, // Reduced alerts
        avg_occupancy: Math.round((spaces.reduce((sum, s) => sum + s.utilization, 0) / spaces.length) * 100 * 10) / 10,
        energy_efficiency: 87.5,
        cost_per_sqft: 45.2,
        sustainability_score: 82.1,
        last_updated: new Date().toISOString()
      }
    };
  }

  async getOccupancyData(timeRange: string = 'today') {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { data: this.generateOccupancyData() };
  }

  async getSpaceData() {
    await new Promise(resolve => setTimeout(resolve, 150));
    const spaces = this.generateMockSpaces();
    
    // Group by type for space data
    const spaceTypes = spaces.reduce((acc, space) => {
      if (!acc[space.type]) {
        acc[space.type] = { current: 0, capacity: 0, count: 0 };
      }
      acc[space.type].current += space.current;
      acc[space.type].capacity += space.capacity;
      acc[space.type].count += 1;
      return acc;
    }, {} as any);

    const spaceData = Object.entries(spaceTypes).map(([type, data]: [string, any]) => ({
      name: type.replace('_', ' '),
      current: data.current,
      capacity: data.capacity,
      utilization: data.current / data.capacity,
      efficiency: 70 + Math.random() * 20, // Reduced variance
      status: data.current / data.capacity > 0.8 ? 'overutilized' : 
              data.current / data.capacity > 0.4 ? 'optimal' : 'underutilized'
    }));

    return { data: spaceData };
  }

  async getEnvironmentalData() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { data: this.generateEnvironmentalData() };
  }

  async getWeeklyTrend() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { data: this.generateWeeklyTrend() };
  }

  async getZoneHeatmap() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { data: this.generateZoneHeatmap() };
  }

  async getEmployees(params: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let employees = this.generateMockEmployees();
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      employees = employees.filter(emp => 
        emp.name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search)
      );
    }
    
    if (params.department) {
      employees = employees.filter(emp => emp.department === params.department);
    }
    
    if (params.status) {
      employees = employees.filter(emp => emp.status === params.status);
    }
    
    if (params.limit) {
      employees = employees.slice(0, params.limit);
    }
    
    return {
      employees,
      total: employees.length,
      timestamp: new Date().toISOString()
    };
  }

  async getDetailedSpaces(params: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let spaces = this.generateMockSpaces();
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      spaces = spaces.filter(space => 
        space.name.toLowerCase().includes(search) ||
        space.type.toLowerCase().includes(search)
      );
    }
    
    if (params.status_filter && params.status_filter !== 'all') {
      spaces = spaces.filter(space => space.status === params.status_filter);
    }
    
    if (params.limit) {
      spaces = spaces.slice(0, params.limit);
    }
    
    return {
      spaces,
      total: spaces.length,
      timestamp: new Date().toISOString()
    };
  }

  async getAIPredictions() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      space_optimizer: this.getSpaceOptimizerAnalytics(),
      energy_predictor: this.getEnergyPredictorAnalytics(),
      timestamp: new Date().toISOString()
    };
  }

  async getOptimizationAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      suggestions: [
        {
          suggestion_id: 'OPT_001',
          category: 'space',
          title: 'Consolidate Underutilized Meeting Rooms',
          description: 'Combine 3 low-usage meeting rooms into flexible co-working space',
          potential_savings: 15000,
          implementation_effort: 'medium',
          priority: 2
        },
        {
          suggestion_id: 'OPT_002',
          category: 'energy',
          title: 'Implement Smart Lighting Controls',
          description: 'Install occupancy-based lighting in 70% of workspace areas',
          potential_savings: 12000,
          implementation_effort: 'low',
          priority: 1
        }
      ],
      cost_savings_potential: 27000,
      timestamp: new Date().toISOString()
    };
  }

  async getEnergyDashboard() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const hourlyData = this.generateEnergyData();
    const totalConsumption = hourlyData.reduce((sum, h) => sum + h.consumption, 0);
    const totalCost = hourlyData.reduce((sum, h) => sum + h.cost, 0);
    
    return {
      current_consumption: hourlyData[hourlyData.length - 1].consumption,
      current_cost: hourlyData[hourlyData.length - 1].cost,
      efficiency_score: Math.round(hourlyData.reduce((sum, h) => sum + h.efficiency, 0) / hourlyData.length),
      total_consumption_24h: Math.round(totalConsumption * 10) / 10,
      total_cost_24h: Math.round(totalCost * 10) / 10,
      carbon_footprint: Math.round(totalConsumption * 0.82 * 10) / 10,
      consumption_breakdown: {
        hvac: Math.round(totalConsumption * 0.45 * 10) / 10,
        lighting: Math.round(totalConsumption * 0.25 * 10) / 10,
        equipment: Math.round(totalConsumption * 0.30 * 10) / 10
      },
      hourly_data: hourlyData,
      predictions: hourlyData.map((h, i) => ({
        hour: i,
        predicted_consumption: h.predicted_consumption,
        timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
      }))
    };
  }

  async getEnergyPredictions(hours: number = 24) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const predictions = [];
    for (let i = 1; i <= hours; i++) {
      const futureTime = new Date(Date.now() + i * 60 * 60 * 1000);
      const hourNum = futureTime.getHours();
      
      let baseConsumption = 80;
      if (hourNum >= 8 && hourNum <= 18) {
        baseConsumption = 120 + 30 * Math.sin((hourNum - 8) * Math.PI / 10);
      }
      
      const predicted = baseConsumption + (Math.random() - 0.5) * 8; // Reduced variance
      
      predictions.push({
        timestamp: futureTime.toISOString(),
        predicted_consumption: Math.round(predicted * 10) / 10,
        hour: hourNum,
        confidence: 0.85 + Math.random() * 0.1
      });
    }
    
    return {
      predictions,
      model_info: {
        model_type: 'Energy Predictor v2.1',
        is_trained: true,
        accuracy: 0.91
      },
      summary: {
        total_predicted_24h: predictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_consumption, 0),
        avg_consumption: predictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_consumption, 0) / 24,
        peak_hour: predictions.slice(0, 24).reduce((max, p) => p.predicted_consumption > max.predicted_consumption ? p : max).hour
      }
    };
  }

  async getEnergyOptimization() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      anomalies: [
        {
          type: 'consumption_spike',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'medium',
          description: 'HVAC consumption 25% above normal',
          location: 'Floor 3'
        }
      ],
      recommendations: [
        {
          category: 'HVAC Optimization',
          title: 'Adjust Temperature Setpoints',
          description: 'Increase cooling setpoint by 2°C during peak hours',
          potential_savings: '15-20%',
          estimated_cost_savings: 8000
        },
        {
          category: 'Lighting Control',
          title: 'Implement Occupancy Sensors',
          description: 'Install motion sensors in 15 underutilized areas',
          potential_savings: '10-15%',
          estimated_cost_savings: 5500
        }
      ],
      efficiency_opportunities: [
        {
          category: 'HVAC Optimization',
          potential_savings: '15-20%',
          description: 'Optimize temperature setpoints and scheduling'
        },
        {
          category: 'Lighting Control',
          potential_savings: '10-15%',
          description: 'Implement occupancy-based lighting controls'
        }
      ]
    };
  }

  async getConflicts() {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return [
      {
        conflict_id: 'CONF_001',
        workspace_ID: 'Hot Seat 2.05',
        workspace_type: 'Hot Seat',
        conflict: 'Double booking detected',
        raiser: 'DEL127',
        user: 'DEL100',
        status: 'Active',
        severity: 'high',
        timestamp: new Date().toISOString(),
        description: 'Two employees scheduled for same hot seat at overlapping times'
      },
      {
        conflict_id: 'CONF_002',
        workspace_ID: 'Meeting Room 1.3',
        workspace_type: 'Meeting Room',
        conflict: 'Room overbooked',
        raiser: 'System',
        user: 'Team Alpha',
        status: 'Active',
        severity: 'medium',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'Meeting room booked beyond capacity limits'
      }
    ];
  }

  async resolveConflict(conflictId: string, resolution: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      message: 'Conflict resolved successfully',
      conflict_id: conflictId,
      resolution,
      resolved_at: new Date().toISOString()
    };
  }

  // Reduced frequency real-time updates
  startRealTimeUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      // Notify listeners with minimal updates
      this.listeners.forEach((callback, key) => {
        if (key === 'occupancy') {
          callback(this.generateOccupancyData());
        } else if (key === 'environmental') {
          callback(this.generateEnvironmentalData());
        } else if (key === 'energy') {
          callback(this.generateEnergyData());
        }
      });
    }, 45000); // Update every 45 seconds for stability
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  subscribe(key: string, callback: (data: any) => void) {
    this.listeners.set(key, callback);
  }

  unsubscribe(key: string) {
    this.listeners.delete(key);
  }

  // Additional methods for complete functionality
  async exportReport(reportType: string, timeRange: string = 'week', format: string = 'pdf') {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      file_type: format,
      filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`,
      summary: {
        total_records: 100,
        generated_at: new Date().toISOString(),
        time_range: timeRange
      },
      download_url: `#download-${reportType}-${format}`
    };
  }

  async addEmployee(employeeData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      employee: {
        id: Math.floor(Math.random() * 9999) + 1000,
        ...employeeData,
        created_at: new Date().toISOString()
      },
      message: "Employee added successfully"
    };
  }

  async updateEmployee(employeeId: number, employeeData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      employee: {
        id: employeeId,
        ...employeeData,
        updated_at: new Date().toISOString()
      },
      message: "Employee updated successfully"
    };
  }

  async deleteEmployee(employeeId: number) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      message: "Employee deleted successfully",
      deleted_employee_id: employeeId
    };
  }

  async addSpace(spaceData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      space: {
        id: Math.floor(Math.random() * 9999) + 1000,
        ...spaceData,
        created_at: new Date().toISOString()
      },
      message: "Space added successfully"
    };
  }

  async getPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const predictions = [];
    for (let i = 1; i <= forecastDays; i++) {
      const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const baseValue = 75 + 10 * Math.sin(2 * Math.PI * i / 7);
      const value = baseValue + (Math.random() - 0.5) * 5; // Reduced variance
      
      predictions.push({
        timestamp: futureDate.toISOString(),
        value: Math.max(0, Math.min(100, value)),
        predicted: true
      });
    }
    
    return {
      historical_data: predictions.slice(-7),
      prediction_model: {
        model_name: "LSTM_Space_Predictor_v2.1",
        accuracy: 0.87,
        confidence: 0.82,
        predictions
      },
      metadata: {
        metric_type: metricType,
        forecast_period: forecastDays,
        model_last_trained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  async getOptimizationSuggestions(params: any = {}) {
    return this.getOptimizationAnalytics();
  }

  async getAlerts(params: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const alerts = [
      {
        alert_id: 'ALERT_001',
        severity: 'high',
        title: 'High CO2 Levels',
        description: 'Meeting Room B shows elevated CO2 levels (450 ppm)',
        affected_spaces: ['Meeting Room B'],
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        alert_id: 'ALERT_002',
        severity: 'medium',
        title: 'Hot Seat Conflict',
        description: 'Double booking detected for Hot Seat 2.05',
        affected_spaces: ['Hot Seat 2.05'],
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];
    
    return alerts;
  }
}

export const mockDataService = new MockDataService();
export default mockDataService;