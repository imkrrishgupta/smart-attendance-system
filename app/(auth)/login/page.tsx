'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (!res || !res.ok) {
        switch (res?.status) {

          case 401:
            setError("Invalid email or password");
            break;
          
          case 400:
            setError("Please fill all fields");
            break;
          
          case 500:
            setError("Server error. Try again later.");
            break;
            
          default:
            setError("Something went wrong");
          }
        
        return;
      }

      const session = await getSession();

      if (!session) {
        setError("Session not found. Please try again.");
        return;
      }

      const role = session.user.role;

      if (role === 'admin') router.replace('/admin/dashboard');
      else if (role === 'teacher') router.replace('/teacher/dashboard');
      else router.replace('/student/dashboard');

      router.refresh();

      } catch (error: any) {
        setError(error.message)
      } finally{
        setLoading(false)
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Login to Smart Attendance
        </h1>

        {error && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 backdrop-blur-md px-4 py-3 shadow-sm">
            
              {/*Icon*/}
            
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                >
              
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              
                </svg>
              </div>
            
              {/*Text*/}
              
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">
                  Login failed
                </p>
              
                <p className="text-sm text-red-600 leading-relaxed">
                  {error}
                </p>
              
              </div>
            </div>
          
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border text-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border text-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  </div>
)
}
