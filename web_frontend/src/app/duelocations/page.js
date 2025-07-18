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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLocations = await getDueLocations();
        if (resLocations?.data) setLocations(resLocations.data);

        const resCollectors = await getAvailableCollectors();
        if (resCollectors?.data) setCollectors(resCollectors.data);
      } catch (err) {
        if (err?.response?.status === 404) setCollectors([]);
        else alert('Error fetching due locations or collectors');
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
      if (res?.status === 200 || res?.data?.message === 'Collector allocated successfully') {
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
      alert('Error allocating collector');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-6 bg-gradient-to-br from-green-400 via-white to-green-300 dark:from-green-800 dark:via-gray-900 dark:to-black text-black dark:text-white"
    >
      <Link href="/dashboard">
        <span className="text-green-900 dark:text-green-300 hover:underline text-sm">
          &larr; Back to Dashboard
        </span>
      </Link>

      <h1 className="text-3xl font-bold mb-6 mt-2 text-center">Due Locations</h1>

      <div className="text-center mb-4 text-lg font-semibold text-red-700 dark:text-red-400">
        Total Full Bins: {
          Object.values(locations)
            .flat()
            .filter((bin) => bin.isCritical === true).length
        }
      </div>

      <div className="max-w-4xl mx-auto">
        {fetching ? (
          <p className="text-center">Loading...</p>
        ) : Object.entries(locations).length === 0 ? (
          <p className="text-center">No due locations found.</p>
        ) : (
          Object.entries(locations).map(([city, areas]) => (
            <div key={city} className="mb-8">
              <ul className="space-y-4">
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
                          className={`p-4 rounded-xl border shadow-md transition-all duration-300 ${
                            isCritical
                              ? 'bg-red-50 border-red-600 dark:bg-red-900 dark:border-red-400'
                              : 'bg-lime-50 border-lime-400 dark:bg-lime-900 dark:border-lime-400'
                          }`}
                        >
                          <span className="font-medium text-lg">
                            {areaText}{' '}
                            {allocatedCollectors[binObjectId] ? (
                              <span className="text-green-700 dark:text-green-300 font-semibold">
                                • Allocated to {allocatedCollectors[binObjectId]}
                              </span>
                            ) : isCritical ? (
                              <span className="text-red-600 dark:text-red-300 font-semibold">
                                • Full – Needs Collection
                              </span>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">• Not Critical</span>
                            )}
                          </span>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                            <select
                              className="p-2 rounded border bg-white text-black dark:bg-gray-700 dark:text-white"
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
                              className="p-2 rounded border bg-white text-black dark:bg-gray-700 dark:text-white"
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
