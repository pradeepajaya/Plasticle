'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];

function groupBy(data, key) {
  const grouped = {};
  data.forEach(item => {
    const groupKey = item[key];
    if (!grouped[groupKey]) {
      grouped[groupKey] = 0;
    }
    grouped[groupKey] += item.totalBottles;
  });
  return Object.entries(grouped).map(([label, totalBottles]) => ({
    [key]: label,
    totalBottles
  }));
}

export default function StatsPage() {
  const [rawStats, setRawStats] = useState([]);
  const [byProvinceData, setByProvinceData] = useState([]);
  const [byAgeGroupData, setByAgeGroupData] = useState([]);
  const [byManufacturerData, setByManufacturerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/stats/bottle-summary`;
        console.log('Fetching stats from:', apiUrl);

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();
        console.log('Fetched stats:', data);

        setRawStats(data);

        // Grouping logic
        const provinces = groupBy(data, 'province');
        const ages = groupBy(data, 'ageGroup');
        const manufacturers = groupBy(data, 'manufacturer');

        console.log('Grouped by Province:', provinces);
        console.log('Grouped by Age Group:', ages);
        console.log('Grouped by Manufacturer:', manufacturers);

        setByProvinceData(provinces);
        setByAgeGroupData(ages);
        setByManufacturerData(manufacturers);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-600 py-6 px-10">
      <a href="/dashboard" className="text-white text-sm underline hover:text-gray-200 block mb-4">
        &larr; Back to Dashboard
      </a>

      <h1 className="text-4xl font-bold text-white text-center mb-8 drop-shadow">Bottle Collection Statistics</h1>

      {loading ? (
        <p className="text-white text-center">Loading statistics...</p>
      ) : rawStats.length === 0 ? (
        <p className="text-white text-center">No statistics found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Province Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">By Province</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byProvinceData}>
                <XAxis dataKey="province" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalBottles" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Group Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">By Age Group</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byAgeGroupData}
                  dataKey="totalBottles"
                  nameKey="ageGroup"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {byAgeGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Manufacturer Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold text-center mb-4">By Manufacturer</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byManufacturerData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="manufacturer" type="category" />
                <Tooltip />
                <Bar dataKey="totalBottles" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
