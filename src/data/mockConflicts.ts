// Mock data for Space Optimizer AI conflicts
export const spaceOptimizerConflicts = [
  {
    id: 1,
    type: "Double Booking",
    location: "Meeting Room Alpha",
    severity: "High",
    recommendedAction: "Move one meeting to Room Beta",
    affectedUsers: ["Alice Johnson", "Client: Mr. Rao"],
    timestamp: "2025-01-09 14:00",
    description: "Two meetings scheduled for the same time slot",
    estimatedResolutionTime: "5 minutes",
    status: "unresolved",
    priority: 1,
    potentialImpact: "Client meeting disruption"
  },
  {
    id: 2,
    type: "Overcrowding",
    location: "Open Desk Zone 3",
    severity: "Medium",
    recommendedAction: "Assign 2 employees to Hot Seats or suggest WFH",
    affectedUsers: ["Team Beta", "Sarah Wilson", "Mike Chen"],
    timestamp: "2025-01-09 09:30",
    description: "Desk capacity exceeded by 40%",
    estimatedResolutionTime: "15 minutes",
    status: "unresolved",
    priority: 2,
    potentialImpact: "Reduced productivity and comfort"
  },
  {
    id: 3,
    type: "Equipment Conflict",
    location: "Conference Room Beta",
    severity: "Medium",
    recommendedAction: "Reserve backup projector from storage",
    affectedUsers: ["Marketing Team", "John Davis"],
    timestamp: "2025-01-09 11:00",
    description: "Multiple teams requesting same AV equipment",
    estimatedResolutionTime: "10 minutes",
    status: "unresolved",
    priority: 3,
    potentialImpact: "Presentation delays"
  },
  {
    id: 4,
    type: "Access Violation",
    location: "Executive Floor",
    severity: "High",
    recommendedAction: "Update access permissions and notify security",
    affectedUsers: ["Temp Worker: Jane Smith"],
    timestamp: "2025-01-09 08:45",
    description: "Unauthorized access attempt detected",
    estimatedResolutionTime: "20 minutes",
    status: "unresolved",
    priority: 1,
    potentialImpact: "Security breach risk"
  },
  {
    id: 5,
    type: "Space Underutilization",
    location: "Quiet Zone 2",
    severity: "Low",
    recommendedAction: "Convert to collaborative space or hot-desking area",
    affectedUsers: ["Facilities Team"],
    timestamp: "2025-01-09 07:00",
    description: "Space utilization below 20% for past week",
    estimatedResolutionTime: "2 hours",
    status: "unresolved",
    priority: 4,
    potentialImpact: "Wasted space resources"
  },
  {
    id: 6,
    type: "Booking Conflict",
    location: "Training Room C",
    severity: "Medium",
    recommendedAction: "Reschedule training session to next available slot",
    affectedUsers: ["HR Team", "New Hires Batch 2025-A"],
    timestamp: "2025-01-09 13:30",
    description: "Training room double-booked with client presentation",
    estimatedResolutionTime: "8 minutes",
    status: "unresolved",
    priority: 2,
    potentialImpact: "Training schedule disruption"
  }
];

// Mock data for Energy Predictor AI conflicts
export const energyPredictorConflicts = [
  {
    id: 1,
    type: "Peak Consumption Alert",
    time: "2025-01-09 14:00",
    severity: "Critical",
    recommendedAction: "Reduce HVAC usage by 30% or shift non-essential loads",
    affectedZones: ["Floor 2", "Server Room", "Main Conference Hall"],
    description: "Energy consumption exceeding grid capacity limits",
    estimatedSavings: "₹15,000/day",
    estimatedResolutionTime: "Immediate",
    status: "unresolved",
    priority: 1,
    currentUsage: "2,847 kWh",
    thresholdLimit: "2,200 kWh"
  },
  {
    id: 2,
    type: "Inefficient Lighting Detected",
    time: "2025-01-09 10:00",
    severity: "Low",
    recommendedAction: "Switch to auto-dimming mode in unoccupied areas",
    affectedZones: ["Reception", "Corridor A", "Break Room"],
    description: "Lights running at full brightness in low-occupancy zones",
    estimatedSavings: "₹2,500/month",
    estimatedResolutionTime: "5 minutes",
    status: "unresolved",
    priority: 4,
    currentUsage: "145 kWh",
    thresholdLimit: "95 kWh"
  },
  {
    id: 3,
    type: "HVAC Inefficiency",
    time: "2025-01-09 12:30",
    severity: "Medium",
    recommendedAction: "Adjust temperature settings and optimize airflow",
    affectedZones: ["Open Office Area", "Meeting Rooms"],
    description: "HVAC system running 25% above optimal efficiency",
    estimatedSavings: "₹8,000/month",
    estimatedResolutionTime: "30 minutes",
    status: "unresolved",
    priority: 2,
    currentUsage: "1,250 kWh",
    thresholdLimit: "1,000 kWh"
  },
  {
    id: 4,
    type: "Equipment Power Surge",
    time: "2025-01-09 13:15",
    severity: "High",
    recommendedAction: "Redistribute load and check equipment health",
    affectedZones: ["IT Department", "Data Center"],
    description: "Unusual power spike detected in server equipment",
    estimatedSavings: "₹25,000 (damage prevention)",
    estimatedResolutionTime: "45 minutes",
    status: "unresolved",
    priority: 1,
    currentUsage: "3,200 kWh",
    thresholdLimit: "2,800 kWh"
  },
  {
    id: 5,
    type: "Renewable Energy Optimization",
    time: "2025-01-09 11:45",
    severity: "Low",
    recommendedAction: "Increase solar panel utilization during peak sun hours",
    affectedZones: ["Rooftop Solar Array", "Battery Storage"],
    description: "Solar energy potential not fully utilized",
    estimatedSavings: "₹5,000/month",
    estimatedResolutionTime: "15 minutes",
    status: "unresolved",
    priority: 3,
    currentUsage: "450 kWh (60% capacity)",
    thresholdLimit: "750 kWh (100% capacity)"
  },
  {
    id: 6,
    type: "Cooling System Overload",
    time: "2025-01-09 15:20",
    severity: "High",
    recommendedAction: "Activate backup cooling units and reduce server load",
    affectedZones: ["Data Center", "Server Room B"],
    description: "Primary cooling system operating at 95% capacity",
    estimatedSavings: "₹18,000 (equipment protection)",
    estimatedResolutionTime: "25 minutes",
    status: "unresolved",
    priority: 1,
    currentUsage: "890 kWh",
    thresholdLimit: "750 kWh"
  }
];

