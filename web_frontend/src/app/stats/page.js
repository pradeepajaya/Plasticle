'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area, AreaChart
} from 'recharts';

const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399', '#f472b6', '#fb7185'];

const ALL_PROVINCES = [
  'Central', 'Eastern', 'Northern', 'Southern',
  'Western', 'North Central', 'North Western', 'Sabaragamuwa', 'Uva'
];

// Smart grouping algorithm for bottle data
function groupBottleData(data, groupKey, valueKey = 'bottleCount') {
  const grouped = new Map();
  
  data.forEach(item => {
    const key = item[groupKey];
    if (!key || key === 'null' || key === 'undefined') return;
    
    const currentValue = grouped.get(key) || 0;
    const itemValue = parseInt(item[valueKey]) || 0;
    grouped.set(key, currentValue + itemValue);
  });
  
  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      [groupKey]: label,
      [valueKey]: value
    }))
    .filter(item => item[valueKey] > 0)
    .sort((a, b) => b[valueKey] - a[valueKey]); // Sort by highest count
}

// Group buyer stats by different dimensions
function groupBuyerData(data, groupKey, valueKey = 'totalBottles') {
  const grouped = new Map();
  
  data.forEach(item => {
    const key = item[groupKey];
    if (!key || key === 'null' || key === 'undefined') return;
    
    const currentValue = grouped.get(key) || 0;
    const itemValue = parseInt(item[valueKey]) || 0;
    grouped.set(key, currentValue + itemValue);
  });
  
  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      [groupKey]: label,
      [valueKey]: value
    }))
    .filter(item => item[valueKey] > 0)
    .sort((a, b) => b[valueKey] - a[valueKey]);
}

