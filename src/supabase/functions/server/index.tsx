import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Password hashing using Web Crypto API (Deno compatible)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BUCKET_NAME = 'make-133136f3-certificates';

// Initialize storage bucket
async function initBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log('Created storage bucket:', BUCKET_NAME);
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

initBucket();

// Send OTP
app.post('/make-server-133136f3/send-otp', async (c) => {
  try {
    const { mobile } = await c.req.json();
    
    if (!mobile) {
      return c.json({ error: 'Mobile number is required' }, 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in KV
    await kv.set(`otp:${mobile}`, JSON.stringify({ otp, expiresAt }));

    // Send OTP via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken && twilioPhone) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', mobile);
      formData.append('From', twilioPhone);
      formData.append('Body', `Your GAT Certificate Portal OTP is: ${otp}. Valid for 10 minutes.`);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Twilio error:', error);
        return c.json({ error: 'Failed to send OTP', details: error }, 500);
      }
    } else {
      console.log('Twilio not configured. OTP would be:', otp);
    }

    return c.json({ success: true, message: 'OTP sent successfully', devOtp: !accountSid ? otp : undefined });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return c.json({ error: 'Failed to send OTP', details: error.message }, 500);
  }
});

// Verify OTP
app.post('/make-server-133136f3/verify-otp', async (c) => {
  try {
    const { mobile, otp } = await c.req.json();

    if (!mobile || !otp) {
      return c.json({ error: 'Mobile and OTP are required' }, 400);
    }

    const storedData = await kv.get(`otp:${mobile}`);
    
    if (!storedData) {
      return c.json({ error: 'OTP not found or expired' }, 400);
    }

    const { otp: storedOtp, expiresAt } = JSON.parse(storedData);

    if (Date.now() > expiresAt) {
      await kv.del(`otp:${mobile}`);
      return c.json({ error: 'OTP expired' }, 400);
    }

    if (otp !== storedOtp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    // Delete OTP after successful verification
    await kv.del(`otp:${mobile}`);

    return c.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return c.json({ error: 'Failed to verify OTP', details: error.message }, 500);
  }
});

// Sign up
app.post('/make-server-133136f3/signup', async (c) => {
  try {
    const { email, password, mobile, name, userType, usn } = await c.req.json();

    if (!email || !password || !mobile || !name || !userType) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Validate email domain
    if (!email.endsWith('@gat.ac.in')) {
      return c.json({ error: 'Only @gat.ac.in emails are allowed' }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      mobile,
      name,
      userType,
      usn: userType === 'student' ? usn : undefined,
      createdAt: Date.now(),
    };

    await kv.set(`user:${email}`, JSON.stringify(user));

    return c.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ error: 'Signup failed', details: error.message }, 500);
  }
});

