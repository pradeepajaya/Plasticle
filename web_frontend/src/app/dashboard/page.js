/*'use client'; // Mark as a Client Component
import { useState, useEffect } from 'react';
import { createTaskHandler, getTaskHandlers } from '../../services/api';
import { useRouter } from 'next/navigation'; // Correct import for Next.js App Router

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

  

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove stored auth token
    router.push('/login'); // Redirect to login page
  };

  return (
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
  );
}
*/
/*'use client';
import { useState, useEffect } from 'react';
import { createTaskHandler, getTaskHandlers, deactivateTaskHandler } from '../../services/api';
import { useRouter } from 'next/navigation';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-700 to-green-600 p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
          >
            Create Task Handler
          </button>
        </form>

        <h2 className="text-2xl font-semibold mb-4">Existing Task Handlers</h2>
        <ul className="space-y-3">
          {taskHandlers.map((handler) => (
            <li
              key={handler._id}
              className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg backdrop-blur-sm shadow hover:shadow-md transition duration-200"
            >
              <span className="font-medium">{handler.username}</span> — <span className="text-sm opacity-80">{handler.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
*/

'use client';
import { useState, useEffect } from 'react';
import {
  createTaskHandler,
  getTaskHandlers,
  deactivateTaskHandler,
} from '../../services/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';


export default function AdminDashboard() {
  const [taskHandlers, setTaskHandlers] = useState([]);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const router = useRouter();

  const fetchHandlers = async () => {
    try {
      const response = await getTaskHandlers();
      setTaskHandlers(response.data);
    } catch (error) {
      console.error('Error fetching handlers', error);
    }
  };

  useEffect(() => {
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
      setFormData({ username: '', email: '', password: '' });
      fetchHandlers(); // refresh list
    } catch (error) {
      alert('Failed to create handler');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateTaskHandler(id);
      alert('Task handler deactivated');
      fetchHandlers(); // Refresh list
    } catch (error) {
      console.error('Failed to deactivate handler', error);
      alert('Failed to deactivate task handler');
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-900 via-emerald-700 to-green-600">
  <Sidebar />
  <div className="flex-grow bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 text-white min-h-screen"><div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="off"
              value={formData.username}
              onChange={handleChange}
              required
              className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-white/20 placeholder-white/80 text-white px-4 py-3 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
            >
              Create Task Handler
            </button>
          </form>

          <h2 className="text-2xl font-semibold mb-4">Existing Task Handlers</h2>
          <ul className="space-y-3">
            {taskHandlers.map((handler) => (
              <li
                key={handler._id}
                className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg backdrop-blur-sm shadow hover:shadow-md transition duration-200 flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{handler.username}</span>{' '}
                  — <span className="text-sm opacity-80">{handler.role}</span>
                </div>
                <button
                  onClick={() => handleDeactivate(handler._id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow"
                >
                  Deactivate
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
