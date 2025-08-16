import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import SuccessPage from "./pages/SuccessPage";
import DownloadPage from "./pages/DownloadPage";

function App() {
  return (
    <Router>
      {/* Navbar */}
      <nav className="bg-gray-900 p-4 text-white flex gap-4">
        <Link to="/register" className="hover:text-indigo-400">Register</Link>
        <Link to="/login" className="hover:text-indigo-400">Login</Link>
        <Link to="/profile" className="hover:text-indigo-400">Profile</Link>
        <Link to="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/" className="hover:text-indigo-400">Upload</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<UploadPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/d/:uuid" element={<DownloadPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
