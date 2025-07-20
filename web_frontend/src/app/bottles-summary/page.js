'use client';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchAndTransform = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const generateChartData = (label, dataObject, color) => ({
  labels: Object.keys(dataObject),
  datasets: [{
    label,
    data: Object.values(dataObject),
    backgroundColor: color,
  }],
});

export default function BottleSummaryPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAndTransform(`${process.env.NEXT_PUBLIC_API_URL}/bottles/summary`)
      .then(setStats)
      .catch(err => console.error("Failed to fetch summary", err));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green', textAlign: 'center' }}>📊 Bottle Collection Summary</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Monthly Collection</h2>
        <Bar data={generateChartData("Bottles", stats.monthly, '#2ecc71')} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Yearly Collection</h2>
        <Bar data={generateChartData("Bottles", stats.yearly, '#27ae60')} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>District-wise Collection</h2>
        <Bar data={generateChartData("Bottles", stats.district, '#1abc9c')} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Manufacturer-wise Collection</h2>
        <Bar data={generateChartData("Bottles", stats.manufacturer, '#16a085')} />
      </div>
    </div>
  );
}
