import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import './ParceiroInfo.css';
import Alert from '../../components/custom/Alert';

const ParceiroInfo = () => {
  const navigate = useNavigate();
  const [parceiro, setParceiro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  
  // Estados para foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  // Funções para gerenciar foto de perfil
  const carregarFotoPerfil = async (codigoParceiro) => {
    try {
      // Implementar carregamento de foto se necessário
      setFotoPerfil(null);
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
      
      // Implementar upload de foto se necessário
      // await parceiroService.uploadFotoPerfil(parceiro.codigo, file);
      // await carregarFotoPerfil(parceiro.codigo);
      
      setShowUploadModal(false);
      showAlert('success', 'Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      let errorMessage = 'Erro desconhecido';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  useEffect(() => {
  const fetchParceiroInfo = async () => {
    try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

      setIsLoading(true);
      const response = await usuarioService.obterParceiro();
      setParceiro(response);
        
        if (response && response.codigo) {
          await carregarFotoPerfil(response.codigo);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do parceiro:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        } else {
          showAlert('error', 'Erro', 'Erro ao carregar informações do parceiro: ' + (error.response?.data?.message || error.message));
        }
    } finally {
      setIsLoading(false);
    }
  };

    fetchParceiroInfo();
  }, [navigate]);

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

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '---';
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length === 14) {
      return cnpjNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
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
    return situacao === 1 ? 'Ativo' : 'Inativo';
  };

  const getSituacaoClass = (situacao) => {
    return situacao === 1 ? 'status-active' : 'status-inactive';
  };

  // Funções para edição
  const handleEdit = () => {
    if (parceiro) {
      setEditedData({
        codigo: parceiro.codigo,
        nome: parceiro.nome || '',
        razaoSocial: parceiro.razaoSocial || '',
        cnpj: parceiro.cnpj || '',
        cep: parceiro.cep || '',
        logradouro: parceiro.logradouro || '',
        numero: parceiro.numero || '',
        complemento: parceiro.complemento || '',
        bairro: parceiro.bairro || '',
        cidade: parceiro.cidade || '',
        uf: parceiro.uf || '',
        telefone: parceiro.telefone || '',
        email: parceiro.email || ''
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
    
    if (editedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
      errors.push('Email deve ter um formato válido');
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
      
      // Limpar CNPJ antes de enviar
      const cnpjLimpo = editedData.cnpj ? editedData.cnpj.replace(/\D/g, '') : '';
      
      await usuarioService.atualizarParceiro(
        editedData.codigo,
        editedData.nome,
        editedData.razaoSocial,
        cnpjLimpo,
        editedData.cep,
        editedData.logradouro,
        editedData.numero,
        editedData.complemento,
        editedData.bairro,
        editedData.cidade,
        editedData.uf,
        editedData.telefone,
        editedData.email
      );
      
      setParceiro(prev => ({
        ...prev,
        ...editedData
      }));
      
      setIsEditing(false);
      setEditedData({});
      showAlert('success', 'Sucesso', 'Dados do parceiro atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      showAlert('error', 'Erro', 'Erro ao atualizar dados do parceiro: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="parceiro-info-container">
        <div className="simple-loading">
          <div className="simple-spinner"></div>
          <p>Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (!parceiro) {
    return (
      <div className="parceiro-info-container">
        <div className="error-state">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Parceiro não encontrado</h3>
          <p>As informações do parceiro não foram encontradas.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="parceiro-info-container">
      <div className="main-content">
        {/* Modern Header */}
        <div className="details-header">
          <div className="header-background"></div>
          <div className="header-content">
            <div className="header-left">
              <button 
                className="btn-back" 
                onClick={() => navigate('/')}
                title="Voltar ao início"
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
                      alt={`Foto de ${parceiro.nome}`}
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 21h18"></path>
                        <path d="M5 21V7l8-4v18"></path>
                        <path d="M19 21V11l-6-4"></path>
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
                  <h1 className="profile-name">{parceiro.nome}</h1>
                  <p className="profile-codigo">Código: {parceiro.codigo}</p>
                  <div className={`status-badge ${getSituacaoClass(parceiro.situacao)}`}>
                    <div className="status-dot"></div>
                    {getSituacaoText(parceiro.situacao)}
                  </div>
                  </div>
                </div>
              </div>

            <div className="header-right">
              {!isEditing ? (
                <button
                  className="btn-edit" 
                  onClick={handleEdit}
                  title="Editar dados do parceiro"
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
                    <label>Nome</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.nome || ''}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className="edit-input"
                        placeholder="Nome do parceiro"
                      />
                    ) : (
                      <span>{parceiro.nome || 'N/A'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Situação</label>
                    <span className={`status ${getSituacaoClass(parceiro.situacao)}`}>
                      {getSituacaoText(parceiro.situacao)}
                    </span>
                  </div>

                  <div className="info-item">
                    <label>Data de Inclusão</label>
                    <span>{formatDate(parceiro.dtInclusao)}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Data da Situação</label>
                    <span>{formatDate(parceiro.dtSituacao)}</span>
                  </div>
                  </div>
                </div>
              </div>

            {/* Informações da Empresa */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18"></path>
                      <path d="M5 21V7l8-4v18"></path>
                      <path d="M19 21V11l-6-4"></path>
                    </svg>
                  </div>
                <h2>Informações da Empresa</h2>
                </div>
                <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Razão Social</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.razaoSocial || ''}
                        onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                        className="edit-input"
                        placeholder="Razão social"
                      />
                    ) : (
                      <span>{parceiro.razaoSocial || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>CNPJ</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.cnpj || ''}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        className="edit-input"
                        placeholder="CNPJ"
                      />
                    ) : (
                      <span>{formatCNPJ(parceiro.cnpj)}</span>
                    )}
                  </div>
                  </div>
                </div>
              </div>

            {/* Contato */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                <h2>Contato</h2>
                </div>
                <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="edit-input"
                        placeholder="Email"
                      />
                    ) : (
                      <span>{parceiro.email || 'Não informado'}</span>
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
                        placeholder="Telefone"
                      />
                    ) : (
                      <span>{formatPhone(parceiro.telefone)}</span>
                    )}
                  </div>
                  </div>
                </div>
              </div>

            {/* Endereço */}
            <div className="info-card full-width">
                <div className="card-header">
                  <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                <h2>Endereço</h2>
                </div>
                <div className="card-content">
                <div className="info-grid address-grid">
                  <div className="info-item">
                    <label>CEP</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.cep || ''}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        className="edit-input"
                        placeholder="CEP"
                      />
                    ) : (
                      <span>{parceiro.cep || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Logradouro</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.logradouro || ''}
                        onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        className="edit-input"
                        placeholder="Logradouro"
                      />
                    ) : (
                      <span>{parceiro.logradouro || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Número</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.numero || ''}
                        onChange={(e) => handleInputChange('numero', e.target.value)}
                        className="edit-input"
                        placeholder="Número"
                      />
                    ) : (
                      <span>{parceiro.numero || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Complemento</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.complemento || ''}
                        onChange={(e) => handleInputChange('complemento', e.target.value)}
                        className="edit-input"
                        placeholder="Complemento"
                      />
                    ) : (
                      <span>{parceiro.complemento || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Bairro</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.bairro || ''}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        className="edit-input"
                        placeholder="Bairro"
                      />
                    ) : (
                      <span>{parceiro.bairro || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>Cidade</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.cidade || ''}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        className="edit-input"
                        placeholder="Cidade"
                      />
                    ) : (
                      <span>{parceiro.cidade || 'Não informado'}</span>
                    )}
                  </div>
                  
                  <div className="info-item">
                    <label>UF</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.uf || ''}
                        onChange={(e) => handleInputChange('uf', e.target.value)}
                        className="edit-input"
                        placeholder="UF"
                        maxLength="2"
                      />
                    ) : (
                      <span>{parceiro.uf || 'Não informado'}</span>
                    )}
                  </div>
                </div>
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
                        <path d="M3 21h18"></path>
                        <path d="M5 21V7l8-4v18"></path>
                        <path d="M19 21V11l-6-4"></path>
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

export default ParceiroInfo;
