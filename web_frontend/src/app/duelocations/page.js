'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDueLocations, getAvailableCollectors, allocateCollector } from '../../services/api';

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
        if (resLocations?.data) {
          setLocations(resLocations.data);
        }

        const resCollectors = await getAvailableCollectors();
        if (resCollectors?.data) {
          setCollectors(resCollectors.data);
        }
       } catch (err) {
      if (err?.response?.status === 404) {
        // No collectors available
        setCollectors([]);
      } else {
        console.error('Failed to fetch data:', err);
        alert('Error fetching due locations or collectors');
      }
    } finally {
      setFetching(false);
    }
  };

    fetchData();
  }, []);

  const handleAllocateCollector = async (binId, collectorId, selectedDate) => {
    if (!collectorId || !binId || !selectedDate) {
      alert('Please select a collector and a date.');
      return;
    }

    setLoading(true);
    try {
      const res = await allocateCollector(binId, collectorId, selectedDate);
      if (res?.status === 200 || res?.data?.message === 'Collector allocated successfully') {
        alert('Collector allocated successfully!');

        const collectorName =
          collectors.find((c) => c._id === collectorId)?.userId ||
          `Collector ${collectorId.slice(-4)}`;

        setAllocatedCollectors((prev) => ({
          ...prev,
          [binId]: collectorName,
        }));

        setSelectedCollectors((prev) => ({ ...prev, [binId]: '' }));
        setSelectedDates((prev) => ({ ...prev, [binId]: '' }));
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <span className="text-blue-600 hover:underline text-sm">&larr; Back to Dashboard</span>
      </Link>

      <h1 className="text-3xl font-bold mb-4 mt-2 text-center">Due Locations</h1>

      <div className="bg-gradient-to-r from-lime-500 to-white p-6 rounded-lg text-white shadow-md">
        {fetching ? (
          <p>Loading...</p>
        ) : Object.entries(locations).length === 0 ? (
          <p>No due locations found.</p>
        ) : (
          Object.entries(locations).map(([city, areas]) => (
            <div key={city} className="mb-6">
              <ul className="ml-4 list-disc text-black">
                {areas.map((area, index) => {
                  const binId = area.binId || 'unknown-bin';
                  const areaText =
                    typeof area.area === 'string'
                      ? area.area
                      : JSON.stringify(area.area);

                  return (
                    <li key={index} className={area.isCritical ? 'text-red-800' : ''}>
                      <div className="flex flex-col mb-2">
                        <span>
                          {areaText}{' '}
                          {allocatedCollectors[binId] ? (
                            <span className="text-green-600 font-semibold">
                               Allocated to collect ({allocatedCollectors[binId]})
                            </span>
                          ) : area.isCritical ? (
                            <span className="text-red-600 font-semibold">
                               Full - Needs Collection
                            </span>
                          ) : (
                            <span className="text-gray-600">(Not Critical)</span>
                          )}
                        </span>

                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                          <select
                            className="p-2 rounded bg-white text-black"
                            onChange={(e) =>
                              setSelectedCollectors((prev) => ({
                                ...prev,
                                [binId]: e.target.value,
                              }))
                            }
                            value={selectedCollectors[binId] || ''}
                          >
                            <option value="">Select Collector</option>
                            {collectors.length === 0 ? (
                              <option disabled>No collectors available</option>
                            ) : (
                              collectors
                                .filter((c) => c.activePersonal)
                                .map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.userId
                                      ? `Collector ${c.userId.slice(-4)}`
                                      : `Collector ${c._id.slice(-4)}`} – [
                                    {c.location?.coordinates[1].toFixed(2)},{' '}
                                    {c.location?.coordinates[0].toFixed(2)}]
                                  </option>
                                ))
                            )}
                          </select>

                          <input
                            type="date"
                            className="p-2 rounded bg-white text-black border"
                            value={selectedDates[binId] || ''}
                            onChange={(e) =>
                              setSelectedDates((prev) => ({
                                ...prev,
                                [binId]: e.target.value,
                              }))
                            }
                          />

                          <button
                            onClick={() =>
                              handleAllocateCollector(
                                binId,
                                selectedCollectors[binId],
                                selectedDates[binId]
                              )
                            }
                            disabled={
                              loading ||
                              !selectedCollectors[binId] ||
                              !selectedDates[binId]
                            }
                            className="p-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
