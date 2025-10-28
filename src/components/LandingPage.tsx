import { GraduationCap, Users } from 'lucide-react';

interface LandingPageProps {
  onSelectStudent: () => void;
  onSelectAdmin: () => void;
  backgroundImage: string;
}

export function LandingPage({ onSelectStudent, onSelectAdmin, backgroundImage }: LandingPageProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("sddefault.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-white mb-4">Global Academy of Technology</h1>
          <p className="text-white/90 text-xl">Certificate Management Portal</p>
          <p className="text-white/80 mt-2">Fast, Secure, and Trackable Certificate Delivery. 
          by: Meghana HJ,Dhyan Kumar M,Vathsalya V, Sammita Abhay</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Card */}
          <button
            onClick={onSelectStudent}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <GraduationCap size={40} className="text-blue-600" />
              </div>
              <h2 className="text-blue-600 mb-4">Student Portal</h2>
              <p className="text-gray-600 mb-6">
                Request and download your certificates with ease
              </p>
              <div className="w-full space-y-2 text-left text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Request bonafide & other certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Track request status in real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Download approved certificates</span>
                </div>
              </div>
              <div className="mt-8 w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-center">
                Continue as Student
              </div>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={onSelectAdmin}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Users size={40} className="text-purple-600" />
              </div>
              <h2 className="text-purple-600 mb-4">Admin Portal</h2>
              <p className="text-gray-600 mb-6">
                Manage and approve certificate requests
              </p>
              <div className="w-full space-y-2 text-left text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>View all student requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>Approve or reject requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span>Upload signed certificates</span>
                </div>
              </div>
              <div className="mt-8 w-full px-6 py-3 bg-purple-600 text-white rounded-lg text-center">
                Continue as Admin
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-white/70 text-sm">
            Secure • Private • Auditable • Fast
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-white/90 text-xs">
              <strong>Note:</strong> OTP verification requires Twilio credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
