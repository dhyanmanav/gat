import { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import type { Admin, CertificateRequest } from '../App';
import logo from 'figma:asset/b7290909043e04203d6867936c6efc5d4558266e.png';
import { getServerUrl, getAuthHeaders } from '../utils/supabase/client';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
  onViewCertificate: (certificate: CertificateRequest) => void;
}

export function AdminDashboard({ admin, onLogout, onViewCertificate }: AdminDashboardProps) {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(getServerUrl('/certificate-requests'), {
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
      setDataLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setLoading(requestId);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(getServerUrl(`/certificate-request/${requestId}`), {
        method: 'PUT',
        headers: getAuthHeaders(accessToken || undefined),
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();

      if (response.ok && data.request) {
        // Update local state
        setRequests(requests.map(req => 
          req.id === requestId ? data.request : req
        ));
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setLoading(requestId);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(getServerUrl(`/certificate-request/${requestId}`), {
        method: 'PUT',
        headers: getAuthHeaders(accessToken || undefined),
        body: JSON.stringify({ status: 'rejected' }),
      });

      const data = await response.json();

      if (response.ok && data.request) {
        // Update local state
        setRequests(requests.map(req => 
          req.id === requestId ? data.request : req
        ));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' ? true : req.status === filter
  );

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-600">{admin.fullName}</p>
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
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Requests</p>
                <p className="text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Approved</p>
                <p className="text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600">Rejected</p>
                <p className="text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-gray-900">Certificate Requests</h2>
          </div>

          {dataLoading ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No {filter !== 'all' ? filter : ''} requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Student Name</th>
                    <th className="px-6 py-3 text-left text-gray-700">USN</th>
                    <th className="px-6 py-3 text-left text-gray-700">Semester/Year</th>
                    <th className="px-6 py-3 text-left text-gray-700">Purpose</th>
                    <th className="px-6 py-3 text-left text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{request.studentName}</td>
                      <td className="px-6 py-4 text-gray-600">{request.usn}</td>
                      <td className="px-6 py-4 text-gray-600">
                        Sem {request.semester} / {request.year} Year
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {request.purpose}
                      </td>
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
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={loading === request.id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading === request.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={loading === request.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <button
                              onClick={() => onViewCertificate(request)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}