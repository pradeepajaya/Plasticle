/*'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (


    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-4">
      <video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
>
  <source src="/videos/rock.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
  <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md"></div>
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h1>
        <h2 className="text-lg text-green text-center">Plasticale coporation</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 placeholder-white/70 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/20 placeholder-white/70 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 transition duration-200 text-white font-semibold py-3 rounded-lg shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
 
  );
}
*/

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/rock.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Login Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Admin Login</h1>
        <p className="text-md text-white/80 mb-6 text-center tracking-wide">
          Plasticale Corporation
        </p>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 placeholder-white/70 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/20 placeholder-white/70 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold py-3 rounded-lg shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
