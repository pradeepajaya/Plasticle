
"use client";
import { useEffect, useState } from "react";
import { differenceInDays } from 'date-fns';
import { FaChevronDown } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';
import Sidebar from '../components/sidebar';

export default function MachinesPage() {
  const [notAssignedMachines, setNotAssignedMachines] = useState([]);
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [newReleaseMachine, setNewReleaseMachine] = useState([]);
  const [endingMachine, setEndingMachine] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: ""
  });
  const [editId, setEditId] = useState(null);
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    fetchAssignedMachines();
    fetchNotAssignedMachines();
    fetchTaskHandler();
    fetchMachines();
  }, []);

  useEffect(() => {
    if (machines) {
      showNotification(machines);
    }

  }, [machines]);



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
  const fetchMachines = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/getMachine`);
      const data = await res.json();
      setMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
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
        window.location.reload();
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
    fetchNotAssignedMachines();
    fetchAssignedMachines();

  };

  const assignedHandler = (machineId) => {
    const machine = assignedMachines.find(m => m._id === machineId);
    if (machine && machine.assignedTo) {
      const handler = taskHandlers.find(th => th._id === machine.assignedTo);
      return handler ? handler.username : "Not Assigned";
    }
    return "Not Assigned";
  };

  const showNotification = (machines) => {


    const newRelease = machines
      .filter(machine => {
        const daysTobe = differenceInDays(new Date(machine.startDate), new Date());
        return machine.startDate && daysTobe <= 3 && daysTobe >= 0;
      })
      .map(machine => {
        const daysTobe = differenceInDays(new Date(machine.startDate), new Date());
        console.log(`${machine.name} will start in ${daysTobe} days`);
        setCount(prev => prev + 1);
        return {
          ...machine,
          startDays: daysTobe
        };
      });


    setNewReleaseMachine(newRelease)
    console.log("New Release Machine:", newRelease);




    const closingMachine = machines
      .filter(machine => {
        const daysTobe = differenceInDays(new Date(machine.endDate), new Date());
        return machine.startDate && daysTobe <= 3 && daysTobe >= 0;
      })
      .map(machine => {
        const daysTobe = differenceInDays(new Date(machine.endDate), new Date());
        console.log(`${machine.name} will start in ${daysTobe} days`);
        setCount(prev => prev + 1);
        return {
          ...machine,
          endDays: daysTobe
        };
      });


    setEndingMachine(closingMachine)
    console.log("New Release Machine:", closingMachine);




  }








  return (
    <>
      <div className="flex bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
        <Sidebar />



        <div className="fixed top-8 right-20 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 relative bg-white dark:bg-emerald-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-emerald-700 transition-colors"
          >
            <FaBell className="text-gray-700 dark:text-gray-200" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ">
                {count}
              </span>
            )}
          </button>

          {isOpen && (newReleaseMachine || endingMachine) && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {newReleaseMachine && (
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                      New Releases
                    </h4>
                    {
                      newReleaseMachine.map((machine, index) => (
                        <div key={index} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {machine.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Releasing {machine.startDays == 0 ? "today" : machine.startDays + "days"}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                )}

                {endingMachine && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                      Closing Soon
                    </h4>
                    {
                      endingMachine.map((machine, index) => (
                        <div key={index} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {machine.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Closing in {machine.endDays} days
                          </p>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>







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
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
            />
            End Date:
            <input
              type="date"
              className="border dark:border-gray-600 bg-white dark:bg-gray-800 p-3 w-full rounded-lg"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              placeholder="End Date"
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
                    <p>Start: {machine.startDate ? new Date(machine.startDate).toISOString().split("T")[0] : "N/A"}</p>
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
                    <p>Start: {machine.startDate ? new Date(machine.startDate).toISOString().split("T")[0] : "N/A"}</p>
                    <p>End: {machine.endDate ? new Date(machine.endDate).toISOString().split("T")[0] : "N/A"}</p>
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

    </>
  );

}