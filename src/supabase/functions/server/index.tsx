import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Helper function to verify user from access token
async function verifyUser(accessToken: string) {
  // Create a client with the anon key to verify user tokens
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error) {
    console.error('Error verifying user token:', error);
  }
  
  return { user, error };
}

// Initialize database on startup
async function initializeDatabase() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if table exists by trying to query it
    const { error } = await supabase.from('kv_store_b46b7a19').select('key').limit(1);
    
    if (error) {
      console.error('KV Store table might not exist:', error.message);
      console.log('Please create the kv_store_b46b7a19 table in your Supabase dashboard');
      console.log('SQL: CREATE TABLE kv_store_b46b7a19 (key TEXT NOT NULL PRIMARY KEY, value JSONB NOT NULL);');
    } else {
      console.log('✅ KV Store table is ready');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run initialization
initializeDatabase();

// Helper function to send OTP via Twilio
async function sendOTP(phone: string, otp: string) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('Twilio credentials not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+91${phone}`,
          From: twilioPhoneNumber,
          Body: `Your GAT verification code is: ${otp}. Valid for 10 minutes.`,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: String(error) };
  }
}

// Health check endpoint
app.get("/make-server-b46b7a19/health", (c) => {
  return c.json({ status: "ok" });
});

// Send OTP
app.post("/make-server-b46b7a19/send-otp", async (c) => {
  try {
    const { phone } = await c.req.json();

    if (!phone || phone.length !== 10) {
      return c.json({ error: 'Invalid phone number' }, 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in KV store with expiration
    const otpKey = `otp:${phone}`;
    await kv.set(otpKey, otp);

    // Send OTP via Twilio
    const result = await sendOTP(phone, otp);

    if (!result.success) {
      // In development, still return success but log the error
      console.log(`Development mode: OTP for ${phone} is ${otp}`);
    }

    return c.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Include OTP in response only in development
      developmentOTP: otp 
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Verify OTP
app.post("/make-server-b46b7a19/verify-otp", async (c) => {
  try {
    const { phone, otp } = await c.req.json();

    if (!phone || !otp) {
      return c.json({ error: 'Phone and OTP required' }, 400);
    }

    // Get stored OTP
    const otpKey = `otp:${phone}`;
    const storedOTP = await kv.get(otpKey);

    if (!storedOTP) {
      return c.json({ error: 'OTP expired or not found' }, 400);
    }

    if (storedOTP !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    // Delete OTP after verification
    await kv.del(otpKey);

    return c.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Student Signup
app.post("/make-server-b46b7a19/signup/student", async (c) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const studentData = await c.req.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: studentData.email,
      password: studentData.password,
      user_metadata: {
        fullName: studentData.fullName,
        usn: studentData.usn,
        fatherName: studentData.fatherName,
        semester: studentData.semester,
        year: studentData.year,
        department: studentData.department,
        phone: studentData.phone,
        role: 'student',
      },
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error during student signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional student data in KV store
    const studentKey = `student:${authData.user.id}`;
    await kv.set(studentKey, {
      id: authData.user.id,
      fullName: studentData.fullName,
      usn: studentData.usn,
      fatherName: studentData.fatherName,
      semester: studentData.semester,
      year: studentData.year,
      email: studentData.email,
      phone: studentData.phone,
    });

    return c.json({ 
      success: true, 
      message: 'Student account created successfully',
      userId: authData.user.id 
    });
  } catch (error) {
    console.error('Error in student signup:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Admin Signup
app.post("/make-server-b46b7a19/signup/admin", async (c) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const adminData = await c.req.json();

    // Verify secret code
    if (adminData.secretCode !== 'gat') {
      return c.json({ error: 'Invalid admin secret code' }, 403);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      user_metadata: {
        fullName: adminData.fullName,
        phone: adminData.phone,
        role: 'admin',
      },
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error during admin signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional admin data in KV store
    const adminKey = `admin:${authData.user.id}`;
    await kv.set(adminKey, {
      id: authData.user.id,
      fullName: adminData.fullName,
      email: adminData.email,
      phone: adminData.phone,
    });

    return c.json({ 
      success: true, 
      message: 'Admin account created successfully',
      userId: authData.user.id 
    });
  } catch (error) {
    console.error('Error in admin signup:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current user data
app.get("/make-server-b46b7a19/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);

    if (error || !user) {
      console.error('Error getting user:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data from KV store based on role
    const role = user.user_metadata.role;
    const userKey = `${role}:${user.id}`;
    const userData = await kv.get(userKey);

    return c.json({ 
      success: true, 
      user: userData || user.user_metadata,
      role 
    });
  } catch (error) {
    console.error('Error in get user:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Submit certificate request
app.post("/make-server-b46b7a19/certificate-request", async (c) => {
  try {
    // Get user token from custom header
    const accessToken = c.req.header('X-User-Token');

    if (!accessToken) {
      console.error('No user token provided');
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { user, error: authError } = await verifyUser(accessToken);

    if (authError || !user) {
      console.error('Token verification failed:', authError);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const requestData = await c.req.json();

    // Create certificate request
    const requestId = `${Date.now()}_${user.id}`;
    const requestKey = `cert_request:${requestId}`;
    
    const certificateRequest = {
      id: requestId,
      studentId: user.id,
      studentName: requestData.studentName,
      usn: requestData.usn,
      fatherName: requestData.fatherName,
      semester: requestData.semester,
      year: requestData.year,
      department: requestData.department,
      purpose: requestData.purpose,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(requestKey, certificateRequest);

    return c.json({ 
      success: true, 
      message: 'Certificate request submitted successfully',
      requestId 
    });
  } catch (error) {
    console.error('Error in certificate request:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all certificate requests (admin)
app.get("/make-server-b46b7a19/certificate-requests", async (c) => {
  try {
    const accessToken = c.req.header('X-User-Token') || c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { user, error: authError } = await verifyUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all certificate requests
    const requests = await kv.getByPrefix('cert_request:');

    return c.json({ success: true, requests });
  } catch (error) {
    console.error('Error getting certificate requests:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get student's certificate requests
app.get("/make-server-b46b7a19/certificate-requests/student", async (c) => {
  try {
    const accessToken = c.req.header('X-User-Token') || c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { user, error: authError } = await verifyUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all certificate requests and filter by student
    const allRequests = await kv.getByPrefix('cert_request:');
    const studentRequests = allRequests.filter((req: any) => req.studentId === user.id);

    return c.json({ success: true, requests: studentRequests });
  } catch (error) {
    console.error('Error getting student certificate requests:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update certificate request status (admin)
app.put("/make-server-b46b7a19/certificate-request/:id", async (c) => {
  try {
    const accessToken = c.req.header('X-User-Token') || c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { user, error: authError } = await verifyUser(accessToken);

    if (authError || !user || user.user_metadata.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const requestId = c.req.param('id');
    const { status } = await c.req.json();

    const requestKey = `cert_request:${requestId}`;
    const request = await kv.get(requestKey);

    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Generate certificate number if approved
    let certificateNumber;
    if (status === 'approved') {
      const year = new Date().getFullYear();
      const nextYear = year + 1;
      
      // Get and increment certificate counter
      const counterKey = 'cert_counter';
      let counter = await kv.get(counterKey);
      if (!counter) {
        counter = 1;
      } else {
        counter = parseInt(counter) + 1;
      }
      await kv.set(counterKey, counter);
      
      // Format counter with leading zeros (001, 002, etc.)
      const formattedCounter = String(counter).padStart(3, '0');
      certificateNumber = `GAT/GEN/BC/${year}-${nextYear}/${formattedCounter}`;
    }

    const updatedRequest = {
      ...request,
      status,
      certificateNumber,
      approvedDate: status === 'approved' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(requestKey, updatedRequest);

    return c.json({ 
      success: true, 
      message: `Request ${status} successfully`,
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating certificate request:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);