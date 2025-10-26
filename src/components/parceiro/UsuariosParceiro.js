import React, { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../../services/Usuario';
import './UsuariosParceiro.css';

const UsuariosParceiro = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pagina: 1,
    itensPorPagina: 25,
    totalItens: 0,
    totalPaginas: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para modal de cadastro
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipoPermissao: 2
  });

  // Estados para modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState('');
  const [editFormData, setEditFormData] = useState({
    codigo: '',
    situacao: 0,
    nome: '',
    email: '',
    senha: '',
    tipoPermissao: 2
  });

  // Estados para confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Debounce para busca
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const fetchUsuarios = useCallback(async (filtro = '', pagina = 1) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await usuarioService.obterUsuariosPorParceiro(pagina, pagination.itensPorPagina, filtro);
      
      console.log('📋 Response usuários:', response);
      
      if (response && response.usuarios && Array.isArray(response.usuarios)) {
        setUsuarios(response.usuarios);
        
        // Atualizar informações de paginação
        const totalItens = response.itens || 0;
        const totalPaginas = response.totalPaginas || 0;
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      } 
      else if (Array.isArray(response)) {
        setUsuarios(response);
        
        // Se não há informações de paginação na resposta, usar valores padrão
        const totalItens = response.length === 25 ? 26 : response.length; // Assumir que há mais se temos 25
        const totalPaginas = Math.ceil(totalItens / pagination.itensPorPagina);
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      }
      else {
        console.error('Formato de resposta inesperado:', response);
        setUsuarios([]);
        setPagination(prev => ({
          ...prev,
          pagina: 1,
          totalItens: 0,
          totalPaginas: 0
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários. Tente novamente.');
      setUsuarios([]);
      setPagination(prev => ({
        ...prev,
        pagina: 1,
        totalItens: 0,
        totalPaginas: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.itensPorPagina]);

  useEffect(() => {
    fetchUsuarios('', 1); // Carrega primeira página de usuários
  }, [fetchUsuarios]);

  // Função de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchUsuarios(searchValue, 1); // Reset para primeira página ao buscar
    }, 500),
    [fetchUsuarios]
  );

  // Busca quando o termo de pesquisa muda (apenas se não for a primeira carga)
  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focar no input quando expandir
      setTimeout(() => {
        const searchInput = document.querySelector('.modern-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      // Limpar busca quando colapsar
      setSearchTerm('');
    }
  };

  const handleSearchBlur = () => {
    // Só colapsar se não há texto na busca
    if (searchTerm.trim() === '') {
      setIsSearchExpanded(false);
    }
  };

  // Função para converter enum de permissão para texto
  const getTipoPermissaoText = (tipoPermissao) => {
    switch (tipoPermissao) {
      case 0:
        return 'Admin';
      case 1:
        return 'Standard';
      case 2:
        return 'Operador';
      default:
        return 'Desconhecido';
    }
  };

  // Função para obter cor da permissão
  const getTipoPermissaoColor = (tipoPermissao) => {
    switch (tipoPermissao) {
      case 0:
        return '#ef4444'; // Vermelho para Admin
      case 1:
        return '#3b82f6'; // Azul para Standard
      case 2:
        return '#10b981'; // Verde para Operador
      default:
        return '#6b7280'; // Cinza para Desconhecido
    }
  };

  // Função para converter enum de situação para texto
  const getSituacaoText = (situacao) => {
    switch (situacao) {
      case 0:
        return 'Ativo';
      case 1:
        return 'Desativo';
      case 2:
        return 'Confirmado';
      case 3:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  // Função para obter cor da situação
  const getSituacaoColor = (situacao) => {
    switch (situacao) {
      case 0: // Ativo
        return '#dcfce7'; // Verde claro
      case 1: // Desativo
        return '#fef2f2'; // Vermelho claro
      case 2: // Confirmado
        return '#dbeafe'; // Azul claro
      case 3: // Cancelado
        return '#f3f4f6'; // Cinza claro
      default:
        return '#f3f4f6'; // Cinza para Desconhecido
    }
  };

  // Função para obter cor do texto da situação
  const getSituacaoTextColor = (situacao) => {
    switch (situacao) {
      case 0: // Ativo
        return '#166534'; // Verde escuro
      case 1: // Desativo
        return '#dc2626'; // Vermelho escuro
      case 2: // Confirmado
        return '#1d4ed8'; // Azul escuro
      case 3: // Cancelado
        return '#6b7280'; // Cinza escuro
      default:
        return '#6b7280'; // Cinza para Desconhecido
    }
  };

  // Funções de paginação
  const handlePageChange = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= pagination.totalPaginas) {
      fetchUsuarios(searchTerm, novaPagina);
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(pagination.pagina - 1);
  const handleNextPage = () => handlePageChange(pagination.pagina + 1);
  const handleLastPage = () => handlePageChange(pagination.totalPaginas);

  // Funções para modal de cadastro
  const handleOpenModal = () => {
    setShowModal(true);
    setModalError('');
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipoPermissao: 2
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipoPermissao: 2
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
      setModalError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setModalLoading(true);
      setModalError('');
      
      await usuarioService.cadastrarUsuarioPorParceiro(
        formData.nome,
        formData.email,
        formData.senha,
        formData.tipoPermissao
      );
      
      // Fechar modal e recarregar lista
      handleCloseModal();
      fetchUsuarios(searchTerm, pagination.pagina);
      
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      setModalError(error.response?.data?.message || 'Erro ao cadastrar usuário. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  // Funções para modal de edição
  const handleOpenEditModal = (usuario) => {
    setShowEditModal(true);
    setEditModalError('');
    setEditFormData({
      codigo: usuario.id || usuario.codigo || '',
      situacao: usuario.situacao !== undefined ? usuario.situacao : 0,
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '', // Senha vazia para edição
      tipoPermissao: usuario.tipoPermissao || 2
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditModalError('');
    setEditFormData({
      codigo: '',
      situacao: 0,
      nome: '',
      email: '',
      senha: '',
      tipoPermissao: 2
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.nome.trim() || !editFormData.email.trim()) {
      setEditModalError('Nome e email são obrigatórios');
      return;
    }

    try {
      setEditModalLoading(true);
      setEditModalError('');
      
      await usuarioService.atualizarUsuario(
        editFormData.codigo,
        editFormData.situacao,
        editFormData.nome,
        editFormData.email,
        editFormData.senha || '', // Senha opcional na edição
        editFormData.tipoPermissao
      );
      
      // Fechar modal e recarregar lista
      handleCloseEditModal();
      fetchUsuarios(searchTerm, pagination.pagina);
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setEditModalError(error.response?.data?.message || 'Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setEditModalLoading(false);
    }
  };

  // Funções para exclusão de usuário
  const handleOpenDeleteModal = (usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUsuarioToDelete(null);
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (!usuarioToDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      const codigoUsuario = usuarioToDelete.id || usuarioToDelete.codigo;
      await usuarioService.excluirUsuario(codigoUsuario);
      
      // Fechar modal e recarregar lista
      handleCloseDeleteModal();
      fetchUsuarios(searchTerm, pagination.pagina);
      
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setDeleteError(error.response?.data?.message || 'Erro ao excluir usuário. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="usuarios-parceiro-container">
      <div className="main-content">
        {/* Integrated Header and Users Section */}
        <div className="integrated-section">
          <div className="section-header">
            <div className="header-left">
              <div className="welcome-section">
                <h1 className="welcome-title">
                  <span className="highlight">Usuários do Parceiro</span>
                  <svg className="title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <path d="M20 8v6"></path>
                    <path d="M23 11h-6"></path>
                  </svg>
                </h1>
                <p className="welcome-subtitle">Gerencie os usuários associados ao parceiro</p>
              </div>
            </div>
            <div className="header-right">
              <button 
                className="btn-secondary" 
                onClick={() => window.location.href = '/parceiro/info'}
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                  </svg>
                </span>
                Informações do Parceiro
              </button>
              <button className="btn-primary" onClick={handleOpenModal}>
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </span>
                Adicionar Usuário
              </button>
            </div>
          </div>
          
          <div className="section-controls">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6"></path>
                <path d="M23 11h-6"></path>
              </svg>
              Usuários Cadastrados
            </div>
            <div className="section-actions">
              <div className="section-count">
                {pagination.totalItens} usuário{pagination.totalItens !== 1 ? 's' : ''}
              </div>
              
              {/* Inline Search */}
              <div className="section-search">
                {!isSearchExpanded ? (
                  <button className="search-toggle-btn" onClick={toggleSearch}>
                    <svg className="search-toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span>Buscar</span>
                  </button>
                ) : (
                  <div className="search-inline">
                    <div className="search-wrapper">
                      <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <input 
                        type="text" 
                        className="modern-search-input" 
                        placeholder="Buscar por nome ou email..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        onBlur={handleSearchBlur}
                        autoFocus
                      />
                      {isLoading && (
                        <div className="search-loading">
                          <div className="loading-spinner-small"></div>
                        </div>
                      )}
                      <button className="search-close-btn" onClick={toggleSearch}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18"></path>
                          <path d="M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando usuários...</div>
            </div>
          ) : error ? (
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
            </div>
          ) : (
            <div className="users-grid">
              {usuarios.length > 0 ? (
                usuarios.map(usuario => (
                  <div key={usuario.id} className="user-card">
                    <div className="card-header">
                      <div className="user-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="user-info">
                        <h3 className="user-name">{usuario.nome}</h3>
                        <p className="user-email">{usuario.email}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-edit" 
                          title="Editar usuário"
                          onClick={() => handleOpenEditModal(usuario)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-delete" 
                          title="Excluir usuário"
                          onClick={() => handleOpenDeleteModal(usuario)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="info-grid">
                        <div className="info-item">
                          <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 12l2 2 4-4"></path>
                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                              <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
                            </svg>
                          </div>
                          <div className="info-content">
                            <span className="info-label">Permissão</span>
                            <span 
                              className="info-value permission-badge"
                              style={{ 
                                backgroundColor: getTipoPermissaoColor(usuario.tipoPermissao),
                                color: 'white'
                              }}
                            >
                              {getTipoPermissaoText(usuario.tipoPermissao)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                          </div>
                          <div className="info-content">
                            <span className="info-label">Status</span>
                            <span 
                              className="info-value status-badge"
                              style={{ 
                                backgroundColor: getSituacaoColor(usuario.situacao),
                                color: getSituacaoTextColor(usuario.situacao)
                              }}
                            >
                              {getSituacaoText(usuario.situacao)}
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="empty-title">Nenhum usuário encontrado</h3>
                  <p className="empty-description">
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Adicione o primeiro usuário do parceiro'}
                  </p>
                  {!searchTerm && (
                    <button className="btn-primary" onClick={handleOpenModal}>
                      <span className="btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                      </span>
                      Adicionar Primeiro Usuário
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Controles de Paginação */}
          {!isLoading && usuarios.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span className="pagination-text">
                  Página {pagination.pagina} de {pagination.totalPaginas} 
                  ({pagination.totalItens} usuário{pagination.totalItens !== 1 ? 's' : ''} total)
                </span>
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  onClick={handleFirstPage}
                  disabled={pagination.pagina === 1 || pagination.totalPaginas <= 1}
                  title="Primeira página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11,17 6,12 11,7"></polyline>
                    <polyline points="18,17 13,12 18,7"></polyline>
                  </svg>
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={pagination.pagina === 1 || pagination.totalPaginas <= 1}
                  title="Página anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPaginas) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPaginas <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.pagina <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.pagina >= pagination.totalPaginas - 2) {
                      pageNum = pagination.totalPaginas - 4 + i;
                    } else {
                      pageNum = pagination.pagina - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${pagination.pagina === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={pagination.pagina === pagination.totalPaginas || pagination.totalPaginas <= 1}
                  title="Próxima página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handleLastPage}
                  disabled={pagination.pagina === pagination.totalPaginas || pagination.totalPaginas <= 1}
                  title="Última página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13,17 18,12 13,7"></polyline>
                    <polyline points="6,17 11,12 6,7"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </span>
                Cadastrar Novo Usuário
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
            
              <form onSubmit={handleSubmit}>
                {modalError && (
                  <div className="error-message general-error">{modalError}</div>
                )}
                
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo*</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="usuario@parceiro.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="senha">Senha*</label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Digite a senha"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tipoPermissao">Tipo de Permissão</label>
                  <select
                    id="tipoPermissao"
                    name="tipoPermissao"
                    value={formData.tipoPermissao}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Usuário</option>
                    <option value={3}>Visualizador</option>
                  </select>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    <span className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={modalLoading}>
                    <span className="btn-icon">
                      {modalLoading ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                      )}
                    </span>
                    {modalLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </span>
                Editar Usuário
              </h2>
              <button className="btn-close" onClick={handleCloseEditModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
            
              <form onSubmit={handleEditSubmit}>
                {editModalError && (
                  <div className="error-message general-error">{editModalError}</div>
                )}
                
                <div className="form-group">
                  <label htmlFor="edit-nome">Nome Completo*</label>
                  <input
                    type="text"
                    id="edit-nome"
                    name="nome"
                    value={editFormData.nome}
                    onChange={handleEditInputChange}
                    className="form-input"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-email">Email*</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="form-input"
                    placeholder="usuario@parceiro.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-senha">Nova Senha (deixe em branco para manter a atual)</label>
                  <input
                    type="password"
                    id="edit-senha"
                    name="senha"
                    value={editFormData.senha}
                    onChange={handleEditInputChange}
                    className="form-input"
                    placeholder="Digite a nova senha (opcional)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-tipoPermissao">Tipo de Permissão</label>
                  <select
                    id="edit-tipoPermissao"
                    name="tipoPermissao"
                    value={editFormData.tipoPermissao}
                    onChange={handleEditInputChange}
                    className="form-select"
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Usuário</option>
                    <option value={3}>Visualizador</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-situacao">Situação</label>
                  <select
                    id="edit-situacao"
                    name="situacao"
                    value={editFormData.situacao}
                    onChange={handleEditInputChange}
                    className="form-select"
                  >
                    <option value={0}>Ativo</option>
                    <option value={1}>Desativo</option>
                    <option value={2}>Confirmado</option>
                    <option value={3}>Cancelado</option>
                  </select>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseEditModal}>
                    <span className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={editModalLoading}>
                    <span className="btn-icon">
                      {editModalLoading ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      )}
                    </span>
                    {editModalLoading ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Modal de Confirmação de Exclusão */}
      {showDeleteModal && usuarioToDelete && (
        <div className="modal-overlay">
          <div className="modal-popup delete-modal">
            <div className="modal-popup-header">
              <h3>Excluir Usuário</h3>
              <button 
                className="btn-close"
                onClick={handleCloseDeleteModal}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-popup-body">
              <div className="warning-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p>Tem certeza que deseja excluir permanentemente o usuário <strong>{usuarioToDelete.nome}</strong>?</p>
              <p className="warning-text">Esta ação não pode ser desfeita.</p>
              
              {deleteError && (
                <div className="error-message general-error">{deleteError}</div>
              )}
            </div>
            <div className="modal-popup-footer">
              <button 
                className="btn-secondary"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                Cancelar
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                <span className="btn-icon">
                  {deleteLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  )}
                </span>
                {deleteLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosParceiro;