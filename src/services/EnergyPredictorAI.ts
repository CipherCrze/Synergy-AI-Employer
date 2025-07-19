import { firebaseService, FIREBASE_PATHS, EnergyReading, ConflictData } from './firebase';
import { format, addHours, subHours, parseISO, startOfDay, endOfDay } from 'date-fns';

export interface EnergyPrediction {
  timestamp: string;
  predictedConsumption: number;
  predictedCost: number;
  confidence: number;
  factors: {
    occupancy: number;
    temperature: number;
    humidity: number;
    timeOfDay: number;
    dayOfWeek: number;
  };
}

export interface EnergyAnomaly {
  id: string;
  type: 'consumption_spike' | 'cost_anomaly' | 'efficiency_drop' | 'equipment_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  location: string;
  source: string;
  recommendations: string[];
}

export interface EnergyOptimization {
  id: string;
  type: 'hvac_optimization' | 'lighting_adjustment' | 'equipment_scheduling' | 'demand_response';
  title: string;
  description: string;
  potentialSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
  confidence: number;
  reasoning: string;
  affectedSystems: string[];
  timestamp: string;
}

export interface EnergyMetrics {
  totalConsumption: number;
  totalCost: number;
  efficiencyScore: number;
  carbonFootprint: number;
  renewablePercentage: number;
  peakDemand: number;
  averageDemand: number;
  costPerKwh: number;
}

class EnergyPredictorAI {
  private energyReadings: EnergyReading[] = [];
  private predictions: EnergyPrediction[] = [];
  private anomalies: EnergyAnomaly[] = [];
  private optimizations: EnergyOptimization[] = [];
  private isInitialized = false;
  private baselineMetrics: EnergyMetrics | null = null;

  constructor() {
    this.initializeRealTimeListeners();
  }

  private initializeRealTimeListeners() {
    // Listen to energy readings
    firebaseService.subscribeToEnergyReadings((readings) => {
      this.energyReadings = readings || [];
      this.detectAnomalies();
      this.generatePredictions();
      this.optimizeEnergyUsage();
    });

    // Listen to energy alerts
    firebaseService.subscribeToEnergyAlerts((alerts) => {
      this.processEnergyAlerts(alerts);
    });

    this.isInitialized = true;
  }

  private detectAnomalies(): void {
    if (this.energyReadings.length < 10) return; // Need minimum data points

    const newAnomalies: EnergyAnomaly[] = [];
    const recentReadings = this.energyReadings
      .slice(-24) // Last 24 readings
      .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

    // Calculate baseline metrics
    const baselineConsumption = this.calculateBaselineConsumption(recentReadings);
    const baselineCost = this.calculateBaselineCost(recentReadings);

    // Detect consumption spikes
    recentReadings.forEach((reading) => {
      const deviation = Math.abs(reading.consumption - baselineConsumption) / baselineConsumption;
      
      if (deviation > 0.3) { // 30% deviation threshold
        const anomaly: EnergyAnomaly = {
          id: `anomaly_${reading.id}`,
          type: 'consumption_spike',
          severity: deviation > 0.5 ? 'critical' : deviation > 0.4 ? 'high' : 'medium',
          description: `Energy consumption spike detected: ${reading.consumption.toFixed(2)} kWh (expected: ${baselineConsumption.toFixed(2)} kWh)`,
          detectedAt: reading.timestamp,
          expectedValue: baselineConsumption,
          actualValue: reading.consumption,
          deviation: deviation * 100,
          location: reading.location,
          source: reading.source,
          recommendations: this.generateAnomalyRecommendations(reading, deviation)
        };
        newAnomalies.push(anomaly);
      }
    });

    // Detect cost anomalies
    recentReadings.forEach((reading) => {
      const costDeviation = Math.abs(reading.cost - baselineCost) / baselineCost;
      
      if (costDeviation > 0.25) { // 25% cost deviation threshold
        const anomaly: EnergyAnomaly = {
          id: `cost_anomaly_${reading.id}`,
          type: 'cost_anomaly',
          severity: costDeviation > 0.4 ? 'high' : 'medium',
          description: `Energy cost anomaly detected: $${reading.cost.toFixed(2)} (expected: $${baselineCost.toFixed(2)})`,
          detectedAt: reading.timestamp,
          expectedValue: baselineCost,
          actualValue: reading.cost,
          deviation: costDeviation * 100,
          location: reading.location,
          source: reading.source,
          recommendations: this.generateCostAnomalyRecommendations(reading, costDeviation)
        };
        newAnomalies.push(anomaly);
      }
    });

    // Add new anomalies to Firebase
    newAnomalies.forEach(async (anomaly) => {
      await firebaseService.addEnergyAlert(anomaly);
    });

    this.anomalies = [...this.anomalies, ...newAnomalies];
  }

  private calculateBaselineConsumption(readings: EnergyReading[]): number {
    const consumptions = readings.map(r => r.consumption);
    const sorted = consumptions.sort((a, b) => a - b);
    const medianIndex = Math.floor(sorted.length / 2);
    return sorted[medianIndex];
  }

  private calculateBaselineCost(readings: EnergyReading[]): number {
    const costs = readings.map(r => r.cost);
    const sorted = costs.sort((a, b) => a - b);
    const medianIndex = Math.floor(sorted.length / 2);
    return sorted[medianIndex];
  }

  private generateAnomalyRecommendations(reading: EnergyReading, deviation: number): string[] {
    const recommendations: string[] = [];
    
    if (reading.source === 'hvac') {
      recommendations.push('Check HVAC system for malfunction or unusual settings');
      recommendations.push('Verify temperature setpoints and scheduling');
      recommendations.push('Inspect for air leaks or blocked vents');
    } else if (reading.source === 'lighting') {
      recommendations.push('Review lighting schedules and occupancy sensors');
      recommendations.push('Check for malfunctioning lighting controls');
      recommendations.push('Verify daylight harvesting system operation');
    } else if (reading.source === 'equipment') {
      recommendations.push('Audit equipment usage and power management settings');
      recommendations.push('Check for equipment left running outside business hours');
      recommendations.push('Review equipment maintenance schedules');
    }

    if (deviation > 0.5) {
      recommendations.push('Immediate investigation required - contact facilities team');
    }

    return recommendations;
  }

  private generateCostAnomalyRecommendations(reading: EnergyReading, deviation: number): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Review energy tariff rates and peak demand charges');
    recommendations.push('Check for billing errors or rate changes');
    recommendations.push('Analyze demand response opportunities');
    
    if (deviation > 0.4) {
      recommendations.push('Consider implementing demand management strategies');
      recommendations.push('Review energy procurement contracts');
    }

