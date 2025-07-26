      // without ui 
/*"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from 'react-icons/fa';
import Sidebar from '../components/sidebar';



export default function MachinesPage() {
  const [notAssignedMachines, setnotAssignedMachines] = useState([]);  
  const [assignedMachines, setAssignedMachines] = useState([]);
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
  const fetchAssginedMachines = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignedMachines`);
    const data = await res.json();
    console.log("Fetched Machines:", data)
    setAssignedMachines(data);
  };
  const fetchNotAssignedMachines = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notAssignedMachines`);
    const data = await res.json();
    console.log("Fetched Not Assigned Machines:", data)
    setnotAssignedMachines(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/createMachine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "" });
    fetchNotAssignedMachines();
    fetchAssginedMachines();
    
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this machine?");
    if (!isConfirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteMachine`, { 
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  fetchNotAssignedMachines();  
  fetchAssginedMachines();

  };

  const handleEdit = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/updateMachine`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    setEditId(null);
    setForm({ name: "", description: "" });
    
    
    fetchNotAssignedMachines();
    fetchAssginedMachines();
  };

  const handleAssign = async (machineId, handlerId) => {
   
   try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignMachine`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId, handlerId }),
    });

   }catch(e){console.log(e)}

    fetchNotAssignedMachines();
    fetchAssginedMachines();
    
    
  }


  useEffect(() => {
    fetchAssginedMachines();
    fetchNotAssignedMachines();
    fetchTaskHandler();
  }, []);

const assinedHandler = (machineId) => {
  const machine = assignedMachines.find(m => m._id === machineId);
  if (machine && machine.assignedTo) {
    const handler = taskHandlers.find(th => th._id === machine.assignedTo);
    return handler ? handler.username : "Not Assigned";
  }
}

  return (
    <div className="flex">
    <Sidebar />
    <layout/>
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

      <h2 className="text-lg font-semibold mb-2 ">Unassigned Machines</h2>
      <ul>
      {notAssignedMachines.map((notAssignedMachines) => (
        <li key={notAssignedMachines._id} className="border p-3 mb-2">
          <h3 className="text-lg font-semibold">{notAssignedMachines.name}</h3>
          <p>{notAssignedMachines.description}</p>
          <p className="text-sm text-gray-500 inline-block">Assigned To:</p> <p className="inline-block">{assinedHandler(notAssignedMachines._id)}</p>
          <div className="mt-2 space-x-2">
            <button
              className="bg-yellow-400 text-black px-2 py-1 rounded"
              onClick={() => {
                setEditId(notAssignedMachines._id);
                setForm({ name: notAssignedMachines.name, description: notAssignedMachines.description });
              }}
            >
              Edit
            </button>

            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => handleDelete(notAssignedMachines._id)}
            >
              Delete
            </button>

            <button
              className="bg-green-400 text-black px-2 py-1 rounded hover:bg-green-500 float-right w-40 flex justify-between items-center" 
              onClick={() => {
                setOpenDropdownId(openDropdownId === notAssignedMachines._id ? null : notAssignedMachines._id)
                
              }}
            >
              Assgin Handler <FaChevronDown />
              
            </button>

            {openDropdownId === notAssignedMachines._id && (
            <ul className="mt-2 border rounded max-h-48 overflow-y-auto">
            {taskHandlers
              .map((taskHandlers) => (
              


              <li
                key={taskHandlers._id}
                className="px-4 py-2 cursor-pointer hover:bg-emerald-100 hover:text-zinc-950 "
                onClick={async ()=>{
                await handleAssign(notAssignedMachines._id, taskHandlers._id);
                setOpenDropdownId(null); 
                fetchAssginedMachines();
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

      <br></br>

      <h2 className="text-lg font-semibold mb-2 ">Assigned Machines</h2>

      <ul>
        {assignedMachines.map((assignedMachines) => (
          <li key={assignedMachines._id} className="border p-3 mb-2">
            <h3 className="text-lg font-semibold">{assignedMachines.name}</h3>
            <p>{assignedMachines.description}</p>
            <p className="text-sm text-gray-500 inline-block">Assigned To:</p> <p className="inline-block">{assinedHandler(assignedMachines._id)}</p>
            <div className="mt-2 space-x-2">
              <button
                className="bg-yellow-400 text-black px-2 py-1 rounded"
                onClick={() => {
                  setEditId(assignedMachines._id);
                  setForm({ name: assignedMachines.name, description: assignedMachines.description });
                }}
              >
                Edit
              </button>

              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(assignedMachines._id)}
              >
                Delete
              </button>

              <button
                className="bg-green-400 text-black px-2 py-1 rounded hover:bg-green-500 float-right w-40 flex justify-between items-center" 
                onClick={() => {
                  setOpenDropdownId(openDropdownId === assignedMachines._id ? null : assignedMachines._id)
                 
                }}
              >
                Re-allocate <FaChevronDown />
                
              </button>

            {openDropdownId === assignedMachines._id && (
            <ul className="mt-2 border rounded max-h-48 overflow-y-auto">
            {taskHandlers
              .map((taskHandlers) => (
              
  

              <li
                key={taskHandlers._id}
                className="px-4 py-2 cursor-pointer hover:bg-emerald-100 hover:text-zinc-950 "
                onClick={async ()=>{
                await handleAssign(assignedMachines._id, taskHandlers._id);
                setOpenDropdownId(null); 
                fetchAssginedMachines();
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
    </div>
    
  );
 }
*/