// Mock resolution history
export const resolutionHistory = [
  {
    id: 101,
    type: "Double Booking",
    resolvedAt: "2025-01-08 16:30",
    resolvedBy: "System Auto-Resolution",
    originalSeverity: "High",
    resolutionAction: "Automatically rescheduled to available room",
    timeTaken: "2 minutes",
    aiModel: "Space Optimizer AI",
    successRate: "100%"
  },
  {
    id: 102,
    type: "Peak Consumption Alert",
    resolvedAt: "2025-01-08 14:45",
    resolvedBy: "Facilities Manager",
    originalSeverity: "Critical",
    resolutionAction: "Reduced HVAC load and shifted equipment usage",
    timeTaken: "15 minutes",
    aiModel: "Energy Predictor AI",
    successRate: "95%"
  },
  {
    id: 103,
    type: "Equipment Conflict",
    resolvedAt: "2025-01-08 10:20",
    resolvedBy: "IT Support",
    originalSeverity: "Medium",
    resolutionAction: "Deployed backup equipment and updated booking system",
    timeTaken: "12 minutes",
    aiModel: "Space Optimizer AI",
    successRate: "100%"
  },
  {
    id: 104,
    type: "HVAC Inefficiency",
    resolvedAt: "2025-01-07 13:10",
    resolvedBy: "Energy Manager",
    originalSeverity: "Medium",
    resolutionAction: "Optimized temperature zones and airflow patterns",
    timeTaken: "35 minutes",
    aiModel: "Energy Predictor AI",
    successRate: "88%"
  },
  {
    id: 105,
    type: "Overcrowding",
    resolvedAt: "2025-01-07 09:15",
    resolvedBy: "HR Coordinator",
    originalSeverity: "Medium",
    resolutionAction: "Implemented flexible seating and WFH options",
    timeTaken: "20 minutes",
    aiModel: "Space Optimizer AI",
    successRate: "92%"
  }
];

// Mock AI model performance metrics
export const aiModelMetrics = {
  spaceOptimizer: {
    totalConflictsDetected: 1247,
    resolvedToday: 8,
    averageResolutionTime: "12 minutes",
    successRate: "94%",
    lastUpdated: "2 minutes ago",
    accuracy: "87%",
    uptime: "99.8%"
  },
  energyPredictor: {
    totalConflictsDetected: 892,
    resolvedToday: 5,
    averageResolutionTime: "18 minutes",
    successRate: "91%",
    lastUpdated: "1 minute ago",
    accuracy: "91%",
    uptime: "99.9%"
  }
};

// Mock conflict trends data
export const conflictTrends = {
  daily: [
    { day: 'Mon', spaceConflicts: 12, energyConflicts: 8 },
    { day: 'Tue', spaceConflicts: 15, energyConflicts: 6 },
    { day: 'Wed', spaceConflicts: 9, energyConflicts: 11 },
    { day: 'Thu', spaceConflicts: 18, energyConflicts: 7 },
    { day: 'Fri', spaceConflicts: 14, energyConflicts: 9 },
    { day: 'Sat', spaceConflicts: 3, energyConflicts: 4 },
    { day: 'Sun', spaceConflicts: 2, energyConflicts: 3 }
  ],
  hourly: Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    conflicts: Math.floor(Math.random() * 10) + 1
  }))
};