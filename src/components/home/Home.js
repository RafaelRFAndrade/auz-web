import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import { agendamentoService } from '../../services/Agendamento';
import './Home.css';
import logo from '../../logo.png'; 

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [appointments, setAppointments] = useState(0);
  const [scheduledWeek, setScheduledWeek] = useState(0);
  const [qtdUsuarios, setQtdUsuarios] = useState(0);
  const [qtdOperadores, setQtdOperadores] = useState(0);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [scheduledList, setScheduledList] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [currentScheduledPage, setCurrentScheduledPage] = useState(1);
  const [totalAppointmentPages, setTotalAppointmentPages] = useState(1);
  const [totalScheduledPages, setTotalScheduledPages] = useState(1);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [appointmentAnimation, setAppointmentAnimation] = useState('');
  const [scheduledAnimation, setScheduledAnimation] = useState('');
  const [isTransitioningAppointments, setIsTransitioningAppointments] = useState(false);
  const [isTransitioningScheduled, setIsTransitioningScheduled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Buscar dados do usuário (nome)
        const userHomeData = await usuarioService.getHome();
        setUserData({ name: userHomeData.nomeUsuario });
        setQtdUsuarios(userHomeData.qtdUsuarios || 0);
        setQtdOperadores(userHomeData.qtdOperadores || 0);

        // Carregar dados iniciais
        await loadAppointments(1);
        await loadScheduled(1);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Função para carregar atendimentos
  const loadAppointments = async (page) => {
    try {
      setIsLoadingAppointments(true);
      const atendimentosData = await atendimentoService.getAtendimentos(page, 4, '');
      setAppointments(atendimentosData.itens || 0);
      setAppointmentsList(atendimentosData.atendimentos || []);
      setTotalAppointmentPages(atendimentosData.totalPaginas || 1);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Função para carregar agendamentos
  const loadScheduled = async (page) => {
    try {
      setIsLoadingScheduled(true);
      const agendamentosData = await agendamentoService.getHome(page, 4);
      setScheduledWeek(agendamentosData.itens || 0);
      setScheduledList(agendamentosData.agendamentos || []);
      setTotalScheduledPages(agendamentosData.totalPaginas || 1);
    } catch (error) {
      console.error('Error loading scheduled:', error);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

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

  // Funções de navegação para atendimentos
  const nextAppointment = async () => {
    if (currentAppointmentPage < totalAppointmentPages && !isLoadingAppointments && !isTransitioningAppointments) {
      setIsTransitioningAppointments(true);
      setAppointmentAnimation('fade-out');
      
      setTimeout(async () => {
        const nextPage = currentAppointmentPage + 1;
        setCurrentAppointmentPage(nextPage);
        await loadAppointments(nextPage);
        
        setTimeout(() => {
          setAppointmentAnimation('fade-in');
          setTimeout(() => {
            setAppointmentAnimation('');
            setIsTransitioningAppointments(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  const prevAppointment = async () => {
    if (currentAppointmentPage > 1 && !isLoadingAppointments && !isTransitioningAppointments) {
      setIsTransitioningAppointments(true);
      setAppointmentAnimation('fade-out');
      
      setTimeout(async () => {
        const prevPage = currentAppointmentPage - 1;
        setCurrentAppointmentPage(prevPage);
        await loadAppointments(prevPage);
        
        setTimeout(() => {
          setAppointmentAnimation('fade-in');
          setTimeout(() => {
            setAppointmentAnimation('');
            setIsTransitioningAppointments(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  // Funções de navegação para agendamentos
  const nextScheduled = async () => {
    if (currentScheduledPage < totalScheduledPages && !isLoadingScheduled && !isTransitioningScheduled) {
      setIsTransitioningScheduled(true);
      setScheduledAnimation('fade-out');
      
      setTimeout(async () => {
        const nextPage = currentScheduledPage + 1;
        setCurrentScheduledPage(nextPage);
        await loadScheduled(nextPage);
        
        setTimeout(() => {
          setScheduledAnimation('fade-in');
          setTimeout(() => {
            setScheduledAnimation('');
            setIsTransitioningScheduled(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  const prevScheduled = async () => {
    if (currentScheduledPage > 1 && !isLoadingScheduled && !isTransitioningScheduled) {
      setIsTransitioningScheduled(true);
      setScheduledAnimation('fade-out');
      
      setTimeout(async () => {
        const prevPage = currentScheduledPage - 1;
        setCurrentScheduledPage(prevPage);
        await loadScheduled(prevPage);
        
        setTimeout(() => {
          setScheduledAnimation('fade-in');
          setTimeout(() => {
            setScheduledAnimation('');
            setIsTransitioningScheduled(false);
          }, 200);
        }, 50);
      }, 150);
    }
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-title">Usuários</div>
              <div className="metric-value">{qtdUsuarios}</div>
            </div>
          </div>

          <div className="metric-card warning-card">
            <div className="metric-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-title">Operadores</div>
              <div className="metric-value">{qtdOperadores}</div>
            </div>
          </div>
        </div>
        
        {/* Atendimentos Section */}
        <div className="activities-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Atendimentos em Andamento
            </h2>
            <div className="section-controls">
              <span className="section-count">{appointments} atendimentos</span>
              {totalAppointmentPages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevAppointment}
                    disabled={currentAppointmentPage === 1 || isLoadingAppointments || isTransitioningAppointments}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <span className="nav-indicator">
                    {currentAppointmentPage} / {totalAppointmentPages}
                  </span>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextAppointment}
                    disabled={currentAppointmentPage === totalAppointmentPages || isLoadingAppointments || isTransitioningAppointments}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="horizontal-carousel">
            {isLoadingAppointments ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Carregando atendimentos...</span>
              </div>
            ) : appointmentsList.length > 0 ? (
              <div className={`cards-container ${appointmentAnimation}`}>
                {appointmentsList.map((atendimento, index) => (
                  <div key={index} className="activity-card modern-card">
                    <div className="card-header">
                      <div className="card-title">{atendimento.descricao}</div>
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
              </div>
            ) : (
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

        {/* Agendamentos Section */}
        <div className="activities-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Agendamentos da Semana
            </h2>
            <div className="section-controls">
              <span className="section-count">{scheduledWeek} agendamentos</span>
              {totalScheduledPages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevScheduled}
                    disabled={currentScheduledPage === 1 || isLoadingScheduled || isTransitioningScheduled}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <span className="nav-indicator">
                    {currentScheduledPage} / {totalScheduledPages}
                  </span>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextScheduled}
                    disabled={currentScheduledPage === totalScheduledPages || isLoadingScheduled || isTransitioningScheduled}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="horizontal-carousel">
            {isLoadingScheduled ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Carregando agendamentos...</span>
              </div>
            ) : scheduledList.length > 0 ? (
              <div className={`cards-container ${scheduledAnimation}`}>
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
              </div>
            ) : (
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
  );
};

export default Home;