/*'use client';
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
      </nav>
    </div>
  );
}

*/

'use client';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Truck,
  Factory,
  PlusCircle,
  Settings,
  Wrench,
  BarChart2,
  Trash2
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-white/10 backdrop-blur-md border-r border-white/20 text-white p-6 space-y-6 shadow-xl">
      {/* Profile section */}
      <div className="flex items-center space-x-4">
        <img
          src="/logoplasticle.png"
          alt="Admin Avatar"
          className="w-20 h-20 rounded-full border border-white/50"
        />
        <div>
          <p className="font-semibold">PLASTICLE</p>
          <p className="text-xs text-emerald-200">Administrator</p>
        </div>
      </div>

      {/* Navigation section */}
      <div>
        <p className="text-sm uppercase text-emerald-300 mb-2 tracking-wide">Navigation</p>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/duelocations" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <MapPin size={18} />
            <span>Due Locations</span>
          </Link>
          <Link href="/vehiclearrival" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <Truck size={18} />
            <span>Vehicle Arrival</span>
          </Link>
          <Link href="/manufacturerlist" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <Factory size={18} />
            <span>Manufacturers</span>
          </Link>
          <Link href="/machine" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <Wrench size={18} />
            <span>Machines</span>
          </Link>
          <Link href="/stats" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <BarChart2 size={18} />
            <span>Statistics</span>
          </Link>
          <Link href="/bin-allocation" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <Trash2 size={18} />
            <span>Custom Bin Allocation</span>
          </Link>
        </nav>
      </div>

      {/* Content section */}
      <div>
        <p className="text-sm uppercase text-emerald-300 mb-2 tracking-wide">Content</p>
        <nav className="space-y-2">
          <Link href="/add-post" className="flex items-center space-x-2 hover:text-emerald-300 transition">
            <PlusCircle size={18} />
            <span>Add Blog/News</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

