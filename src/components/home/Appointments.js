// src/pages/Atendimentos.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import './Appointments.css';
import Alert from '../../components/custom/Alert';
import AppointmentForm from './AppointmentForm';
import logo from '../../logo.png';

const Atendimentos = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [atendimentos, setAtendimentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const navigate = useNavigate();

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
    fetchAtendimentos(1);
  }, [navigate]);

  const fetchAtendimentos = async (pagina) => {
    try {
      setIsLoading(true);
  
      let response = await atendimentoService.getAtendimentos(pagina, 25);
  
      setAtendimentos(response.atendimentos || []);
      setTotalPaginas(response.totalPaginas || 1);
      setTotalItens(response.itens || 0);
      setPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      showAlert('error', 'Erro', 'Erro ao carregar atendimentos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (novaPagina) => {
    if (novaPagina !== paginaAtual && novaPagina >= 1 && novaPagina <= totalPaginas) {
      fetchAtendimentos(novaPagina);
    }
  };

  const getFirstLetters = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
  };

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/login');
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return '---';
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5; // Reduzido de 7 para 5
    
    if (totalPaginas <= maxVisibleButtons) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`pagination-btn ${paginaAtual === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Sempre mostrar primeira página
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`pagination-btn ${paginaAtual === 1 ? 'active' : ''}`}
        >
          1
        </button>
      );

      if (paginaAtual > 3) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }

      // Páginas ao redor da atual (reduzido)
      const start = Math.max(2, paginaAtual - 1);
      const end = Math.min(totalPaginas - 1, paginaAtual + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPaginas) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`pagination-btn ${paginaAtual === i ? 'active' : ''}`}
            >
              {i}
            </button>
          );
        }
      }

      if (paginaAtual < totalPaginas - 2) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }

      // Sempre mostrar última página
      if (totalPaginas > 1) {
        buttons.push(
          <button
            key={totalPaginas}
            onClick={() => handlePageChange(totalPaginas)}
            className={`pagination-btn ${paginaAtual === totalPaginas ? 'active' : ''}`}
          >
            {totalPaginas}
          </button>
        );
      }
    }

    return buttons;
  };

  // Funções para controlar o formulário de cadastro
  const handleOpenAppointmentForm = () => {
    setShowAppointmentForm(true);
  };

  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
  };

  const handleAppointmentSuccess = (message) => {
    showAlert('success', 'Sucesso', message);
    fetchAtendimentos(paginaAtual); // Recarregar a lista de atendimentos na página atual
  };

  const handleDeleteAtendimento = async (codigoAtendimento, descricao) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o atendimento "${descricao}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setIsLoading(true);
      await atendimentoService.deleteAtendimento(codigoAtendimento);
      
      showAlert('success', 'Sucesso', 'Atendimento excluído com sucesso!');
      
      // Recarregar a lista na página atual
      await fetchAtendimentos(paginaAtual);
      
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir atendimento. Tente novamente.';
      showAlert('error', 'Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo-sidebar">
          <img src={logo} alt="AUZ" className="logo-img" />
        </div>

        <a href="#" className={`menu-item`} onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}>
          <span className="menu-item-text">Início</span>
        </a>

        <a href="#" className={`menu-item`} onClick={(e) => { e.preventDefault(); handleNavigation('patients'); }}>
          <span className="menu-item-text">Pacientes</span>
        </a>

        <a href="#" className={`menu-item active`} onClick={(e) => { e.preventDefault(); handleNavigation('atendimentos'); }}>
          <span className="menu-item-text">Atendimentos</span>
        </a>

        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">{getFirstLetters(userData.name)}</div>
            <div className="user-name">{userData.name}</div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Sair">Sair</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <div className="page-title-section">
            <div className="page-title">Atendimentos</div>
            <div className="header-actions">
              <button className="add-button" onClick={handleOpenAppointmentForm}>
                <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Cadastrar Atendimento
              </button>
            </div>
          </div>
          {totalItens > 0 && (
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{totalItens}</div>
                  <div className="stat-label">Atendimento{totalItens !== 1 ? 's' : ''}</div>
                </div>
              </div>
              {totalPaginas > 1 && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{totalPaginas}</div>
                    <div className="stat-label">Página{totalPaginas !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Carregando...</div>
          </div>
        ) : (
          <div className="patients-grid">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Data Inclusão</th>
                  <th>Data Situação</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {atendimentos.length > 0 ? (
                  atendimentos.map(item => (
                    <tr key={item.codigoAtendimento}>
                      <td className="description-cell">{item.descricao || 'N/A'}</td>
                      <td className="patient-name">{item.nomePaciente || 'N/A'}</td>
                      <td className="doctor-name">{item.nomeMedico || 'N/A'}</td>
                      <td>{formatDate(item.dtInclusao)}</td>
                      <td>{formatDate(item.dtSituacao)}</td>
                      <td className="actions-cell">
                        <button 
                          className="schedule-btn"
                          onClick={() => navigate(`/scheduling/${item.codigoAtendimento}`)}
                          title="Agendar para este atendimento"
                        >
                          <svg className="schedule-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                            <line x1="12" y1="14" x2="12" y2="18"></line>
                            <line x1="10" y1="16" x2="14" y2="16"></line>
                          </svg>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteAtendimento(item.codigoAtendimento, item.descricao)}
                          title="Excluir atendimento"
                        >
                          <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      {isLoading ? 'Carregando...' : `Nenhum atendimento encontrado. Total de itens: ${totalItens}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalItens > 25 && totalPaginas > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>Mostrando página {paginaAtual} de {totalPaginas}</span>
                  <span className="total-items">Total: {totalItens} atendimentos</span>
                </div>
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={paginaAtual === 1}
                    className="pagination-btn pagination-first"
                    title="Primeira página"
                  >
                    ⟪
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="pagination-btn pagination-nav"
                    title="Página anterior"
                  >
                    ‹
                  </button>
                  
                  {renderPaginationButtons()}
                  
                  <button
                    onClick={() => handlePageChange(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="pagination-btn pagination-nav"
                    title="Próxima página"
                  >
                    ›
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(totalPaginas)}
                    disabled={paginaAtual === totalPaginas}
                    className="pagination-btn pagination-last"
                    title="Última página"
                  >
                    ⟫
                  </button>
                </div>
              </div>
            )}
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

      {showAppointmentForm && (
        <AppointmentForm 
          onClose={handleCloseAppointmentForm}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  );
};

export default Atendimentos;