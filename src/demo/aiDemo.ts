import { useAIStore } from '../services/aiStore';
import { firebaseService } from '../services/firebase';

/**
 * Demo script to showcase the enhanced AI models
 * This simulates real-world usage of the Space Optimizer and Energy Predictor AI models
 */

class AIDemo {
  private aiStore = useAIStore.getState();
  private demoInterval: NodeJS.Timeout | null = null;

  async startDemo() {
    console.log('🚀 Starting Synergy AI Platform Demo...');
    
    // Initialize AI models
    await this.aiStore.initializeAI();
    console.log('✅ AI models initialized');

    // Start demo data generation
    this.startDemoDataGeneration();
    
    // Start periodic updates
    this.startPeriodicUpdates();
    
    console.log('🎯 Demo is running! Check the dashboard for real-time updates.');
  }

  private startDemoDataGeneration() {
    // Generate sample bookings
    this.generateSampleBookings();
    
    // Generate sample energy readings
    this.generateSampleEnergyReadings();
    
    // Generate sample occupancy data
    this.generateSampleOccupancyData();
  }

  private async generateSampleBookings() {
    const sampleBookings = [
      {
        employeeId: 'emp_001',
        spaceId: 'desk_101',
        spaceType: 'desk' as const,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        status: 'confirmed' as const
      },
      {
        employeeId: 'emp_002',
        spaceId: 'meeting_room_a',
        spaceType: 'meeting_room' as const,
        startTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        status: 'confirmed' as const
      },
      {
        employeeId: 'emp_003',
        spaceId: 'desk_101', // This will create a conflict with emp_001
        spaceType: 'desk' as const,
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
        status: 'confirmed' as const
      }
    ];

    for (const booking of sampleBookings) {
      try {
        await this.aiStore.addBooking(booking);
        console.log(`📅 Added booking: ${booking.employeeId} -> ${booking.spaceId}`);
      } catch (error) {
        console.error('Failed to add booking:', error);
      }
    }
  }

  private async generateSampleEnergyReadings() {
    const sampleReadings = [
      {
        consumption: 125.5,
        cost: 18.75,
        source: 'hvac' as const,
        location: 'floor_1'
      },
      {
        consumption: 89.2,
        cost: 13.38,
        source: 'lighting' as const,
        location: 'floor_1'
      },
      {
        consumption: 45.8,
        cost: 6.87,
        source: 'equipment' as const,
        location: 'floor_1'
      },
      {
        consumption: 180.0, // This will trigger an anomaly (high consumption)
        cost: 27.00,
        source: 'hvac' as const,
        location: 'floor_2'
      }
    ];

    for (const reading of sampleReadings) {
      try {
        await this.aiStore.addEnergyReading(reading);
        console.log(`⚡ Added energy reading: ${reading.consumption}kWh from ${reading.source}`);
      } catch (error) {
        console.error('Failed to add energy reading:', error);
      }
    }
  }

  private async generateSampleOccupancyData() {
    const sampleOccupancy = {
      'desk_101': {
        spaceId: 'desk_101',
        currentOccupancy: 1,
        capacity: 1,
        utilization: 1.0,
        timestamp: new Date().toISOString(),
        environmentalFactors: {
          temperature: 22.5,
          humidity: 45,
          co2: 450,
          noise: 48
        }
      },
      'meeting_room_a': {
        spaceId: 'meeting_room_a',
        currentOccupancy: 0,
        capacity: 8,
        utilization: 0.0,
        timestamp: new Date().toISOString(),
        environmentalFactors: {
          temperature: 21.0,
          humidity: 50,
          co2: 400,
          noise: 35
        }
      },
      'desk_102': {
        spaceId: 'desk_102',
        currentOccupancy: 1,
        capacity: 1,
        utilization: 1.0,
        timestamp: new Date().toISOString(),
        environmentalFactors: {
          temperature: 25.0, // This will trigger environmental alert
          humidity: 65,
          co2: 600,
          noise: 55
        }
      }
    };

    for (const [spaceId, data] of Object.entries(sampleOccupancy)) {
      try {
        await firebaseService.updateOccupancy(data);
        console.log(`🏢 Updated occupancy for ${spaceId}: ${data.currentOccupancy}/${data.capacity}`);
      } catch (error) {
        console.error('Failed to update occupancy:', error);
      }
    }
  }

  private startPeriodicUpdates() {
    this.demoInterval = setInterval(async () => {
      // Generate new energy readings every 30 seconds
      const newReading = {
        consumption: 100 + Math.random() * 50,
        cost: (100 + Math.random() * 50) * 0.15,
        source: ['hvac', 'lighting', 'equipment'][Math.floor(Math.random() * 3)] as any,
        location: `floor_${Math.floor(Math.random() * 3) + 1}`
      };

      try {
        await this.aiStore.addEnergyReading(newReading);
        console.log(`⚡ Periodic energy reading: ${newReading.consumption.toFixed(1)}kWh`);
      } catch (error) {
        console.error('Failed to add periodic energy reading:', error);
      }

      // Update occupancy data
      const occupancyUpdate = {
        spaceId: 'desk_101',
        currentOccupancy: Math.random() > 0.5 ? 1 : 0,
        capacity: 1,
        utilization: Math.random() > 0.5 ? 1.0 : 0.0,
        timestamp: new Date().toISOString(),
        environmentalFactors: {
          temperature: 20 + Math.random() * 8,
          humidity: 40 + Math.random() * 30,
          co2: 350 + Math.random() * 200,
          noise: 35 + Math.random() * 25
        }
      };

      try {
        await firebaseService.updateOccupancy(occupancyUpdate);
        console.log(`🏢 Periodic occupancy update: ${occupancyUpdate.currentOccupancy}/${occupancyUpdate.capacity}`);
      } catch (error) {
        console.error('Failed to update occupancy:', error);
      }
    }, 30000); // Every 30 seconds
  }

  async stopDemo() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    
    this.aiStore.cleanup();
    console.log('🛑 Demo stopped');
  }

  // Demo functions to showcase specific features
  async demonstrateConflictResolution() {
    console.log('🔧 Demonstrating conflict resolution...');
    
    // Get active conflicts
    const activeConflicts = this.aiStore.getActiveConflicts();
    console.log(`Found ${activeConflicts.length} active conflicts`);

    // Resolve the first conflict
    if (activeConflicts.length > 0) {
      const conflict = activeConflicts[0];
      await this.aiStore.resolveConflict(conflict.id, 'Demo resolution: Automatically rescheduled booking');
      console.log(`✅ Resolved conflict: ${conflict.description}`);
    }
  }

  async demonstrateAIRecommendations() {
    console.log('💡 Demonstrating AI recommendations...');
    
    const spaceRecommendations = this.aiStore.getRecommendations();
    const energyOptimizations = this.aiStore.getOptimizations();
    
    console.log(`Space Optimizer recommendations: ${spaceRecommendations.length}`);
    console.log(`Energy Predictor optimizations: ${energyOptimizations.length}`);
    
    if (spaceRecommendations.length > 0) {
      console.log('Top space recommendation:', spaceRecommendations[0].title);
    }
    
    if (energyOptimizations.length > 0) {
      console.log('Top energy optimization:', energyOptimizations[0].title);
    }
  }

  async demonstrateRealTimeAnalytics() {
    console.log('📊 Demonstrating real-time analytics...');
    
    const spaceAnalytics = this.aiStore.getSpaceOptimizerAnalytics();
    const energyAnalytics = this.aiStore.getEnergyPredictorAnalytics();
    const conflictAnalytics = this.aiStore.getConflictAnalytics();
    
    console.log('Space Optimizer Analytics:', {
      accuracy: spaceAnalytics.accuracy,
      utilization: spaceAnalytics.predictions.next_week_utilization,
      recommendations: spaceAnalytics.recommendations.length
    });
    
    console.log('Energy Predictor Analytics:', {
      accuracy: energyAnalytics.accuracy,
      consumption: energyAnalytics.predictions.next_day_consumption,
      anomalies: energyAnalytics.anomalies
    });
    
    console.log('Conflict Resolution Analytics:', {
      totalConflicts: conflictAnalytics.total_conflicts,
      activeConflicts: conflictAnalytics.active_conflicts,
      resolutionRate: conflictAnalytics.resolution_rate
    });
  }
}

// Export demo instance
export const aiDemo = new AIDemo();

// Auto-start demo when imported (for development)
if (process.env.NODE_ENV === 'development') {
  // Start demo after a short delay to allow app initialization
  setTimeout(() => {
    aiDemo.startDemo();
  }, 2000);
}

export default aiDemo;