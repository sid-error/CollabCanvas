import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import AuthPage from './components/auth/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DrawingCanvas from './components/canvas/DrawingCanvas';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); 
  const [user, setUser] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: "Artist", email: "user@example.com" }); 
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && <LandingPage onGetStarted={() => setCurrentPage('auth')} onLogin={() => setCurrentPage('auth')} />}
      {currentPage === 'auth' && <AuthPage onBack={() => setCurrentPage('landing')} onSubmit={handleLogin} />}
      {user && currentPage === 'dashboard' && <DashboardPage user={user} onLogout={() => setUser(null)} onOpenCanvas={() => setCurrentPage('canvas')} />}
      {user && currentPage === 'canvas' && <DrawingCanvas onExit={() => setCurrentPage('dashboard')} />}
    </div>
  );
}