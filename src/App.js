import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Home from './components/home/Home';
import Doctors from './components/home/Doctors';
import Patients from './components/home/Patients';
import Appointments from './components/home/Appointments'; // Novo componente
import Sidebar from './components/Sidebar'; // Novo componente
import { usuarioService } from './services/Usuario';

function App() {
  const ProtectedRoute = ({ children }) => {
    if (!usuarioService.isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (usuarioService.isAuthenticated()) {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  // Layout para páginas autenticadas (com sidebar)
  const AuthenticatedLayout = ({ children }) => {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Rotas públicas - sem sidebar */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Rotas protegidas - com sidebar */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Doctors />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Patients />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Appointments />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        {/* Rota catch-all */}
        <Route 
          path="*" 
          element={
            usuarioService.isAuthenticated() 
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;