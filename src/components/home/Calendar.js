import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import agendamentoService from '../../services/Agendamento';
import './Calendar.css';
import Alert from '../custom/Alert';
import NewAppointmentModal from './NewAppointmentModal';

const Calendar = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [agendamentos, setAgendamentos] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setShowModal(true);
  };

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        const homeData = await usuarioService.getHome();
        setUserData({ name: homeData.nomeUsuario });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };
    fetchUserData();
    fetchAgendamentos();
  }, [navigate]);

  const fetchAgendamentos = async () => {
    try {
      setIsLoading(true);
      const response = await agendamentoService.getAllAgendamentos();
      setAgendamentos(response || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      showAlert('error', 'Erro', 'Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções do calendário
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const getAgendamentosForDate = (day) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return agendamentos.filter(agendamento => {
      // Converter para horário de Brasília (UTC-3)
      const agendamentoDate = new Date(agendamento.dtAgendamento);
      const brasiliaDate = new Date(agendamentoDate.getTime() - (3 * 60 * 60 * 1000));
      
      // Comparar apenas ano, mês e dia no horário de Brasília
      return brasiliaDate.getFullYear() === dateToCheck.getFullYear() &&
             brasiliaDate.getMonth() === dateToCheck.getMonth() &&
             brasiliaDate.getDate() === dateToCheck.getDate();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
  
    // Dias vazios do início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
  
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAgendamentos = getAgendamentosForDate(day);
      const today = new Date();
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = today.getFullYear() === dayDate.getFullYear() &&
                      today.getMonth() === dayDate.getMonth() &&
                      today.getDate() === dayDate.getDate();
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${dayAgendamentos.length > 0 ? 'has-events' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          {dayAgendamentos.length > 0 && (
            <div className="events-indicator">
              <span className="events-count">{dayAgendamentos.length}</span>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const renderSelectedDateEvents = () => {
    if (!selectedDate) return null;

    const dayAgendamentos = getAgendamentosForDate(selectedDate);
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);

    return (
      <div className="selected-date-events">
        <h3>Agendamentos para {selectedDateObj.toLocaleDateString('pt-BR')}</h3>
        {dayAgendamentos.length > 0 ? (
          <div className="events-list">
            {dayAgendamentos.map(agendamento => (
              <div key={agendamento.codigoAgendamento} className="event-item">
                <div className="event-time">{formatTime(agendamento.dtAgendamento)}</div>
                <div className="event-description">{agendamento.descricao}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">Nenhum agendamento para este dia</p>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Agenda</span> 📅
              </h1>
              <p className="welcome-subtitle">
                Gerencie seus agendamentos e compromissos
              </p>
            </div>
            <div className="header-actions">
              <div className="calendar-navigation">
                <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <h2 className="current-month">{formatDate(currentDate)}</h2>
                <button className="nav-btn" onClick={() => navigateMonth(1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Calendário
            </div>
            <div className="section-count">
              {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando agenda...</div>
            </div>
          ) : (
            <div className="calendar-grid">
              <div className="calendar-header">
                <div className="weekday-header">Dom</div>
                <div className="weekday-header">Seg</div>
                <div className="weekday-header">Ter</div>
                <div className="weekday-header">Qua</div>
                <div className="weekday-header">Qui</div>
                <div className="weekday-header">Sex</div>
                <div className="weekday-header">Sáb</div>
              </div>
              <div className="calendar-body">
                {renderCalendarDays()}
              </div>
            </div>
          )}
        </div>

        {/* Events Section */}
        {selectedDate && (
          <div className="events-section">
            <div className="section-header">
              <div className="section-title">
                <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                Agendamentos do Dia
              </div>
            </div>
            {renderSelectedDateEvents()}
          </div>
        )}
      </div>

      <Alert 
        show={alert.show} 
        type={alert.type} 
        title={alert.title} 
        message={alert.message} 
        onClose={closeAlert} 
        duration={7000} 
      />
      {showModal && (
        <NewAppointmentModal 
          date={selectedDate ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate) : null}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAgendamentos(); }}
        />
      )}
    </div>
  );
};

export default Calendar;