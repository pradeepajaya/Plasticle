'use client';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-green-800 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <Link href="/dashboard" className="block hover:text-emerald-300">
          Dashboard
        </Link>
        <Link href="/duelocations" className="block hover:text-emerald-300">
          Due Locations
        </Link>
        <Link href="/vehiclearrival" className="block hover:text-emerald-300">
          Vehicle Arrival
        </Link>
        <Link href="/manufacturerlist" className="block hover:text-emerald-300">
          Manufacturers List
        </Link>
        <Link href="/add-post" className="block hover:text-emerald-300">
          Add Blog/News/Initiative
        </Link>
        <Link href="/machine" className="block hover:text-emerald-300">
          Machines
        </Link>
      </nav>
    </div>
  );
}

