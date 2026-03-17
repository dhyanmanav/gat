import { useState } from 'react';
import { FileText, ArrowLeft, Send } from 'lucide-react';
import type { Student } from '../App';
import { getServerUrl, getAuthHeaders } from '../utils/supabase/client';

interface CertificateRequestFormProps {
  student: Student;
  onNavigate: (view: 'studentDashboard') => void;
  onBack: () => void;
}

export function CertificateRequestForm({ student, onNavigate, onBack }: CertificateRequestFormProps) {
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!purpose.trim()) {
      setError('Please enter the purpose of the certificate');
      return;
    }

    setLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(getServerUrl('/certificate-request'), {
        method: 'POST',
        headers: getAuthHeaders(accessToken || undefined),
        body: JSON.stringify({
          studentName: student.fullName,
          usn: student.usn,
          fatherName: student.fatherName,
          semester: student.semester,
          year: student.year,
          department: student.department,
          purpose: purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess('Certificate request submitted successfully! Your request is now pending admin approval.');

      setTimeout(() => {
        onNavigate('studentDashboard');
      }, 2000);
    } catch (err) {
      console.error('Certificate request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Bonafide Certificate Request</h1>
              <p className="text-gray-600">Fill in the required details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  value={student.fullName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">USN</label>
                <input
                  type="text"
                  value={student.usn}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  value={student.fatherName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={student.department}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Semester</label>
                <input
                  type="text"
                  value={`Semester ${student.semester}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  value={`${student.year} Year`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={student.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Purpose of Certificate *</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="e.g., For applying to higher education, For loan application, etc."
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Submitting...' : 'Request Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}