// src/pages/Atendimentos.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import './Appointments.css';
import Alert from '../../components/custom/Alert';
import AppointmentForm from './AppointmentForm';

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
            className={`btn-pagination ${paginaAtual === i ? 'active' : ''}`}
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
          className={`btn-pagination ${paginaAtual === 1 ? 'active' : ''}`}
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
              className={`btn-pagination ${paginaAtual === i ? 'active' : ''}`}
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
            className={`btn-pagination ${paginaAtual === totalPaginas ? 'active' : ''}`}
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
    <div className="appointments-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Atendimentos</span> 📋
              </h1>
              <p className="welcome-subtitle">
                Gerencie os atendimentos da clínica
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleOpenAppointmentForm}>
                <span className="btn-icon">📋➕</span>
                Cadastrar Atendimento
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
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

        {/* Appointments Section */}
        <div className="appointments-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Lista de Atendimentos
            </div>
            <div className="section-count">
              {atendimentos.length} atendimento{atendimentos.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando...</div>
            </div>
          ) : (
            <div className="appointments-grid">
              {atendimentos.length > 0 ? (
                atendimentos.map(item => (
                  <div key={item.codigoAtendimento} className="appointment-card">
                    <div className="card-header">
                      <div className="appointment-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                      <div className="appointment-info">
                        <h3 className="appointment-title">{item.descricao || 'N/A'}</h3>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-view" 
                          onClick={() => navigate(`/appointment-details/${item.codigoAtendimento}`)}
                          title="Ver detalhes do atendimento"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-schedule" 
                          onClick={() => navigate(`/scheduling/${item.codigoAtendimento}`)}
                          title="Agendar para este atendimento"
                        >
                          📅
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteAtendimento(item.codigoAtendimento, item.descricao)}
                          title="Excluir atendimento"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="info-label">Paciente:</span>
                        <span className="info-value">{item.nomePaciente || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                          <path d="M8 3v4"></path>
                          <path d="M16 3v4"></path>
                          <path d="M12 11v6"></path>
                          <path d="M9 14h6"></path>
                        </svg>
                        <span className="info-label">Médico:</span>
                        <span className="info-value">{item.nomeMedico || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="info-label">Data Inclusão:</span>
                        <span className="info-value">{formatDate(item.dtInclusao)}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="info-label">Data Situação:</span>
                        <span className="info-value">{formatDate(item.dtSituacao)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                  </div>
                  <h3 className="empty-title">Nenhum atendimento encontrado</h3>
                  <p className="empty-description">
                    {isLoading ? 'Carregando atendimentos...' : 'Cadastre o primeiro atendimento da clínica'}
                  </p>
                  {!isLoading && (
                    <button className="btn-primary" onClick={handleOpenAppointmentForm}>
                      <span className="btn-icon">📋➕</span>
                      Cadastrar Primeiro Atendimento
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
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
                  className="btn-pagination btn-pagination-first"
                  title="Primeira página"
                >
                  ⏮️
                </button>
                
                <button
                  onClick={() => handlePageChange(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="btn-pagination btn-pagination-nav"
                  title="Página anterior"
                >
                  ⏪
                </button>
                
                {renderPaginationButtons()}
                
                <button
                  onClick={() => handlePageChange(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="btn-pagination btn-pagination-nav"
                  title="Próxima página"
                >
                  ⏩
                </button>
                
                <button
                  onClick={() => handlePageChange(totalPaginas)}
                  disabled={paginaAtual === totalPaginas}
                  className="btn-pagination btn-pagination-last"
                  title="Última página"
                >
                  ⏭️
                </button>
              </div>
            </div>
          )}
        </div>
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