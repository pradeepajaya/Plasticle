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
                className="bg-green-400 text-black px-2 py-1 rounded hover:bg-green-600 float-right w-40 flex justify-between items-center" 
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

"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from 'react-icons/fa';
import Sidebar from '../components/sidebar';

export default function MachinesPage() {
  const [notAssignedMachines, setNotAssignedMachines] = useState([]);  
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    startDate: "", 
    endDate: "" 
  });
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

  const fetchAssignedMachines = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignedMachines`);
      const data = await res.json();
      setAssignedMachines(data);
    } catch (error) {
      console.error('Error fetching assigned machines:', error);
    }
  };

  const fetchNotAssignedMachines = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notAssignedMachines`);
      const data = await res.json();
      setNotAssignedMachines(data);
    } catch (error) {
      console.error('Error fetching not assigned machines:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/updateMachine`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/createMachine`;
      
      const method = editId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });

      if (res.ok) {
        alert(editId ? "Machine updated successfully!" : "Machine created successfully!");
        resetForm();
        fetchNotAssignedMachines();
        fetchAssignedMachines();
      } else {
        throw new Error(editId ? "Failed to update machine" : "Failed to create machine");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", startDate: "", endDate: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this machine?");
    if (!isConfirmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteMachine`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchNotAssignedMachines();  
      fetchAssignedMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert("Failed to delete machine");
    }
  };

  const handleAssign = async (machineId, handlerId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assignMachine`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId, handlerId }),
      });
      if (!res.ok) throw new Error("Failed to assign machine");
      fetchNotAssignedMachines();
      fetchAssignedMachines();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleEdit = (machine) => {
    setForm({
      name: machine.name,
      description: machine.description,
      startDate: machine.startDate ? machine.startDate.split('T')[0] : "",
      endDate: machine.endDate ? machine.endDate.split('T')[0] : ""
    });
    setEditId(machine._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const assignedHandler = (machineId) => {
    const machine = assignedMachines.find(m => m._id === machineId);
    if (machine && machine.assignedTo) {
      const handler = taskHandlers.find(th => th._id === machine.assignedTo);
      return handler ? handler.username : "Not Assigned";
    }
    return "Not Assigned";
  };

  useEffect(() => {
    fetchAssignedMachines();
    fetchNotAssignedMachines();
    fetchTaskHandler();
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-emerald-700 dark:text-emerald-400">🌿 Machine Management</h1>

        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
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
          Start Date: 
          <input
            type="date"
            className="border dark:border-gray-600 bg-white dark:bg-gray-800 p-3 w-full rounded-lg "
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            placeholder="Start Date"
            required
            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
          />
          End Date:
          <input
            type="date"
            className="border dark:border-gray-600 bg-white dark:bg-gray-800 p-3 w-full rounded-lg"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            placeholder="End Date"
            required
            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
          />

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow"
            >
              {editId ? "Update Machine" : "Create Machine"}
            </button>
            {editId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2 className="text-xl font-semibold mb-4 text-emerald-600 dark:text-emerald-300">Unassigned Machines</h2>
        <div className="space-y-4">
          {notAssignedMachines.length > 0 ? (
            notAssignedMachines.map((machine) => (
              <div key={machine._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold">{machine.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">{machine.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p>Start: {machine.endDate ? new Date(machine.endDate).toISOString().split("T")[0] : "N/A"}</p>
                  <p>End: {machine.endDate ? new Date(machine.endDate).toISOString().split("T")[0] : "N/A"}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button 
                    className="bg-yellow-300 hover:bg-yellow-400 text-black px-3 py-1 rounded" 
                    onClick={() => handleEdit(machine)}
                  >
                    Edit
                  </button>
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" 
                    onClick={() => handleDelete(machine._id)}
                  >
                    Delete
                  </button>
                  <div className="relative">
                    <button 
                      className="bg-green-400 hover:bg-green-500 text-black px-3 py-1 rounded flex items-center" 
                      onClick={() => setOpenDropdownId(openDropdownId === machine._id ? null : machine._id)}
                    >
                      Assign Handler <FaChevronDown className="ml-2" />
                    </button>
                    {openDropdownId === machine._id && (
                      <ul className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 rounded mt-2 w-48 max-h-48 overflow-y-auto shadow-lg z-10">
                        {taskHandlers.map(handler => (
                          <li 
                            key={handler._id} 
                            className="px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-500 cursor-pointer" 
                            onClick={async () => { 
                              await handleAssign(machine._id, handler._id); 
                              setOpenDropdownId(null); 
                            }}
                          >
                            {handler.username}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No unassigned machines found</p>
          )}
        </div>

        <h2 className="text-xl font-semibold mt-10 mb-4 text-emerald-600 dark:text-emerald-300">Assigned Machines</h2>
        <div className="space-y-4">
          {assignedMachines.length > 0 ? (
            assignedMachines.map((machine) => (
              <div key={machine._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold">{machine.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">{machine.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p>Start: {machine.startDate ? new Date(machine.startDate).toLocaleDateString() : "N/A"}</p>
                  <p>End: {machine.endDate ? new Date(machine.endDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <p className="text-sm mt-2">
                  <span className="font-medium">Assigned To:</span> {assignedHandler(machine._id)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button 
                    className="bg-yellow-300 hover:bg-yellow-400 text-black px-3 py-1 rounded" 
                    onClick={() => handleEdit(machine)}
                  >
                    Edit
                  </button>
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" 
                    onClick={() => handleDelete(machine._id)}
                  >
                    Delete
                  </button>
                  <div className="relative">
                    <button 
                      className="bg-green-400 hover:bg-green-500 text-black px-3 py-1 rounded flex items-center" 
                      onClick={() => setOpenDropdownId(openDropdownId === machine._id ? null : machine._id)}
                    >
                      Re-allocate <FaChevronDown className="ml-2" />
                    </button>
                    {openDropdownId === machine._id && (
                      <ul className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 rounded mt-2 w-48 max-h-48 overflow-y-auto shadow-lg z-10">
                        {taskHandlers.map(handler => (
                          <li 
                            key={handler._id} 
                            className="px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-500 cursor-pointer" 
                            onClick={async () => { 
                              await handleAssign(machine._id, handler._id); 
                              setOpenDropdownId(null); 
                            }}
                          >
                            {handler.username}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No assigned machines found</p>
          )}
        </div>
      </div>
    </div>
  );
}