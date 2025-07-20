'use client';
import React, { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyers/leaderboard`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (!data.length) return <p>No data available.</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>♻️ Green Warriors Leaderboard</h1>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.headerCell}>Rank</th>
            <th style={styles.headerCell}>Name</th>
            <th style={styles.headerCell}>Bottles Collected</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ rank, name, bottles }) => (
            <tr
              key={rank + name}
              style={{
                backgroundColor: rank % 2 === 0 ? '#f4fef7' : '#ffffff',
                borderBottom: '1px solid #d6ecd8',
              }}
            >
              <td style={styles.rankCell}>{rank}</td>
              <td style={styles.bodyCell}>{name}</td>
              <td style={styles.bodyCell}>{bottles}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={styles.footer}>Keep collecting to climb the ranks! 🌱</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '50px auto',
    padding: 24,
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    boxShadow: '0 0 12px rgba(0, 128, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#27ae60',
    fontSize: 28,
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  headerRow: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  headerCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  bodyCell: {
    padding: '12px 16px',
    color: 'green'
  },
  rankCell: {
    padding: '12px 16px',
    fontWeight: 'bold',
    color: 'green',
  },
  footer: {
    marginTop: 15,
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
};
