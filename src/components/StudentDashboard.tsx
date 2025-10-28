import { useState, useEffect } from 'react';
import { LogOut, FileText, Plus, Download, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { api } from '../utils/api';

interface StudentDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function StudentDashboard({ user, token, onLogout }: StudentDashboardProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [formData, setFormData] = useState({
    certificateType: '',
    purpose: '',
    additionalInfo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await api.getMyRequests(token);
      if (result.success) {
        setRequests(result.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await api.requestCertificate(token, formData);
      if (result.success) {
        setShowNewRequest(false);
        setFormData({ certificateType: '', purpose: '', additionalInfo: '' });
        fetchRequests();
      } else {
        alert(result.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock size={16} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle size={16} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle size={16} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    await api.logout(token);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-blue-600">Certificate Portal</h1>
              <p className="text-gray-600">Global Academy of Technology</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-600" />
                  <p className="text-gray-800">{user.name}</p>
                </div>
                <p className="text-sm text-gray-500">{user.usn}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewRequest(!showNewRequest)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
          >
            <Plus size={20} />
            New Certificate Request
          </button>
        </div>

        {/* New Request Form */}
        {showNewRequest && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-gray-800 mb-6">Request New Certificate</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Certificate Type</label>
                <select
                  value={formData.certificateType}
                  onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select certificate type</option>
                  <option value="bonafide">Bonafide Certificate</option>
                  <option value="internship">Internship Letter</option>
                  <option value="transfer">Transfer Certificate</option>
                  <option value="conduct">Conduct Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Purpose</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Bank loan, Passport application, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Additional Information</label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewRequest(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-800 mb-6">My Certificate Requests</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No certificate requests yet</p>
              <p className="text-gray-400 text-sm">Click "New Certificate Request" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-gray-800 capitalize">{request.certificateType} Certificate</h3>
                      <p className="text-sm text-gray-500">Request ID: {request.id}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Purpose:</span> {request.purpose}
                    </p>
                    {request.additionalInfo && (
                      <p className="text-gray-600">
                        <span className="font-medium">Additional Info:</span> {request.additionalInfo}
                      </p>
                    )}
                    <p className="text-gray-500">
                      Requested on: {new Date(request.requestedAt).toLocaleDateString()}
                    </p>

                    {request.status === 'approved' && request.certificateUrl && (
                      <div className="mt-4">
                        <a
                          href={request.certificateUrl}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Download size={16} />
                          Download Certificate
                        </a>
                        {request.remarks && (
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Admin Remarks:</span> {request.remarks}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">
                          <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
