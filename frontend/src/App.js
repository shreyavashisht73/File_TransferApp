import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import SuccessPage from "./pages/SuccessPage";
import DownloadPage from "./pages/DownloadPage";
import MyFiles from "./pages/MyFiles";
import RecentlyDeleted from "./pages/RecentlyDeleted";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

//navigation
const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <nav className="bg-gray-900 p-4 text-white flex gap-4 items-center justify-between">
      <div className="flex gap-4">
        {!isAuthenticated ? (
          <>
            <Link to="/register" className="hover:text-indigo-400">Register</Link>
            <Link to="/login" className="hover:text-indigo-400">Login</Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="hover:text-indigo-400">Profile</Link>
            <Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
            <Link to="/" className="hover:text-indigo-400">Upload</Link>
            <Link to="/my-files" className="hover:text-indigo-400">My Files</Link>
          </>
        )}
      </div>
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Welcome, {user?.name}</span>
          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        
        {/* Routes */}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          <Route path="/my-files" element={
            <ProtectedRoute>
              <MyFiles />
            </ProtectedRoute>
          } />
          <Route path="/recently-deleted" element={
  <ProtectedRoute>
    <RecentlyDeleted />
  </ProtectedRoute>
} />

          <Route path="/success" element={<SuccessPage />} />
          <Route path="/d/:uuid" element={<DownloadPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
