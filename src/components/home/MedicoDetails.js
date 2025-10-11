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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  const handleEdit = () => {
    if (medicoData && medicoData.medico) {
      setEditedData({
        codigo: medicoData.medico.codigo,
        nome: medicoData.medico.nome || '',
        crm: medicoData.medico.crm || '',
        email: medicoData.medico.email || '',
        telefone: medicoData.medico.telefone || '',
        documentoFederal: medicoData.medico.documentoFederal || '',
        especialidade: medicoData.medico.especialidade || '',
        diasAtendimento: medicoData.medico.diasAtendimento || 0,
        diasSelecionados: getDiasSelecionados(medicoData.medico.diasAtendimento || 0),
        tipoContrato: medicoData.medico.tipoContrato || '',
        valorConsulta: medicoData.medico.valorConsulta || 0
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiaChange = (dia, isChecked) => {
    setEditedData(prev => {
      let novosDias = [...(prev.diasSelecionados || [])];
      
      if (isChecked) {
        // Adicionar dia se não estiver na lista
        if (!novosDias.find(d => d.key === dia.key)) {
          novosDias.push(dia);
        }
      } else {
        // Remover dia da lista
        novosDias = novosDias.filter(d => d.key !== dia.key);
      }
      
      const novoValor = getValorDias(novosDias);
      
      return {
        ...prev,
        diasSelecionados: novosDias,
        diasAtendimento: novoValor
      };
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!editedData.nome || editedData.nome.trim() === '') {
      errors.push('Nome é obrigatório');
    }
    
    if (!editedData.crm || editedData.crm.trim() === '') {
      errors.push('CRM é obrigatório');
    }
    
    if (!editedData.email || editedData.email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
      errors.push('Email deve ter um formato válido');
    }
    
    if (!editedData.documentoFederal || editedData.documentoFederal.trim() === '') {
      errors.push('CPF é obrigatório');
    } else if (!/^\d{11}$/.test(editedData.documentoFederal.replace(/\D/g, ''))) {
      errors.push('CPF deve ter 11 dígitos');
    }
    
    if (!editedData.telefone || editedData.telefone.trim() === '') {
      errors.push('Telefone é obrigatório');
    }
    
    if (editedData.valorConsulta < 0) {
      errors.push('Valor da consulta não pode ser negativo');
    }
    
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      showAlert('error', 'Erro de Validação', validationErrors.join(', '));
      return;
    }
    
    try {
      setIsSaving(true);
      await medicoService.updateMedicoCompleto(editedData);
      
      // Atualizar os dados locais
      setMedicoData(prev => ({
        ...prev,
        medico: {
          ...prev.medico,
          ...editedData
        }
      }));
      
      setIsEditing(false);
      setEditedData({});
      showAlert('success', 'Sucesso', 'Dados do médico atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      showAlert('error', 'Erro', 'Erro ao atualizar dados do médico: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

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

  // Helper functions for DiasAtendimento enum flags
  const diasSemana = [
    { key: 'segunda', label: 'Segunda', value: 1 << 0 }, // 1
    { key: 'terca', label: 'Terça', value: 1 << 1 },     // 2
    { key: 'quarta', label: 'Quarta', value: 1 << 2 },   // 4
    { key: 'quinta', label: 'Quinta', value: 1 << 3 },   // 8
    { key: 'sexta', label: 'Sexta', value: 1 << 4 },     // 16
    { key: 'sabado', label: 'Sábado', value: 1 << 5 },   // 32
    { key: 'domingo', label: 'Domingo', value: 1 << 6 }  // 64
  ];

  const getDiasSelecionados = (valor) => {
    if (!valor || valor === 0) return [];
    return diasSemana.filter(dia => (valor & dia.value) === dia.value);
  };

  const getValorDias = (diasSelecionados) => {
    return diasSelecionados.reduce((total, dia) => total + dia.value, 0);
  };

  const formatDiasAtendimento = (valor) => {
    const dias = getDiasSelecionados(valor);
    if (dias.length === 0) return 'Nenhum dia';
    return dias.map(dia => dia.label).join(', ');
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
              {!isEditing ? (
                <button 
                  className="btn-edit" 
                  onClick={handleEdit}
                  title="Editar dados do médico"
                >
                  ✏️ Editar
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn-save" 
                    onClick={handleSave}
                    disabled={isSaving}
                    title="Salvar alterações"
                  >
                    {isSaving ? '💾 Salvando...' : '💾 Salvar'}
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={handleCancel}
                    disabled={isSaving}
                    title="Cancelar edição"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.nome || ''}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="edit-input"
                      placeholder="Nome do médico"
                    />
                  ) : (
                    <span>{medico.nome || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>CRM:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.crm || ''}
                      onChange={(e) => handleInputChange('crm', e.target.value)}
                      className="edit-input"
                      placeholder="CRM do médico"
                    />
                  ) : (
                    <span>{medico.crm || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>CPF:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.documentoFederal || ''}
                      onChange={(e) => handleInputChange('documentoFederal', e.target.value)}
                      className="edit-input"
                      placeholder="CPF do médico"
                    />
                  ) : (
                    <span>{formatCPF(medico.documentoFederal)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="edit-input"
                      placeholder="Email do médico"
                    />
                  ) : (
                    <span>{medico.email || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Telefone:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.telefone || ''}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className="edit-input"
                      placeholder="Telefone do médico"
                    />
                  ) : (
                    <span>{formatPhone(medico.telefone)}</span>
                  )}
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.especialidade || ''}
                      onChange={(e) => handleInputChange('especialidade', e.target.value)}
                      className="edit-input"
                      placeholder="Especialidade do médico"
                    />
                  ) : (
                    <span>{medico.especialidade || 'Não informada'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Tipo de Contrato:</label>
                  {isEditing ? (
                    <select
                      value={editedData.tipoContrato || ''}
                      onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                      className="edit-input"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="Livre">Livre</option>
                      <option value="Contratado">Contratado</option>
                      <option value="Parceria">Parceria</option>
                    </select>
                  ) : (
                    <span>{medico.tipoContrato || 'Não informado'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Valor da Consulta:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.valorConsulta || ''}
                      onChange={(e) => handleInputChange('valorConsulta', parseFloat(e.target.value) || 0)}
                      className="edit-input"
                      placeholder="Valor da consulta"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span>{medico.valorConsulta ? `R$ ${medico.valorConsulta}` : 'Não informado'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Dias de Atendimento:</label>
                  {isEditing ? (
                    <div className="dias-atendimento-container">
                      <div className="dias-checkboxes">
                        {diasSemana.map(dia => (
                          <label key={dia.key} className="dia-checkbox">
                            <input
                              type="checkbox"
                              checked={editedData.diasSelecionados?.some(d => d.key === dia.key) || false}
                              onChange={(e) => handleDiaChange(dia, e.target.checked)}
                            />
                            <span className="dia-label">{dia.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="dias-selected-info">
                        <small>Valor: {editedData.diasAtendimento || 0}</small>
                      </div>
                    </div>
                  ) : (
                    <span>{formatDiasAtendimento(medico.diasAtendimento)}</span>
                  )}
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
