import React from 'react';

const rawData = [
  { name: 'Alice', bottles: 100 },
  { name: 'Bob', bottles: 120 },
  { name: 'Charlie', bottles: 80 },
  { name: 'Diana', bottles: 100 },
  { name: 'Ethan', bottles: 45 },
];

const getRankedData = (data) => {
  const sorted = [...data].sort((a, b) => b.bottles - a.bottles);

  let rank = 1;
  let prevBottles = null;
  let skip = 0;

  return sorted.map((user, i) => {
    if (user.bottles === prevBottles) {
      skip++;
    } else {
      rank = i + 1;
      rank += skip;
      skip = 0;
    }
    prevBottles = user.bottles;
    return { ...user, rank };
  });
};

const leaderboardData = getRankedData(rawData);

export default function Leaderboard() {
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
          {leaderboardData.map((user, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#f4fef7' : '#ffffff',
                borderBottom: '1px solid #d6ecd8',
              }}
            >
              <td style={styles.rankCell}>{user.rank}</td>
              <td style={styles.bodyCell}>{user.name}</td>
              <td style={styles.bodyCell}>{user.bottles}</td>
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
    maxWidth: '600px',
    margin: '50px auto',
    padding: '24px',
    backgroundColor: '#f0fff4',
    borderRadius: '12px',
    boxShadow: '0 0 12px rgba(0, 128, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#27ae60',
    fontSize: '28px',
    marginBottom: '20px',
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
  },
  rankCell: {
    padding: '12px 16px',
    fontWeight: 'bold',
    color: '#1e8449',
  },
  footer: {
    marginTop: '15px',
    textAlign: 'center',
    color: '#555',
    fontSize: '14px',
  },
};
