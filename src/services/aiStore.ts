import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { spaceOptimizerAI, SpaceAllocation, OptimizationRecommendation } from './SpaceOptimizerAI';
import { energyPredictorAI, EnergyPrediction, EnergyAnomaly, EnergyOptimization, EnergyMetrics } from './EnergyPredictorAI';
import { conflictResolutionService, ConflictData, ConflictResolutionAction, ConflictSummary } from './ConflictResolutionService';
import { firebaseService } from './firebase';

export interface AIState {
  // Space Optimizer state
  spaceAllocations: SpaceAllocation[];
  spaceRecommendations: OptimizationRecommendation[];
  spaceOptimizationMetrics: any;
  
  // Energy Predictor state
  energyPredictions: EnergyPrediction[];
  energyAnomalies: EnergyAnomaly[];
  energyOptimizations: EnergyOptimization[];
  energyMetrics: EnergyMetrics;
  predictionAccuracy: number;
  
  // Conflict Resolution state
  activeConflicts: ConflictData[];
  resolvedConflicts: ConflictData[];
  resolutionActions: ConflictResolutionAction[];
  conflictSummary: ConflictSummary;
  
  // UI state
  isLoading: boolean;
  lastUpdated: string;
  error: string | null;
  
  // Actions
  initializeAI: () => Promise<void>;
  refreshData: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: string) => Promise<void>;
  addBooking: (booking: any) => Promise<string>;
  addEnergyReading: (reading: any) => Promise<string>;
  getSpaceOptimizerAnalytics: () => any;
  getEnergyPredictorAnalytics: () => any;
  getConflictAnalytics: () => any;
  cleanup: () => void;
}

