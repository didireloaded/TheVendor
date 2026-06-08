import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { Layout } from './components/layout/Layout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Messages from './pages/Messages';
import Content from './pages/Content';
import Business from './pages/Business';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Opportunities from './pages/Opportunities';
import Analytics from './pages/Analytics';
import Reviews from './pages/Reviews';
import Bookings from './pages/Bookings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="messages" element={<Messages />} />
          <Route path="content" element={<Content />} />
          <Route path="business" element={<Business />} />
          <Route path="profile" element={<Profile />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
