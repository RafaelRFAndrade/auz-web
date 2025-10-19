import React, { useState, useEffect } from 'react';
import { usuarioService } from '../../services/Usuario';
import './ParceiroInfo.css';

const ParceiroInfo = () => {
  const [parceiro, setParceiro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para modo de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFormData, setEditFormData] = useState({
    codigo: '',
    nome: '',
    razaoSocial: '',
    cnpj: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    telefone: '',
    email: ''
  });

  useEffect(() => {
    fetchParceiroInfo();
  }, []);

  const fetchParceiroInfo = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await usuarioService.obterParceiro();
      setParceiro(response);
    } catch (err) {
      console.error('Erro ao buscar informações do parceiro:', err);
      setError('Erro ao carregar informações do parceiro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSituacaoText = (situacao) => {
    return situacao === 1 ? 'Ativo' : 'Inativo';
  };

  const getSituacaoClass = (situacao) => {
    return situacao === 1 ? 'status-active' : 'status-inactive';
  };

  // Função para formatar CNPJ para exibição
  const formatCNPJForDisplay = (cnpj) => {
    if (!cnpj) return 'Não informado';
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj; // Retorna como está se não tiver 14 dígitos
  };

  // Funções para edição
  const handleEditClick = () => {
    if (parceiro) {
      setEditFormData({
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
      setEditError('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
    setEditFormData({
      codigo: '',
      nome: '',
      razaoSocial: '',
      cnpj: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      telefone: '',
      email: ''
    });
  };

  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar formatação para CNPJ
    let formattedValue = value;
    if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Função para limpar CNPJ (remover formatação)
  const cleanCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/\D/g, ''); // Remove tudo que não é dígito
  };

  const handleSaveEdit = async () => {
    if (!editFormData.nome.trim()) {
      setEditError('Nome é obrigatório');
      return;
    }

    try {
      setEditLoading(true);
      setEditError('');
      
      // Limpar CNPJ antes de enviar
      const cnpjLimpo = cleanCNPJ(editFormData.cnpj);
      
      await usuarioService.atualizarParceiro(
        editFormData.codigo,
        editFormData.nome,
        editFormData.razaoSocial,
        cnpjLimpo, // CNPJ limpo (apenas números)
        editFormData.cep,
        editFormData.logradouro,
        editFormData.numero,
        editFormData.complemento,
        editFormData.bairro,
        editFormData.cidade,
        editFormData.uf,
        editFormData.telefone,
        editFormData.email
      );
      
      // Recarregar dados e sair do modo de edição
      await fetchParceiroInfo();
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      setEditError(error.response?.data?.message || 'Erro ao atualizar informações. Tente novamente.');
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="parceiro-info-container">
        <div className="loading-container">
          <div className="loading-spinner">Carregando informações...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parceiro-info-container">
        <div className="error-container">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 className="error-title">Erro ao carregar</h3>
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={fetchParceiroInfo}>
            <span className="btn-icon">🔄</span>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="parceiro-info-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Informações do Parceiro</span> 🏢
              </h1>
              <p className="welcome-subtitle">
                Visualize as informações detalhadas do parceiro
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary" 
                onClick={() => window.history.back()}
              >
                <span className="btn-icon">←</span>
                Voltar
              </button>
              {!isEditing && (
                <button 
                  className="btn-primary" 
                  onClick={handleEditClick}
                >
                  <span className="btn-icon">✏️</span>
                  Editar Informações
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Parceiro Information */}
        <div className="parceiro-info-section">
          {isEditing ? (
            <div className="edit-form-container">
              <div className="edit-form-header">
                <h3 className="edit-form-title">
                  <span className="edit-icon">✏️</span>
                  Editar Informações do Parceiro
                </h3>
                <p className="edit-form-subtitle">
                  Atualize as informações do parceiro conforme necessário
                </p>
              </div>

              {editError && (
                <div className="edit-error">
                  <span className="error-icon">⚠️</span>
                  {editError}
                </div>
              )}

              <div className="edit-form-grid">
                {/* Basic Information */}
                <div className="edit-form-section">
                  <h4 className="section-title">Informações Básicas</h4>
                  <div className="form-group">
                    <label className="form-label">Nome *</label>
                    <input
                      type="text"
                      name="nome"
                      value={editFormData.nome}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Digite o nome do parceiro"
                      required
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div className="edit-form-section">
                  <h4 className="section-title">Informações da Empresa</h4>
                  <div className="form-group">
                    <label className="form-label">Razão Social</label>
                    <input
                      type="text"
                      name="razaoSocial"
                      value={editFormData.razaoSocial}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Digite a razão social"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CNPJ</label>
                    <input
                      type="text"
                      name="cnpj"
                      value={editFormData.cnpj}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Digite o CNPJ"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="edit-form-section">
                  <h4 className="section-title">Contato</h4>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Digite o email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={editFormData.telefone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Digite o telefone"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="edit-form-section full-width">
                  <h4 className="section-title">Endereço</h4>
                  <div className="address-form-grid">
                    <div className="form-group">
                      <label className="form-label">CEP</label>
                      <input
                        type="text"
                        name="cep"
                        value={editFormData.cep}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite o CEP"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Logradouro</label>
                      <input
                        type="text"
                        name="logradouro"
                        value={editFormData.logradouro}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite o logradouro"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Número</label>
                      <input
                        type="text"
                        name="numero"
                        value={editFormData.numero}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite o número"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Complemento</label>
                      <input
                        type="text"
                        name="complemento"
                        value={editFormData.complemento}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite o complemento"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bairro</label>
                      <input
                        type="text"
                        name="bairro"
                        value={editFormData.bairro}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite o bairro"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cidade</label>
                      <input
                        type="text"
                        name="cidade"
                        value={editFormData.cidade}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite a cidade"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">UF</label>
                      <input
                        type="text"
                        name="uf"
                        value={editFormData.uf}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Digite a UF"
                        maxLength="2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="edit-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              {/* Basic Information */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="card-title">Informações Básicas</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <div className="info-label">Nome</div>
                    <div className="info-value">{parceiro.nome}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Código</div>
                    <div className="info-value code">{parceiro.codigo}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Situação</div>
                    <div className={`info-value status ${getSituacaoClass(parceiro.situacao)}`}>
                      {getSituacaoText(parceiro.situacao)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates Information */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <h3 className="card-title">Datas</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <div className="info-label">Data de Inclusão</div>
                    <div className="info-value">{formatDate(parceiro.dtInclusao)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Data da Situação</div>
                    <div className="info-value">{formatDate(parceiro.dtSituacao)}</div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"></path>
                      <path d="M5 21V7l8-4v18"></path>
                      <path d="M19 21V11l-6-4"></path>
                    </svg>
                  </div>
                  <h3 className="card-title">Informações da Empresa</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <div className="info-label">Razão Social</div>
                    <div className="info-value">{parceiro.razaoSocial || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">CNPJ</div>
                    <div className="info-value">{formatCNPJForDisplay(parceiro.cnpj)}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <h3 className="card-title">Contato</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{parceiro.email || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Telefone</div>
                    <div className="info-value">{parceiro.telefone || 'Não informado'}</div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3 className="card-title">Endereço</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <div className="info-label">CEP</div>
                    <div className="info-value">{parceiro.cep || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Logradouro</div>
                    <div className="info-value">{parceiro.logradouro || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Número</div>
                    <div className="info-value">{parceiro.numero || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Complemento</div>
                    <div className="info-value">{parceiro.complemento || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Bairro</div>
                    <div className="info-value">{parceiro.bairro || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Cidade</div>
                    <div className="info-value">{parceiro.cidade || 'Não informado'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">UF</div>
                    <div className="info-value">{parceiro.uf || 'Não informado'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParceiroInfo;
