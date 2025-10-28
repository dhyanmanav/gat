import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-133136f3`;

async function handleResponse(response: Response) {
  try {
    const data = await response.json();
    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error || 'Request failed');
    }
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse response:', error);
      throw new Error('Server response error');
    }
    throw error;
  }
}

export const api = {
  async sendOTP(mobile: string) {
    try {
      const response = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ mobile }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Send OTP error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the backend is running.');
      }
      throw error;
    }
  },

  async verifyOTP(mobile: string, otp: string) {
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ mobile, otp }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },

  async signup(data: { email: string; password: string; mobile: string; name: string; userType: string; usn?: string }) {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(email: string, password: string, userType: string) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, userType }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async verifySession(token: string) {
    try {
      const response = await fetch(`${API_BASE}/verify-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Session verification error:', error);
      throw error;
    }
  },

  async requestCertificate(token: string, data: { certificateType: string; purpose: string; additionalInfo: string }) {
    try {
      const response = await fetch(`${API_BASE}/request-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Request certificate error:', error);
      throw error;
    }
  },

  async getMyRequests(token: string) {
    try {
      const response = await fetch(`${API_BASE}/my-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get my requests error:', error);
      throw error;
    }
  },

  async getAllRequests(token: string) {
    try {
      const response = await fetch(`${API_BASE}/all-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Get all requests error:', error);
      throw error;
    }
  },

  async approveRequest(token: string, requestId: string, certificate: File, remarks: string) {
    try {
      const formData = new FormData();
      formData.append('requestId', requestId);
      formData.append('certificate', certificate);
      formData.append('remarks', remarks);

      const response = await fetch(`${API_BASE}/approve-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Approve request error:', error);
      throw error;
    }
  },

  async rejectRequest(token: string, requestId: string, reason: string) {
    try {
      const response = await fetch(`${API_BASE}/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
        body: JSON.stringify({ requestId, reason }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Reject request error:', error);
      throw error;
    }
  },

  async logout(token: string) {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};
