import { useState } from 'react';
import { Login } from './components/Login';
import { StudentSignup } from './components/StudentSignup';
import { AdminSignup } from './components/AdminSignup';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CertificateRequestForm } from './components/CertificateRequestForm';
import { Certificate } from './components/Certificate';

export interface Student {
  id: string;
  fullName: string;
  usn: string;
  fatherName: string;
  semester: string;
  year: string;
  department: string;
  email: string;
  phone: string;
  password: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  fatherName: string;
  semester: string;
  year: string;
  department: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  certificateNumber?: string;
  approvedDate?: string;
}

export type UserType = 'student' | 'admin' | null;

export default function App() {
  const [currentView, setCurrentView] = useState<
    'login' | 'studentSignup' | 'adminSignup' | 'studentDashboard' | 'adminDashboard' | 'certificateRequest' | 'certificate'
  >('login');
  const [userType, setUserType] = useState<UserType>(null);
  const [currentUser, setCurrentUser] = useState<Student | Admin | null>(null);
  const [currentCertificate, setCurrentCertificate] = useState<CertificateRequest | null>(null);

  const handleLogin = (type: 'student' | 'admin', user: Student | Admin) => {
    setUserType(type);
    setCurrentUser(user);
    setCurrentView(type === 'student' ? 'studentDashboard' : 'adminDashboard');
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleNavigate = (view: typeof currentView) => {
    setCurrentView(view);
  };

  const handleViewCertificate = (certificate: CertificateRequest) => {
    setCurrentCertificate(certificate);
    setCurrentView('certificate');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onNavigate={handleNavigate} />
      )}
      {currentView === 'studentSignup' && (
        <StudentSignup onNavigate={handleNavigate} />
      )}
      {currentView === 'adminSignup' && (
        <AdminSignup onNavigate={handleNavigate} />
      )}
      {currentView === 'studentDashboard' && currentUser && userType === 'student' && (
        <StudentDashboard
          student={currentUser as Student}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onViewCertificate={handleViewCertificate}
        />
      )}
      {currentView === 'certificateRequest' && currentUser && userType === 'student' && (
        <CertificateRequestForm
          student={currentUser as Student}
          onNavigate={handleNavigate}
          onBack={() => setCurrentView('studentDashboard')}
        />
      )}
      {currentView === 'adminDashboard' && currentUser && userType === 'admin' && (
        <AdminDashboard
          admin={currentUser as Admin}
          onLogout={handleLogout}
          onViewCertificate={handleViewCertificate}
        />
      )}
      {currentView === 'certificate' && currentCertificate && (
        <Certificate
          certificate={currentCertificate}
          onBack={() => setCurrentView(userType === 'admin' ? 'adminDashboard' : 'studentDashboard')}
        />
      )}
    </div>
  );
}