/*'use client'; // Mark as a Client Component
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [searchParams]);

  const handleResetPassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
      alert('Password reset successfully! You can now login.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ padding: '10px', marginBottom: '10px', display: 'block' }}
      />
      <button onClick={handleResetPassword} style={{ padding: '10px' }}>
        Reset Password
      </button>
    </div>
  );
}*/
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [searchParams]);

  const handleResetPassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
      alert('Password reset successfully! You can now login.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-700 to-green-600 p-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl font-bold">🔒</div>
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="text-sm text-emerald-200">Enter a new password to continue</p>
        </div>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <button
          onClick={handleResetPassword}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
