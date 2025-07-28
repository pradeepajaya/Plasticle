//old UI
/*
'use client';

import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BinAllocationPage() {
  const [bins, setBins] = useState([]);
  const [showBins, setShowBins] = useState(false);
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [showAssignmentUI, setShowAssignmentUI] = useState(false);
  const [fullBins, setFullBins] = useState([]);
  const [binAssignments, setBinAssignments] = useState([]);

  const fetchBins = async () => {
    try {
      const response = await axios.get(`${API_URL}/bins/getbins`);
      setBins(response.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const fetchBinAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/assignments`);
      setBinAssignments(res.data);
    } catch (err) {
      console.error("Error fetching bin assignments", err);
    }
  };

  const fetchTaskHandlers = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/active`);
      setTaskHandlers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFullBins = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/full`);
      setFullBins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignBin = async (handlerId, binId) => {
    if (!binId) return;
    try {
      await axios.post(`${API_URL}/taskhandlers/assign-bin`, { handlerId, binId });
      alert("Bin assigned successfully");
      fetchTaskHandlers();
      fetchFullBins();
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 text-gray-800 py-12 px-6">
      <div className="max-w-7xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-green-900 mb-10 text-center">
          ♻️ Eco Bin Allocation Dashboard
        </h1>

        {/* Buttons *//*}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={() => {
              setShowBins(true);
              fetchBins();
              fetchBinAssignments();
              setShowAssignmentUI(false);
            }}
            className="bg-green-600/80 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md backdrop-blur-sm transition-all"
          >
            🌿 View Bins
          </button>

          <button
            onClick={() => {
              setShowAssignmentUI(true);
              fetchTaskHandlers();
              fetchFullBins();
              setShowBins(false);
            }}
            className="bg-lime-600/80 hover:bg-lime-700 text-white px-6 py-3 rounded-lg shadow-md backdrop-blur-sm transition-all"
          >
            🧑‍🔧 Allocate Task Handlers
          </button>
        </div>

        {/* Assignment UI *//*}
        {showAssignmentUI && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {taskHandlers.length === 0 ? (
              <p className="text-gray-500 col-span-full">No active task handlers available.</p>
            ) : (
              taskHandlers.map((handler) => (
                <div
                  key={handler._id}
                  className="bg-green-50/60 border border-green-200 rounded-2xl p-6 shadow-md backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{handler.username}</h3>
                  <p className="text-green-700 mb-3">
                    Status: <span className={clsx(handler.binAssigned ? "text-yellow-600" : "text-green-600", "font-semibold")}>{handler.binAssigned ? "Assigned" : "Available"}</span>
                  </p>

                  <label className="block text-sm mb-1 text-green-700">Assign Bin:</label>
                  <select
                    className="w-full bg-white border border-green-300 rounded px-3 py-2 text-green-800"
                    onChange={(e) => handleAssignBin(handler._id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a Bin</option>
                    {fullBins.length === 0 && <option disabled>No full bins available</option>}
                    {fullBins.map((bin) => (
                      <option key={bin._id} value={bin._id}>
                        {bin.binId} - {bin.locationName || bin.location}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bin Cards *//*}
        {showBins && (
          <div className="mt-8">
            {bins.length === 0 ? (
              <p className="text-gray-500">No bins to display.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {bins.map((bin, index) => {
                  const assignedHandlers = binAssignments.filter(handler =>
                    handler.assignedBins.some(b => b._id === bin._id)
                  );

                  return (
                    <motion.div
                      key={bin._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={clsx(
                        "rounded-2xl p-6 backdrop-blur-sm bg-white/30 border border-white/40 shadow-xl transition-transform hover:scale-105 text-sm text-gray-800 space-y-2",
                        {
                          "bg-red-200/30 border-red-300 text-red-900": bin.status === "full",
                          "bg-green-200/30 border-green-300 text-green-900": bin.status === "active",
                          "bg-gray-200/30 border-gray-300 text-gray-900": bin.status === "inactive",
                          "bg-yellow-200/30 border-yellow-300 text-yellow-900": bin.status === "assigned",
                        }
                      )}
                    >
                      <p className="font-semibold text-lg">Bin ID: {bin.binId}</p>
                      <p>
                        📍 {bin.locationName && <span className="font-medium">{bin.locationName}</span>}
                        {(() => {
                          let lat, lng;

                          if (typeof bin.location === "string") {
                            [lat, lng] = bin.location.split(",").map(coord => coord.trim());
                          } else if (bin.location?.latitude && bin.location?.longitude) {
                            lat = bin.location.latitude;
                            lng = bin.location.longitude;
                          }

                          if (lat && lng) {
                            return (
                              <>
                                <br />
                                <a
                                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 bg-green-600/80 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-semibold shadow"
                                >
                                  View on Map
                                </a>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </p>

                      <p>Status: <span className="capitalize font-medium">{bin.status}</span></p>
                      <p>Capacity: {bin.capacity}</p>
                      <p>Current Fill: {bin.currentFill}</p>

                      {assignedHandlers.length > 0 && (
                        <div className="mt-3 text-sm text-green-800">
                          <p className="font-semibold">Assigned Handler{assignedHandlers.length > 1 ? 's' : ''}:</p>
                          <ul className="list-disc list-inside">
                            {assignedHandlers.map(handler => (
                              <li key={handler._id}>{handler.username}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
*/

