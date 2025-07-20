//Navbar
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
      <Link href="/" style={{ marginRight: '1rem', color: 'white' }}>Home</Link>
      <Link href="/machine" style={{ marginRight: '1rem', color: 'white' }}>Machine Page</Link>
      <Link href="/duelocations" style={{ marginRight: '1rem', color: 'white' }}>Due Locations</Link>
      <Link href="/vehiclearrival" style={{ marginRight: '1rem', color: 'white' }}>Vehicle Arrival</Link>
      <Link href="/leaderboard" style={{ marginRight: '1rem', color: 'white' }}>Leaderboard</Link>
      <Link href="/bottles-summary" style={{ marginRight: '1rem', color: 'white' }}>Statistics</Link>
      

    </nav>
  );
};

export default Navbar;
