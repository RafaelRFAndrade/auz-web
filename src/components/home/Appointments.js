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
    <div className="appointments-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">Atendimentos</h1>
            <p className="page-subtitle">Gerencie os atendimentos da clínica</p>
          </div>
          <button className="add-button" onClick={handleOpenAppointmentForm}>
            <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Atendimento
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por descrição, paciente ou médico..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          {isLoading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>


      {/* Appointments List */}
      <div className="appointments-section">
        <div className="section-header">
          <h2 className="section-title">Lista de Atendimentos</h2>
          <div className="appointments-count">
            {atendimentos.length} atendimento{atendimentos.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p className="loading-text">Carregando atendimentos...</p>
          </div>
        ) : (
          <div className="appointments-list">
            {atendimentos.length > 0 ? (
              atendimentos.map(item => (
                <div key={item.codigoAtendimento} className="appointment-item">
                  <div className="appointment-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                  </div>
                  
                  <div className="appointment-info">
                    <div className="appointment-main">
                      <h3 className="appointment-title" title={item.descricao}>
                        {item.descricao || 'N/A'}
                      </h3>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="detail-label">Paciente:</span>
                        <span className="detail-value" title={item.nomePaciente}>
                          {item.nomePaciente || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                          <path d="M8 3v4"></path>
                          <path d="M16 3v4"></path>
                          <path d="M12 11v6"></path>
                          <path d="M9 14h6"></path>
                        </svg>
                        <span className="detail-label">Médico:</span>
                        <span className="detail-value" title={item.nomeMedico}>
                          {item.nomeMedico || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="detail-label">Data Inclusão:</span>
                        <span className="detail-value">
                          {formatDate(item.dtInclusao)}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="detail-label">Data Situação:</span>
                        <span className="detail-value">
                          {formatDate(item.dtSituacao)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="appointment-actions">
                    <button 
                      className="btn-view" 
                      onClick={() => navigate(`/appointment-details/${item.codigoAtendimento}`)}
                      title="Ver detalhes"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      className="btn-schedule" 
                      onClick={() => navigate(`/scheduling/${item.codigoAtendimento}`)}
                      title="Agendar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteAtendimento(item.codigoAtendimento, item.descricao)}
                      title="Excluir"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <button className="add-button" onClick={handleOpenAppointmentForm}>
                    <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Cadastrar Primeiro Atendimento
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && atendimentos.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Página {pagination.pagina} de {pagination.totalPaginas}
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={handleFirstPage}
                disabled={pagination.pagina === 1}
                title="Primeira página"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="11,19 2,12 11,5"></polyline>
                  <polyline points="22,19 13,12 22,5"></polyline>
                </svg>
              </button>
              <button 
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={pagination.pagina === 1}
                title="Página anterior"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
              <button 
                className="pagination-btn"
                onClick={handleLastPage}
                disabled={pagination.pagina === pagination.totalPaginas}
                title="Última página"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13,19 22,12 13,5"></polyline>
                  <polyline points="2,19 11,12 2,5"></polyline>
                </svg>
              </button>
            </div>
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