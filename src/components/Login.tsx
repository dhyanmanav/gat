import { useState } from 'react';
import { LogIn, GraduationCap, ShieldCheck } from 'lucide-react';
import type { Student, Admin } from '../App';
import logo from 'figma:asset/b7290909043e04203d6867936c6efc5d4558266e.png';
import bgImage from 'figma:asset/82eabb1d3b0be5236946e304fb239b048b059ca8.png';
import { createClient } from '../utils/supabase/client';

interface LoginProps {
  onLogin: (type: 'student' | 'admin', user: Student | Admin) => void;
  onNavigate: (view: 'studentSignup' | 'adminSignup') => void;
}

export function Login({ onLogin, onNavigate }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError || !data.user) {
        throw new Error('Invalid credentials. Please try again.');
      }

      // Check if user role matches the selected tab
      const userRole = data.user.user_metadata.role;
      if (userRole !== activeTab) {
        throw new Error(`This account is not registered as ${activeTab}. Please use the correct login tab.`);
      }

      // Store access token for future requests
      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
      }

      // Create user object from metadata
      const userData = data.user.user_metadata;
      const user = activeTab === 'student' 
        ? {
            id: data.user.id,
            fullName: userData.fullName,
            usn: userData.usn,
            fatherName: userData.fatherName,
            semester: userData.semester,
            year: userData.year,
            department: userData.department,
            email: data.user.email!,
            phone: userData.phone,
            password: '',
          }
        : {
            id: data.user.id,
            fullName: userData.fullName,
            email: data.user.email!,
            phone: userData.phone,
            password: '',
          };

      onLogin(activeTab, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Global Academy of Technology" className="w-24 h-24" />
          </div>
          <h1 className="text-gray-900 mb-2">Global Academy of Technology</h1>
          <p className="text-gray-600">Student Certificate Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Login</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  {activeTab === 'student' ? 'Email or USN' : 'Email'}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder={activeTab === 'student' ? 'Enter your email or USN' : 'Enter your email'}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate(activeTab === 'student' ? 'studentSignup' : 'adminSignup')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          © 2025 Global Academy of Technology
        </p>
      </div>
    </div>
  );
}