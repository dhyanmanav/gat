import { useState, useEffect } from 'react';
import { LogOut, User, Search, CheckCircle, XCircle, Upload, FileText } from 'lucide-react';
import { api } from '../utils/api';

interface AdminDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function AdminDashboard({ user, token, onLogout }: AdminDashboardProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await api.getAllRequests(token);
      if (result.success) {
        setRequests(result.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentUSN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateFile) {
      alert('Please upload a certificate file');
      return;
    }

    setProcessing(true);

    try {
      const result = await api.approveRequest(token, selectedRequest.id, certificateFile, remarks);
      if (result.success) {
        alert('Certificate approved and uploaded successfully!');
        setSelectedRequest(null);
        setCertificateFile(null);
        setRemarks('');
        fetchRequests();
      } else {
        alert(result.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);

    try {
      const result = await api.rejectRequest(token, requestId, rejectionReason);
      if (result.success) {
        alert('Request rejected successfully');
        setSelectedRequest(null);
        setRejectionReason('');
        fetchRequests();
      } else {
        alert(result.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await api.logout(token);
    onLogout();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Rejected</span>;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-purple-600">Admin Portal</h1>
              <p className="text-gray-600">Certificate Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-600" />
                  <p className="text-gray-800">{user.name}</p>
                </div>
                <p className="text-sm text-gray-500">Admission Department</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 mb-2">Total Requests</p>
            <p className="text-3xl text-gray-800">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-lg p-6">
            <p className="text-yellow-700 mb-2">Pending</p>
            <p className="text-3xl text-yellow-800">{pendingCount}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-lg p-6">
            <p className="text-green-700 mb-2">Approved</p>
            <p className="text-3xl text-green-800">{approvedCount}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-lg p-6">
            <p className="text-red-700 mb-2">Rejected</p>
            <p className="text-3xl text-red-800">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, USN, or request ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-gray-800 mb-6">Certificate Requests</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700">Request ID</th>
                    <th className="text-left py-3 px-4 text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-gray-700">USN</th>
                    <th className="text-left py-3 px-4 text-gray-700">Certificate Type</th>
                    <th className="text-left py-3 px-4 text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{request.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{request.studentName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{request.studentUSN}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 capitalize">{request.certificateType}</td>
                      <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-800">Request Details</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="text-gray-800">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="text-gray-800">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">USN</p>
                  <p className="text-gray-800">{selectedRequest.studentUSN}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="text-gray-800">{selectedRequest.studentMobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{selectedRequest.studentEmail}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Certificate Type</p>
                <p className="text-gray-800 capitalize">{selectedRequest.certificateType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="text-gray-800">{selectedRequest.purpose}</p>
              </div>

              {selectedRequest.additionalInfo && (
                <div>
                  <p className="text-sm text-gray-500">Additional Information</p>
                  <p className="text-gray-800">{selectedRequest.additionalInfo}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Requested On</p>
                <p className="text-gray-800">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
              </div>

              {selectedRequest.status === 'pending' && (
                <>
                  {/* Approve Form */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-gray-800 mb-4">Approve Request</h4>
                    <form onSubmit={handleApprove} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Upload Certificate (PDF)</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Remarks (Optional)</label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Any additional notes..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                      >
                        <CheckCircle size={20} />
                        {processing ? 'Processing...' : 'Approve & Upload Certificate'}
                      </button>
                    </form>
                  </div>

                  {/* Reject Form */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-gray-800 mb-4">Reject Request</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Rejection Reason</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                      >
                        <XCircle size={20} />
                        {processing ? 'Processing...' : 'Reject Request'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-green-700 mb-2">✓ Certificate Approved</p>
                  <p className="text-sm text-gray-600">
                    Approved on: {new Date(selectedRequest.approvedAt).toLocaleString()}
                  </p>
                  {selectedRequest.remarks && (
                    <p className="text-sm text-gray-600 mt-2">
                      Remarks: {selectedRequest.remarks}
                    </p>
                  )}
                </div>
              )}

              {selectedRequest.status === 'rejected' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-red-700 mb-2">✗ Request Rejected</p>
                  <p className="text-sm text-gray-600">
                    Rejected on: {new Date(selectedRequest.rejectedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Reason: {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setCertificateFile(null);
                  setRemarks('');
                  setRejectionReason('');
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
