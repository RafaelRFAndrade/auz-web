import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Login/Register'; 
import Home from './components/home/Home'; 
import { usuarioService } from './services/Usuario';

function App() {
  const ProtectedRoute = ({ children }) => {
    if (!usuarioService.isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;