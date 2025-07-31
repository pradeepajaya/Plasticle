'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  getManufacturers,
  updateManufacturer,
  deleteManufacturer,
  getDeletedManufacturers
} from '@/services/api';
import Modal from 'react-modal';

Modal.setAppElement('body');

function AdminManufacturerList() {
  const [manufacturers, setManufacturers] = useState([]);
  const [deletedManufacturers, setDeletedManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    companyLocation: '',
    companyRegNumber: '',
    companyTelephone: '',
  });

  const fetchManufacturers = async () => {
    try {
      const res = await getManufacturers();
      setManufacturers(res.data);
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
    }
  };

  const fetchDeletedManufacturers = async () => {
    try {
      const res = await getDeletedManufacturers();
      setDeletedManufacturers(res.data);
    } catch (err) {
      console.error('Error fetching deleted manufacturers:', err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchManufacturers(), fetchDeletedManufacturers()]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const openUpdateModal = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setForm({
      companyName: manufacturer.companyName || '',
      companyLocation: manufacturer.companyLocation || '',
      companyRegNumber: manufacturer.companyRegNumber || '',
      companyTelephone: manufacturer.companyTelephone || '',
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateManufacturer(selectedManufacturer._id, form);
      alert('Manufacturer updated successfully');
      setManufacturers((prev) =>
        prev.map((m) => (m._id === selectedManufacturer._id ? { ...m, ...form } : m))
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating manufacturer:', err);
      alert('Failed to update manufacturer');
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Are you sure you want to delete this manufacturer?')) {
      try {
        await deleteManufacturer(userId);
        await fetchManufacturers(); // Refresh lists
        await fetchDeletedManufacturers();
      } catch (err) {
        console.error('Error deleting manufacturer:', err);
        alert('Failed to delete manufacturer');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-700 to-green-600">
      {/* Header Section */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Manufacturer Management
            </h1>
            <p className="text-xl text-white/90 font-light">
              Manage manufacturer accounts and company information
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Manufacturers</p>
                <p className="text-3xl font-bold text-green-700">{manufacturers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Deleted Accounts</p>
                <p className="text-3xl font-bold text-red-600">{deletedManufacturers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Manufacturers Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/30 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white">Active Manufacturers</h2>
                <p className="text-green-100 mt-1">Manage registered manufacturer accounts</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                <span className="ml-3 text-lg text-gray-600">Loading manufacturers...</span>
              </div>
            ) : manufacturers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manufacturers Found</h3>
                <p className="text-gray-600">No manufacturer accounts are currently registered.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-tl-lg">
                        👤 Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        ✉️ Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        🏢 Company Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        📍 Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        🔢 Reg. Number
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-tr-lg">
                        ⚙️ Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {manufacturers.map((m, index) => (
                      <tr key={m._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors duration-200`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-700 font-semibold text-sm">
                                {m.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{m.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{m.email}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{m.companyName}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{m.companyLocation || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-mono text-sm">{m.companyRegNumber || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                              onClick={() => openUpdateModal(m)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(m._id)}
                              className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Deleted Accounts Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white">Deleted Accounts</h2>
                <p className="text-red-100 mt-1">Previously deleted manufacturers for record keeping</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {deletedManufacturers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deleted Accounts</h3>
                <p className="text-gray-600">No manufacturers have been deleted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-tl-lg">
                        🆔 UserID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        ✉️ Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        🏢 Company Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        📍 Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-tr-lg">
                        🔢 Reg. Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deletedManufacturers.map((m, index) => (
                      <tr key={m._id} className={`${index % 2 === 0 ? 'bg-red-50' : 'bg-white'} opacity-75`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-sm">
                                {m.username?.charAt(0)?.toUpperCase() || 'D'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-600">{m.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{m.email}</td>
                        <td className="px-6 py-4 text-gray-600">{m.companyName || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{m.companyLocation || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-mono text-sm">{m.companyRegNumber || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Update Manufacturer"
        className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20"
      >
        <h2 className="text-2xl font-bold mb-4 text-green-700">Update Manufacturer</h2>
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Company Location"
            value={form.companyLocation}
            onChange={(e) => setForm({ ...form, companyLocation: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Company Reg Number"
            value={form.companyRegNumber}
            onChange={(e) => setForm({ ...form, companyRegNumber: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Company Telephone"
            value={form.companyTelephone}
            onChange={(e) => setForm({ ...form, companyTelephone: e.target.value })}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleUpdate}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminManufacturerList;