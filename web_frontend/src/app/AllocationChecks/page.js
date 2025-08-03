'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Package, Clock, Trash2 } from 'lucide-react';

const AllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assigned-collectors`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch allocations');
      }
      
      const data = await response.json();
      setAllocations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUnassign = async (binId, collectorId) => {
    if (!window.confirm('Are you sure you want to unassign this bin?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/unassign-bin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ binId, collectorId })
      });
      
      if (response.ok) {
        fetchAllocations(); // Refresh the data
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to unassign bin');
      }
    } catch (err) {
      alert('Error unassigning bin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading allocations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Error Loading Data</h3>
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
          <button 
            onClick={fetchAllocations}
            className="mt-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-200 to-green-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Collector Allocations</h1>
              <p className="text-emerald-100 text-lg">Monitor and manage active collector assignments</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="text-sm text-emerald-100 font-medium">Active Allocations</div>
              <div className="text-3xl font-bold text-white">{allocations.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {allocations.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Active Allocations</h3>
              <p className="text-gray-600 leading-relaxed">No collectors are currently assigned to bins. New allocations will appear here once created.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {allocations.map((allocation, index) => (
              <div key={allocation.collectorId} className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                {/* Collector Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {allocation.collectorDetails.nickname}
                        </h3>
                        <p className="text-emerald-100 text-lg">
                          {allocation.collectorDetails.email}
                        </p>
                        <div className="text-emerald-100 text-sm mt-1">
                          ID: {allocation.collectorDetails.username}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                        <div className="text-emerald-100 text-sm font-medium mb-1">Total Assigned</div>
                        <div className="text-white text-2xl font-bold">
                          {allocation.totalBins} <span className="text-lg font-medium">bins</span>
                        </div>
                        <div className="text-emerald-100 text-lg">
                          {allocation.totalBottles} bottles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Bins */}
                <div className="p-8">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Assigned Bins</h4>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {allocation.assignedBins.map((bin, binIndex) => (
                      <div key={bin.binId} className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-800 text-lg">
                                Bin #{binIndex + 1}
                              </h5>
                              <button
                                onClick={() => handleUnassign(bin.binId, allocation.collectorId)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                                title="Unassign bin"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg mb-3">
                              {bin.binId}
                            </div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                              <span className="font-medium">{bin.locationName || bin.location || 'Unknown Location'}</span>
                            </div>
                            {bin.city && (
                              <div className="text-sm text-gray-600 ml-6">
                                {bin.city}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Capacity</span>
                            <span className="font-bold text-gray-800">{bin.capacity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Current Fill</span>
                            <span className="font-bold text-emerald-600">{bin.currentFill}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Fill Level</span>
                              <span>{Math.round((bin.currentFill / bin.capacity) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min((bin.currentFill / bin.capacity) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {bin.collectionDate && (
                            <div className="bg-white rounded-xl p-4 border border-emerald-200">
                              <div className="flex items-center text-emerald-700">
                                <Clock className="h-4 w-4 mr-2" />
                                <div>
                                  <div className="text-sm font-medium">Collection Due</div>
                                  <div className="font-bold">{formatDate(bin.collectionDate)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationsPage;