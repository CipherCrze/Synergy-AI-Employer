import { firebaseService, FIREBASE_PATHS, BookingData, OccupancyData, ConflictData } from './firebase';
import { format, addHours, isWithinInterval, parseISO } from 'date-fns';

export interface SpaceAllocation {
  spaceId: string;
  spaceType: 'desk' | 'meeting_room' | 'hot_seat';
  employeeId?: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  utilization: number;
  environmentalScore: number;
  proximityScore: number;
  lastUpdated: string;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'space_reallocation' | 'capacity_adjustment' | 'environmental_optimization' | 'booking_conflict_resolution';
  title: string;
  description: string;
  affectedSpaces: string[];
  potentialSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface ConflictResolution {
  conflictId: string;
  resolution: string;
  actions: string[];
  affectedBookings: string[];
  timestamp: string;
}

class SpaceOptimizerAI {
  private allocations: Map<string, SpaceAllocation> = new Map();
  private bookings: BookingData[] = [];
  private conflicts: ConflictData[] = [];
  private recommendations: OptimizationRecommendation[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeRealTimeListeners();
  }

  private initializeRealTimeListeners() {
    // Listen to booking changes
    firebaseService.subscribeToBookings((bookings) => {
      this.bookings = bookings || [];
      this.detectConflicts();
      this.optimizeAllocations();
    });

    // Listen to occupancy changes
    firebaseService.subscribeToOccupancy((occupancyData) => {
      this.updateAllocationsFromOccupancy(occupancyData);
      this.optimizeAllocations();
    });

    // Listen to conflicts
    firebaseService.subscribeToConflicts((conflicts) => {
      this.conflicts = conflicts || [];
      this.updateRecommendations();
    });

    this.isInitialized = true;
  }

  private updateAllocationsFromOccupancy(occupancyData: { [key: string]: OccupancyData }) {
    Object.entries(occupancyData).forEach(([spaceId, data]) => {
      const allocation: SpaceAllocation = {
        spaceId,
        spaceType: this.determineSpaceType(spaceId),
        status: data.currentOccupancy > 0 ? 'occupied' : 'available',
        utilization: data.utilization,
        environmentalScore: this.calculateEnvironmentalScore(data.environmentalFactors),
        proximityScore: this.calculateProximityScore(spaceId),
        lastUpdated: data.timestamp
      };
      this.allocations.set(spaceId, allocation);
    });
  }

  private determineSpaceType(spaceId: string): 'desk' | 'meeting_room' | 'hot_seat' {
    if (spaceId.includes('room') || spaceId.includes('meeting')) return 'meeting_room';
    if (spaceId.includes('hot') || spaceId.includes('flex')) return 'hot_seat';
    return 'desk';
  }

  private calculateEnvironmentalScore(factors: any): number {
    const { temperature, humidity, co2, noise } = factors;
    
    // Ideal ranges
    const tempScore = Math.max(0, 100 - Math.abs(temperature - 22) * 5);
    const humidityScore = Math.max(0, 100 - Math.abs(humidity - 50) * 2);
    const co2Score = Math.max(0, 100 - Math.max(0, co2 - 400) / 10);
    const noiseScore = Math.max(0, 100 - Math.max(0, noise - 45) * 2);
    
    return (tempScore + humidityScore + co2Score + noiseScore) / 4;
  }

  private calculateProximityScore(spaceId: string): number {
    // Mock proximity calculation based on space ID
    // In real implementation, this would use actual floor plan data
    const baseScore = 70;
    const variation = Math.random() * 30;
    return Math.min(100, baseScore + variation);
  }

  private detectConflicts(): void {
    const newConflicts: ConflictData[] = [];

    // Detect booking overlaps
    const bookingConflicts = this.detectBookingOverlaps();
    newConflicts.push(...bookingConflicts);

    // Detect overcrowding
    const overcrowdingConflicts = this.detectOvercrowding();
    newConflicts.push(...overcrowdingConflicts);

    // Detect environmental issues
    const environmentalConflicts = this.detectEnvironmentalIssues();
    newConflicts.push(...environmentalConflicts);

    // Add new conflicts to Firebase
    newConflicts.forEach(async (conflict) => {
      await firebaseService.addConflict(conflict);
    });
  }

