import { firebaseService, ConflictData } from './firebase';
import { spaceOptimizerAI, OptimizationRecommendation } from './SpaceOptimizerAI';
import { energyPredictorAI, EnergyAnomaly, EnergyOptimization } from './EnergyPredictorAI';

export interface ConflictResolutionAction {
  id: string;
  conflictId: string;
  action: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  timestamp: string;
  completedAt?: string;
  notes?: string;
}

export interface ResolutionStrategy {
  id: string;
  conflictType: string;
  strategy: string;
  description: string;
  successRate: number;
  averageResolutionTime: number; // minutes
  prerequisites: string[];
  actions: string[];
}

export interface ConflictSummary {
  totalConflicts: number;
  resolvedConflicts: number;
  activeConflicts: number;
  averageResolutionTime: number;
  conflictsByType: { [key: string]: number };
  conflictsBySeverity: { [key: string]: number };
  topResolutionStrategies: ResolutionStrategy[];
}

class ConflictResolutionService {
  private conflicts: ConflictData[] = [];
  private resolutionActions: ConflictResolutionAction[] = [];
  private resolutionStrategies: ResolutionStrategy[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeStrategies();
    this.initializeRealTimeListeners();
  }

  private initializeStrategies(): void {
    this.resolutionStrategies = [
      // Space Optimizer conflict strategies
      {
        id: 'booking_overlap_auto_reschedule',
        conflictType: 'booking_overlap',
        strategy: 'Auto-reschedule conflicting bookings',
        description: 'Automatically reschedule one of the conflicting bookings to the next available time slot',
        successRate: 0.85,
        averageResolutionTime: 5,
        prerequisites: ['Available alternative time slots', 'Booking system access'],
        actions: ['Identify alternative time slots', 'Notify affected users', 'Automatically reschedule booking']
      },
      {
        id: 'overcrowding_space_reallocation',
        conflictType: 'overcrowding',
        strategy: 'Space reallocation',
        description: 'Move employees from overcrowded spaces to underutilized areas',
        successRate: 0.78,
        averageResolutionTime: 15,
        prerequisites: ['Available alternative spaces', 'Employee consent'],
        actions: ['Identify underutilized spaces', 'Contact affected employees', 'Coordinate move logistics']
      },
      {
        id: 'environmental_alert_hvac_adjustment',
        conflictType: 'environmental_alert',
        strategy: 'HVAC system adjustment',
        description: 'Adjust HVAC settings to improve environmental conditions',
        successRate: 0.92,
        averageResolutionTime: 10,
        prerequisites: ['HVAC system access', 'Environmental monitoring'],
        actions: ['Check current HVAC settings', 'Adjust temperature/humidity', 'Monitor improvements']
      },

      // Energy Predictor conflict strategies
      {
        id: 'consumption_spike_equipment_shutdown',
        conflictType: 'consumption_spike',
        strategy: 'Selective equipment shutdown',
        description: 'Identify and shut down non-essential equipment causing consumption spikes',
        successRate: 0.88,
        averageResolutionTime: 8,
        prerequisites: ['Equipment monitoring system', 'Equipment control access'],
        actions: ['Identify spike source', 'Assess equipment criticality', 'Shutdown non-essential equipment']
      },
      {
        id: 'cost_anomaly_demand_response',
        conflictType: 'cost_anomaly',
        strategy: 'Demand response activation',
        description: 'Activate demand response measures to reduce energy costs',
        successRate: 0.75,
        averageResolutionTime: 20,
        prerequisites: ['Demand response program enrollment', 'Load shedding capability'],
        actions: ['Activate demand response', 'Reduce non-critical loads', 'Monitor cost impact']
      },
      {
        id: 'efficiency_drop_maintenance_schedule',
        conflictType: 'efficiency_drop',
        strategy: 'Maintenance scheduling',
        description: 'Schedule maintenance for equipment showing efficiency drops',
        successRate: 0.82,
        averageResolutionTime: 60,
        prerequisites: ['Maintenance team availability', 'Equipment access'],
        actions: ['Schedule maintenance', 'Perform diagnostics', 'Implement efficiency improvements']
      }
    ];
  }

