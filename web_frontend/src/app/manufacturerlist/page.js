'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { getManufacturers, updateManufacturer } from '@/services/api';
import Modal from 'react-modal';

Modal.setAppElement('body');

function AdminManufacturerList() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    companyLocation: '',
    companyRegNumber: '',
    companyTelephone: '',
  });

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const res = await getManufacturers();
        setManufacturers(res.data);
      } catch (err) {
        console.error('Error fetching manufacturers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
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

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this manufacturer?')) {
      setManufacturers((prev) => prev.filter((m) => m._id !== id));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-400 via-white to-lime-400 dark:from-gray-800 dark:via-green-900 dark:to-green-200 transition-colors">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-gray-900 dark:text-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-800 dark:text-green-300">
          Manufacturer List
        </h2>
        {loading ? (
          <p className="text-center dark:text-gray-300">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-lime-200 dark:bg-lime-900 text-green-900 dark:text-lime-100">
                <tr>
                  <th className="border p-3">Username</th>
                  <th className="border p-3">Email</th>
                  <th className="border p-3">Company Name</th>
                  <th className="border p-3">Company Location</th>
                  <th className="border p-3">Company Reg. Number</th>
                  <th className="border p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {manufacturers.map((m) => (
                  <tr key={m._id} className="text-center hover:bg-green-50 dark:hover:bg-gray-800">
                    <td className="border p-3">{m.username}</td>
                    <td className="border p-3">{m.email}</td>
                    <td className="border p-3">{m.companyName || '-'}</td>
                    <td className="border p-3">{m.companyLocation || '-'}</td>
                    <td className="border p-3">{m.companyRegNumber || '-'}</td>
                    <td className="border p-3 flex justify-center gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => openUpdateModal(m)}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {manufacturers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No manufacturers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Update Manufacturer"
        className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20"
      >
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300">
          Update Manufacturer
        </h2>

        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Company Location"
            value={form.companyLocation}
            onChange={(e) => setForm({ ...form, companyLocation: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Company Reg Number"
            value={form.companyRegNumber}
            onChange={(e) => setForm({ ...form, companyRegNumber: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Company Telephone"
            value={form.companyTelephone}
            onChange={(e) => setForm({ ...form, companyTelephone: e.target.value })}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            onClick={handleUpdate}
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminManufacturerList;
