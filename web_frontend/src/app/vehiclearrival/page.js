'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function VehicleArrivalPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [dailyStats, setDailyStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch vehicle arrival data
    const fetchVehicleData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehiclearrival-basic`);
        if (!response.ok) {
          console.error("Failed to fetch vehicle data, status:", response.status);
          return;
        }
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicle arrival data:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    // Fetch daily collector stats
    const fetchDailyStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/daily-collection-stats`);
        if (!response.ok) {
          console.error("Failed to fetch daily stats, status:", response.status);
          return;
        }
        const data = await response.json();
        setDailyStats(data);
      } catch (error) {
        console.error('Error fetching daily collector stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchVehicleData();
    fetchDailyStats();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const totalVehicles = vehicles.length;
  const totalBottlesCollected = vehicles.reduce((sum, vehicle) => sum + (vehicle.totalBottles || 0), 0);
  const totalBinsCollected = vehicles.reduce((sum, vehicle) => sum + (vehicle.totalBins || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-700 via-emerald-500 to-green-600">
      {/* Header Section */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Vehicle Arrival Overview
            </h1>
            <p className="text-xl text-white/90 font-light">
              Monitor collection vehicles and daily performance metrics
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Bins</p>
                <p className="text-3xl font-bold text-blue-600">{totalBinsCollected}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Bottles</p>
                <p className="text-3xl font-bold text-emerald-600">{totalBottlesCollected.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Arrival Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/30 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white">Vehicle Collections</h2>
                <p className="text-green-100 mt-1">Recent collection vehicle arrivals and data</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingVehicles ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                <span className="ml-3 text-lg text-gray-600">Loading vehicle data...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicle Arrivals</h3>
                <p className="text-gray-600">No vehicle arrivals have been recorded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vehicles.map((vehicle, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Vehicle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Vehicle: {vehicle.vehicleId || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-600">Collection completed</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        ✅ Arrived
                      </span>
                    </div>

                    {/* Vehicle Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Collector ID:</span>
                        <span className="text-sm font-semibold text-gray-900">{vehicle.collectorId || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Collection Date:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatDate(vehicle.collectionDate)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Bins Collected:</span>
                        <span className="text-sm font-semibold text-blue-600">{vehicle.totalBins ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Bottles Collected:</span>
                        <span className="text-sm font-semibold text-emerald-600">{(vehicle.totalBottles ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Collected Areas */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Collected Areas
                      </h4>
                      {vehicle.collectedLocations?.length > 0 ? (
                        <div className="space-y-1">
                          {vehicle.collectedLocations.map((location, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{location}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No areas collected</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Collector Statistics Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white">Daily Performance Statistics</h2>
                <p className="text-green-100 mt-1">Track daily collection metrics and success rates</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                <span className="ml-3 text-lg text-gray-600">Loading daily statistics...</span>
              </div>
            ) : dailyStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Statistics Available</h3>
                <p className="text-gray-600">Daily statistics will appear here once data is collected.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-tl-lg">
                        📅 Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        👥 Collectors
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        🗑️ Bins Collected
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        🍶 Bottles Collected
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-tr-lg">
                        ✅ Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailyStats.map((stat, index) => (
                      <tr key={stat.date} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors duration-200`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {stat.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {stat.totalCollectors}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {stat.totalBinsCollected ?? "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {stat.totalBottlesCollected?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-16 h-16 mx-auto">
                            <CircularProgressbar
                              value={stat.collectionSuccessRate}
                              text={`${stat.collectionSuccessRate.toFixed(1)}%`}
                              styles={buildStyles({
                                textSize: '24px',
                                pathColor: stat.collectionSuccessRate >= 80 ? '#10b981' : stat.collectionSuccessRate >= 60 ? '#f59e0b' : '#ef4444',
                                textColor: stat.collectionSuccessRate >= 80 ? '#10b981' : stat.collectionSuccessRate >= 60 ? '#f59e0b' : '#ef4444',
                                trailColor: '#e5e7eb',
                                strokeLinecap: 'round',
                              })}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}