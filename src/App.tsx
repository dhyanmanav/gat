import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { StudentLogin } from './components/StudentLogin';
import { StudentSignup } from './components/StudentSignup';
import { AdminLogin } from './components/AdminLogin';
import { AdminSignup } from './components/AdminSignup';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PWAHead } from './components/PWAHead';
import { InstallPrompt } from './components/InstallPrompt';
import { api } from './utils/api';

type Screen = 
  | 'landing' 
  | 'student-login' 
  | 'student-signup' 
  | 'admin-login' 
  | 'admin-signup'
  | 'student-dashboard'
  | 'admin-dashboard';

interface AuthState {
  token: string | null;
  user: any | null;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  const backgroundImage = "https://images.unsplash.com/photo-1693011142814-aa33d7d1535c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYxNTgxNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  useEffect(() => {
    // Register service worker for PWA (silently - app works without it)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker registered');
        })
        .catch(() => {
          // Service worker not available in this environment - app continues to work normally
        });
    }

    // Check for existing session
    const savedToken = localStorage.getItem('auth_token');
    const savedUserType = localStorage.getItem('user_type');
    
    if (savedToken) {
      verifySession(savedToken, savedUserType as 'student' | 'admin');
    } else {
      setLoading(false);
    }
  }, []);

  const verifySession = async (token: string, userType: 'student' | 'admin') => {
    try {
      const result = await api.verifySession(token);
      if (result.success) {
        setAuth({ token, user: result.user });
        setScreen(userType === 'student' ? 'student-dashboard' : 'admin-dashboard');
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_type');
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, user: any) => {
    setAuth({ token, user });
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_type', user.userType);
    setScreen(user.userType === 'student' ? 'student-dashboard' : 'admin-dashboard');
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    setScreen('landing');
  };

  const handleSignupSuccess = () => {
    alert('Account created successfully! Please login with your credentials.');
    setScreen(screen === 'student-signup' ? 'student-login' : 'admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PWAHead />
      <InstallPrompt />
      {screen === 'landing' && (
        <LandingPage
          onSelectStudent={() => setScreen('student-login')}
          onSelectAdmin={() => setScreen('admin-login')}
          backgroundImage={backgroundImage}
        />
      )}

      {screen === 'student-login' && (
        <StudentLogin
          onBack={() => setScreen('landing')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setScreen('student-signup')}
          backgroundImage={backgroundImage}
        />
      )}

      {screen === 'student-signup' && (
        <StudentSignup
          onBack={() => setScreen('landing')}
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setScreen('student-login')}
          backgroundImage={backgroundImage}
        />
      )}

      {screen === 'admin-login' && (
        <AdminLogin
          onBack={() => setScreen('landing')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setScreen('admin-signup')}
          backgroundImage={backgroundImage}
        />
      )}

      {screen === 'admin-signup' && (
        <AdminSignup
          onBack={() => setScreen('landing')}
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setScreen('admin-login')}
          backgroundImage={backgroundImage}
        />
      )}

      {screen === 'student-dashboard' && auth.token && auth.user && (
        <StudentDashboard
          user={auth.user}
          token={auth.token}
          onLogout={handleLogout}
        />
      )}

      {screen === 'admin-dashboard' && auth.token && auth.user && (
        <AdminDashboard
          user={auth.user}
          token={auth.token}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