export const useAIStore = create<AIState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    spaceAllocations: [],
    spaceRecommendations: [],
    spaceOptimizationMetrics: null,
    
    energyPredictions: [],
    energyAnomalies: [],
    energyOptimizations: [],
    energyMetrics: {
      totalConsumption: 0,
      totalCost: 0,
      efficiencyScore: 0,
      carbonFootprint: 0,
      renewablePercentage: 0,
      peakDemand: 0,
      averageDemand: 0,
      costPerKwh: 0
    },
    predictionAccuracy: 0,
    
    activeConflicts: [],
    resolvedConflicts: [],
    resolutionActions: [],
    conflictSummary: {
      totalConflicts: 0,
      resolvedConflicts: 0,
      activeConflicts: 0,
      averageResolutionTime: 0,
      conflictsByType: {},
      conflictsBySeverity: {},
      topResolutionStrategies: []
    },
    
    isLoading: false,
    lastUpdated: new Date().toISOString(),
    error: null,

    // Actions
    initializeAI: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Initialize real-time listeners for AI predictions and recommendations
        firebaseService.subscribeToAIPredictions((predictions) => {
          if (predictions?.energyPredictor) {
            set({ energyPredictions: predictions.energyPredictor });
          }
        });

        firebaseService.subscribeToAIRecommendations((recommendations) => {
          if (recommendations?.spaceOptimizer) {
            set({ spaceRecommendations: recommendations.spaceOptimizer });
          }
          if (recommendations?.energyPredictor) {
            set({ energyOptimizations: recommendations.energyPredictor });
          }
        });

        // Initial data load
        await get().refreshData();
        
        set({ 
          isLoading: false, 
          lastUpdated: new Date().toISOString() 
        });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize AI' 
        });
      }
    },

    refreshData: async () => {
      set({ isLoading: true });
      
      try {
        // Update Space Optimizer data
        const spaceAllocations = spaceOptimizerAI.getCurrentAllocations();
        const spaceRecommendations = spaceOptimizerAI.getRecommendations();
        const spaceOptimizationMetrics = spaceOptimizerAI.getOptimizationMetrics();
        
        // Update Energy Predictor data
        const energyPredictions = energyPredictorAI.getCurrentPredictions();
        const energyAnomalies = energyPredictorAI.getAnomalies();
        const energyOptimizations = energyPredictorAI.getOptimizations();
        const energyMetrics = energyPredictorAI.getEnergyMetrics();
        const predictionAccuracy = energyPredictorAI.getPredictionAccuracy();
        
        // Update Conflict Resolution data
        const activeConflicts = conflictResolutionService.getActiveConflicts();
        const resolvedConflicts = conflictResolutionService.getResolvedConflicts();
        const resolutionActions = conflictResolutionService.getResolutionActions();
        const conflictSummary = conflictResolutionService.getConflictSummary();
        
        set({
          spaceAllocations,
          spaceRecommendations,
          spaceOptimizationMetrics,
          
          energyPredictions,
          energyAnomalies,
          energyOptimizations,
          energyMetrics,
          predictionAccuracy,
          
          activeConflicts,
          resolvedConflicts,
          resolutionActions,
          conflictSummary,
          
          isLoading: false,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to refresh data' 
        });
      }
    },

    resolveConflict: async (conflictId: string, resolution: string) => {
      try {
        await conflictResolutionService.resolveConflict(conflictId, resolution);
        await get().refreshData();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to resolve conflict' 
        });
      }
    },

    addBooking: async (booking: any) => {
      try {
        const bookingId = await spaceOptimizerAI.addBooking(booking);
        await get().refreshData();
        return bookingId;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add booking' 
        });
        throw error;
      }
    },

    addEnergyReading: async (reading: any) => {
      try {
        const readingId = await energyPredictorAI.addEnergyReading(reading);
        await get().refreshData();
        return readingId;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add energy reading' 
        });
        throw error;
      }
    },

    getSpaceOptimizerAnalytics: () => {
      const state = get();
      return {
        modelName: "Space Optimizer AI v2.1",
        accuracy: 0.87,
        predictions: {
          next_week_utilization: state.spaceOptimizationMetrics?.averageUtilization * 100 || 78.5,
          peak_hours: [9, 14, 16],
          underutilized_spaces: state.spaceAllocations
            .filter(alloc => alloc.utilization < 0.3)
            .map(alloc => alloc.spaceId),
          optimization_score: state.spaceOptimizationMetrics?.averageEnvironmentalScore || 85.2
        },
        clustering_results: {
          high_activity_collaborative: state.spaceAllocations
            .filter(alloc => alloc.utilization > 0.8 && alloc.environmentalScore > 70).length,
          high_activity_focused: state.spaceAllocations
            .filter(alloc => alloc.utilization > 0.8 && alloc.environmentalScore <= 70).length,
          moderate_activity: state.spaceAllocations
            .filter(alloc => alloc.utilization > 0.4 && alloc.utilization <= 0.8).length,
          quiet_underutilized: state.spaceAllocations
            .filter(alloc => alloc.utilization <= 0.4).length
        },
        recommendations: state.spaceRecommendations.map(rec => rec.description),
        metrics: state.spaceOptimizationMetrics
      };
    },

    getEnergyPredictorAnalytics: () => {
      const state = get();
      return {
        modelName: "Energy Predictor AI v1.8",
        accuracy: state.predictionAccuracy / 100,
        predictions: {
          next_day_consumption: state.energyPredictions[0]?.predictedConsumption || 2847.3,
          weekly_forecast: state.energyPredictions.slice(0, 7).map(p => p.predictedConsumption),
          cost_prediction: state.energyPredictions[0]?.predictedCost || 18420,
          efficiency_score: state.energyMetrics.efficiencyScore
        },
        feature_importance: [
          { feature: "occupancy_count", importance: 0.35 },
          { feature: "temperature", importance: 0.28 },
          { feature: "time_of_day", importance: 0.22 },
          { feature: "hvac_usage", importance: 0.15 }
        ],
        anomalies: state.energyAnomalies.length,
        optimizations: state.energyOptimizations.length,
        metrics: state.energyMetrics
      };
    },

    getConflictAnalytics: () => {
      const state = get();
      return {
        total_conflicts: state.conflictSummary.totalConflicts,
        active_conflicts: state.conflictSummary.activeConflicts,
        resolution_rate: state.conflictSummary.resolvedConflicts / Math.max(state.conflictSummary.totalConflicts, 1),
        average_resolution_time: state.conflictSummary.averageResolutionTime,
        conflicts_by_type: state.conflictSummary.conflictsByType,
        conflicts_by_severity: state.conflictSummary.conflictsBySeverity,
        top_strategies: state.conflictSummary.topResolutionStrategies,
        recent_actions: state.resolutionActions.slice(-10)
      };
    },

    cleanup: () => {
      firebaseService.cleanup();
      spaceOptimizerAI.cleanup();
      energyPredictorAI.cleanup();
      conflictResolutionService.cleanup();
    }
  }))
);

// Subscribe to store changes for debugging
if (process.env.NODE_ENV === 'development') {
  useAIStore.subscribe(
    (state) => state,
    (state) => {
      console.log('AI Store State Updated:', {
        spaceAllocations: state.spaceAllocations.length,
        energyPredictions: state.energyPredictions.length,
        activeConflicts: state.activeConflicts.length,
        lastUpdated: state.lastUpdated
      });
    }
  );
}

export default useAIStore;