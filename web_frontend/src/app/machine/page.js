"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from 'react-icons/fa';




export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Fetch task handlers
  const fetchTaskHandler = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getTaskHandler`);
      const data = await response.json();
      console.log("Fetched Task Handlers:", data);
      setTaskHandlers(data);
    } catch (error) {
      console.error('Error fetching task handlers:', error);
    }
  };
    

  //fetch machine list 
  const fetchMachines = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getMachine`);
    const data = await res.json();
    console.log("Fetched Machines:", data)
    setMachines(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/createMachine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "" });
    fetchMachines();
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this machine?");
    if (!isConfirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteMachine`, { 
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
    fetchMachines();
  };

  const handleEdit = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/updateMachine`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    setEditId(null);
    setForm({ name: "", description: "" });
    fetchMachines();
  };

  const handleAssign = async (machineId, handlerId) => {
   
   try{
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignMachine`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId, handlerId }),
    });

   }catch(e){console.log(e)}
    
    
  }


  useEffect(() => {
    fetchMachines();
    fetchTaskHandler();
  }, []);

const assinedHandler = (machineId) => {
  const machine = machines.find(m => m._id === machineId);
  if (machine && machine.assignedTo) {
    const handler = taskHandlers.find(th => th._id === machine.assignedTo);
    return handler ? handler.username : "Not Assigned";
  }
}

  return (
    
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
            <p className="text-sm text-gray-500 inline-block">Assigned To:</p> <p className="inline-block">{assinedHandler(machine._id)}</p>
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

              <button
                className="bg-green-400 text-black px-2 py-1 rounded hover:bg-green-500 float-right w-40 flex justify-between items-center" 
                onClick={() => {
                  setOpenDropdownId(openDropdownId === machine._id ? null : machine._id)
                 
                }}
              >
                Assgin Handler <FaChevronDown />
                
              </button>

            {openDropdownId === machine._id && (
            <ul className="mt-2 border rounded max-h-48 overflow-y-auto">
            {taskHandlers.map((taskHandlers) => (
              <li
                key={taskHandlers._id}
                className="px-4 py-2 cursor-pointer hover:bg-emerald-100 hover:text-zinc-950 "
              onClick={async ()=>{
                await handleAssign(machine._id, taskHandlers._id);
                setOpenDropdownId(null); 
                fetchMachines();
              }}
              >
              
              
                {taskHandlers.username}
                
              </li>
            ))}
            </ul>
            )}

            </div>
          </li>
        ))}
      </ul>
    </div>
    
  );
 }
