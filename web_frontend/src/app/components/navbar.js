//Navbar
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
      <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link href="/machine" style={{ marginRight: '1rem' }}>Machine Page</Link>
      <Link href="/duelocations" style={{ marginRight: '1rem' }}>Due Locations</Link>
      <Link href="/vehiclearrival">Vehicle Arrival</Link>
    </nav>
  );
};

export default Navbar;
