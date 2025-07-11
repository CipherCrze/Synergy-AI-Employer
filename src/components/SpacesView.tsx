import React, { useState } from 'react';
import { MapPin, Users, Thermometer, Volume2, Wifi, Coffee, Car, Shield, Plus, Edit, Trash2, Search, Filter, Grid, List, Eye, Settings } from 'lucide-react';
import { useDetailedSpaces } from '../hooks/useAPI';
import { apiService } from '../services/api';

interface SpacesViewProps {
  zoneHeatmap: any[];
  userType: 'employer' | 'executive';
}

const SpacesView: React.FC<SpacesViewProps> = ({ zoneHeatmap, userType }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Use API hook for space data
  const { 
    data: spacesResponse, 
    loading: spacesLoading, 
    error: spacesError,
    refetch: refetchSpaces 
  } = useDetailedSpaces({
    search: searchTerm || undefined,
    status_filter: filterStatus !== 'all' ? filterStatus : undefined,
    limit: 20
  });

  const detailedSpaces = spacesResponse?.spaces || [];
  const totalSpaces = spacesResponse?.total || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overutilized': return 'bg-red-100 text-red-800 border-red-200';
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'underutilized': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const handleAddSpace = async (spaceData: any) => {
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await apiService.addSpace(spaceData);
      setShowAddModal(false);
      refetchSpaces();
    } catch (error) {
      setActionError('Failed to add space. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (spacesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading spaces...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (spacesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading spaces: {spacesError}</p>
          <button 
            onClick={refetchSpaces}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SpaceCard = ({ space }: { space: any }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{space.name}</h3>
          <p className="text-sm text-gray-600">Floor {space.floor} • {space.type.replace('_', ' ')}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(space.status)}`}>
          {space.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Occupancy</p>
          <p className="text-lg font-semibold text-gray-900">{space.current}/{space.capacity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Utilization</p>
          <p className="text-lg font-semibold text-gray-900">{(space.utilization * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(space.current / space.capacity) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Thermometer className="w-4 h-4" />
            <span>{space.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <Volume2 className="w-4 h-4" />
            <span>{space.noise.toFixed(0)}dB</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">Rating:</span>
          <span className="text-sm font-medium text-yellow-600">{space.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {space.amenities.slice(0, 3).map((amenity: string, index: number) => (
            <div key={index} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              {getAmenityIcon(amenity)}
            </div>
          ))}
          {space.amenities.length > 3 && (
            <span className="text-xs text-gray-500">+{space.amenities.length - 3}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSelectedSpace(space)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {userType === 'employer' && (
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const SpaceListItem = ({ space }: { space: any }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-medium text-gray-900">{space.name}</h3>
            <p className="text-sm text-gray-600">Floor {space.floor} • {space.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{space.current}/{space.capacity}</p>
            <p className="text-xs text-gray-600">Occupancy</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{(space.utilization * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-600">Utilization</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{space.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-gray-600">Temperature</p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(space.status)}`}>
            {space.status}
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSelectedSpace(space)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            {userType === 'employer' && (
              <button 
                onClick={() => {/* Handle edit */}}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Space Management</h2>
            <p className="text-gray-600">Monitor and manage workspace utilization</p>
            {actionError && (
              <p className="text-sm text-red-600 mt-1">{actionError}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="optimal">Optimal</option>
              <option value="underutilized">Underutilized</option>
              <option value="overutilized">Overutilized</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Add Space Button */}
            {userType === 'employer' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Space</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Space Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spaces</p>
              <p className="text-2xl font-bold text-gray-900">{detailedSpaces.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Grid className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {detailedSpaces.filter(s => s.current > s.capacity * 0.7).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {detailedSpaces.filter(s => s.current < s.capacity * 0.3).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {(detailedSpaces.reduce((sum, s) => sum + s.utilization, 0) / detailedSpaces.length * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Spaces Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {detailedSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {detailedSpaces.map((space) => (
            <SpaceListItem key={space.id} space={space} />
          ))}
        </div>
      )}

      {viewMode === 'map' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Floor Plan View</h3>
          <div className="grid grid-cols-12 gap-1 max-w-4xl mx-auto">
            {zoneHeatmap.map((zone) => (
              <div
                key={zone.id}
                className="aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: zone.status === 'free' ? '#1e40af' : 
                                  zone.status === 'assigned' ? '#60a5fa' : 
                                  zone.status === 'occupied' ? '#6b7280' : '#f59e0b' 
                }}
                title={`Zone ${zone.id}: ${zone.status}${zone.employee ? ` - ${zone.employee}` : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Space Detail Modal */}
      {selectedSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedSpace.name}</h2>
                <button
                  onClick={() => setSelectedSpace(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Space Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Type:</span> {selectedSpace.type.replace('_', ' ')}</p>
                    <p><span className="text-gray-600">Floor:</span> {selectedSpace.floor}</p>
                    <p><span className="text-gray-600">Capacity:</span> {selectedSpace.capacity} people</p>
                    <p><span className="text-gray-600">Current Occupancy:</span> {selectedSpace.current} people</p>
                    <p><span className="text-gray-600">Utilization:</span> {(selectedSpace.utilization * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Environment</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Temperature:</span> {selectedSpace.temperature.toFixed(1)}°C</p>
                    <p><span className="text-gray-600">Humidity:</span> {selectedSpace.humidity.toFixed(1)}%</p>
                    <p><span className="text-gray-600">Noise Level:</span> {selectedSpace.noise.toFixed(0)}dB</p>
                    <p><span className="text-gray-600">Air Quality:</span> {selectedSpace.airQuality.toFixed(0)}/100</p>
                    <p><span className="text-gray-600">Rating:</span> {selectedSpace.rating.toFixed(1)}/5</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSpace.amenities.map((amenity: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {amenity.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Maintenance</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Last Cleaned:</span> {new Date(selectedSpace.last_cleaned).toLocaleDateString()}</p>
                  <p><span className="text-gray-600">Next Maintenance:</span> {new Date(selectedSpace.next_maintenance).toLocaleDateString()}</p>
                  <p><span className="text-gray-600">Today's Bookings:</span> {selectedSpace.bookings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacesView;