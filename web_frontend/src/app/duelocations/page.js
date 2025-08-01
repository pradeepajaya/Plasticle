'use client';

import { useEffect, useState } from 'react';
import {
  getDueLocations,
  getAvailableCollectors,
  allocateCollector,
} from '../../services/api';
import socket from '../../utils/socket';

// Helper function to check if a string looks like coordinates
const looksLikeCoordinates = (str) => {
  if (typeof str !== 'string') return false;
  const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  return coordPattern.test(str.trim());
};

// Helper function to convert coordinates to location name
const getLocationNameFromCoordinates = async (coordinates) => {
  try {
    if (!looksLikeCoordinates(coordinates)) {
      return coordinates;
    }

    const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    
    if (isNaN(lat) || isNaN(lng)) {
      return coordinates;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BinManagementSystem/1.0'
        }
      }
    );

    if (!response.ok) {
      return coordinates;
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      const address = data.address || {};
      const locationParts = [];
      
      if (address.road) locationParts.push(address.road);
      if (address.suburb) locationParts.push(address.suburb);
      if (address.city || address.town || address.village) {
        locationParts.push(address.city || address.town || address.village);
      }
      if (address.state) locationParts.push(address.state);
      
      if (locationParts.length > 0) {
        return locationParts.join(', ');
      }
      
      return data.display_name.length > 100 
        ? data.display_name.substring(0, 100) + '...'
        : data.display_name;
    }
    
    return coordinates;
  } catch (error) {
    console.error('Error converting coordinates:', error);
    return coordinates;
  }
};