  private detectBookingOverlaps(): ConflictData[] {
    const conflicts: ConflictData[] = [];
    const sortedBookings = [...this.bookings].sort((a, b) => 
      parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
    );

    for (let i = 0; i < sortedBookings.length; i++) {
      for (let j = i + 1; j < sortedBookings.length; j++) {
        const booking1 = sortedBookings[i];
        const booking2 = sortedBookings[j];

        if (booking1.spaceId === booking2.spaceId && 
            booking1.status === 'confirmed' && 
            booking2.status === 'confirmed') {
          
          const start1 = parseISO(booking1.startTime);
          const end1 = parseISO(booking1.endTime);
          const start2 = parseISO(booking2.startTime);
          const end2 = parseISO(booking2.endTime);

          if (isWithinInterval(start1, { start: start2, end: end2 }) ||
              isWithinInterval(start2, { start: start1, end: end1 }) ||
              isWithinInterval(end1, { start: start2, end: end2 }) ||
              isWithinInterval(end2, { start: start1, end: end1 })) {
            
            conflicts.push({
              id: `overlap_${booking1.id}_${booking2.id}`,
              type: 'booking_overlap',
              severity: 'high',
              description: `Booking overlap detected for space ${booking1.spaceId}`,
              affectedSpaces: [booking1.spaceId],
              resolution: '',
              status: 'detected',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }

    return conflicts;
  }

  private detectOvercrowding(): ConflictData[] {
    const conflicts: ConflictData[] = [];
    
    this.allocations.forEach((allocation) => {
      if (allocation.utilization > 0.95) {
        conflicts.push({
          id: `overcrowding_${allocation.spaceId}`,
          type: 'overcrowding',
          severity: 'medium',
          description: `Space ${allocation.spaceId} is overcrowded (${(allocation.utilization * 100).toFixed(1)}% utilization)`,
          affectedSpaces: [allocation.spaceId],
          resolution: '',
          status: 'detected',
          timestamp: new Date().toISOString()
        });
      }
    });

    return conflicts;
  }

  private detectEnvironmentalIssues(): ConflictData[] {
    const conflicts: ConflictData[] = [];
    
    this.allocations.forEach((allocation) => {
      if (allocation.environmentalScore < 50) {
        conflicts.push({
          id: `environmental_${allocation.spaceId}`,
          type: 'environmental_alert',
          severity: 'medium',
          description: `Poor environmental conditions detected in space ${allocation.spaceId}`,
          affectedSpaces: [allocation.spaceId],
          resolution: '',
          status: 'detected',
          timestamp: new Date().toISOString()
        });
      }
    });

    return conflicts;
  }

  private optimizeAllocations(): void {
    if (!this.isInitialized) return;

    const recommendations: OptimizationRecommendation[] = [];

    // Space reallocation recommendations
    const reallocationRecs = this.generateReallocationRecommendations();
    recommendations.push(...reallocationRecs);

    // Capacity adjustment recommendations
    const capacityRecs = this.generateCapacityRecommendations();
    recommendations.push(...capacityRecs);

    // Environmental optimization recommendations
    const environmentalRecs = this.generateEnvironmentalRecommendations();
    recommendations.push(...environmentalRecs);

    this.recommendations = recommendations;

    // Update Firebase with recommendations
    firebaseService.updateAIRecommendations({
      spaceOptimizer: recommendations,
      timestamp: new Date().toISOString()
    });
  }

  private generateReallocationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Find underutilized spaces
    const underutilizedSpaces = Array.from(this.allocations.values())
      .filter(alloc => alloc.utilization < 0.3 && alloc.status === 'available');

    // Find overcrowded spaces
    const overcrowdedSpaces = Array.from(this.allocations.values())
      .filter(alloc => alloc.utilization > 0.9);

    if (underutilizedSpaces.length > 0 && overcrowdedSpaces.length > 0) {
      recommendations.push({
        id: `reallocation_${Date.now()}`,
        type: 'space_reallocation',
        title: 'Space Reallocation Opportunity',
        description: `Move employees from overcrowded spaces to underutilized areas`,
        affectedSpaces: [...underutilizedSpaces.map(s => s.spaceId), ...overcrowdedSpaces.map(s => s.spaceId)],
        potentialSavings: 15000,
        implementationEffort: 'medium',
        confidence: 0.85,
        reasoning: `Found ${underutilizedSpaces.length} underutilized spaces and ${overcrowdedSpaces.length} overcrowded spaces`,
        timestamp: new Date().toISOString()
      });
    }

    return recommendations;
  }

  private generateCapacityRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Analyze meeting room utilization
    const meetingRooms = Array.from(this.allocations.values())
      .filter(alloc => alloc.spaceType === 'meeting_room');
    
    const avgMeetingRoomUtilization = meetingRooms.reduce((sum, room) => sum + room.utilization, 0) / meetingRooms.length;
    
    if (avgMeetingRoomUtilization < 0.4) {
      recommendations.push({
        id: `capacity_${Date.now()}`,
        type: 'capacity_adjustment',
        title: 'Meeting Room Capacity Optimization',
        description: 'Consider converting large meeting rooms to smaller collaborative spaces',
        affectedSpaces: meetingRooms.map(room => room.spaceId),
        potentialSavings: 8000,
        implementationEffort: 'high',
        confidence: 0.75,
        reasoning: `Average meeting room utilization is ${(avgMeetingRoomUtilization * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    return recommendations;
  }

  private generateEnvironmentalRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Find spaces with poor environmental scores
    const poorEnvironmentalSpaces = Array.from(this.allocations.values())
      .filter(alloc => alloc.environmentalScore < 60);
    
    if (poorEnvironmentalSpaces.length > 0) {
      recommendations.push({
        id: `environmental_${Date.now()}`,
        type: 'environmental_optimization',
        title: 'Environmental Conditions Improvement',
        description: 'Address poor environmental conditions in identified spaces',
        affectedSpaces: poorEnvironmentalSpaces.map(space => space.spaceId),
        potentialSavings: 5000,
        implementationEffort: 'medium',
        confidence: 0.90,
        reasoning: `Found ${poorEnvironmentalSpaces.length} spaces with environmental scores below 60`,
        timestamp: new Date().toISOString()
      });
    }

    return recommendations;
  }

  private updateRecommendations(): void {
    // Update recommendations based on resolved conflicts
    const activeConflicts = this.conflicts.filter(c => c.status === 'detected');
    
    if (activeConflicts.length > 0) {
      const conflictResolutionRecs = activeConflicts.map(conflict => ({
        id: `conflict_resolution_${conflict.id}`,
        type: 'booking_conflict_resolution' as const,
        title: `Resolve ${conflict.type.replace('_', ' ')}`,
        description: conflict.description,
        affectedSpaces: conflict.affectedSpaces,
        potentialSavings: conflict.severity === 'critical' ? 20000 : 
                         conflict.severity === 'high' ? 15000 : 
                         conflict.severity === 'medium' ? 10000 : 5000,
        implementationEffort: conflict.severity === 'critical' ? 'high' : 'medium' as const,
        confidence: 0.95,
        reasoning: `Active conflict requires immediate attention`,
        timestamp: new Date().toISOString()
      }));

      this.recommendations = [...this.recommendations, ...conflictResolutionRecs];
    }
  }

  // Public methods
  async resolveConflict(conflictId: string, resolution: string): Promise<void> {
    await firebaseService.resolveConflict(conflictId, resolution);
  }

  async addBooking(booking: Omit<BookingData, 'id' | 'timestamp'>): Promise<string> {
    const newBooking: BookingData = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return await firebaseService.addBooking(newBooking);
  }

  getCurrentAllocations(): SpaceAllocation[] {
    return Array.from(this.allocations.values());
  }

  getRecommendations(): OptimizationRecommendation[] {
    return this.recommendations;
  }

  getConflicts(): ConflictData[] {
    return this.conflicts;
  }

  getOptimizationMetrics(): any {
    const totalSpaces = this.allocations.size;
    const occupiedSpaces = Array.from(this.allocations.values()).filter(a => a.status === 'occupied').length;
    const avgUtilization = Array.from(this.allocations.values()).reduce((sum, a) => sum + a.utilization, 0) / totalSpaces;
    const avgEnvironmentalScore = Array.from(this.allocations.values()).reduce((sum, a) => sum + a.environmentalScore, 0) / totalSpaces;

    return {
      totalSpaces,
      occupiedSpaces,
      occupancyRate: occupiedSpaces / totalSpaces,
      averageUtilization: avgUtilization,
      averageEnvironmentalScore: avgEnvironmentalScore,
      activeConflicts: this.conflicts.filter(c => c.status === 'detected').length,
      recommendationsCount: this.recommendations.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Cleanup
  cleanup(): void {
    // Cleanup will be handled by Firebase service
  }
}

export const spaceOptimizerAI = new SpaceOptimizerAI();
export default spaceOptimizerAI;