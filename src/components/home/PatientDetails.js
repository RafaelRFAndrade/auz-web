import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pacienteService } from '../../services/Paciente';
import { usuarioService } from '../../services/Usuario';
import './PatientDetails.css';
import Alert from '../../components/custom/Alert';

const PatientDetails = () => {
  const { codigoPaciente } = useParams();
  const navigate = useNavigate();
  const [pacienteData, setPacienteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  const handleEdit = () => {
    if (pacienteData) {
      setEditedData({
        codigo: pacienteData.codigo,
        nome: pacienteData.nome || '',
        email: pacienteData.email || '',
        telefone: pacienteData.telefone || '',
        documentoFederal: pacienteData.documentoFederal || '',
        dataNascimento: pacienteData.dataNascimento || '',
        altura: pacienteData.altura || '',
        peso: pacienteData.peso || '',
        contatoEmergencia: pacienteData.contatoEmergencia || '',
        genero: pacienteData.genero || '',
        estadoCivil: pacienteData.estadoCivil || '',
        cep: pacienteData.cep || '',
        logradouro: pacienteData.logradouro || '',
        numero: pacienteData.numero || '',
        complemento: pacienteData.complemento || '',
        bairro: pacienteData.bairro || '',
        cidade: pacienteData.cidade || '',
        uf: pacienteData.uf || '',
        possuiEspecificacoes: pacienteData.possuiEspecificacoes || false,
        descricaoEspecificacoes: pacienteData.descricaoEspecificacoes || ''
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

  const validateForm = () => {
    const errors = [];
    
    if (!editedData.nome || editedData.nome.trim() === '') {
      errors.push('Nome é obrigatório');
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
      await pacienteService.updatePacienteDetalhado(editedData);
      
      // Atualizar os dados locais
      setPacienteData(prev => ({
        ...prev,
        ...editedData
      }));
      
      setIsEditing(false);
      setEditedData({});
      showAlert('success', 'Sucesso', 'Dados do paciente atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      showAlert('error', 'Erro', 'Erro ao atualizar dados do paciente: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchPacienteDetails = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const response = await pacienteService.getPacienteById(codigoPaciente);
        setPacienteData(response);
      } catch (error) {
        console.error('Erro ao buscar detalhes do paciente:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        } else {
          showAlert('error', 'Erro', 'Erro ao carregar detalhes do paciente: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacienteDetails();
  }, [codigoPaciente, navigate]);

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

  const getGeneroText = (genero) => {
    switch (genero) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      case 'O': return 'Outro';
      default: return 'Não informado';
    }
  };

  const getEstadoCivilText = (estadoCivil) => {
    switch (estadoCivil) {
      case 'S': return 'Solteiro(a)';
      case 'C': return 'Casado(a)';
      case 'D': return 'Divorciado(a)';
      case 'V': return 'Viúvo(a)';
      case 'U': return 'União Estável';
      default: return 'Não informado';
    }
  };

  if (isLoading) {
    return (
      <div className="patient-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando detalhes do paciente...</p>
        </div>
      </div>
    );
  }

  if (!pacienteData) {
    return (
      <div className="patient-details-page">
        <div className="error-state">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 className="error-title">Paciente não encontrado</h3>
          <p className="error-description">O paciente solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/patients')}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-details-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate('/patients')}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Voltar
            </button>
            
            <div className="patient-profile">
              <div className="patient-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="patient-info">
                <h1 className="patient-name" title={pacienteData.nome}>
                  {pacienteData.nome}
                </h1>
                <p className="patient-cpf" title={formatCPF(pacienteData.documentoFederal)}>
                  {formatCPF(pacienteData.documentoFederal)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className={`status-badge ${getSituacaoClass(pacienteData.situacao)}`}>
              {getSituacaoText(pacienteData.situacao)}
            </div>
            
            {!isEditing ? (
              <button className="edit-button" onClick={handleEdit}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave} disabled={isSaving}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="cancel-button" onClick={handleCancel} disabled={isSaving}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Content */}
      <div className="content-grid">
        {/* Informações Básicas */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="section-title">Informações Básicas</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Nome Completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.nome || ''}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="form-input"
                    placeholder="Nome do paciente"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.nome}>
                    {pacienteData.nome || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">CPF</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.documentoFederal || ''}
                    onChange={(e) => handleInputChange('documentoFederal', e.target.value)}
                    className="form-input"
                    placeholder="000.000.000-00"
                  />
                ) : (
                  <span className="info-value" title={formatCPF(pacienteData.documentoFederal)}>
                    {formatCPF(pacienteData.documentoFederal)}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="form-input"
                    placeholder="exemplo@email.com"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.email}>
                    {pacienteData.email || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Telefone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <span className="info-value" title={formatPhone(pacienteData.telefone)}>
                    {formatPhone(pacienteData.telefone)}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Data de Nascimento</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedData.dataNascimento || ''}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span className="info-value">
                    {pacienteData.dataNascimento ? new Date(pacienteData.dataNascimento).toLocaleDateString('pt-BR') : '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Gênero</label>
                {isEditing ? (
                  <select
                    value={editedData.genero || ''}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                ) : (
                  <span className="info-value">
                    {getGeneroText(pacienteData.genero)}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Estado Civil</label>
                {isEditing ? (
                  <select
                    value={editedData.estadoCivil || ''}
                    onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Selecione o estado civil</option>
                    <option value="S">Solteiro(a)</option>
                    <option value="C">Casado(a)</option>
                    <option value="D">Divorciado(a)</option>
                    <option value="V">Viúvo(a)</option>
                    <option value="U">União Estável</option>
                  </select>
                ) : (
                  <span className="info-value">
                    {getEstadoCivilText(pacienteData.estadoCivil)}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Data de Inclusão</label>
                <span className="info-value">
                  {formatDate(pacienteData.dtInclusao)}
                </span>
              </div>
              
              <div className="info-item">
                <label className="info-label">Status</label>
                <span className={`status-text ${getSituacaoClass(pacienteData.situacao)}`}>
                  {getSituacaoText(pacienteData.situacao)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Físicas */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <h2 className="section-title">Informações Físicas</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Altura (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData.altura || ''}
                    onChange={(e) => handleInputChange('altura', e.target.value)}
                    className="form-input"
                    placeholder="Altura em cm"
                    min="0"
                  />
                ) : (
                  <span className="info-value">
                    {pacienteData.altura ? `${pacienteData.altura} cm` : '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Peso (kg)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData.peso || ''}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    className="form-input"
                    placeholder="Peso em kg"
                    min="0"
                    step="0.1"
                  />
                ) : (
                  <span className="info-value">
                    {pacienteData.peso ? `${pacienteData.peso} kg` : '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item full-width">
                <label className="info-label">Contato de Emergência</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.contatoEmergencia || ''}
                    onChange={(e) => handleInputChange('contatoEmergencia', e.target.value)}
                    className="form-input"
                    placeholder="Nome e telefone do contato"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.contatoEmergencia}>
                    {pacienteData.contatoEmergencia || '---'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="info-section">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h2 className="section-title">Endereço</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">CEP</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className="form-input"
                    placeholder="00000-000"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.cep}>
                    {pacienteData.cep || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Logradouro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.logradouro || ''}
                    onChange={(e) => handleInputChange('logradouro', e.target.value)}
                    className="form-input"
                    placeholder="Rua, Avenida, etc."
                  />
                ) : (
                  <span className="info-value" title={pacienteData.logradouro}>
                    {pacienteData.logradouro || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Número</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    className="form-input"
                    placeholder="Número"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.numero}>
                    {pacienteData.numero || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Complemento</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.complemento || ''}
                    onChange={(e) => handleInputChange('complemento', e.target.value)}
                    className="form-input"
                    placeholder="Apartamento, bloco, etc."
                  />
                ) : (
                  <span className="info-value" title={pacienteData.complemento}>
                    {pacienteData.complemento || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Bairro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    className="form-input"
                    placeholder="Bairro"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.bairro}>
                    {pacienteData.bairro || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">Cidade</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="form-input"
                    placeholder="Cidade"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.cidade}>
                    {pacienteData.cidade || '---'}
                  </span>
                )}
              </div>
              
              <div className="info-item">
                <label className="info-label">UF</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.uf || ''}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                    className="form-input"
                    placeholder="Estado"
                    maxLength="2"
                  />
                ) : (
                  <span className="info-value" title={pacienteData.uf}>
                    {pacienteData.uf || '---'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Especificações Médicas */}
        <div className="info-section full-width">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h2 className="section-title">Especificações Médicas</h2>
          </div>
          
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item full-width">
                <label className="info-label">Possui Especificações</label>
                {isEditing ? (
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={editedData.possuiEspecificacoes || false}
                      onChange={(e) => handleInputChange('possuiEspecificacoes', e.target.checked)}
                      className="checkbox-input"
                      id="possuiEspecificacoes"
                    />
                    <label htmlFor="possuiEspecificacoes" className="checkbox-label">
                      Sim, possui especificações médicas
                    </label>
                  </div>
                ) : (
                  <span className="info-value">
                    {pacienteData.possuiEspecificacoes ? 'Sim' : 'Não'}
                  </span>
                )}
              </div>
              
              {(pacienteData.possuiEspecificacoes || (isEditing && editedData.possuiEspecificacoes)) && (
                <div className="info-item full-width">
                  <label className="info-label">Descrição das Especificações</label>
                  {isEditing ? (
                    <textarea
                      value={editedData.descricaoEspecificacoes || ''}
                      onChange={(e) => handleInputChange('descricaoEspecificacoes', e.target.value)}
                      className="form-textarea"
                      placeholder="Descreva as especificações médicas do paciente"
                      rows="4"
                    />
                  ) : (
                    <div className="text-content" title={pacienteData.descricaoEspecificacoes}>
                      {pacienteData.descricaoEspecificacoes || 'Nenhuma descrição fornecida'}
                    </div>
                  )}
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

export default PatientDetails;