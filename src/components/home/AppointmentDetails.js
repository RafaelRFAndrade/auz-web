import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atendimentoService } from '../../services/Atendimento';
import { documentoService } from '../../services/Documento';
import { usuarioService } from '../../services/Usuario';
import { agendamentoService } from '../../services/Agendamento';
import './AppointmentDetails.css';
import Alert from '../../components/custom/Alert';

const AppointmentDetails = () => {
  const { codigoAtendimento } = useParams();
  const navigate = useNavigate();
  const [atendimento, setAtendimento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  
  // Estados para documentos
  const [documentos, setDocumentos] = useState([]);
  const [documentosLoading, setDocumentosLoading] = useState(false);
  const [documentosError, setDocumentosError] = useState(null);
  const [documentosPaginaAtual, setDocumentosPaginaAtual] = useState(1);
  const [documentosTotalPaginas, setDocumentosTotalPaginas] = useState(0);
  const [documentosTotalItens, setDocumentosTotalItens] = useState(0);
  const itensPorPagina = 15;
  
  // Estados para agendamentos
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosLoading, setAgendamentosLoading] = useState(false);
  const [agendamentosError, setAgendamentosError] = useState(null);
  const [agendamentosPaginaAtual, setAgendamentosPaginaAtual] = useState(1);
  const [agendamentosTotalPaginas, setAgendamentosTotalPaginas] = useState(0);
  const [agendamentosTotalItens, setAgendamentosTotalItens] = useState(0);
  
  // Estados para carrossel de documentos
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  
  // Estados para carrossel de agendamentos
  const [currentAgendamentoSlide, setCurrentAgendamentoSlide] = useState(0);
  const [agendamentosItemsPerView, setAgendamentosItemsPerView] = useState(4);

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  const carregarDocumentos = async (codigoEntidade, pagina = 1) => {
    try {
      setDocumentosLoading(true);
      setDocumentosError(null);
      const response = await documentoService.buscarDocumentos(codigoEntidade, pagina, itensPorPagina);
      setDocumentos(response.documentos || []);
      setDocumentosTotalPaginas(response.totalPaginas || 0);
      setDocumentosTotalItens(response.itens || 0);
      setDocumentosPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setDocumentosError('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setDocumentosLoading(false);
    }
  };

  const carregarAgendamentos = async (codigoAtendimento, pagina = 1) => {
    try {
      setAgendamentosLoading(true);
      setAgendamentosError(null);
      const response = await agendamentoService.getDetalhadoAtendimento(codigoAtendimento, pagina, itensPorPagina);
      setAgendamentos(response.agendamentos || []);
      setAgendamentosTotalPaginas(response.totalPaginas || 0);
      setAgendamentosTotalItens(response.itens || 0);
      setAgendamentosPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentosError('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setAgendamentosLoading(false);
    }
  };

  const navegarPaginaDocumentos = (novaPagina) => {
    carregarDocumentos(codigoAtendimento, novaPagina);
  };

  const navegarPaginaAgendamentos = (novaPagina) => {
    carregarAgendamentos(codigoAtendimento, novaPagina);
  };

  // Funções do carrossel de documentos
  const nextSlide = () => {
    const maxSlide = Math.max(0, documentos.length - itemsPerView);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Funções do carrossel de agendamentos
  const nextAgendamentoSlide = () => {
    const maxSlide = Math.max(0, agendamentos.length - agendamentosItemsPerView);
    setCurrentAgendamentoSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevAgendamentoSlide = () => {
    setCurrentAgendamentoSlide(prev => Math.max(prev - 1, 0));
  };

  const goToAgendamentoSlide = (slideIndex) => {
    setCurrentAgendamentoSlide(slideIndex);
  };

  // Calcular itens visíveis baseado no tamanho da tela
  const updateItemsPerView = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setItemsPerView(1);
      setAgendamentosItemsPerView(1);
    } else if (width < 1200) {
      setItemsPerView(2);
      setAgendamentosItemsPerView(2);
    } else if (width < 1600) {
      setItemsPerView(3);
      setAgendamentosItemsPerView(3);
    } else {
      setItemsPerView(4);
      setAgendamentosItemsPerView(4);
    }
  };

  // Resetar slide quando documentos mudarem
  useEffect(() => {
    setCurrentSlide(0);
  }, [documentos]);

  // Resetar slide quando agendamentos mudarem
  useEffect(() => {
    setCurrentAgendamentoSlide(0);
  }, [agendamentos]);

  // Atualizar itens por view quando a tela redimensionar
  useEffect(() => {
    updateItemsPerView();
    const handleResize = () => updateItemsPerView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Resetar estados quando codigoAtendimento mudar
    setAtendimento(null);
    setDocumentos([]);
    setAgendamentos([]);
    setDocumentosPaginaAtual(1);
    setAgendamentosPaginaAtual(1);
    setCurrentSlide(0);
    setCurrentAgendamentoSlide(0);
    setDocumentosError(null);
    setAgendamentosError(null);
    
    const fetchAtendimentoDetails = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const response = await atendimentoService.getAtendimentoDetails(codigoAtendimento);
        setAtendimento(response);
        
        // Carregar documentos e agendamentos usando o codigoAtendimento da URL
        carregarDocumentos(codigoAtendimento);
        carregarAgendamentos(codigoAtendimento);
      } catch (error) {
        console.error('Erro ao buscar detalhes do atendimento:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        } else {
          showAlert('error', 'Erro', 'Erro ao carregar detalhes do atendimento: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtendimentoDetails();
  }, [codigoAtendimento, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '---';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '---';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatarTipoArquivo = (tipoConteudo) => {
    if (tipoConteudo?.startsWith('image/')) return '🖼️ Imagem';
    if (tipoConteudo?.startsWith('application/pdf')) return '📄 PDF';
    if (tipoConteudo?.startsWith('text/')) return '📝 Texto';
    if (tipoConteudo?.includes('word')) return '📄 Word';
    if (tipoConteudo?.includes('excel') || tipoConteudo?.includes('spreadsheet')) return '📊 Excel';
    return '📄 Documento';
  };

  const getSituacaoText = (situacao) => {
    switch (situacao) {
      case 0: return 'Ativo';
      case 1: return 'Inativo';
      case 2: return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getSituacaoClass = (situacao) => {
    switch (situacao) {
      case 0: return 'status-active';
      case 1: return 'status-inactive';
      case 2: return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const handleDownloadDocumento = async (codigoDocumento, nomeArquivo) => {
    try {
      if (!codigoDocumento) {
        showAlert('error', 'Erro', 'Código do documento não encontrado');
        return;
      }
      
      setIsLoading(true);
      const response = await documentoService.downloadDocumento(codigoDocumento);
      
      // A resposta já é um blob quando usamos responseType: 'blob'
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo || 'documento';
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showAlert('success', 'Sucesso', 'Documento baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      if (error.response?.status === 401) {
        usuarioService.logout();
        navigate('/login');
      } else {
        showAlert('error', 'Erro', 'Erro ao baixar documento: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="appointment-details-page">
      {/* Header Fixo - Sempre presente */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate('/appointments')}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Voltar
            </button>
            
            <div className="appointment-profile">
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
                <h1 className="appointment-title" title={atendimento?.descricaoAtendimento || 'Carregando...'}>
                  {atendimento?.descricaoAtendimento || 'Carregando detalhes...'}
                </h1>
                <p className="appointment-subtitle">
                  Detalhes do Atendimento
                </p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            {atendimento ? (
              <div className={`status-badge ${getSituacaoClass(atendimento.situacao)}`}>
                {getSituacaoText(atendimento.situacao)}
              </div>
            ) : (
              <div className="status-badge status-loading">
                {isLoading ? 'Carregando...' : '---'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content - Estados condicionais */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando detalhes do atendimento...</p>
        </div>
      ) : !atendimento ? (
        <div className="error-state">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 className="error-title">Atendimento não encontrado</h3>
          <p className="error-description">O atendimento solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/appointments')}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Voltar para Atendimentos
          </button>
        </div>
      ) : (
        <div className="content-grid">
        {/* Informações Básicas */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <h2 className="section-title">Informações Básicas</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Descrição</label>
                <span className="info-value" title={atendimento.descricaoAtendimento}>
                  {atendimento.descricaoAtendimento || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Data de Inclusão</label>
                <span className="info-value">
                  {formatDate(atendimento.dtInclusao)}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Status</label>
                <span className={`status-text ${getSituacaoClass(atendimento.situacao)}`}>
                  {getSituacaoText(atendimento.situacao)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Médico */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="section-title">Informações do Médico</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Nome</label>
                <span className="info-value" title={atendimento.nomeMedico}>
                  {atendimento.nomeMedico || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">CPF</label>
                <span className="info-value" title={atendimento.documentoFederalMedico}>
                  {atendimento.documentoFederalMedico || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Email</label>
                <span className="info-value" title={atendimento.emailMedico}>
                  {atendimento.emailMedico || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Telefone</label>
                <span className="info-value" title={atendimento.telefoneMedico}>
                  {atendimento.telefoneMedico || '---'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="section-title">Informações do Paciente</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Nome</label>
                <span className="info-value" title={atendimento.nomePaciente}>
                  {atendimento.nomePaciente || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">CPF</label>
                <span className="info-value" title={atendimento.documentoFederalPaciente}>
                  {atendimento.documentoFederalPaciente || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Email</label>
                <span className="info-value" title={atendimento.emailPaciente}>
                  {atendimento.emailPaciente || '---'}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Telefone</label>
                <span className="info-value" title={atendimento.telefonePaciente}>
                  {atendimento.telefonePaciente || '---'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="info-section full-width">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h2 className="section-title">Agendamentos ({agendamentosTotalItens || 0})</h2>
          </div>
          
          <div className="section-content">
            {agendamentosLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Carregando agendamentos...</p>
              </div>
            ) : agendamentosError ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="error-title">Erro ao carregar agendamentos</h3>
                <p className="error-description">{agendamentosError}</p>
                <button 
                  className="btn-primary"
                  onClick={() => carregarAgendamentos(codigoAtendimento, agendamentosPaginaAtual)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Tentar novamente
                </button>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="empty-title">Nenhum agendamento encontrado</h3>
                <p className="empty-description">Este atendimento ainda não possui agendamentos.</p>
              </div>
            ) : (
              <>
                <div className="agendamentos-carousel">
                  <div className="agendamentos-carousel-header">
                    <h3 className="agendamentos-carousel-title">
                      Agendamentos ({agendamentos.length})
                    </h3>
                    <div className="carousel-controls">
                      <button
                        className="carousel-btn"
                        onClick={prevAgendamentoSlide}
                        disabled={currentAgendamentoSlide === 0}
                        title="Agendamento anterior"
                      >
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        Anterior
                      </button>
                      <button
                        className="carousel-btn"
                        onClick={nextAgendamentoSlide}
                        disabled={currentAgendamentoSlide >= agendamentos.length - agendamentosItemsPerView}
                        title="Próximo agendamento"
                      >
                        Próximo
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="agendamentos-container">
                    <div 
                      className="agendamentos-track"
                      style={{
                        transform: `translateX(-${currentAgendamentoSlide * (100 / agendamentosItemsPerView)}%)`
                      }}
                    >
                      {agendamentos.map((agendamento, index) => (
                        <div key={index} className="agendamento-item">
                          <div className="agendamento-header">
                            <div className="agendamento-icon">
                              📅
                            </div>
                            <div className="agendamento-info">
                              <h4 className="agendamento-descricao" title={agendamento.descricao}>
                                {agendamento.descricao}
                              </h4>
                              <div className="agendamento-details">
                                <span className="agendamento-date">
                                  {formatDate(agendamento.dtAgendamento)}
                                </span>
                                <span className={`agendamento-status ${getSituacaoClass(agendamento.situacao)}`}>
                                  {getSituacaoText(agendamento.situacao)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores do carrossel de agendamentos */}
                  {agendamentos.length > agendamentosItemsPerView && (
                    <div className="carousel-indicators">
                      {Array.from({ length: Math.ceil(agendamentos.length / agendamentosItemsPerView) }, (_, i) => (
                        <button
                          key={i}
                          className={`carousel-indicator ${Math.floor(currentAgendamentoSlide / agendamentosItemsPerView) === i ? 'active' : ''}`}
                          onClick={() => goToAgendamentoSlide(i * agendamentosItemsPerView)}
                          title={`Ir para slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Paginação dos agendamentos */}
                {agendamentosTotalPaginas > 1 && (
                  <div className="agendamentos-pagination">
                    <div className="pagination-info">
                      Página {agendamentosPaginaAtual} de {agendamentosTotalPaginas}
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-button"
                        onClick={() => navegarPaginaAgendamentos(agendamentosPaginaAtual - 1)}
                        disabled={agendamentosPaginaAtual <= 1 || agendamentosLoading}
                        title="Página anterior"
                      >
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        Anterior
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, agendamentosTotalPaginas) }, (_, i) => {
                          let numeroPagina;
                          if (agendamentosTotalPaginas <= 5) {
                            numeroPagina = i + 1;
                          } else if (agendamentosPaginaAtual <= 3) {
                            numeroPagina = i + 1;
                          } else if (agendamentosPaginaAtual >= agendamentosTotalPaginas - 2) {
                            numeroPagina = agendamentosTotalPaginas - 4 + i;
                          } else {
                            numeroPagina = agendamentosPaginaAtual - 2 + i;
                          }
                          
                          return (
                            <button
                              key={numeroPagina}
                              className={`pagination-number ${agendamentosPaginaAtual === numeroPagina ? 'active' : ''}`}
                              onClick={() => navegarPaginaAgendamentos(numeroPagina)}
                              disabled={agendamentosLoading}
                            >
                              {numeroPagina}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        className="pagination-button"
                        onClick={() => navegarPaginaAgendamentos(agendamentosPaginaAtual + 1)}
                        disabled={agendamentosPaginaAtual >= agendamentosTotalPaginas || agendamentosLoading}
                        title="Próxima página"
                      >
                        Próxima
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Documentos */}
        <div className="info-section full-width">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <h2 className="section-title">Documentos ({documentosTotalItens || 0})</h2>
          </div>
          
          <div className="section-content">
            {documentosLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Carregando documentos...</p>
              </div>
            ) : documentosError ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="error-title">Erro ao carregar documentos</h3>
                <p className="error-description">{documentosError}</p>
                <button 
                  className="btn-primary"
                  onClick={() => carregarDocumentos(codigoAtendimento, documentosPaginaAtual)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Tentar novamente
                </button>
              </div>
            ) : documentos.length === 0 ? (
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
                <h3 className="empty-title">Nenhum documento encontrado</h3>
                <p className="empty-description">Este atendimento ainda não possui documentos anexados.</p>
              </div>
            ) : (
              <>
                <div className="documentos-carousel">
                  <div className="documentos-carousel-header">
                    <h3 className="documentos-carousel-title">
                      Documentos ({documentos.length})
                    </h3>
                    <div className="carousel-controls">
                      <button
                        className="carousel-btn"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        title="Documento anterior"
                      >
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        Anterior
                      </button>
                      <button
                        className="carousel-btn"
                        onClick={nextSlide}
                        disabled={currentSlide >= documentos.length - itemsPerView}
                        title="Próximo documento"
                      >
                        Próximo
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="documentos-container">
                    <div 
                      className="documentos-track"
                      style={{
                        transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)`
                      }}
                    >
                      {documentos.map((documento, index) => (
                        <div key={documento.codigo || index} className="documento-item">
                          <div className="documento-header">
                            <div className="documento-icon">
                              {formatarTipoArquivo(documento.tipoConteudo)}
                            </div>
                            <div className="documento-info">
                              <h4 className="documento-nome" title={documento.nomeArquivo}>
                                {documento.nomeArquivo}
                              </h4>
                              <div className="documento-details">
                                <span className="documento-tipo">
                                  {formatarTipoArquivo(documento.tipoConteudo)}
                                </span>
                                <span className="documento-tamanho">
                                  {formatFileSize(documento.tamanhoBytes)}
                                </span>
                                <span className="documento-data">
                                  {formatDate(documento.dataUpload)}
                                </span>
                              </div>
                            </div>
                            <div className="documento-actions">
                              <button 
                                className="btn-download"
                                onClick={() => handleDownloadDocumento(documento.codigo, documento.nomeArquivo)}
                                title="Baixar documento"
                                disabled={isLoading}
                              >
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7,10 12,15 17,10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                {isLoading ? 'Baixando...' : 'Download'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores do carrossel */}
                  {documentos.length > itemsPerView && (
                    <div className="carousel-indicators">
                      {Array.from({ length: Math.ceil(documentos.length / itemsPerView) }, (_, i) => (
                        <button
                          key={i}
                          className={`carousel-indicator ${Math.floor(currentSlide / itemsPerView) === i ? 'active' : ''}`}
                          onClick={() => goToSlide(i * itemsPerView)}
                          title={`Ir para slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Paginação */}
                {documentosTotalPaginas > 1 && (
                  <div className="documentos-pagination">
                    <div className="pagination-info">
                      Página {documentosPaginaAtual} de {documentosTotalPaginas}
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-button"
                        onClick={() => navegarPaginaDocumentos(documentosPaginaAtual - 1)}
                        disabled={documentosPaginaAtual <= 1 || documentosLoading}
                        title="Página anterior"
                      >
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        Anterior
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, documentosTotalPaginas) }, (_, i) => {
                          let numeroPagina;
                          if (documentosTotalPaginas <= 5) {
                            numeroPagina = i + 1;
                          } else if (documentosPaginaAtual <= 3) {
                            numeroPagina = i + 1;
                          } else if (documentosPaginaAtual >= documentosTotalPaginas - 2) {
                            numeroPagina = documentosTotalPaginas - 4 + i;
                          } else {
                            numeroPagina = documentosPaginaAtual - 2 + i;
                          }
                          
                          return (
                            <button
                              key={numeroPagina}
                              className={`pagination-number ${documentosPaginaAtual === numeroPagina ? 'active' : ''}`}
                              onClick={() => navegarPaginaDocumentos(numeroPagina)}
                              disabled={documentosLoading}
                            >
                              {numeroPagina}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        className="pagination-button"
                        onClick={() => navegarPaginaDocumentos(documentosPaginaAtual + 1)}
                        disabled={documentosPaginaAtual >= documentosTotalPaginas || documentosLoading}
                        title="Próxima página"
                      >
                        Próxima
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      )}

      <Alert 
        show={alert.show} 
        type={alert.type} 
        title={alert.title} 
        message={alert.message} 
        onClose={closeAlert} 
        duration={7000} 
      />
    </div>
  );
};

export default AppointmentDetails;