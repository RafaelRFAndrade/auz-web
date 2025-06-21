import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import './Home.css';
import logo from '../../logo.png'; 

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [appointments, setAppointments] = useState(0);
  const [scheduledToday, setScheduledToday] = useState(0);
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
        setScheduledToday(homeData.agendamentos.length);
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
      <div className="sidebar">
        <div className="logo-sidebar">
          <img src={logo} alt="AUZ" className="logo-img" />
        </div>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="menu-item-text">Início</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'doctors' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('doctors'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
            <path d="M8 3v4"></path>
            <path d="M16 3v4"></path>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
          <span className="menu-item-text">Médicos</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'patients' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('patients'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="menu-item-text">Pacientes</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'requests' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('requests'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="menu-item-text">Atendimentos</span>
        </a>
        
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {getFirstLetters(userData.name)}
            </div>
            <div className="user-name">{userData.name}</div>
          </div>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            title="Sair">
            Sair
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Bem-vindo, {userData.name}</h1>
          <p className="welcome-subtitle">Aqui está um resumo da sua atividade atual</p>
          
          <div className="metrics-container">
            <div className="metric-card primary">
              <div className="metric-title">Atendimentos em Andamento</div>
              <div className="metric-value">{appointments}</div>
            </div>
            
            <div className="metric-card secondary">
              <div className="metric-title">Agendamentos Hoje</div>
              <div className="metric-value">{scheduledToday}</div>
            </div>
          </div>
        </div>
        
        <div className="recent-activities-container">
          <h2 className="page-title">
            <svg className="page-title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Atividades Recentes
          </h2>

          <div className="activities-grids">
            <div className="activity-column">
              <h3>Atendimentos em andamento</h3>
              <div className="activity-list">
                {appointmentsList.map((atendimento, index) => (
                  <div key={index} className="activity-card">
                    <div className="activity-header">
                      <span className="activity-title">{atendimento.nomeAtendimento}</span>
                      <span className="activity-date">{formatDate(atendimento.dtInclusao)}</span>
                    </div>
                    <div className="activity-details">
                      <div><strong>Médico:</strong> {atendimento.nomeMedico}</div>
                      <div><strong>Paciente:</strong> {atendimento.nomePaciente}</div>
                    </div>
                  </div>
                ))}
                {appointmentsList.length === 0 && (
                  <div className="no-activities">Nenhum atendimento recente</div>
                )}
              </div>
            </div>

            <div className="activity-column">
              <h3>Agendamentos para hoje</h3>
              <div className="activity-list">
                {scheduledList.map((agendamento, index) => (
                  <div key={index} className="activity-card">
                    <div className="activity-header">
                      <span className="activity-title">{agendamento.nomeAgendamento}</span>
                      <span className="activity-status">{getSituacao(agendamento.situacao)}</span>
                    </div>
                    <div className="activity-details">
                      <div><strong>Médico:</strong> {agendamento.nomeMedico}</div>
                      <div><strong>Paciente:</strong> {agendamento.nomePaciente}</div>
                    </div>
                  </div>
                ))}
                {scheduledList.length === 0 && (
                  <div className="no-activities">Nenhum agendamento recente</div>
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