// with UI 

// Updated MachinesPage component with dark mode and eco-friendly UI
"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from 'react-icons/fa';
import Sidebar from '../components/sidebar';

export default function MachinesPage() {
  const [notAssignedMachines, setnotAssignedMachines] = useState([]);  
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const fetchTaskHandler = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getTaskHandler`);
      const data = await response.json();
      setTaskHandlers(data);
    } catch (error) {
      console.error('Error fetching task handlers:', error);
    }
  };

  const fetchAssginedMachines = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignedMachines`);
    const data = await res.json();
    setAssignedMachines(data);
  };

  const fetchNotAssignedMachines = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notAssignedMachines`);
    const data = await res.json();
    setnotAssignedMachines(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/createMachine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "" });
    fetchNotAssignedMachines();
    fetchAssginedMachines();
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this machine?");
    if (!isConfirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteMachine`, { 
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotAssignedMachines();  
    fetchAssginedMachines();
  };

  const handleEdit = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/updateMachine`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    setEditId(null);
    setForm({ name: "", description: "" });
    fetchNotAssignedMachines();
    fetchAssginedMachines();
  };

  const handleAssign = async (machineId, handlerId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignMachine`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId, handlerId }),
      });
    } catch (e) {
      console.log(e);
    }
    fetchNotAssignedMachines();
    fetchAssginedMachines();
  };

  useEffect(() => {
    fetchAssginedMachines();
    fetchNotAssignedMachines();
    fetchTaskHandler();
  }, []);

  const assinedHandler = (machineId) => {
    const machine = assignedMachines.find(m => m._id === machineId);
    if (machine && machine.assignedTo) {
      const handler = taskHandlers.find(th => th._id === machine.assignedTo);
      return handler ? handler.username : "Not Assigned";
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-emerald-700 dark:text-emerald-400">🌿 Machine Management</h1>

        <form onSubmit={editId ? () => handleEdit(editId) : handleCreate} className="mb-10 space-y-4">
          <input
            type="text"
            placeholder="Machine Name"
            className="border dark:border-gray-600 bg-white dark:bg-gray-800 p-3 w-full rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="border dark:border-gray-600 bg-white dark:bg-gray-800 p-3 w-full rounded-lg"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow">
            {editId ? "Update Machine" : "Create Machine"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-4 text-emerald-600 dark:text-emerald-300">Unassigned Machines</h2>
        <div className="space-y-4">
          {notAssignedMachines.map((machine) => (
            <div key={machine._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold">{machine.name}</h3>
              <p>{machine.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Assigned To: {assinedHandler(machine._id)}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button className="bg-yellow-300 text-black px-3 py-1 rounded" onClick={() => { setEditId(machine._id); setForm({ name: machine.name, description: machine.description }); }}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(machine._id)}>Delete</button>
                <div className="relative">
                  <button className="bg-green-400 text-black px-3 py-1 rounded flex items-center" onClick={() => setOpenDropdownId(openDropdownId === machine._id ? null : machine._id)}>
                    Assign Handler <FaChevronDown className="ml-2" />
                  </button>
                  {openDropdownId === machine._id && (
                    <ul className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 rounded mt-2 w-48 max-h-48 overflow-y-auto shadow-lg z-10">
                      {taskHandlers.map(handler => (
                        <li key={handler._id} className="px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-500 cursor-pointer" onClick={async () => { await handleAssign(machine._id, handler._id); setOpenDropdownId(null); }}>
                          {handler.username}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-10 mb-4 text-emerald-600 dark:text-emerald-300">Assigned Machines</h2>
        <div className="space-y-4">
          {assignedMachines.map((machine) => (
            <div key={machine._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold">{machine.name}</h3>
              <p>{machine.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Assigned To: {assinedHandler(machine._id)}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button className="bg-yellow-300 text-black px-3 py-1 rounded" onClick={() => { setEditId(machine._id); setForm({ name: machine.name, description: machine.description }); }}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(machine._id)}>Delete</button>
                <div className="relative">
                  <button className="bg-green-400 text-black px-3 py-1 rounded flex items-center" onClick={() => setOpenDropdownId(openDropdownId === machine._id ? null : machine._id)}>
                    Re-allocate <FaChevronDown className="ml-2" />
                  </button>
                  {openDropdownId === machine._id && (
                    <ul className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 rounded mt-2 w-48 max-h-48 overflow-y-auto shadow-lg z-10">
                      {taskHandlers.map(handler => (
                        <li key={handler._id} className="px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-500 cursor-pointer" onClick={async () => { await handleAssign(machine._id, handler._id); setOpenDropdownId(null); }}>
                          {handler.username}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

