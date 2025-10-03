import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import './Home.css';
import logo from '../../logo.png'; 

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [appointments, setAppointments] = useState(0);
  const [scheduledWeek, setScheduledWeek] = useState(0);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [scheduledList, setScheduledList] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const homeData = await usuarioService.getHome();
        setUserData({ name: homeData.nomeUsuario });
        setAppointments(homeData.atendimentos.length);
        setScheduledWeek(homeData.agendamentos.length);
        setAppointmentsList(homeData.atendimentos);
        setScheduledList(homeData.agendamentos);

      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/login');
  };

  const getFirstLetters = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    
    if (page === 'home') {
      navigate('/');
    } else if (page === 'doctors') {
      navigate('/doctors');
    } else if (page === 'patients') {
      navigate('/patients');
    } else if (page === 'requests') {
      navigate('/requests');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getSituacao = (situacao) => {
    return situacao === 0 ? 'Agendado' : 'Desconhecido';
  };

  return (
    <div className="home-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Olá, <span className="highlight">{userData.name}</span>
              </h1>
              <p className="welcome-subtitle">
                Aqui está um resumo das suas atividades de hoje
              </p>
            </div>
            <div className="header-actions">
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="stat-number">{appointments}</span>
                  <span className="stat-label">Atendimentos</span>
                </div>
                <div className="quick-stat">
                  <span className="stat-number">{scheduledWeek}</span>
                  <span className="stat-label">Agendamentos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card primary-card">
            <div className="metric-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-title">Atendimentos em Andamento</div>
              <div className="metric-value">{appointments}</div>
            </div>
          </div>
          
          <div className="metric-card secondary-card">
            <div className="metric-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-title">Agendamentos da Semana</div>
              <div className="metric-value">{scheduledWeek}</div>
            </div>
          </div>

          <div className="metric-card success-card">
            <div className="metric-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-title">Taxa de Sucesso</div>
              <div className="metric-value">94%</div>
            </div>
          </div>
        </div>
        
        {/* Activities Section */}
        <div className="activities-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Atividades Recentes
            </h2>

          </div>

          <div className="activities-grid">
            <div className="activity-column">
              <div className="column-header">
                <h3 className="column-title">
                  <div className="title-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  Atendimentos em Andamento
                </h3>
                <span className="column-count">{appointmentsList.length}</span>
              </div>
              <div className="activity-list">
                {appointmentsList.map((atendimento, index) => (
                  <div key={index} className="activity-card modern-card">
                    <div className="card-header">
                      <div className="card-title">{atendimento.nomeAtendimento}</div>
                      <div className="card-badge status-active">Em Andamento</div>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="info-label">Médico:</span>
                        <span className="info-value">{atendimento.nomeMedico}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="info-label">Paciente:</span>
                        <span className="info-value">{atendimento.nomePaciente}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <span className="card-date">{formatDate(atendimento.dtInclusao)}</span>
                    </div>
                  </div>
                ))}
                {appointmentsList.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <div className="empty-title">Nenhum atendimento em andamento</div>
                    <div className="empty-subtitle">Os novos atendimentos aparecerão aqui</div>
                  </div>
                )}
              </div>
            </div>

            <div className="activity-column">
              <div className="column-header">
                <h3 className="column-title">
                  <div className="title-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  Agendamentos da Semana
                </h3>
                <span className="column-count">{scheduledList.length}</span>
              </div>
              <div className="activity-list">
                {scheduledList.map((agendamento, index) => (
                  <div key={index} className="activity-card modern-card">
                    <div className="card-header">
                      <div className="card-title">{agendamento.nomeAgendamento}</div>
                      <div className="card-badge status-scheduled">{getSituacao(agendamento.situacao)}</div>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="info-label">Médico:</span>
                        <span className="info-value">{agendamento.nomeMedico}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="info-label">Paciente:</span>
                        <span className="info-value">{agendamento.nomePaciente}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <span className="card-date">{formatDate(agendamento.dtAgendamento)}</span>
                    </div>
                  </div>
                ))}
                {scheduledList.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="empty-title">Nenhum agendamento para esta semana</div>
                    <div className="empty-subtitle">Os agendamentos da semana aparecerão aqui</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;