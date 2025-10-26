import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loading from './components/custom/Loading';
import { usuarioService } from './services/Usuario';

// Lazy loading dos componentes
const Login = lazy(() => import('./components/Login/Login'));
const Register = lazy(() => import('./components/Login/Register'));
const Home = lazy(() => import('./components/home/Home'));
const Doctors = lazy(() => import('./components/home/Doctors'));
const Patients = lazy(() => import('./components/home/Patients'));
const Appointments = lazy(() => import('./components/home/Appointments'));
const AppointmentDetails = lazy(() => import('./components/home/AppointmentDetails'));
const MedicoDetails = lazy(() => import('./components/home/MedicoDetails'));
const PatientDetails = lazy(() => import('./components/home/PatientDetails'));
const Scheduling = lazy(() => import('./components/home/Scheduling'));
const Calendar = lazy(() => import('./components/home/Calendar'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const UsuariosParceiro = lazy(() => import('./components/parceiro/UsuariosParceiro'));
const ParceiroInfo = lazy(() => import('./components/parceiro/ParceiroInfo'));
const OperacionalMenu = lazy(() => import('./components/operacional/OperacionalMenu'));
const Operacional = lazy(() => import('./components/operacional/Operacional'));
const AgendamentoDetalhes = lazy(() => import('./components/agendamento/AgendamentoDetalhes'));

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
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleSidebarToggle = (event) => {
        setSidebarExpanded(event.detail.isExpanded);
      };

      const handleResize = () => {
        setIsMobile(window.innerWidth <= 480);
      };

      window.addEventListener('sidebarToggle', handleSidebarToggle);
      window.addEventListener('resize', handleResize);
      handleResize(); // Verificar tamanho inicial

      return () => {
        window.removeEventListener('sidebarToggle', handleSidebarToggle);
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // Calcular estilos dinamicamente baseado no tamanho da tela
    const getMainStyle = () => {
      if (isMobile) {
        return {
          marginLeft: '0px',
          width: '100vw',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1
        };
      }

      const isTablet = window.innerWidth <= 768;
      const collapsedWidth = isTablet ? '70px' : '80px';
      const expandedWidth = isTablet ? '220px' : '240px';

      return {
        marginLeft: sidebarExpanded ? expandedWidth : collapsedWidth,
        width: sidebarExpanded ? `calc(100vw - ${expandedWidth})` : `calc(100vw - ${collapsedWidth})`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      };
    };

    const mainStyle = getMainStyle();

    return (
      <div className="app-layout">
        <Suspense fallback={<Loading size="small" text="Carregando menu..." />}>
          <Sidebar />
        </Suspense>
        <main className="app-main" style={mainStyle}>
          <div className="app-content">
            {children}
          </div>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <Suspense fallback={<Loading overlay={true} text="Carregando aplicação..." />}>
        <Routes>
          {/* Rotas públicas - sem sidebar */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Suspense fallback={<Loading overlay={true} text="Carregando login..." />}>
                  <Login />
                </Suspense>
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Suspense fallback={<Loading overlay={true} text="Carregando cadastro..." />}>
                  <Register />
                </Suspense>
              </PublicRoute>
            } 
          />

          {/* Rotas protegidas - com sidebar */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando página inicial..." />}>
                    <Home />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando página inicial..." />}>
                    <Home />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando médicos..." />}>
                    <Doctors />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando pacientes..." />}>
                    <Patients />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando atendimentos..." />}>
                    <Appointments />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointment-details/:codigoAtendimento" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando detalhes do atendimento..." />}>
                    <AppointmentDetails />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medico-details/:codigoMedico" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando detalhes do médico..." />}>
                    <MedicoDetails />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-details/:codigoPaciente" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando detalhes do paciente..." />}>
                    <PatientDetails />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scheduling" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando agendamento..." />}>
                    <Scheduling />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scheduling/:codigoAtendimento" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando agendamento..." />}>
                    <Scheduling />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agenda" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando agenda..." />}>
                    <Calendar />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/parceiro/usuarios" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando usuários do parceiro..." />}>
                    <UsuariosParceiro />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/parceiro/info" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando informações do parceiro..." />}>
                    <ParceiroInfo />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operacional" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando menu operacional..." />}>
                    <OperacionalMenu />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operacional/:codigoMedico" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando operacional..." />}>
                    <Operacional />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agendamento/:codigoAgendamento" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<Loading text="Carregando detalhes do agendamento..." />}>
                    <AgendamentoDetalhes />
                  </Suspense>
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
      </Suspense>
    </Router>
  );
}

export default App;