export default function StatsPage() {
  const [manufactured, setManufactured] = useState([]);
  const [collected, setCollected] = useState([]);
  const [recycled, setRecycled] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [yearlyStats, setYearlyStats] = useState([]);
  const [buyerBottleStats, setBuyerBottleStats] = useState([]);
  const [buyerSummaryStats, setBuyerSummaryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bottles'); // 'bottles' or 'buyers'

  useEffect(() => {
    const fetchBottleAnalytics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not configured. Please check your environment variables.');
        }

        // Fetch new bottle summary (manufactured, collected, recycled)
        const bottleRes = await fetch(`${apiUrl}/stats/bottle-summary-detailed`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!bottleRes.ok) {
          const errorText = await bottleRes.text();
          throw new Error(`Bottle API Error ${bottleRes.status}: ${errorText}`);
        }
        const bottleData = await bottleRes.json();
        setManufactured(bottleData.manufactured || []);
        setCollected(bottleData.collected || []);
        setRecycled(bottleData.recycled || []);

        // Fetch buyer bottle stats
        const buyerBottleRes = await fetch(`${apiUrl}/stats/buyer-bottle-stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (buyerBottleRes.ok) {
          const buyerBottleData = await buyerBottleRes.json();
          setBuyerBottleStats(buyerBottleData || []);
        }

        // Fetch buyer summary stats
        const buyerSummaryRes = await fetch(`${apiUrl}/stats/buyer-summary-stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (buyerSummaryRes.ok) {
          const buyerSummaryData = await buyerSummaryRes.json();
          setBuyerSummaryStats(buyerSummaryData || []);
        }

        // Generate monthly and yearly stats from collected data
        setMonthlyStats(generateMonthlyFromCollected(bottleData.collected || []));
        setYearlyStats(generateYearlyFromCollected(bottleData.collected || []));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBottleAnalytics();
  }, []);


  // Generate monthly stats from collected data
  const generateMonthlyFromCollected = (collectedData) => {
    const monthlyMap = new Map();
    collectedData.forEach(item => {
      const key = `${item.year}-${item.month}`;
      const existing = monthlyMap.get(key) || {
        year: item.year,
        month: item.month,
        monthName: getMonthName(item.month),
        totalBottles: 0
      };
      existing.totalBottles += item.collectedCount || 0;
      monthlyMap.set(key, existing);
    });
    return Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  // Generate yearly stats from collected data
  const generateYearlyFromCollected = (collectedData) => {
    const yearlyMap = new Map();
    collectedData.forEach(item => {
      const year = item.year;
      const existing = yearlyMap.get(year) || {
        year,
        totalBottles: 0
      };
      existing.totalBottles += item.collectedCount || 0;
      yearlyMap.set(year, existing);
    });
    return Array.from(yearlyMap.values()).sort((a, b) => a.year - b.year);
  };

  const getMonthName = (monthNum) => {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading bottle analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-600 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl mb-4 font-semibold">Connection Issue</h2>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-sm opacity-90 mb-2">Error:</p>
            <p className="text-xs font-mono bg-black/20 p-2 rounded">{error}</p>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <p><strong>Quick Checks:</strong></p>
            <p>1. Backend server running?</p>
            <p>2. Check .env.local file</p>
            <p>3. Test: {process.env.NEXT_PUBLIC_API_URL}/stats/bottle-summary</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Dummy data for fallback
  const dummyCollected = [
    { province: 'Central', manufacturer: 'ABC', year: 2024, month: 6, collectedCount: 120 },
    { province: 'Western', manufacturer: 'XYZ', year: 2024, month: 6, collectedCount: 80 },
    { province: 'Southern', manufacturer: 'DEF', year: 2024, month: 5, collectedCount: 60 },
    { province: 'Central', manufacturer: 'ABC', year: 2024, month: 5, collectedCount: 40 },
    { province: 'Eastern', manufacturer: 'GHI', year: 2023, month: 12, collectedCount: 30 }
  ];

  const dummyBuyerStats = [
    { buyerName: 'John Doe', province: 'Central', manufacturer: 'ABC', year: 2024, month: 6, totalBottles: 25, recycledBottles: 20, recyclingRate: 80 },
    { buyerName: 'Jane Smith', province: 'Western', manufacturer: 'XYZ', year: 2024, month: 6, totalBottles: 15, recycledBottles: 12, recyclingRate: 80 },
    { buyerName: 'Bob Johnson', province: 'Southern', manufacturer: 'DEF', year: 2024, month: 5, totalBottles: 30, recycledBottles: 25, recyclingRate: 83 }
  ];

  const dummyMonthlyStats = [
    { year: 2024, month: 6, monthName: 'Jun', totalBottles: 200 },
    { year: 2024, month: 5, monthName: 'May', totalBottles: 100 },
    { year: 2023, month: 12, monthName: 'Dec', totalBottles: 30 }
  ];

  const dummyYearlyStats = [
    { year: 2024, totalBottles: 300 },
    { year: 2023, totalBottles: 30 }
  ];

  // Use dummy data if real data is empty
  const collectedToUse = collected.length > 0 ? collected : dummyCollected;
  const buyerStatsToUse = buyerBottleStats.length > 0 ? buyerBottleStats : dummyBuyerStats;
  const monthlyStatsToUse = monthlyStats.length > 0 ? monthlyStats : dummyMonthlyStats;
  const yearlyStatsToUse = yearlyStats.length > 0 ? yearlyStats : dummyYearlyStats;

  // Process grouped data from collected stats
  const manufacturerData = groupBottleData(collectedToUse, 'manufacturer', 'collectedCount');
  const provinceData = groupBottleData(collectedToUse, 'province', 'collectedCount');

  // Process buyer data
  const buyerProvinceData = groupBuyerData(buyerStatsToUse, 'province', 'totalBottles');
  const buyerManufacturerData = groupBuyerData(buyerStatsToUse, 'manufacturer', 'totalBottles');

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-600 py-6 px-4">
      <a href="/dashboard" className="text-white text-sm underline hover:text-gray-200 block mb-4">
        &larr; Back to Dashboard
      </a>

      <h1 className="text-4xl font-bold text-white text-center mb-8 drop-shadow">
        🍾 Bottle Disposal & Collection Analytics
      </h1>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('bottles')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'bottles'
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📊 Bottle Analytics
          </button>
          <button
            onClick={() => setActiveTab('buyers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'buyers'
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            👥 Buyer Analytics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Total Disposed</h3>
            <p className="text-2xl font-bold text-green-600">
              {collectedToUse.reduce((sum, item) => sum + (item.collectedCount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Active Buyers</h3>
            <p className="text-2xl font-bold text-blue-600">
              {buyerStatsToUse.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Manufacturers</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {manufacturerData.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">Active Provinces</h3>
            <p className="text-2xl font-bold text-purple-600">
              {provinceData.length}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bottles' && (
          <>
            {/* Time-based Analytics */}
            {(monthlyStatsToUse.length > 0 || yearlyStatsToUse.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Disposal Trend */}
                {monthlyStatsToUse.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                      📅 Monthly Disposal Timeline
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={monthlyStatsToUse}>
                        <XAxis dataKey="monthName" fontSize={12} />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(label, payload) => 
                            payload?.[0]?.payload ? `${label} ${payload[0].payload.year}` : label
                          }
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="totalBottles" 
                          fill="#34d399" 
                          stroke="#059669"
                          fillOpacity={0.6}
                          name="Total Disposed"
                        />
                        <Bar dataKey="recycledBottles" fill="#3b82f6" name="Recycled" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Yearly Performance */}
                {yearlyStatsToUse.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                      📈 Yearly Recycling Performance
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={yearlyStatsToUse}>
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="totalBottles" fill="#10b981" name="Total Bottles" />
                        <Line yAxisId="right" type="monotone" dataKey="recyclingRate" stroke="#f59e0b" strokeWidth={3} name="Recycling Rate %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Distribution Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Manufacturer Performance */}
              {manufacturerData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                    🏭 Bottles by Manufacturer
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={manufacturerData} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="manufacturer" 
                        type="category" 
                        width={100}
                        fontSize={11}
                      />
                      <Tooltip formatter={(value) => [`${value} bottles`, 'Disposed']} />
                      <Bar dataKey="bottleCount">
                        {manufacturerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Province Distribution */}
              {provinceData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                    🗺️ Disposal by Province
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={provinceData}
                        dataKey="bottleCount"
                        nameKey="province"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({province, bottleCount, percent}) => 
                          `${province}: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {provinceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} bottles`, 'Disposed']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'buyers' && (
          <>
            {/* Buyer Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Buyer by Province */}
              {buyerProvinceData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                    🗺️ Bottles Collected by Buyers (by Province)
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={buyerProvinceData}>
                      <XAxis dataKey="province" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} bottles`, 'Collected by Buyers']} />
                      <Bar dataKey="totalBottles" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Buyer by Manufacturer */}
              {buyerManufacturerData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                    🏭 Bottles Collected by Buyers (by Manufacturer)
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={buyerManufacturerData}
                        dataKey="totalBottles"
                        nameKey="manufacturer"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({manufacturer, totalBottles, percent}) => 
                          `${manufacturer}: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {buyerManufacturerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} bottles`, 'Collected by Buyers']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Detailed Buyer Table */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Detailed Buyer Collection Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 px-3">Buyer Name</th>
                      <th className="text-left py-2 px-3">Province</th>
                      <th className="text-left py-2 px-3">Manufacturer</th>
                      <th className="text-center py-2 px-3">Year</th>
                      <th className="text-center py-2 px-3">Month</th>
                      <th className="text-right py-2 px-3">Total Bottles</th>
                      <th className="text-right py-2 px-3">Recycled</th>
                      <th className="text-right py-2 px-3">Recycling Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerStatsToUse.slice(0, 20).map((stat, index) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{stat.buyerName || 'Unknown'}</td>
                        <td className="py-2 px-3">{stat.province || 'Unknown'}</td>
                        <td className="py-2 px-3">{stat.manufacturer || 'Unknown'}</td>
                        <td className="py-2 px-3 text-center">{stat.year || '-'}</td>
                        <td className="py-2 px-3 text-center">{stat.monthName || getMonthName(stat.month) || '-'}</td>
                        <td className="py-2 px-3 text-right">{(typeof stat.totalBottles === 'number' ? stat.totalBottles : 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">{(typeof stat.recycledBottles === 'number' ? stat.recycledBottles : 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">{stat.recyclingRate || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {buyerStatsToUse.length > 20 && (
                  <p className="text-gray-500 text-center mt-4">Showing first 20 entries of {buyerStatsToUse.length} total records</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Summary Tables for Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bottles by Month */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bottles Disposed by Month</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-1 px-2">Year</th>
                  <th className="text-left py-1 px-2">Month</th>
                  <th className="text-right py-1 px-2">Disposed</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStatsToUse.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-1 px-2">{item.year}</td>
                    <td className="py-1 px-2">{item.monthName}</td>
                    <td className="py-1 px-2 text-right">{(typeof item.totalBottles === 'number' ? item.totalBottles : 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Bottles by Year */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bottles Disposed by Year</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-1 px-2">Year</th>
                  <th className="text-right py-1 px-2">Disposed</th>
                </tr>
              </thead>
              <tbody>
                {yearlyStatsToUse.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-1 px-2">{item.year}</td>
                    <td className="py-1 px-2 text-right">{(typeof item.totalBottles === 'number' ? item.totalBottles : 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Table for debugging */}
        {collected.length === 0 && !loading && (
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">No Data Available</h3>
            <p className="text-gray-600 mb-2">Showing sample statistics for demonstration.</p>
          </div>
        )}
      </div>
    </div>
  );
}
