import { FileText, LogOut, User, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import type { Student } from '../App';
import type { CertificateRequest } from '../App';
import { useState, useEffect } from 'react';
import logo from 'figma:asset/b7290909043e04203d6867936c6efc5d4558266e.png';
import { getServerUrl, getAuthHeaders } from '../utils/supabase/client';

interface StudentDashboardProps {
  student: Student;
  onNavigate: (view: 'certificateRequest') => void;
  onLogout: () => void;
  onViewCertificate?: (certificate: CertificateRequest) => void;
}

export function StudentDashboard({ student, onNavigate, onLogout, onViewCertificate }: StudentDashboardProps) {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [student.id]);

  const loadRequests = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(getServerUrl('/certificate-requests/student'), {
        method: 'GET',
        headers: getAuthHeaders(accessToken || undefined),
      });

      const data = await response.json();

      if (response.ok && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (certificate: CertificateRequest) => {
    if (onViewCertificate) {
      onViewCertificate(certificate);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900">Welcome, {student.fullName}</h2>
                <p className="text-gray-600">USN: {student.usn}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Manage your bonafide certificate requests</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Apply for Certificate Card */}
          <div 
            onClick={() => onNavigate('certificateRequest')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-600"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2">Apply for Bonafide Certificate</h3>
              <p className="text-gray-600">Submit a new certificate request</p>
              <div className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Apply Now
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending Requests</p>
                <p className="text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Approved Requests</p>
                <p className="text-gray-900">{requests.filter(r => r.status === 'approved').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        {requests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-gray-900 mb-4">Recent Requests</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Request Date</th>
                      <th className="px-6 py-3 text-left text-gray-700">Purpose</th>
                      <th className="px-6 py-3 text-left text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700">Certificate No.</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(parseInt(request.id)).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{request.purpose}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {request.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                            {request.status === 'rejected' && <XCircle className="w-4 h-4" />}
                            {request.status === 'pending' && <Clock className="w-4 h-4" />}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {request.certificateNumber || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleDownloadCertificate(request)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}