'use client';

import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BinAllocationPage() {
  const [bins, setBins] = useState([]);
  const [showBins, setShowBins] = useState(false);
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [showAssignmentUI, setShowAssignmentUI] = useState(false);
  const [fullBins, setFullBins] = useState([]);
  const [binAssignments, setBinAssignments] = useState([]);

  const fetchBins = async () => {
    try {
      const response = await axios.get(`${API_URL}/bins/getbins`);
      setBins(response.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const fetchBinAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/assignments`);
      setBinAssignments(res.data);
    } catch (err) {
      console.error("Error fetching bin assignments", err);
    }
  };

  const fetchTaskHandlers = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/active`);
      setTaskHandlers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFullBins = async () => {
    try {
      const res = await axios.get(`${API_URL}/taskhandlers/full`);
      setFullBins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignBin = async (handlerId, binId) => {
    if (!binId) return;
    try {
      await axios.post(`${API_URL}/taskhandlers/assign-bin`, { handlerId, binId });
      alert("Bin assigned successfully");
      fetchTaskHandlers();
      fetchFullBins();
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 text-gray-800 py-12 px-6">
      <div className="max-w-7xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-green-900 mb-10 text-center">
          ♻️ Eco Bin Allocation Dashboard
        </h1>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={() => {
              setShowBins(true);
              fetchBins();
              fetchBinAssignments();
              setShowAssignmentUI(false);
            }}
            className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            🌿 View Bins
          </button>

          <button
            onClick={() => {
              setShowAssignmentUI(true);
              fetchTaskHandlers();
              fetchFullBins();
              setShowBins(false);
            }}
            className="bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 hover:from-lime-600 hover:to-lime-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            🧑‍🔧 Allocate Task Handlers
          </button>
        </div>

        {/* Assignment UI */}
        {showAssignmentUI && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {taskHandlers.length === 0 ? (
              <p className="text-gray-500 col-span-full">No active task handlers available.</p>
            ) : (
              taskHandlers.map((handler) => (
                <div
                  key={handler._id}
                  className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <h3 className="text-xl font-bold text-green-900 mb-2">{handler.username}</h3>
                  <p className="text-green-700 mb-3">
                    Status:{' '}
                    <span
                      className={clsx(
                        handler.binAssigned ? 'text-yellow-600' : 'text-green-600',
                        'font-semibold'
                      )}
                    >
                      {handler.binAssigned ? 'Assigned' : 'Available'}
                    </span>
                  </p>

                  <label className="block text-sm mb-1 text-green-700 font-medium">Assign Bin:</label>
                  <select
                    className="w-full bg-white border border-green-300 rounded px-3 py-2 text-green-800 focus:outline-none focus:ring focus:ring-green-400"
                    onChange={(e) => handleAssignBin(handler._id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a Bin
                    </option>
                    {fullBins.length === 0 && <option disabled>No full bins available</option>}
                    {fullBins.map((bin) => (
                      <option key={bin._id} value={bin._id}>
                        {bin.binId} - {bin.locationName || bin.location}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bin Cards */}
        {showBins && (
          <div className="mt-8">
            {bins.length === 0 ? (
              <p className="text-gray-500">No bins to display.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {bins.map((bin, index) => {
                  const assignedHandlers = binAssignments.filter((handler) =>
                    handler.assignedBins.some((b) => b._id === bin._id)
                  );

                  return (
                    <motion.div
                      key={bin._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={clsx(
                        'rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-transform hover:scale-105 text-sm text-gray-800 space-y-2 border-2',
                        {
                          'bg-gradient-to-br from-red-100 via-red-200 to-red-300 border-red-400 text-red-900':
                            bin.status === 'full',
                          'bg-gradient-to-br from-green-100 via-green-200 to-green-300 border-green-400 text-green-900':
                            bin.status === 'active',
                          'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border-gray-400 text-gray-900':
                            bin.status === 'inactive',
                          'bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 border-yellow-400 text-yellow-900':
                            bin.status === 'assigned',
                        }
                      )}
                    >
                      <p className="font-semibold text-lg">Bin ID: {bin.binId}</p>
                      <p>
                        📍{' '}
                        {bin.locationName && <span className="font-medium">{bin.locationName}</span>}
                        {(() => {
                          let lat, lng;

                          if (typeof bin.location === 'string') {
                            [lat, lng] = bin.location.split(',').map((coord) => coord.trim());
                          } else if (bin.location?.latitude && bin.location?.longitude) {
                            lat = bin.location.latitude;
                            lng = bin.location.longitude;
                          }

                          if (lat && lng) {
                            return (
                              <>
                                <br />
                                <a
                                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-800 transition-all text-sm font-semibold shadow"
                                >
                                  View on Map
                                </a>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </p>

                      <p>
                        Status:{' '}
                        <span className="capitalize font-medium">{bin.status}</span>
                      </p>
                      <p>Capacity: {bin.capacity}</p>
                      <p>Current Fill: {bin.currentFill}</p>

                      {assignedHandlers.length > 0 && (
                        <div className="mt-3 text-sm text-green-800">
                          <p className="font-semibold">
                            Assigned Handler{assignedHandlers.length > 1 ? 's' : ''}:
                          </p>
                          <ul className="list-disc list-inside">
                            {assignedHandlers.map((handler) => (
                              <li key={handler._id}>{handler.username}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
