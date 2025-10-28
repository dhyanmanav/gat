import { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';
import { OTPModal } from './OTPModal';

interface AdminSignupProps {
  onBack: () => void;
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
  backgroundImage: string;
}

export function AdminSignup({ onBack, onSignupSuccess, onSwitchToLogin, backgroundImage }: AdminSignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.sendOTP(formData.mobile);
      
      if (result.success) {
        setShowOTPModal(true);
        // Show dev OTP if available (for testing without Twilio)
        if (result.devOtp) {
          alert(`Development OTP: ${result.devOtp}`);
        }
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('OTP send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setOtpVerified(true);
    setShowOTPModal(false);
    setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpVerified) {
      setError('Please verify your mobile number first');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.email.endsWith('@gat.ac.in')) {
      setError('Please use your @gat.ac.in email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.signup({
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        name: formData.name,
        userType: 'admin',
      });
      
      if (result.success) {
        onSignupSuccess();
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-white hover:text-gray-200"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-purple-600 mb-2">Admin Sign Up</h2>
            <p className="text-gray-600">Admission Department</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@gat.ac.in"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+919876543210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={otpVerified}
                  />
                </div>
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 whitespace-nowrap"
                  >
                    Verify
                  </button>
                )}
                {otpVerified && (
                  <div className="px-4 py-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                    ✓ Verified
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {showOTPModal && (
        <OTPModal
          mobile={formData.mobile}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
}
