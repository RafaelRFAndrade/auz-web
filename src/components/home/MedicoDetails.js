import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicoService } from '../../services/Medico';
import { usuarioService } from '../../services/Usuario';
import './MedicoDetails.css';
import Alert from '../../components/custom/Alert';

const MedicoDetails = () => {
  const { codigoMedico } = useParams();
  const navigate = useNavigate();
  const [medicoData, setMedicoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  useEffect(() => {
    const fetchMedicoDetails = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const response = await medicoService.getMedicoDetalhado(codigoMedico);
        setMedicoData(response);
      } catch (error) {
        console.error('Erro ao buscar detalhes do médico:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        } else {
          showAlert('error', 'Erro', 'Erro ao carregar detalhes do médico: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicoDetails();
  }, [codigoMedico, navigate]);

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

  const formatCPF = (cpf) => {
    if (!cpf) return '---';
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length === 11) {
      return cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatPhone = (phone) => {
    if (!phone) return '---';
    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length === 11) {
      return phoneNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phoneNumbers.length === 10) {
      return phoneNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
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

  if (isLoading) {
    return (
      <div className="medico-details-container">
        <div className="loading-container">
          <div className="loading-spinner">Carregando detalhes...</div>
        </div>
      </div>
    );
  }

  if (!medicoData || !medicoData.medico) {
    return (
      <div className="medico-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Médico não encontrado</h3>
          <p>O médico solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/doctors')}>
            Voltar para Médicos
          </button>
        </div>
      </div>
    );
  }

  const { medico, atendimentos } = medicoData;

  return (
    <div className="medico-details-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="details-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn-back" 
                onClick={() => navigate('/doctors')}
                title="Voltar para médicos"
              >
                ← Voltar
              </button>
              <div className="title-section">
                <h1 className="details-title">
                  <span className="highlight">Detalhes do Médico</span> 👨‍⚕️
                </h1>
                <p className="details-subtitle">
                  {medico.nome}
                </p>
              </div>
            </div>
            <div className="header-right">
              <div className={`status-badge ${getSituacaoClass(medico.situacao)}`}>
                {getSituacaoText(medico.situacao)}
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
                  <label>Nome:</label>
                  <span>{medico.nome || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>CRM:</label>
                  <span>{medico.crm || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>CPF:</label>
                  <span>{formatCPF(medico.documentoFederal)}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{medico.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Telefone:</label>
                  <span>{formatPhone(medico.telefone)}</span>
                </div>
                <div className="info-item">
                  <label>Data de Inclusão:</label>
                  <span>{formatDate(medico.dtInclusao)}</span>
                </div>
                <div className="info-item">
                  <label>Situação:</label>
                  <span className={`status-text ${getSituacaoClass(medico.situacao)}`}>
                    {getSituacaoText(medico.situacao)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">💼</span>
                Informações Profissionais
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Especialidade:</label>
                  <span>{medico.especialidade || 'Não informada'}</span>
                </div>
                <div className="info-item">
                  <label>Tipo de Contrato:</label>
                  <span>{medico.tipoContrato || 'Não informado'}</span>
                </div>
                <div className="info-item">
                  <label>Valor da Consulta:</label>
                  <span>{medico.valorConsulta ? `R$ ${medico.valorConsulta}` : 'Não informado'}</span>
                </div>
                <div className="info-item">
                  <label>Dias de Atendimento:</label>
                  <span>{medico.diasAtendimento || 'Não informados'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Atendimentos */}
          <div className="details-section full-width">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📋</span>
                Atendimentos ({atendimentos?.length || 0})
              </h2>
            </div>
            <div className="section-content">
              {atendimentos && atendimentos.length > 0 ? (
                <div className="atendimentos-list">
                  {atendimentos.map((atendimento, index) => (
                    <div key={index} className="atendimento-item">
                      <div className="atendimento-header">
                        <h4 className="atendimento-descricao">{atendimento.descricao}</h4>
                        <button 
                          className="btn-view-atendimento"
                          onClick={() => navigate(`/appointment-details/${atendimento.codigoAtendimento}`)}
                          title="Ver detalhes do atendimento"
                        >
                          👁️ Ver Detalhes
                        </button>
                      </div>
                      <div className="atendimento-details">
                        <span className="atendimento-date">
                          📅 {formatDate(atendimento.dtInclusao)}
                        </span>
                        <span className="atendimento-code">
                          🆔 {atendimento.codigoAtendimento}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>Nenhum atendimento encontrado</p>
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

export default MedicoDetails;
