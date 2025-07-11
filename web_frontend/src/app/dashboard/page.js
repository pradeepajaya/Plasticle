'use client'; // Mark as a Client Component
import { useState, useEffect } from 'react';
import { createTaskHandler, getTaskHandlers } from '../../services/api';


import { useRouter } from 'next/navigation'; // Correct import for Next.js App Router
import Navbar from '../components/navbar';

export default function AdminDashboard() {
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const router = useRouter();
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await getTaskHandlers();
        setTaskHandlers(response.data);
      } catch (error) {
        console.error('Error fetching handlers', error);
      }
    };
    fetchHandlers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTaskHandler(formData);
      alert('Task handler created successfully');
      window.location.reload();
    } catch (error) {
      alert('Failed to create handler');
    }
  };

  

  //  Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token'); //  Remove stored auth token
    router.push('/login'); // Redirect to login page
  };

  return (
    <>
    <Navbar/>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      <form onSubmit={handleSubmit} className="mb-6">
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="border p-2 mb-2 w-full" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border p-2 mb-2 w-full" />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="border p-2 mb-2 w-full" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4">Create Task Handler</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Existing Task Handlers</h2>
      <ul className="border p-4 rounded">
        {taskHandlers.map((handler) => (
          <li key={handler._id} className="p-2 border-b">{handler.username} ({handler.role})</li>
        ))}
      </ul>
    </div>
    </>
  );
}
