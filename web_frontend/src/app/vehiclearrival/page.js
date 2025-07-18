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

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-lime-500 to-white py-6 px-10">
      <a href="/dashboard" className="text-white text-sm underline hover:text-gray-200 block mb-4">
        &larr; Back to Dashboard
      </a>

      <h1 className="text-4xl font-bold mb-10 text-center drop-shadow">🚛 Vehicle Arrival Overview</h1>

      {/* Vehicle Arrival Section */}
      {loadingVehicles ? (
        <p className="text-white text-center">Loading vehicle data...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-center">No vehicle arrivals recorded.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {vehicles.map((vehicle, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-90 shadow-lg rounded-xl p-6 border border-gray-200"
            >
              <h2 className="text-2xl font-semibold mb-3">
                🚚 Vehicle: {vehicle.vehicleId || "N/A"} Arrived after collection.
              </h2>
              <p><strong>Collector ID:</strong> {vehicle.collectorId || "N/A"}</p>
              <p><strong>Collection Date:</strong> {formatDate(vehicle.collectionDate)}</p>
              <p><strong>Bins Collected (Count):</strong> {vehicle.totalBins ?? 0}</p>
              <p><strong>Total Bottles Collected:</strong> {vehicle.totalBottles ?? 0}</p>

              <div className="mt-2">
                <strong>Collected Areas (Bin Locations):</strong>
                {vehicle.collectedLocations?.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-700 text-sm">
                    {vehicle.collectedLocations.map((location, i) => (
                      <li key={i}>{location}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm italic">No areas collected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Collector Statistics Section */}
      <h1 className="text-3xl font-bold mb-6 text-center drop-shadow"> Daily Collector Statistics</h1>

      {loadingStats ? (
        <p className="text-center">Loading daily statistics...</p>
      ) : dailyStats.length === 0 ? (
        <p className="text-center">No daily statistics available.</p>
      ) : (
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Collectors</th>
                <th className="border border-gray-300 px-4 py-2">Collected Bins</th> 
                <th className="border border-gray-300 px-4 py-2">Bottles Collected</th>
                <th className="border border-gray-300 px-4 py-2">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map(stat => (
                <tr key={stat.date} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{stat.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{stat.totalCollectors}</td>
                  <td className="border border-gray-300 px-4 py-2">{stat.totalBinsCollected ?? "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{stat.totalBottlesCollected}</td>
                  <td className="border border-gray-300 px-4 py-2 w-20 h-20">
                    <CircularProgressbar
                      value={stat.collectionSuccessRate}
                      text={`${stat.collectionSuccessRate.toFixed(1)}%`}
                      styles={buildStyles({
                        textSize: '28px',
                        pathColor: `rgba(62, 152, 199, ${stat.collectionSuccessRate / 100})`,
                        textColor: '#3e98c7',
                        trailColor: '#d6d6d6',
                      })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
