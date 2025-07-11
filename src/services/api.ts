import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  autoFetch: boolean = true
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

// Specific hooks for common API calls
export function useOccupancyData(timeRange: string = 'today') {
  return useApi(
    () => apiService.getOccupancyData(timeRange),
    [timeRange]
  );
}

export function useSpaceData() {
  return useApi(() => apiService.getSpaceData());
}

export function useEnvironmentalData() {
  return useApi(() => apiService.getEnvironmentalData());
}

export function useWeeklyTrend() {
  return useApi(() => apiService.getWeeklyTrend());
}

export function useZoneHeatmap() {
  return useApi(() => apiService.getZoneHeatmap());
}

export function useEmployees(params: {
  search?: string;
  department?: string;
  status?: string;
  limit?: number;
} = {}) {
  return useApi(
    () => apiService.getEmployees(params),
    [params.search, params.department, params.status, params.limit]
  );
}

export function useDetailedSpaces(params: {
  search?: string;
  status_filter?: string;
  limit?: number;
} = {}) {
  return useApi(
    () => apiService.getDetailedSpaces(params),
    [params.search, params.status_filter, params.limit]
  );
}

export function useAlerts(params: {
  severity?: string;
  resolved?: boolean;
  limit?: number;
} = {}) {
  return useApi(
    () => apiService.getAlerts(params),
    [params.severity, params.resolved, params.limit]
  );
}

export function useDashboardSummary() {
  return useApi(() => apiService.getDashboardSummary());
}

export function usePredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
  return useApi(
    () => apiService.getPredictions(metricType, forecastDays),
    [metricType, forecastDays]
  );
}

export function useDashboardPredictions(metricType: string = 'occupancy', forecastDays: number = 7) {
  return useApi(
    () => apiService.getDashboardPredictions(metricType, forecastDays),
    [metricType, forecastDays]
  );
}

export function useDashboardOptimization(params: {
  category?: string;
  priority?: number;
} = {}) {
  return useApi(
    () => apiService.getDashboardOptimization(params),
    [params.category, params.priority]
  );
}

export function useOptimizationSuggestions(params: {
  category?: string;
  priority?: number;
} = {}) {
  return useApi(
    () => apiService.getOptimizationSuggestions(params),
    [params.category, params.priority]
  );
}