  private initializeRealTimeListeners(): void {
    // Listen to conflicts from Firebase
    firebaseService.subscribeToConflicts((conflicts) => {
      this.conflicts = conflicts || [];
      this.processNewConflicts();
    });

    this.isInitialized = true;
  }

  private processNewConflicts(): void {
    const newConflicts = this.conflicts.filter(c => c.status === 'detected');
    
    newConflicts.forEach(conflict => {
      this.autoResolveConflict(conflict);
    });
  }

  private async autoResolveConflict(conflict: ConflictData): Promise<void> {
    // Find appropriate resolution strategy
    const strategy = this.findBestStrategy(conflict);
    
    if (!strategy) {
      console.warn(`No resolution strategy found for conflict type: ${conflict.type}`);
      return;
    }

    // Create resolution action
    const action: ConflictResolutionAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conflictId: conflict.id,
      action: strategy.strategy,
      description: strategy.description,
      priority: conflict.severity,
      status: 'pending',
      estimatedDuration: strategy.averageResolutionTime,
      timestamp: new Date().toISOString()
    };

    this.resolutionActions.push(action);

    // Attempt automatic resolution for low/medium priority conflicts
    if (conflict.severity === 'low' || conflict.severity === 'medium') {
      await this.executeResolutionAction(action, strategy);
    } else {
      // High/critical conflicts require manual intervention
      await this.escalateConflict(conflict, action);
    }
  }

  private findBestStrategy(conflict: ConflictData): ResolutionStrategy | null {
    const applicableStrategies = this.resolutionStrategies.filter(s => s.conflictType === conflict.type);
    
    if (applicableStrategies.length === 0) return null;

    // Sort by success rate and resolution time
    return applicableStrategies.sort((a, b) => {
      const scoreA = a.successRate * (1 - a.averageResolutionTime / 120); // Normalize time to 2 hours
      const scoreB = b.successRate * (1 - b.averageResolutionTime / 120);
      return scoreB - scoreA;
    })[0];
  }

  private async executeResolutionAction(action: ConflictResolutionAction, strategy: ResolutionStrategy): Promise<void> {
    try {
      action.status = 'in_progress';
      
      // Execute strategy actions
      for (const actionStep of strategy.actions) {
        await this.executeActionStep(actionStep, action);
      }

      // Mark as completed
      action.status = 'completed';
      action.completedAt = new Date().toISOString();
      action.actualDuration = Math.floor((new Date(action.completedAt).getTime() - new Date(action.timestamp).getTime()) / 60000);

      // Resolve the conflict
      await firebaseService.resolveConflict(action.conflictId, `Automatically resolved using ${strategy.strategy}`);

      console.log(`Conflict ${action.conflictId} automatically resolved using ${strategy.strategy}`);
    } catch (error) {
      action.status = 'failed';
      action.notes = `Resolution failed: ${error.message}`;
      console.error(`Failed to resolve conflict ${action.conflictId}:`, error);
    }
  }

  private async executeActionStep(actionStep: string, action: ConflictResolutionAction): Promise<void> {
    // Simulate action execution with appropriate delays
    const stepDelay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, stepDelay));

    // Log action step
    console.log(`Executing: ${actionStep} for conflict ${action.conflictId}`);
  }

  private async escalateConflict(conflict: ConflictData, action: ConflictResolutionAction): Promise<void> {
    action.status = 'pending';
    action.notes = 'Escalated for manual resolution due to high severity';
    
    // In a real implementation, this would:
    // 1. Send notifications to relevant teams
    // 2. Create tickets in issue tracking system
    // 3. Update dashboard with escalation status
    
    console.log(`Conflict ${conflict.id} escalated for manual resolution`);
  }

  // Public methods
  async resolveConflict(conflictId: string, resolution: string, manualActions?: string[]): Promise<void> {
    await firebaseService.resolveConflict(conflictId, resolution);

    // Create manual resolution action if actions provided
    if (manualActions && manualActions.length > 0) {
      const action: ConflictResolutionAction = {
        id: `manual_action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conflictId,
        action: 'Manual Resolution',
        description: `Manually resolved: ${resolution}`,
        priority: 'high',
        status: 'completed',
        estimatedDuration: 30,
        actualDuration: 30,
        timestamp: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        notes: `Manual actions: ${manualActions.join(', ')}`
      };

      this.resolutionActions.push(action);
    }
  }

  getActiveConflicts(): ConflictData[] {
    return this.conflicts.filter(c => c.status === 'detected');
  }

  getResolvedConflicts(): ConflictData[] {
    return this.conflicts.filter(c => c.status === 'resolved');
  }

  getResolutionActions(): ConflictResolutionAction[] {
    return this.resolutionActions;
  }

  getResolutionStrategies(): ResolutionStrategy[] {
    return this.resolutionStrategies;
  }

  getConflictSummary(): ConflictSummary {
    const totalConflicts = this.conflicts.length;
    const resolvedConflicts = this.conflicts.filter(c => c.status === 'resolved').length;
    const activeConflicts = totalConflicts - resolvedConflicts;

    // Calculate conflicts by type
    const conflictsByType: { [key: string]: number } = {};
    this.conflicts.forEach(conflict => {
      conflictsByType[conflict.type] = (conflictsByType[conflict.type] || 0) + 1;
    });

    // Calculate conflicts by severity
    const conflictsBySeverity: { [key: string]: number } = {};
    this.conflicts.forEach(conflict => {
      conflictsBySeverity[conflict.severity] = (conflictsBySeverity[conflict.severity] || 0) + 1;
    });

    // Calculate average resolution time
    const completedActions = this.resolutionActions.filter(a => a.status === 'completed' && a.actualDuration);
    const averageResolutionTime = completedActions.length > 0 
      ? completedActions.reduce((sum, a) => sum + (a.actualDuration || 0), 0) / completedActions.length
      : 0;

    // Get top resolution strategies
    const topResolutionStrategies = this.resolutionStrategies
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    return {
      totalConflicts,
      resolvedConflicts,
      activeConflicts,
      averageResolutionTime,
      conflictsByType,
      conflictsBySeverity,
      topResolutionStrategies
    };
  }

  getConflictsByType(type: string): ConflictData[] {
    return this.conflicts.filter(c => c.type === type);
  }

  getConflictsBySeverity(severity: string): ConflictData[] {
    return this.conflicts.filter(c => c.severity === severity);
  }

  getActionsByStatus(status: string): ConflictResolutionAction[] {
    return this.resolutionActions.filter(a => a.status === status);
  }

  // Integration with AI models
  getSpaceOptimizerConflicts(): ConflictData[] {
    return this.conflicts.filter(c => 
      c.type === 'booking_overlap' || 
      c.type === 'overcrowding' || 
      c.type === 'environmental_alert'
    );
  }

  getEnergyPredictorConflicts(): ConflictData[] {
    return this.conflicts.filter(c => 
      c.type === 'consumption_spike' || 
      c.type === 'cost_anomaly' || 
      c.type === 'efficiency_drop' || 
      c.type === 'equipment_failure'
    );
  }

  // Analytics and reporting
  getConflictTrends(days: number = 30): any {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const recentConflicts = this.conflicts.filter(c => 
      new Date(c.timestamp) >= cutoffDate
    );

    const dailyConflicts: { [key: string]: number } = {};
    recentConflicts.forEach(conflict => {
      const date = new Date(conflict.timestamp).toISOString().split('T')[0];
      dailyConflicts[date] = (dailyConflicts[date] || 0) + 1;
    });

    return {
      dailyConflicts,
      totalConflicts: recentConflicts.length,
      averageConflictsPerDay: recentConflicts.length / days,
      resolutionRate: recentConflicts.filter(c => c.status === 'resolved').length / recentConflicts.length
    };
  }

  // Cleanup
  cleanup(): void {
    // Cleanup will be handled by Firebase service
  }
}

export const conflictResolutionService = new ConflictResolutionService();
export default conflictResolutionService;