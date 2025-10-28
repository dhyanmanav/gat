import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

interface OTPModalProps {
  mobile: string;
  onVerified: () => void;
  onClose: () => void;
}

export function OTPModal({ mobile, onVerified, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.verifyOTP(mobile, otp);
      
      if (result.success) {
        onVerified();
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setOtp('');

    try {
      const result = await api.sendOTP(mobile);
      
      if (result.success) {
        setResendTimer(60);
        // Show dev OTP if available (for testing without Twilio)
        if (result.devOtp) {
          alert(`Development OTP: ${result.devOtp}`);
        }
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error('OTP resend error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3>Verify Mobile Number</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enter the 6-digit OTP sent to {mobile}
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest"
          disabled={loading}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend OTP in {resendTimer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
