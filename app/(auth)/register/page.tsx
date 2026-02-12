'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        role
      });

      router.push("/login");
      router.refresh();

    } catch (error: any) {
        if (error.response) {
          setError(error.response.data?.error || "Registration failed");
        } else {
            setError("Something went wrong. Please try again.");
        }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="student">Student</option>
          </select>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-slate-600 text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
