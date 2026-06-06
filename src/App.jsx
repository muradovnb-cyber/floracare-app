import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ClientApp from './pages/ClientApp';
import StaffApp from './pages/StaffApp';
import AdminApp from './pages/AdminApp';
import { api } from './utils/api';

export default function App() {
  const [appState, setAppState] = useState('loading'); // 'loading' | 'landing' | 'client' | 'staff'
  const [currentUser, setCurrentUser] = useState(null);

  // Check user session on load
  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem('floracare_token');
      if (!token) {
        setAppState('landing');
        return;
      }
      try {
        const user = await api.getMe();
        setCurrentUser(user);
        if (user.role === 'admin') {
          setAppState('admin');
        } else if (user.role === 'gardener') {
          setAppState('staff');
        } else {
          setAppState('client');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        api.logout();
        setAppState('landing');
      }
    }
    checkSession();
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    // БАГ #5 FIX: отдельный роутинг для каждой роли
    if (user.role === 'admin') {
      setAppState('admin');
    } else if (user.role === 'gardener') {
      setAppState('staff');
    } else {
      setAppState('client');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAppState('landing');
  };

  if (appState === 'loading') {
    return (
      <div style={{
        background: '#080C08',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E8E0D0',
        fontFamily: 'system-ui'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '300',
          marginBottom: '20px'
        }}>
          Flora<span style={{ color: '#4D9149', fontStyle: 'italic' }}>Care</span>
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid rgba(77,145,73,.2)',
          borderTopColor: '#4D9149',
          animation: 'spin .8s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {appState === 'landing' && (
        <LandingPage onLoginSuccess={handleLoginSuccess} />
      )}
      {appState === 'client' && (
        <ClientApp user={currentUser} onLogout={handleLogout} />
      )}
      {appState === 'staff' && (
        <StaffApp initialUser={currentUser} onLogout={handleLogout} />
      )}
      {appState === 'admin' && (
        <AdminApp user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}
