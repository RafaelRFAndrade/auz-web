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
      <div className="patient-details-container">
        <div className="loading-container">
          <div className="loading-spinner">Carregando detalhes...</div>
        </div>
      </div>
    );
  }

  if (!pacienteData) {
    return (
      <div className="patient-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Paciente não encontrado</h3>
          <p>O paciente solicitado não foi encontrado.</p>
          <button className="btn-primary" onClick={() => navigate('/patients')}>
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-details-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="details-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn-back" 
                onClick={() => navigate('/patients')}
                title="Voltar para pacientes"
              >
                ← Voltar
              </button>
              <div className="title-section">
                <div className="patient-profile">
                  <div className="profile-photo-container">
                    <div className="profile-photo-placeholder">
                      👤
                    </div>
                  </div>
                  <div className="title-info">
                    <h1 className="details-title">
                      <span className="highlight">Detalhes do Paciente</span>
                    </h1>
                    <p className="details-subtitle">
                      {pacienteData.nome}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className={`status-badge ${getSituacaoClass(pacienteData.situacao)}`}>
                {getSituacaoText(pacienteData.situacao)}
              </div>
              {!isEditing ? (
                <button 
                  className="btn-edit" 
                  onClick={handleEdit}
                  title="Editar dados do paciente"
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
                      placeholder="Nome do paciente"
                    />
                  ) : (
                    <span>{pacienteData.nome || 'N/A'}</span>
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
                      placeholder="CPF do paciente"
                    />
                  ) : (
                    <span>{formatCPF(pacienteData.documentoFederal)}</span>
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
                      placeholder="Email do paciente"
                    />
                  ) : (
                    <span>{pacienteData.email || 'N/A'}</span>
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
                      placeholder="Telefone do paciente"
                    />
                  ) : (
                    <span>{formatPhone(pacienteData.telefone)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Data de Nascimento:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedData.dataNascimento || ''}
                      onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{pacienteData.dataNascimento ? new Date(pacienteData.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Gênero:</label>
                  {isEditing ? (
                    <select
                      value={editedData.genero || ''}
                      onChange={(e) => handleInputChange('genero', e.target.value)}
                      className="edit-input"
                    >
                      <option value="">Selecione o gênero</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  ) : (
                    <span>{getGeneroText(pacienteData.genero)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Estado Civil:</label>
                  {isEditing ? (
                    <select
                      value={editedData.estadoCivil || ''}
                      onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                      className="edit-input"
                    >
                      <option value="">Selecione o estado civil</option>
                      <option value="S">Solteiro(a)</option>
                      <option value="C">Casado(a)</option>
                      <option value="D">Divorciado(a)</option>
                      <option value="V">Viúvo(a)</option>
                      <option value="U">União Estável</option>
                    </select>
                  ) : (
                    <span>{getEstadoCivilText(pacienteData.estadoCivil)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Data de Inclusão:</label>
                  <span>{formatDate(pacienteData.dtInclusao)}</span>
                </div>
                <div className="info-item">
                  <label>Situação:</label>
                  <span className={`status-text ${getSituacaoClass(pacienteData.situacao)}`}>
                    {getSituacaoText(pacienteData.situacao)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Físicas */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📏</span>
                Informações Físicas
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Altura (cm):</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.altura || ''}
                      onChange={(e) => handleInputChange('altura', e.target.value)}
                      className="edit-input"
                      placeholder="Altura em cm"
                      min="0"
                    />
                  ) : (
                    <span>{pacienteData.altura ? `${pacienteData.altura} cm` : 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Peso (kg):</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.peso || ''}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      className="edit-input"
                      placeholder="Peso em kg"
                      min="0"
                      step="0.1"
                    />
                  ) : (
                    <span>{pacienteData.peso ? `${pacienteData.peso} kg` : 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Contato de Emergência:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.contatoEmergencia || ''}
                      onChange={(e) => handleInputChange('contatoEmergencia', e.target.value)}
                      className="edit-input"
                      placeholder="Nome e telefone do contato"
                    />
                  ) : (
                    <span>{pacienteData.contatoEmergencia || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="details-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🏠</span>
                Endereço
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>CEP:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.cep || ''}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      className="edit-input"
                      placeholder="CEP"
                    />
                  ) : (
                    <span>{pacienteData.cep || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Logradouro:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.logradouro || ''}
                      onChange={(e) => handleInputChange('logradouro', e.target.value)}
                      className="edit-input"
                      placeholder="Rua, Avenida, etc."
                    />
                  ) : (
                    <span>{pacienteData.logradouro || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Número:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.numero || ''}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      className="edit-input"
                      placeholder="Número"
                    />
                  ) : (
                    <span>{pacienteData.numero || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Complemento:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.complemento || ''}
                      onChange={(e) => handleInputChange('complemento', e.target.value)}
                      className="edit-input"
                      placeholder="Apartamento, bloco, etc."
                    />
                  ) : (
                    <span>{pacienteData.complemento || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Bairro:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.bairro || ''}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                      className="edit-input"
                      placeholder="Bairro"
                    />
                  ) : (
                    <span>{pacienteData.bairro || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Cidade:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.cidade || ''}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="edit-input"
                      placeholder="Cidade"
                    />
                  ) : (
                    <span>{pacienteData.cidade || 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>UF:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.uf || ''}
                      onChange={(e) => handleInputChange('uf', e.target.value)}
                      className="edit-input"
                      placeholder="Estado"
                      maxLength="2"
                    />
                  ) : (
                    <span>{pacienteData.uf || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Especificações Médicas */}
          <div className="details-section full-width">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🏥</span>
                Especificações Médicas
              </h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Possui Especificações:</label>
                  {isEditing ? (
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={editedData.possuiEspecificacoes || false}
                        onChange={(e) => handleInputChange('possuiEspecificacoes', e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-label">Sim, possui especificações médicas</span>
                    </div>
                  ) : (
                    <span>{pacienteData.possuiEspecificacoes ? 'Sim' : 'Não'}</span>
                  )}
                </div>
                {pacienteData.possuiEspecificacoes && (
                  <div className="info-item full-width">
                    <label>Descrição das Especificações:</label>
                    {isEditing ? (
                      <textarea
                        value={editedData.descricaoEspecificacoes || ''}
                        onChange={(e) => handleInputChange('descricaoEspecificacoes', e.target.value)}
                        className="edit-textarea"
                        placeholder="Descreva as especificações médicas do paciente"
                        rows="4"
                      />
                    ) : (
                      <div className="text-content">
                        {pacienteData.descricaoEspecificacoes || 'Nenhuma descrição fornecida'}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
