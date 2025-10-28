# GAT Certificate Portal

A comprehensive Progressive Web Application (PWA) for managing certificate requests at Global Academy of Technology.

## 🎯 Features

### For Students
- ✅ Secure login with @gat.ac.in email
- 📱 Mobile OTP verification during signup
- 📝 Request certificates (Bonafide, Internship, Transfer, etc.)
- 📊 Track request status in real-time
- ⬇️ Download approved certificates
- 🔒 Secure session management

### For Admission Department
- 👥 Manage all student requests
- ✅ Approve or reject requests
- 📄 Upload signed PDF certificates
- 🔍 Search and filter requests
- 📈 Dashboard with request statistics
- 📝 Add remarks and rejection reasons

### Technical Features
- 🚀 Progressive Web App (PWA) - installable on mobile and desktop
- 📱 Fully responsive design
- 🔐 OTP verification via Twilio
- 💾 Supabase backend (authentication, database, file storage)
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast and efficient

## 🛠️ Setup Instructions

### Prerequisites
1. Supabase project (already connected)
2. Twilio account for OTP functionality

### Twilio Setup
1. Create a Twilio account at https://www.twilio.com
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. Add these to the environment variables (already prompted in the app)

### Environment Variables
The following secrets have been set up:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ TWILIO_ACCOUNT_SID (Enter your Twilio Account SID)
- ✅ TWILIO_AUTH_TOKEN (Enter your Twilio Auth Token)
- ✅ TWILIO_PHONE_NUMBER (Enter your Twilio phone number, e.g., +1234567890)

## 📱 Installing as PWA

### On Mobile (Android/iOS)
1. Open the website in Chrome (Android) or Safari (iOS)
2. Tap the menu (⋮ or share icon)
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on your home screen like a native app

### On Desktop
1. Open the website in Chrome or Edge
2. Click the install icon in the address bar (⊕ or computer icon)
3. Click "Install"
4. The app will open in its own window

## 🔐 Authentication Flow

### Student Signup
1. Enter full name and USN
2. Enter @gat.ac.in email
3. Enter mobile number
4. Verify mobile with OTP
5. Set password
6. Account created - can now login

### Admin Signup
1. Enter full name
2. Enter @gat.ac.in email
3. Enter mobile number
4. Verify mobile with OTP
5. Set password
6. Account created - can now login

### Login
- Users must be verified (OTP confirmed) during signup
- Only @gat.ac.in emails are accepted
- Sessions persist across browser sessions

## 📋 Usage Guide

### For Students

#### Requesting a Certificate
1. Login to student dashboard
2. Click "New Certificate Request"
3. Select certificate type
4. Enter purpose and additional details
5. Submit request
6. Track status in "My Certificate Requests"

#### Downloading Certificate
1. Wait for admin approval
2. Once approved, "Download Certificate" button appears
3. Click to download the signed PDF

### For Admins

#### Approving a Request
1. Login to admin dashboard
2. View all pending requests
3. Click "View" on any request
4. Upload the signed PDF certificate
5. Add optional remarks
6. Click "Approve & Upload Certificate"
6. Student receives the certificate immediately

#### Rejecting a Request
1. Click "View" on any request
2. Scroll to "Reject Request" section
3. Enter rejection reason
4. Click "Reject Request"
5. Student receives notification with reason

## 🗄️ Database Structure

The application uses Supabase KV store with the following data:

### Users (`user:{email}`)
- email
- password (hashed)
- name
- mobile
- userType (student/admin)
- usn (for students)
- createdAt

### Sessions (`session:{token}`)
- email
- userType
- createdAt

### OTP (`otp:{mobile}`)
- otp
- expiresAt

### Requests (`request:{requestId}`)
- id
- studentEmail
- certificateType
- purpose
- additionalInfo
- status (pending/approved/rejected)
- certificateUrl (for approved)
- remarks (for approved)
- rejectionReason (for rejected)
- requestedAt
- updatedAt
- approvedAt/rejectedAt
- approvedBy/rejectedBy

## 📁 File Storage

Certificates are stored in Supabase Storage:
- Bucket: `make-133136f3-certificates`
- Files: `{requestId}_{timestamp}.pdf`
- Access: Private with signed URLs (valid for 1 year)

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session token-based authentication
- ✅ OTP verification for signup
- ✅ Email domain validation (@gat.ac.in only)
- ✅ Admin-only routes for approval actions
- ✅ Private file storage with signed URLs
- ✅ HTTPS enforced in production

## 🎨 Design

- Modern gradient backgrounds
- Card-based layouts
- Color-coded user types (Blue for students, Purple for admins)
- Status badges for requests (Yellow=Pending, Green=Approved, Red=Rejected)
- Responsive design for all screen sizes

## 🚀 Deployment

The application is deployed and ready to use. Access it via the provided URL.

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify Twilio credentials are correct
3. Ensure @gat.ac.in email is used
4. Contact system administrator

## 📝 Future Enhancements

Potential features to add:
- Push notifications for certificate approvals
- Email notifications
- Certificate templates
- QR code verification
- Analytics dashboard
- Bulk certificate upload
- Student profile management
- Request history export

## 🙏 Credits

Built with:
- React + TypeScript
- Tailwind CSS
- Supabase (Backend & Storage)
- Twilio (OTP)
- Lucide Icons

---

**Global Academy of Technology**  
*Making certificate management fast, secure, and efficient*
