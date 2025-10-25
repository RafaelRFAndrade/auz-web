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
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  // Funções para gerenciar foto de perfil
  const carregarFotoPerfil = async (codigoMedico) => {
    try {
      const fotoBlob = await medicoService.getFotoPerfil(codigoMedico);
      if (fotoBlob) {
        const fotoUrl = URL.createObjectURL(fotoBlob);
        setFotoPerfil(fotoUrl);
      } else {
        setFotoPerfil(null);
      }
    } catch (error) {
      setFotoPerfil(null);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Erro', 'Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showAlert('error', 'Erro', 'O arquivo deve ter no máximo 10MB.');
        return;
      }

      handleUploadFoto(file);
    }
  };

  const handleUploadFoto = async (file) => {
    try {
      setIsUploadingFoto(true);
      
      await medicoService.uploadFotoPerfil(medicoData.medico.codigo, file);
      await carregarFotoPerfil(medicoData.medico.codigo);
      
      setShowUploadModal(false);
      showAlert('success', 'Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      let errorMessage = 'Erro desconhecido';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Mensagem) {
        errorMessage = error.response.data.Mensagem;
      }
      
      showAlert('error', 'Erro no Upload', `Erro ao fazer upload da foto: ${errorMessage}`);
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const removerFotoPerfil = () => {
    if (fotoPerfil) {
      URL.revokeObjectURL(fotoPerfil);
      setFotoPerfil(null);
    }
  };

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
        if (!novosDias.find(d => d.key === dia.key)) {
          novosDias.push(dia);
        }
      } else {
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
        
        if (response && response.medico && response.medico.codigo) {
          await carregarFotoPerfil(response.medico.codigo);
        }
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

  useEffect(() => {
    return () => {
      if (fotoPerfil) {
        URL.revokeObjectURL(fotoPerfil);
      }
    };
  }, [fotoPerfil]);

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

  const diasSemana = [
    { key: 'segunda', label: 'Segunda', value: 1 << 0 },
    { key: 'terca', label: 'Terça', value: 1 << 1 },
    { key: 'quarta', label: 'Quarta', value: 1 << 2 },
    { key: 'quinta', label: 'Quinta', value: 1 << 3 },
    { key: 'sexta', label: 'Sexta', value: 1 << 4 },
    { key: 'sabado', label: 'Sábado', value: 1 << 5 },
    { key: 'domingo', label: 'Domingo', value: 1 << 6 }
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
        <div className="simple-loading">
          <div className="simple-spinner"></div>
          <p>Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!medicoData || !medicoData.medico) {
    return (
      <div className="medico-details-container">
        <div className="error-state">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Médico não encontrado</h3>
          <p>O médico solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/doctors')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
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
        {/* Modern Header */}
        <div className="details-header">
          <div className="header-background"></div>
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn-back" 
                onClick={() => navigate('/doctors')}
                title="Voltar para médicos"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Voltar
              </button>
              
              <div className="profile-section">
                <div className="profile-photo-container">
                  {fotoPerfil ? (
                    <img 
                      src={fotoPerfil} 
                      alt={`Foto de ${medico.nome}`}
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                  <button 
                    className="btn-upload-photo"
                    onClick={() => setShowUploadModal(true)}
                    title="Alterar foto de perfil"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </div>
                
                <div className="profile-info">
                  <h1 className="profile-name">{medico.nome}</h1>
                  <p className="profile-crm">CRM: {medico.crm}</p>
                  <div className={`status-badge ${getSituacaoClass(medico.situacao)}`}>
                    <div className="status-dot"></div>
                    {getSituacaoText(medico.situacao)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="header-right">
              {!isEditing ? (
                <button 
                  className="btn-edit" 
                  onClick={handleEdit}
                  title="Editar dados do médico"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn-save" 
                    onClick={handleSave}
                    disabled={isSaving}
                    title="Salvar alterações"
                  >
                    {isSaving ? (
                      <div className="btn-spinner"></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                      </svg>
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={handleCancel}
                    disabled={isSaving}
                    title="Cancelar edição"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="details-content">
          <div className="content-grid">
            {/* Informações Básicas */}
            <div className="info-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2>Informações Básicas</h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nome Completo</label>
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
                    <label>CRM</label>
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
                    <label>CPF</label>
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
                    <label>Email</label>
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
                    <label>Telefone</label>
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
                    <label>Data de Inclusão</label>
                    <span>{formatDate(medico.dtInclusao)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div className="info-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h2>Informações Profissionais</h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Especialidade</label>
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
                    <label>Tipo de Contrato</label>
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
                    <label>Valor da Consulta</label>
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
                  
                  <div className="info-item full-width">
                    <label>Dias de Atendimento</label>
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
            <div className="info-card full-width">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7v7m0-7h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9m0-7V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
                <h2>Atendimentos ({atendimentos?.length || 0})</h2>
              </div>
              <div className="card-content">
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Ver Detalhes
                          </button>
                        </div>
                        <div className="atendimento-details">
                          <span className="atendimento-date">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {formatDate(atendimento.dtInclusao)}
                          </span>
                          <span className="atendimento-code">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            {atendimento.codigoAtendimento}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7v7m0-7h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9m0-7V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </div>
                    <p>Nenhum atendimento encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upload de Foto */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Alterar Foto de Perfil</h3>
              <button 
                className="btn-close-modal"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploadingFoto}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-section">
                <div className="current-photo">
                  {fotoPerfil ? (
                    <img 
                      src={fotoPerfil} 
                      alt="Foto atual"
                      className="current-photo-preview"
                    />
                  ) : (
                    <div className="no-photo-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <p>Nenhuma foto</p>
                    </div>
                  )}
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={isUploadingFoto}
                  />
                  <label 
                    htmlFor="photo-upload" 
                    className={`btn-upload-file ${isUploadingFoto ? 'disabled' : ''}`}
                  >
                    {isUploadingFoto ? (
                      <div className="btn-spinner"></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                    )}
                    {isUploadingFoto ? 'Enviando...' : 'Selecionar Foto'}
                  </label>
                  <p className="upload-info">
                    Formatos aceitos: JPG, PNG, GIF<br/>
                    Tamanho máximo: 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploadingFoto}
              >
                Cancelar
              </button>
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

export default MedicoDetails;