'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getDueLocations,
  getAvailableCollectors,
  allocateCollector,
} from '../../services/api';

export default function DueLocationsPage() {
  const [locations, setLocations] = useState({});
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedCollectors, setSelectedCollectors] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [allocatedCollectors, setAllocatedCollectors] = useState({});
  const [showModal, setShowModal] = useState(false);


 useEffect(() => {
  const fetchData = async () => {
    try {
      const resLocations = await getDueLocations();
      const resCollectors = await getAvailableCollectors();

      let allBins = [];
      let fullBins = [];

      if (resLocations?.data) {
        setLocations(resLocations.data);
        allBins = Object.values(resLocations.data).flat();
        fullBins = allBins.filter((bin) => bin.isCritical === true);
      }

      if (resCollectors?.data) {
        setCollectors(resCollectors.data);
      } else {
        setCollectors([]);
      }

      const allBinsFull = allBins.length > 0 && fullBins.length === allBins.length;
      const noActiveCollectors =
        resCollectors?.data?.filter((c) => c.activePersonal)?.length === 0;

      if (allBinsFull && noActiveCollectors) {
        
        setShowModal(true);
      }

    } catch (err) {
      console.error('Failed to fetch due locations or collectors:', err);
      alert('Error fetching due locations or collectors');
    } finally {
      setFetching(false);
    }
  };

  fetchData();
}, []);

  const handleAllocateCollector = async (binObjectId, collectorId, selectedDate) => {
    if (!collectorId || !binObjectId || !selectedDate) {
      alert('Please select a collector and a date.');
      return;
    }

    setLoading(true);
    try {
      const res = await allocateCollector(binObjectId, collectorId, selectedDate);
      if (
        res?.status === 200 ||
        res?.data?.message === 'Collector allocated successfully'
      ) {
        alert('Collector allocated successfully!');

        const collector = collectors.find((c) => c._id === collectorId);
        const collectorName =
          collector?.userId?.nickname ||
          collector?.userId?.username ||
          `Collector ${collectorId.slice(-4)}`;

        setAllocatedCollectors((prev) => ({
          ...prev,
          [binObjectId]: collectorName,
        }));

        setSelectedCollectors((prev) => ({ ...prev, [binObjectId]: '' }));
        setSelectedDates((prev) => ({ ...prev, [binObjectId]: '' }));
      } else {
        alert('Failed to allocate collector.');
      }
    } catch (err) {
      console.error('Error allocating collector:', err);
      alert('Error allocating collector');
    } finally {
      setLoading(false);
    }
  };
  {showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-700 mb-4">🚨 Alert</h2>
      <p className="text-gray-800 text-lg">
        All bins are full and no active collectors are available. Please allocate a task handler.
      </p>
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Close
      </button>
    </div>
  </div>
)}


  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to top right, rgba(94, 190, 65, 0.6), rgba(39, 95, 15, 0.6), rgba(47, 99, 64, 0.6)), url('/background.jpg')`,
      }}
    >
 {showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-700 mb-4">🚨 Alert</h2>
      <p className="text-gray-800 text-lg">
        All bins are full and no active collectors are available. Please allocate a task handler.
      </p>
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Close
      </button>
    </div>
  </div>
)}
      <Link href="/dashboard">
        <span className="text-green-900 hover:underline text-sm">
          &larr; Back to Dashboard
        </span>
      </Link>

      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-100 via-lime-400 to-green-100 text-center mb-6 mt-2 drop-shadow-lg tracking-wide uppercase">
        Due Locations
      </h1>


      <div className="flex justify-center mb-4">
        <div className="bg-red-200 border border-red-400 text-red-800 px-4 py-2 rounded shadow-md text-lg font-semibold text-center">
          Total Full Bins: {
            Object.values(locations)
              .flat()
              .filter((bin) => bin.isCritical === true).length
          }
        </div>
      </div>


      <div className="max-w-4xl mx-auto">
        {fetching ? (
          <p>Loading...</p>
        ) : Object.entries(locations).length === 0 ? (
          <p className="text-center">No due locations found.</p>
        ) : (
          Object.entries(locations).map(([city, areas]) => (
            <div key={city} className="mb-8">
              <ul className="space-y-4  text-white">
                {areas
                  .sort((a, b) => (b.isCritical === true) - (a.isCritical === true))
                  .map((area, index) => {
                    const binObjectId = area._id || area.binId || 'unknown-bin';
                    const areaText =
                      typeof area.area === 'string'
                        ? area.area
                        : JSON.stringify(area.area);

                    const isCritical = area.isCritical;

                    return (
                      <li key={index}>
                        <div
                          className={`p-4 rounded-xl border shadow-md transition-all duration-300 ${isCritical
                            ? 'bg-red-50 border-red-600 text-red-700'
                            : 'bg-lime border-lime-400'
                            }`}
                        >
                          <span className="font-medium text-lg">
                            {areaText}{' '}
                            {allocatedCollectors[binObjectId] ? (
                              <span className="text-green-700 font-semibold">
                                • Allocated to {allocatedCollectors[binObjectId]}
                              </span>
                            ) : isCritical ? (
                              <span className="text-red-600 font-semibold">
                                • Full – Needs Collection
                              </span>
                            ) : (
                              <span className="text-white">• Not Critical</span>
                            )}
                          </span>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                            <select
                              className="p-2 rounded border bg-white text-black"
                              onChange={(e) =>
                                setSelectedCollectors((prev) => ({
                                  ...prev,
                                  [binObjectId]: e.target.value,
                                }))
                              }
                              value={selectedCollectors[binObjectId] || ''}
                            >
                              <option value="">Select Collector</option>
                              {collectors.length === 0 ? (
                                <option disabled>No collectors available</option>
                              ) : (
                                collectors
                                  .filter((c) => {
                                    const prefersThisBin = Array.isArray(c.preferredBins) &&
                                      c.preferredBins.some((b) =>
                                        b._id?.toString() === binObjectId?.toString()
                                      );
                                    const hasNoPrefs =
                                      !Array.isArray(c.preferredBins) ||
                                      c.preferredBins.length === 0;
                                    return c.activePersonal && (prefersThisBin || hasNoPrefs);
                                  })
                                  .map((c) => (
                                    <option key={c._id} value={c._id}>
                                      {`${c.userId?.nickname || 'Collector'} (${c._id.slice(-4)}) – [${c.location?.coordinates[1]?.toFixed(2)}, ${c.location?.coordinates[0]?.toFixed(2)}]`}
                                    </option>
                                  ))
                              )}
                            </select>

                            <input
                              type="date"
                              className="p-2 rounded border bg-white text-black"
                              value={selectedDates[binObjectId] || ''}
                              onChange={(e) =>
                                setSelectedDates((prev) => ({
                                  ...prev,
                                  [binObjectId]: e.target.value,
                                }))
                              }
                            />

                            <button
                              onClick={() =>
                                handleAllocateCollector(
                                  binObjectId,
                                  selectedCollectors[binObjectId],
                                  selectedDates[binObjectId]
                                )
                              }
                              disabled={
                                loading ||
                                !selectedCollectors[binObjectId] ||
                                !selectedDates[binObjectId]
                              }
                              className="p-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Allocating...' : 'Allocate Collector'}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))
        )}
      </div>

      <Link href="/vehiclearrival">
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-6 mx-auto block">
          View Vehicle Arrivals
        </button>
      </Link>
    </div>
  );
}
