// src/pages/Atendimentos.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import './Appointments.css';
import Alert from '../../components/custom/Alert';
import AppointmentForm from './AppointmentForm';

const Atendimentos = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [atendimentos, setAtendimentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pagina: 1,
    itensPorPagina: 25,
    totalItens: 0,
    totalPaginas: 0
  });
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const navigate = useNavigate();

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  // Debounce para busca
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const fetchAtendimentos = useCallback(async (filtro = '', pagina = 1) => {
    try {
      setIsLoading(true);
      
      const response = await atendimentoService.getAtendimentos(pagina, pagination.itensPorPagina, filtro);
      
      console.log('📋 Response atendimentos:', response);
      
      if (response && response.atendimentos && Array.isArray(response.atendimentos)) {
        setAtendimentos(response.atendimentos);
        
        // Atualizar informações de paginação
        const totalItens = response.itens || 0;
        const totalPaginas = response.totalPaginas || Math.ceil(totalItens / pagination.itensPorPagina);
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      } 
      else if (Array.isArray(response)) {
        setAtendimentos(response);
        
        // Se não há informações de paginação na resposta, usar valores padrão
        const totalItens = response.length === 25 ? 26 : response.length; // Assumir que há mais se temos 25
        const totalPaginas = Math.ceil(totalItens / pagination.itensPorPagina);
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      }
      else {
        console.error('Formato de resposta inesperado:', response);
        setAtendimentos([]);
        setPagination(prev => ({
          ...prev,
          pagina: 1,
          totalItens: 0,
          totalPaginas: 0
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      if (error.response?.status === 401) {
        usuarioService.logout();
        navigate('/login');
      }
      showAlert('error', 'Erro', 'Erro ao carregar atendimentos: ' + (error.response?.data?.message || error.message));
      setAtendimentos([]);
      setPagination(prev => ({
        ...prev,
        pagina: 1,
        totalItens: 0,
        totalPaginas: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, [navigate, pagination.itensPorPagina]);

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
    fetchAtendimentos('', 1); // Carrega primeira página de atendimentos
  }, [navigate, fetchAtendimentos]);

  // Função de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchAtendimentos(searchValue, 1); // Reset para primeira página ao buscar
    }, 500),
    [fetchAtendimentos]
  );

  // Busca quando o termo de pesquisa muda (apenas se não for a primeira carga)
  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Funções de paginação
  const handlePageChange = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= pagination.totalPaginas) {
      fetchAtendimentos(searchTerm, novaPagina);
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(pagination.pagina - 1);
  const handleNextPage = () => handlePageChange(pagination.pagina + 1);
  const handleLastPage = () => handlePageChange(pagination.totalPaginas);


  const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return '---';
    }
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
    fetchAtendimentos(searchTerm, pagination.pagina); // Recarregar a lista de atendimentos na página atual
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
      await fetchAtendimentos(searchTerm, pagination.pagina);
      
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

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Buscar atendimentos por descrição, paciente ou médico..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              {isLoading && (
                <div className="search-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {pagination.totalItens > 0 && (
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
                <div className="stat-number">{pagination.totalItens}</div>
                <div className="stat-label">Atendimento{pagination.totalItens !== 1 ? 's' : ''}</div>
              </div>
            </div>
            {pagination.totalPaginas > 1 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{pagination.totalPaginas}</div>
                  <div className="stat-label">Página{pagination.totalPaginas !== 1 ? 's' : ''}</div>
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

          {/* Controles de Paginação */}
          {!isLoading && atendimentos.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span className="pagination-text">
                  Página {pagination.pagina} de {pagination.totalPaginas} 
                  ({pagination.totalItens} atendimento{pagination.totalItens !== 1 ? 's' : ''} total)
                </span>
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  onClick={handleFirstPage}
                  disabled={pagination.pagina === 1}
                  title="Primeira página"
                >
                  ⏮️
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={pagination.pagina === 1}
                  title="Página anterior"
                >
                  ⏪
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPaginas) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPaginas <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.pagina <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.pagina >= pagination.totalPaginas - 2) {
                      pageNum = pagination.totalPaginas - 4 + i;
                    } else {
                      pageNum = pagination.pagina - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${pagination.pagina === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={pagination.pagina === pagination.totalPaginas}
                  title="Próxima página"
                >
                  ⏩
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handleLastPage}
                  disabled={pagination.pagina === pagination.totalPaginas}
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