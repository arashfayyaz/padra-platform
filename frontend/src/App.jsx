import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SeoProvider } from './context/SeoContext.jsx';
import Navbar    from './components/Navbar.jsx';
import Footer    from './components/Footer.jsx';
import Home      from './pages/Home.jsx';
import Search    from './pages/Search.jsx';
import TripDetail  from './pages/TripDetail.jsx';
import Login     from './pages/Login.jsx';
import Register  from './pages/Register.jsx';
import MyBookings  from './pages/MyBookings.jsx';
import Profile   from './pages/Profile.jsx';
import Admin     from './pages/Admin.jsx';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-border text-primary"></div></div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/search"      element={<Search />} />
          <Route path="/trip/:id"    element={<TripDetail />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"       element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SeoProvider>
            <AppRoutes />
          </SeoProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
