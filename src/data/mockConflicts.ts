// Mock data for Space Optimizer AI conflicts
export const spaceOptimizerConflicts = [
  {
    id: 1,
    type: "Double Booking",
    location: "Meeting Room A",
    severity: "High",
    recommendedAction: "Reschedule one booking to Room B",
    affectedUsers: ["Alice Johnson", "Visitor: Mr. Rao"],
    timestamp: "2025-01-09 14:00",
    description: "Two meetings scheduled for the same time slot",
    estimatedResolutionTime: "5 minutes",
    status: "unresolved"
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
    status: "unresolved"
  },
  {
    id: 3,
    type: "Equipment Conflict",
    location: "Conference Room B",
    severity: "Medium",
    recommendedAction: "Reserve backup projector from storage",
    affectedUsers: ["Marketing Team", "John Davis"],
    timestamp: "2025-01-09 11:00",
    description: "Multiple teams requesting same AV equipment",
    estimatedResolutionTime: "10 minutes",
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    status: "unresolved"
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
    timeTaken: "2 minutes"
  },
  {
    id: 102,
    type: "Peak Consumption Alert",
    resolvedAt: "2025-01-08 14:45",
    resolvedBy: "Facilities Manager",
    originalSeverity: "Critical",
    resolutionAction: "Reduced HVAC load and shifted equipment usage",
    timeTaken: "15 minutes"
  }
];