    return recommendations;
  }

  private generatePredictions(): void {
    if (this.energyReadings.length < 24) return; // Need at least 24 hours of data

    const predictions: EnergyPrediction[] = [];
    const now = new Date();

    // Generate predictions for next 24 hours
    for (let i = 1; i <= 24; i++) {
      const predictionTime = addHours(now, i);
      const prediction = this.predictEnergyAtTime(predictionTime);
      predictions.push(prediction);
    }

    this.predictions = predictions;

    // Update Firebase with predictions
    firebaseService.updateAIPredictions({
      energyPredictor: predictions,
      timestamp: new Date().toISOString()
    });
  }

  private predictEnergyAtTime(targetTime: Date): EnergyPrediction {
    // Get historical data for similar time periods
    const similarReadings = this.energyReadings.filter(reading => {
      const readingTime = parseISO(reading.timestamp);
      const targetHour = targetTime.getHours();
      const readingHour = readingTime.getHours();
      const targetDay = targetTime.getDay();
      const readingDay = readingTime.getDay();
      
      // Find readings from similar times (same hour, same day of week)
      return Math.abs(targetHour - readingHour) <= 1 && targetDay === readingDay;
    });

    if (similarReadings.length === 0) {
      // Fallback to overall average
      const avgConsumption = this.energyReadings.reduce((sum, r) => sum + r.consumption, 0) / this.energyReadings.length;
      const avgCost = this.energyReadings.reduce((sum, r) => sum + r.cost, 0) / this.energyReadings.length;
      
      return {
        timestamp: targetTime.toISOString(),
        predictedConsumption: avgConsumption,
        predictedCost: avgCost,
        confidence: 0.5,
        factors: {
          occupancy: 0.7,
          temperature: 22,
          humidity: 50,
          timeOfDay: targetTime.getHours(),
          dayOfWeek: targetTime.getDay()
        }
      };
    }

    // Calculate weighted average based on recency and similarity
    const weights = similarReadings.map((_, index) => 1 / (index + 1));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const weightedConsumption = similarReadings.reduce((sum, reading, index) => 
      sum + reading.consumption * weights[index], 0) / totalWeight;
    
    const weightedCost = similarReadings.reduce((sum, reading, index) => 
      sum + reading.cost * weights[index], 0) / totalWeight;

    // Calculate confidence based on data consistency
    const consumptionVariance = this.calculateVariance(similarReadings.map(r => r.consumption));
    const confidence = Math.max(0.3, 1 - consumptionVariance / 1000);

    return {
      timestamp: targetTime.toISOString(),
      predictedConsumption: weightedConsumption,
      predictedCost: weightedCost,
      confidence,
      factors: {
        occupancy: this.estimateOccupancy(targetTime),
        temperature: this.estimateTemperature(targetTime),
        humidity: this.estimateHumidity(targetTime),
        timeOfDay: targetTime.getHours(),
        dayOfWeek: targetTime.getDay()
      }
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private estimateOccupancy(time: Date): number {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    
    // Business hours: 9 AM - 6 PM, Monday - Friday
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 18) {
      return 0.8;
    } else if (dayOfWeek >= 1 && dayOfWeek <= 5 && (hour >= 7 && hour <= 8 || hour >= 19 && hour <= 20)) {
      return 0.3;
    } else {
      return 0.1;
    }
  }

  private estimateTemperature(time: Date): number {
    const hour = time.getHours();
    const month = time.getMonth();
    
    // Seasonal temperature variation
    const seasonalTemp = 22 + 8 * Math.sin(2 * Math.PI * month / 12);
    const dailyVariation = 2 * Math.sin(2 * Math.PI * hour / 24);
    
    return seasonalTemp + dailyVariation;
  }

  private estimateHumidity(time: Date): number {
    const temp = this.estimateTemperature(time);
    // Inverse relationship with temperature
    return Math.max(30, Math.min(80, 80 - 0.5 * temp));
  }

  private optimizeEnergyUsage(): void {
    if (!this.isInitialized) return;

    const optimizations: EnergyOptimization[] = [];

    // HVAC optimization
    const hvacOptimizations = this.generateHVACOptimizations();
    optimizations.push(...hvacOptimizations);

    // Lighting optimization
    const lightingOptimizations = this.generateLightingOptimizations();
    optimizations.push(...lightingOptimizations);

    // Equipment scheduling optimization
    const equipmentOptimizations = this.generateEquipmentOptimizations();
    optimizations.push(...equipmentOptimizations);

    this.optimizations = optimizations;

    // Update Firebase with optimizations
    firebaseService.updateAIRecommendations({
      energyPredictor: optimizations,
      timestamp: new Date().toISOString()
    });
  }

  private generateHVACOptimizations(): EnergyOptimization[] {
    const optimizations: EnergyOptimization[] = [];
    
    // Analyze HVAC usage patterns
    const hvacReadings = this.energyReadings.filter(r => r.source === 'hvac');
    if (hvacReadings.length === 0) return optimizations;

    const avgHVACConsumption = hvacReadings.reduce((sum, r) => sum + r.consumption, 0) / hvacReadings.length;
    const peakHVACConsumption = Math.max(...hvacReadings.map(r => r.consumption));

    if (peakHVACConsumption > avgHVACConsumption * 1.5) {
      optimizations.push({
        id: `hvac_optimization_${Date.now()}`,
        type: 'hvac_optimization',
        title: 'HVAC Peak Demand Reduction',
        description: 'Optimize HVAC scheduling to reduce peak demand and energy costs',
        potentialSavings: 12000,
        implementationEffort: 'medium',
        confidence: 0.85,
        reasoning: `Peak HVAC consumption (${peakHVACConsumption.toFixed(2)} kWh) is ${((peakHVACConsumption / avgHVACConsumption - 1) * 100).toFixed(1)}% above average`,
        affectedSystems: ['HVAC', 'Thermostats', 'Building Management System'],
        timestamp: new Date().toISOString()
      });
    }

    return optimizations;
  }

  private generateLightingOptimizations(): EnergyOptimization[] {
    const optimizations: EnergyOptimization[] = [];
    
    const lightingReadings = this.energyReadings.filter(r => r.source === 'lighting');
    if (lightingReadings.length === 0) return optimizations;

    // Check for lighting usage during low occupancy hours
    const lowOccupancyReadings = lightingReadings.filter(r => {
      const time = parseISO(r.timestamp);
      const hour = time.getHours();
      const dayOfWeek = time.getDay();
      return (dayOfWeek === 0 || dayOfWeek === 6) || (hour < 7 || hour > 20);
    });

    if (lowOccupancyReadings.length > 0) {
      const avgLowOccupancyConsumption = lowOccupancyReadings.reduce((sum, r) => sum + r.consumption, 0) / lowOccupancyReadings.length;
      
      optimizations.push({
        id: `lighting_optimization_${Date.now()}`,
        type: 'lighting_adjustment',
        title: 'Lighting Schedule Optimization',
        description: 'Reduce lighting usage during low occupancy hours',
        potentialSavings: 6000,
        implementationEffort: 'low',
        confidence: 0.90,
        reasoning: `Average lighting consumption during low occupancy: ${avgLowOccupancyConsumption.toFixed(2)} kWh`,
        affectedSystems: ['Lighting Controls', 'Occupancy Sensors', 'Building Automation'],
        timestamp: new Date().toISOString()
      });
    }

    return optimizations;
  }

  private generateEquipmentOptimizations(): EnergyOptimization[] {
    const optimizations: EnergyOptimization[] = [];
    
    const equipmentReadings = this.energyReadings.filter(r => r.source === 'equipment');
    if (equipmentReadings.length === 0) return optimizations;

    // Check for equipment running outside business hours
    const afterHoursReadings = equipmentReadings.filter(r => {
      const time = parseISO(r.timestamp);
      const hour = time.getHours();
      const dayOfWeek = time.getDay();
      return (dayOfWeek === 0 || dayOfWeek === 6) || (hour < 6 || hour > 22);
    });

    if (afterHoursReadings.length > 0) {
      optimizations.push({
        id: `equipment_optimization_${Date.now()}`,
        type: 'equipment_scheduling',
        title: 'Equipment Power Management',
        description: 'Implement power management for equipment running outside business hours',
        potentialSavings: 8000,
        implementationEffort: 'medium',
        confidence: 0.80,
        reasoning: `Equipment running outside business hours detected`,
        affectedSystems: ['Computers', 'Printers', 'Kitchen Equipment', 'Power Management Software'],
        timestamp: new Date().toISOString()
      });
    }

    return optimizations;
  }

  private processEnergyAlerts(alerts: any[]): void {
    // Process incoming energy alerts and update internal state
    this.anomalies = alerts || [];
  }

  // Public methods
  async addEnergyReading(reading: Omit<EnergyReading, 'id' | 'timestamp'>): Promise<string> {
    const newReading: EnergyReading = {
      ...reading,
      id: `energy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return await firebaseService.addEnergyReading(newReading);
  }

  getCurrentPredictions(): EnergyPrediction[] {
    return this.predictions;
  }

  getAnomalies(): EnergyAnomaly[] {
    return this.anomalies;
  }

  getOptimizations(): EnergyOptimization[] {
    return this.optimizations;
  }

  getEnergyMetrics(): EnergyMetrics {
    if (this.energyReadings.length === 0) {
      return {
        totalConsumption: 0,
        totalCost: 0,
        efficiencyScore: 0,
        carbonFootprint: 0,
        renewablePercentage: 0,
        peakDemand: 0,
        averageDemand: 0,
        costPerKwh: 0
      };
    }

    const totalConsumption = this.energyReadings.reduce((sum, r) => sum + r.consumption, 0);
    const totalCost = this.energyReadings.reduce((sum, r) => sum + r.cost, 0);
    const peakDemand = Math.max(...this.energyReadings.map(r => r.consumption));
    const averageDemand = totalConsumption / this.energyReadings.length;
    const costPerKwh = totalCost / totalConsumption;

    // Calculate efficiency score based on consumption patterns
    const efficiencyScore = this.calculateEfficiencyScore();

    // Calculate carbon footprint (assuming 0.5 kg CO2 per kWh)
    const carbonFootprint = totalConsumption * 0.5;

    return {
      totalConsumption,
      totalCost,
      efficiencyScore,
      carbonFootprint,
      renewablePercentage: 15, // Mock value - would come from actual renewable energy data
      peakDemand,
      averageDemand,
      costPerKwh
    };
  }

  private calculateEfficiencyScore(): number {
    if (this.energyReadings.length < 24) return 70; // Default score

    const recentReadings = this.energyReadings.slice(-24);
    const consumptions = recentReadings.map(r => r.consumption);
    
    // Calculate coefficient of variation (lower is better)
    const mean = consumptions.reduce((sum, val) => sum + val, 0) / consumptions.length;
    const variance = consumptions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / consumptions.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Convert to efficiency score (0-100)
    const efficiencyScore = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 50));
    
    return efficiencyScore;
  }

  getPredictionAccuracy(): number {
    if (this.predictions.length === 0 || this.energyReadings.length === 0) return 0;

    // Calculate accuracy based on recent predictions vs actual readings
    const recentPredictions = this.predictions.slice(-24);
    const recentReadings = this.energyReadings.slice(-24);

    if (recentPredictions.length !== recentReadings.length) return 0;

    const errors = recentPredictions.map((pred, index) => {
      const actual = recentReadings[index];
      return Math.abs(pred.predictedConsumption - actual.consumption) / actual.consumption;
    });

    const averageError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const accuracy = Math.max(0, 100 - averageError * 100);

    return accuracy;
  }

  // Cleanup
  cleanup(): void {
    // Cleanup will be handled by Firebase service
  }
}

export const energyPredictorAI = new EnergyPredictorAI();
export default energyPredictorAI;