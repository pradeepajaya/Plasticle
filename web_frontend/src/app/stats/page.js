'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/bottle-summary`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
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
      ) : !stats ? (
        <p className="text-white text-center">No statistics found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Province Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">By Province</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byProvince}>
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
                  data={stats.byAgeGroup}
                  dataKey="totalBottles"
                  nameKey="ageGroup"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#60a5fa"
                  label
                >
                  {stats.byAgeGroup.map((entry, index) => (
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
              <BarChart data={stats.byManufacturer} layout="vertical">
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
