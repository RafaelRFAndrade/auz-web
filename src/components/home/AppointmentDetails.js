import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atendimentoService } from '../../services/Atendimento';
import { documentoService } from '../../services/Documento';
import { usuarioService } from '../../services/Usuario';
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
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const itensPorPagina = 5;
  
  // Estados para carrossel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  const carregarDocumentos = async (codigoEntidade, pagina = 1) => {
    try {
      setDocumentosLoading(true);
      setDocumentosError(null);
      const response = await documentoService.buscarDocumentos(codigoEntidade, pagina, itensPorPagina);
      setDocumentos(response.documentos || []);
      setTotalPaginas(response.totalPaginas || 0);
      setTotalItens(response.itens || 0);
      setPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setDocumentosError('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setDocumentosLoading(false);
    }
  };

  const navegarPagina = (novaPagina) => {
    // FORÇAR usando codigoAtendimento da URL
    carregarDocumentos(codigoAtendimento, novaPagina);
  };

  // Funções do carrossel
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

  // Calcular itens visíveis baseado no tamanho da tela
  const updateItemsPerView = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setItemsPerView(1);
    } else if (width < 1200) {
      setItemsPerView(2);
    } else if (width < 1600) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4); // Mais itens em telas grandes
    }
  };

  // Resetar slide quando documentos mudarem
  useEffect(() => {
    setCurrentSlide(0);
  }, [documentos]);

  // Atualizar itens por view quando a tela redimensionar
  useEffect(() => {
    updateItemsPerView();
    const handleResize = () => updateItemsPerView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAtendimentoDetails = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const response = await atendimentoService.getAtendimentoDetails(codigoAtendimento);
        setAtendimento(response);
        
        // Carregar documentos usando o codigoAtendimento da URL
        carregarDocumentos(codigoAtendimento);
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

  if (isLoading) {
    return (
      <div className="appointment-details-container">
        <div className="loading-container">
          <div className="loading-spinner">Carregando detalhes...</div>
        </div>
      </div>
    );
  }

  if (!atendimento) {
    return (
      <div className="appointment-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Atendimento não encontrado</h3>
          <p>O atendimento solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/appointments')}>
            Voltar para Atendimentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-details-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="details-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn-back" 
                onClick={() => navigate('/appointments')}
                title="Voltar para atendimentos"
              >
                ← Voltar
              </button>
              <div className="title-section">
                <h1 className="details-title">
                  <span className="highlight">Detalhes do Atendimento</span> 📋
                </h1>
                <p className="details-subtitle">
                  {atendimento.descricaoAtendimento}
                </p>
              </div>
            </div>
            <div className="header-right">
              <div className={`status-badge ${getSituacaoClass(atendimento.situacao)}`}>
                {getSituacaoText(atendimento.situacao)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="details-grid">
          {/* Informações Básicas */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">ℹ️</span>
                Informações Básicas
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Descrição:</label>
                  <span>{atendimento.descricaoAtendimento || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Data de Inclusão:</label>
                  <span>{formatDate(atendimento.dtInclusao)}</span>
                </div>
                <div className="info-item">
                  <label>Situação:</label>
                  <span className={`status-text ${getSituacaoClass(atendimento.situacao)}`}>
                    {getSituacaoText(atendimento.situacao)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Médico */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">👨‍⚕️</span>
                Informações do Médico
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome:</label>
                  <span>{atendimento.nomeMedico || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>CPF:</label>
                  <span>{atendimento.documentoFederalMedico || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{atendimento.emailMedico || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Telefone:</label>
                  <span>{atendimento.telefoneMedico || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Paciente */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">👤</span>
                Informações do Paciente
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome:</label>
                  <span>{atendimento.nomePaciente || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>CPF:</label>
                  <span>{atendimento.documentoFederalPaciente || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{atendimento.emailPaciente || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Telefone:</label>
                  <span>{atendimento.telefonePaciente || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agendamentos */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📅</span>
                Agendamentos ({atendimento.agendamentos?.length || 0})
              </h2>
            </div>
            <div className="section-content">
              {atendimento.agendamentos && atendimento.agendamentos.length > 0 ? (
                <div className="agendamentos-list">
                  {atendimento.agendamentos.map((agendamento, index) => (
                    <div key={index} className="agendamento-item">
                      <div className="agendamento-header">
                        <h4 className="agendamento-descricao">{agendamento.descricao}</h4>
                        <span className={`agendamento-status ${getSituacaoClass(agendamento.situacao)}`}>
                          {getSituacaoText(agendamento.situacao)}
                        </span>
                      </div>
                      <div className="agendamento-details">
                        <span className="agendamento-date">
                          📅 {formatDate(agendamento.dtAgendamento)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Nenhum agendamento encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Documentos - Carrossel */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📄</span>
                Documentos ({totalItens || 0})
              </h2>
            </div>
            <div className="section-content">
              {documentosLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner">Carregando documentos...</div>
                </div>
              ) : documentosError ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <p>{documentosError}</p>
                  <button 
                    className="btn-primary"
                    onClick={() => atendimento && carregarDocumentos(atendimento.codigo, paginaAtual)}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : documentos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>Nenhum documento encontrado</p>
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
                          ← Anterior
                        </button>
                        <button
                          className="carousel-btn"
                          onClick={nextSlide}
                          disabled={currentSlide >= documentos.length - itemsPerView}
                          title="Próximo documento"
                        >
                          Próximo →
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
                                  {isLoading ? '⏳' : '⬇️'} Download
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
                  {totalPaginas > 1 && (
                    <div className="documentos-pagination">
                      <div className="pagination-info">
                        Página {paginaAtual} de {totalPaginas}
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="pagination-button"
                          onClick={() => navegarPagina(paginaAtual - 1)}
                          disabled={paginaAtual <= 1 || documentosLoading}
                          title="Página anterior"
                        >
                          ← Anterior
                        </button>
                        
                        <div className="pagination-numbers">
                          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                            let numeroPagina;
                            if (totalPaginas <= 5) {
                              numeroPagina = i + 1;
                            } else if (paginaAtual <= 3) {
                              numeroPagina = i + 1;
                            } else if (paginaAtual >= totalPaginas - 2) {
                              numeroPagina = totalPaginas - 4 + i;
                            } else {
                              numeroPagina = paginaAtual - 2 + i;
                            }
                            
                            return (
                              <button
                                key={numeroPagina}
                                className={`pagination-number ${paginaAtual === numeroPagina ? 'active' : ''}`}
                                onClick={() => navegarPagina(numeroPagina)}
                                disabled={documentosLoading}
                              >
                                {numeroPagina}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          className="pagination-button"
                          onClick={() => navegarPagina(paginaAtual + 1)}
                          disabled={paginaAtual >= totalPaginas || documentosLoading}
                          title="Próxima página"
                        >
                          Próxima →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default AppointmentDetails;
