"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);

  //fetch machine list 
  const fetchMachines = async () => {
    const res = await fetch("/api/admin/getMachine");
    const data = await res.json();
    const response = await getTaskHandlers();
    setTaskHandlers(response.data);
    console.log("Fetched Machines:", data)
    setMachines(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/getMachine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "" });
    fetchMachines();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/machines/${id}`, { method: "DELETE" });
    fetchMachines();
  };

  const handleEdit = async (id) => {
    await fetch(`/api/machines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditId(null);
    setForm({ name: "", description: "" });
    fetchMachines();
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return (
    <><Navbar/>
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Machine Management</h1>

      <form onSubmit={editId ? () => handleEdit(editId) : handleCreate} className="mb-6">
        <input
          type="text"
          placeholder="Machine Name"
          className="border p-2 w-full mb-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full mb-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editId ? "Update Machine" : "Create Machine"}
        </button>
      </form>

      <ul>
        {machines.map((machine) => (
          <li key={machine._id} className="border p-3 mb-2">
            <h3 className="text-lg font-semibold">{machine.name}</h3>
            <p>{machine.description}</p>
            <div className="mt-2 space-x-2">
              <button
                className="bg-yellow-400 text-black px-2 py-1 rounded"
                onClick={() => {
                  setEditId(machine._id);
                  setForm({ name: machine.name, description: machine.description });
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(machine._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