// Login
app.post('/make-server-133136f3/login', async (c) => {
  try {
    const { email, password, userType } = await c.req.json();

    if (!email || !password || !userType) {
      return c.json({ error: 'Email, password, and user type are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    
    if (!userData) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = JSON.parse(userData);

    // Verify user type
    if (user.userType !== userType) {
      return c.json({ error: 'Invalid user type' }, 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create session token (simple version)
    const token = btoa(`${email}:${Date.now()}`);
    await kv.set(`session:${token}`, JSON.stringify({ email, userType, createdAt: Date.now() }));

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ 
      success: true, 
      token,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

// Verify session
app.post('/make-server-133136f3/verify-session', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    const userData = await kv.get(`user:${session.email}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 401);
    }

    const user = JSON.parse(userData);
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return c.json({ error: 'Session verification failed', details: error.message }, 500);
  }
});

// Submit certificate request
app.post('/make-server-133136f3/request-certificate', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    const { certificateType, purpose, additionalInfo } = await c.req.json();

    if (!certificateType) {
      return c.json({ error: 'Certificate type is required' }, 400);
    }

    const requestId = `REQ${Date.now()}`;
    const request = {
      id: requestId,
      studentEmail: session.email,
      certificateType,
      purpose: purpose || '',
      additionalInfo: additionalInfo || '',
      status: 'pending',
      requestedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await kv.set(`request:${requestId}`, JSON.stringify(request));

    return c.json({ success: true, requestId, message: 'Certificate request submitted successfully' });
  } catch (error) {
    console.error('Error submitting certificate request:', error);
    return c.json({ error: 'Failed to submit request', details: error.message }, 500);
  }
});

// Get student's requests
app.get('/make-server-133136f3/my-requests', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    const allRequests = await kv.getByPrefix('request:');
    
    const myRequests = allRequests
      .map(r => JSON.parse(r))
      .filter(r => r.studentEmail === session.email)
      .sort((a, b) => b.requestedAt - a.requestedAt);

    return c.json({ success: true, requests: myRequests });
  } catch (error) {
    console.error('Error fetching student requests:', error);
    return c.json({ error: 'Failed to fetch requests', details: error.message }, 500);
  }
});

// Get all requests (admin only)
app.get('/make-server-133136f3/all-requests', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    
    if (session.userType !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const allRequests = await kv.getByPrefix('request:');
    
    // Get student details for each request
    const requestsWithDetails = await Promise.all(
      allRequests.map(async (r) => {
        const request = JSON.parse(r);
        const studentData = await kv.get(`user:${request.studentEmail}`);
        const student = studentData ? JSON.parse(studentData) : null;
        return {
          ...request,
          studentName: student?.name || 'Unknown',
          studentUSN: student?.usn || 'N/A',
          studentMobile: student?.mobile || 'N/A',
        };
      })
    );

    requestsWithDetails.sort((a, b) => b.requestedAt - a.requestedAt);

    return c.json({ success: true, requests: requestsWithDetails });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return c.json({ error: 'Failed to fetch requests', details: error.message }, 500);
  }
});

// Approve request and upload certificate
app.post('/make-server-133136f3/approve-request', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    
    if (session.userType !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const formData = await c.req.formData();
    const requestId = formData.get('requestId') as string;
    const pdfFile = formData.get('certificate') as File;
    const remarks = formData.get('remarks') as string;

    if (!requestId || !pdfFile) {
      return c.json({ error: 'Request ID and certificate file are required' }, 400);
    }

    // Get request
    const requestData = await kv.get(`request:${requestId}`);
    if (!requestData) {
      return c.json({ error: 'Request not found' }, 404);
    }

    const request = JSON.parse(requestData);

    // Upload PDF to Supabase Storage
    const fileName = `${requestId}_${Date.now()}.pdf`;
    const fileBuffer = await pdfFile.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      return c.json({ error: 'Failed to upload certificate', details: uploadError.message }, 500);
    }

    // Create signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 31536000);

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return c.json({ error: 'Failed to create download link', details: urlError.message }, 500);
    }

    // Update request
    request.status = 'approved';
    request.certificateUrl = urlData.signedUrl;
    request.approvedAt = Date.now();
    request.approvedBy = session.email;
    request.remarks = remarks || '';
    request.updatedAt = Date.now();

    await kv.set(`request:${requestId}`, JSON.stringify(request));

    return c.json({ success: true, message: 'Certificate approved and uploaded successfully' });
  } catch (error) {
    console.error('Error approving request:', error);
    return c.json({ error: 'Failed to approve request', details: error.message }, 500);
  }
});

// Reject request
app.post('/make-server-133136f3/reject-request', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await kv.get(`session:${token}`);
    if (!sessionData) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const session = JSON.parse(sessionData);
    
    if (session.userType !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const { requestId, reason } = await c.req.json();

    if (!requestId) {
      return c.json({ error: 'Request ID is required' }, 400);
    }

    // Get request
    const requestData = await kv.get(`request:${requestId}`);
    if (!requestData) {
      return c.json({ error: 'Request not found' }, 404);
    }

    const request = JSON.parse(requestData);

    // Update request
    request.status = 'rejected';
    request.rejectedAt = Date.now();
    request.rejectedBy = session.email;
    request.rejectionReason = reason || '';
    request.updatedAt = Date.now();

    await kv.set(`request:${requestId}`, JSON.stringify(request));

    return c.json({ success: true, message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return c.json({ error: 'Failed to reject request', details: error.message }, 500);
  }
});

// Logout
app.post('/make-server-133136f3/logout', async (c) => {
  try {
    const token = c.req.header('X-Session-Token');
    
    if (token) {
      await kv.del(`session:${token}`);
    }

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Logout failed', details: error.message }, 500);
  }
});

console.log('🚀 GAT Certificate Management Server starting...');
console.log('📋 Available routes:');
console.log('  POST /make-server-133136f3/send-otp');
console.log('  POST /make-server-133136f3/verify-otp');
console.log('  POST /make-server-133136f3/signup');
console.log('  POST /make-server-133136f3/login');
console.log('  POST /make-server-133136f3/verify-session');
console.log('  POST /make-server-133136f3/request-certificate');
console.log('  GET  /make-server-133136f3/my-requests');
console.log('  GET  /make-server-133136f3/all-requests');
console.log('  POST /make-server-133136f3/approve-request');
console.log('  POST /make-server-133136f3/reject-request');
console.log('  POST /make-server-133136f3/logout');

const twilioConfigured = !!(Deno.env.get('TWILIO_ACCOUNT_SID') && Deno.env.get('TWILIO_AUTH_TOKEN') && Deno.env.get('TWILIO_PHONE_NUMBER'));
console.log(`📱 Twilio OTP: ${twilioConfigured ? '✅ Configured' : '⚠️  Not configured (dev mode - OTP will be logged)'}`);
console.log('✨ Server ready!');

Deno.serve(app.fetch);
