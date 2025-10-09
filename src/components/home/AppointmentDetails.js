import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atendimentoService } from '../../services/Atendimento';
import { usuarioService } from '../../services/Usuario';
import './AppointmentDetails.css';
import Alert from '../../components/custom/Alert';

const AppointmentDetails = () => {
  const { codigoAtendimento } = useParams();
  const navigate = useNavigate();
  const [atendimento, setAtendimento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

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
      const response = await atendimentoService.downloadDocumento(codigoDocumento);
      
      const blob = new Blob([response.data]);
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

          {/* Documentos */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📄</span>
                Documentos ({atendimento.documentos?.length || 0})
              </h2>
            </div>
            <div className="section-content">
              {atendimento.documentos && atendimento.documentos.length > 0 ? (
                <div className="documentos-list">
                  {atendimento.documentos.map((documento, index) => (
                    <div key={index} className="documento-item">
                      <div className="documento-header">
                        <div className="documento-icon">
                          {documento.tipoConteudo?.startsWith('image/') ? '🖼️' : '📄'}
                        </div>
                        <div className="documento-info">
                          <h4 className="documento-nome">{documento.nomeArquivo}</h4>
                          <div className="documento-details">
                            <span className="documento-tipo">{documento.tipoConteudo}</span>
                            <span className="documento-tamanho">{formatFileSize(documento.tamanhoBytes)}</span>
                            <span className="documento-data">{formatDate(documento.dataUpload)}</span>
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
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>Nenhum documento encontrado</p>
                </div>
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
