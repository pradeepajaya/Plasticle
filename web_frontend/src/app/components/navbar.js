//Navbar
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
      <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link href="./machine">Machine Page</Link>
    </nav>
  );
};

export default Navbar;