export default function DueLocationsPage() {
  const [locations, setLocations] = useState({});
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedCollectors, setSelectedCollectors] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [allocatedCollectors, setAllocatedCollectors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [locationNames, setLocationNames] = useState({}); // Store converted location names

  // Function to convert coordinates to location names for all areas
  const convertCoordinatesToNames = async (locationsData) => {
    const namePromises = {};
    
    for (const [city, areas] of Object.entries(locationsData)) {
      for (const area of areas) {
        const areaKey = area._id || area.binId || JSON.stringify(area.area);
        const areaText = typeof area.area === 'string' ? area.area : JSON.stringify(area.area);
        
        if (looksLikeCoordinates(areaText)) {
          namePromises[areaKey] = getLocationNameFromCoordinates(areaText);
        }
      }
    }
    
    const resolvedNames = {};
    for (const [key, promise] of Object.entries(namePromises)) {
      try {
        resolvedNames[key] = await promise;
      } catch (error) {
        console.error(`Error converting coordinates for ${key}:`, error);
      }
    }
    
    setLocationNames(resolvedNames);
  };

  const refetchBins = async () => {
    try {
      const resLocations = await getDueLocations();
      if (resLocations?.data) {
        setLocations(resLocations.data);
        // Convert coordinates to location names
        await convertCoordinatesToNames(resLocations.data);
      }
    } catch (err) {
      console.error('Failed to refetch due locations:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLocations = await getDueLocations();
        const resCollectors = await getAvailableCollectors();

        let allBins = [];
        let fullBins = [];

        if (resLocations?.data) {
          setLocations(resLocations.data);
          allBins = Object.values(resLocations.data).flat();
          fullBins = allBins.filter((bin) => bin.isCritical === true);
          
          // Convert coordinates to location names
          await convertCoordinatesToNames(resLocations.data);
        }

        if (resCollectors?.data) {
          setCollectors(resCollectors.data);
        } else {
          setCollectors([]);
        }

        const allBinsFull = allBins.length > 0 && fullBins.length === allBins.length;
        const noActiveCollectors =
          resCollectors?.data?.filter((c) => c.activePersonal)?.length === 0;

        if (allBinsFull && noActiveCollectors) {
          setShowModal(true);
        }

      } catch (err) {
        console.error('Failed to fetch due locations or collectors:', err);
        alert('Error fetching due locations or collectors');
      } finally {
        setFetching(false);
      }
    };

    fetchData();

    // Socket listener
    socket.on('bin-rejected-update', () => {
      console.log('Bin rejected — refetching due locations...');
      refetchBins();
    });

    return () => {
      socket.off('bin-rejected-update');
    };
    
  }, []);

  const handleAllocateCollector = async (binObjectId, collectorId, selectedDate) => {
    if (!collectorId || !binObjectId || !selectedDate) {
      alert('Please select a collector and a date.');
      return;
    }

    setLoading(true);
    try {
      const res = await allocateCollector(binObjectId, collectorId, selectedDate);
      if (
        res?.status === 200 ||
        res?.data?.message === 'Collector allocated successfully'
      ) {
        alert('Collector allocated successfully!');

        const collector = collectors.find((c) => c._id === collectorId);
        const collectorName =
          collector?.userId?.nickname ||
          collector?.userId?.username ||
          `Collector ${collectorId.slice(-4)}`;

        setAllocatedCollectors((prev) => ({
          ...prev,
          [binObjectId]: collectorName,
        }));

        setSelectedCollectors((prev) => ({ ...prev, [binObjectId]: '' }));
        setSelectedDates((prev) => ({ ...prev, [binObjectId]: '' }));
      } else {
        alert('Failed to allocate collector.');
      }
    } catch (err) {
      console.error('Error allocating collector:', err);
      alert('Error allocating collector');
    } finally {
      setLoading(false);
    }
  };

  const totalFullBins = Object.values(locations)
    .flat()
    .filter((bin) => bin.isCritical === true).length;

  const totalBins = Object.values(locations).flat().length;

  // Helper function to get display location name
  const getDisplayLocationName = (area) => {
    const binObjectId = area._id || area.binId || 'unknown-bin';
    const areaText = typeof area.area === 'string' ? area.area : JSON.stringify(area.area);
    
    // If we have a converted location name, use it
    if (locationNames[binObjectId]) {
      return locationNames[binObjectId];
    }
    
    // If area has displayLocation field (from backend), use it
    if (area.displayLocation) {
      return area.displayLocation;
    }
    
    // Otherwise use the original area text
    return areaText;
  };

  return (
   <div className="bg-gradient-to-br from-green-900 via-emerald-700 to-green-600">
      {/* Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚨</span>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Critical Alert</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                All bins are full and no active collectors are available. 
                <br />
                <strong>Immediate action required!</strong>
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white">
            Collection Management
          </h1>
          <p className="text-xl text-gray-300 font-light">Monitor and allocate waste collection tasks</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Locations</p>
                <p className="text-3xl font-bold text-gray-900">{totalBins}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Critical Bins</p>
                <p className="text-3xl font-bold text-red-600">{totalFullBins}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available Collectors</p>
                <p className="text-3xl font-bold text-green-800">{collectors.filter(c => c.activePersonal).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Locations List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Collection Locations</h2>
            <p className="text-green-100 mt-1">Manage waste collection assignments</p>
          </div>

          <div className="p-6">
            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
                <span className="ml-3 text-lg text-gray-600">Loading locations...</span>
              </div>
            ) : Object.entries(locations).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Due Locations</h3>
                <p className="text-gray-600">All locations are up to date!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(locations).map(([city, areas]) => (
                  <div key={city} className="space-y-4">
                    {areas
                      .sort((a, b) => (b.isCritical === true) - (a.isCritical === true))
                      .map((area, index) => {
                        const binObjectId = area._id || area.binId || 'unknown-bin';
                        const displayLocationName = getDisplayLocationName(area);
                        const isCritical = area.isCritical;

                        return (
                          <div
                            key={index}
                            className={`rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                              isCritical
                                ? 'bg-red-50 border-red-200 hover:border-red-300'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Location Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {displayLocationName}
                                </h3>
                                <div className="flex items-center space-x-3">
                                  {allocatedCollectors[binObjectId] ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Allocated to {allocatedCollectors[binObjectId]}
                                    </span>
                                  ) : isCritical ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      Critical - Needs Collection
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Normal Status
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Allocation Controls */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-green-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <h4 className="text-lg font-semibold text-gray-800">
                                  Assign Collection Task
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                                {/* Collector Dropdown */}
                                <div className="lg:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Collector
                                  </label>
                                  <div className="relative">
                                    <select
                                      className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:ring-3 focus:ring-green-200 focus:border-green-800 transition-all duration-200 appearance-none cursor-pointer hover:border-green-600 shadow-sm"
                                      onChange={(e) =>
                                        setSelectedCollectors((prev) => ({
                                          ...prev,
                                          [binObjectId]: e.target.value,
                                        }))
                                      }
                                      value={selectedCollectors[binObjectId] || ''}
                                    >
                                      <option value="">Choose a collector...</option>
                                      {collectors.length === 0 ? (
                                        <option disabled>⚠️ No collectors available</option>
                                      ) : (
                                        collectors
                                          .filter((c) => {
                                            const prefersThisBin = Array.isArray(c.preferredBins) &&
                                              c.preferredBins.some((b) =>
                                                b._id?.toString() === binObjectId?.toString()
                                              );
                                            const hasNoPrefs =
                                              !Array.isArray(c.preferredBins) ||
                                              c.preferredBins.length === 0;
                                            return c.activePersonal && (prefersThisBin || hasNoPrefs);
                                          })
                                          .map((c) => (
                                            <option key={c._id} value={c._id}>
                                              👤 {c.userId?.nickname || 'Collector'} (ID: {c._id.slice(-4)}) 
                                              📍 [{c.location?.coordinates[1]?.toFixed(2)}, {c.location?.coordinates[0]?.toFixed(2)}]
                                            </option>
                                          ))
                                      )}
                                    </select>
                                    {/* Dropdown Icon */}
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {/* Date Picker */}
                                <div className="lg:col-span-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Collection Date
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="date"
                                      className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:ring-3 focus:ring-green-200 focus:border-green-800 transition-all duration-200 hover:border-green-600 shadow-sm"
                                      value={selectedDates[binObjectId] || ''}
                                      min={new Date().toISOString().split('T')[0]}
                                      onChange={(e) =>
                                        setSelectedDates((prev) => ({
                                          ...prev,
                                          [binObjectId]: e.target.value,
                                        }))
                                      }
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {/* Allocate Button */}
                                <div className="lg:col-span-3">
                                  <button
                                    onClick={() =>
                                      handleAllocateCollector(
                                        binObjectId,
                                        selectedCollectors[binObjectId],
                                        selectedDates[binObjectId]
                                      )
                                    }
                                    disabled={
                                      loading ||
                                      !selectedCollectors[binObjectId] ||
                                      !selectedDates[binObjectId]
                                    }
                                    className="w-full px-6 py-3 bg-gradient-to-r from-green-800 to-green-700 text-white rounded-xl hover:from-green-900 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center space-x-2"
                                  >
                                    {loading ? (
                                      <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Assigning...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Assign Task</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}