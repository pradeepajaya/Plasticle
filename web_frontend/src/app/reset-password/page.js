'use client'; // Mark as a Client Component
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordContent() {
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
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}