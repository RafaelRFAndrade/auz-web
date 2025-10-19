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
    situacao: 1,
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
      situacao: usuario.situacao || 1,
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
      situacao: 1,
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
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Parceiro</span> 👥
              </h1>
              <p className="welcome-subtitle">
                Gerencie os usuários associados ao parceiro
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary" 
                onClick={() => window.location.href = '/parceiro/info'}
              >
                <span className="btn-icon">🏢</span>
                Informações do Parceiro
              </button>
              <button className="btn-primary" onClick={handleOpenModal}>
                <span className="btn-icon">👤➕</span>
                Adicionar Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Buscar usuários por nome ou email..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              {isLoading && (
                <div className="search-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {pagination.totalItens > 0 && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{pagination.totalItens}</div>
                <div className="stat-label">Usuário{pagination.totalItens !== 1 ? 's' : ''} Total</div>
              </div>
            </div>
            {pagination.totalPaginas > 1 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{pagination.totalPaginas}</div>
                  <div className="stat-label">Página{pagination.totalPaginas !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        <div className="users-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Lista de Usuários
            </div>
            <div className="section-count">
              {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando...</div>
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
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          title="Excluir usuário"
                          onClick={() => handleOpenDeleteModal(usuario)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4"></path>
                          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                          <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                          <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
                        </svg>
                        <span className="info-label">Permissão:</span>
                        <span className="info-value">{usuario.tipoPermissao}</span>
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
                    Adicione o primeiro usuário do parceiro
                  </p>
                  <button className="btn-primary" onClick={handleOpenModal}>
                    <span className="btn-icon">👤➕</span>
                    Adicionar Primeiro Usuário
                  </button>
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
                  disabled={pagination.pagina === 1}
                  title="Primeira página"
                >
                  ⏮️
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={pagination.pagina === 1}
                  title="Página anterior"
                >
                  ⏪
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
                  disabled={pagination.pagina === pagination.totalPaginas}
                  title="Próxima página"
                >
                  ⏩
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handleLastPage}
                  disabled={pagination.pagina === pagination.totalPaginas}
                  title="Última página"
                >
                  ⏭️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro de Usuário */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">👤➕</span>
                Cadastrar Novo Usuário
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nome" className="form-label">
                  Nome Completo *
                </label>
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
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha" className="form-label">
                  Senha *
                </label>
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
                <label htmlFor="tipoPermissao" className="form-label">
                  Tipo de Permissão
                </label>
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

              {modalError && (
                <div className="modal-error">
                  <span className="error-icon">⚠️</span>
                  {modalError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">👤➕</span>
                      Cadastrar Usuário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Usuário */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">✏️</span>
                Editar Usuário
              </h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-nome" className="form-label">
                  Nome Completo *
                </label>
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
                <label htmlFor="edit-email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="form-input"
                  placeholder="Digite o email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-senha" className="form-label">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
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
                <label htmlFor="edit-tipoPermissao" className="form-label">
                  Tipo de Permissão
                </label>
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
                <label htmlFor="edit-situacao" className="form-label">
                  Situação
                </label>
                <select
                  id="edit-situacao"
                  name="situacao"
                  value={editFormData.situacao}
                  onChange={handleEditInputChange}
                  className="form-select"
                >
                  <option value={1}>Ativo</option>
                  <option value={2}>Inativo</option>
                </select>
              </div>

              {editModalError && (
                <div className="modal-error">
                  <span className="error-icon">⚠️</span>
                  {editModalError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseEditModal}
                  disabled={editModalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editModalLoading}
                >
                  {editModalLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && usuarioToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">🗑️</span>
                Confirmar Exclusão
              </h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-form">
              <div className="delete-warning">
                <div className="warning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                  </svg>
                </div>
                <h3 className="warning-title">Tem certeza que deseja excluir este usuário?</h3>
                <p className="warning-message">
                  Esta ação não pode ser desfeita. O usuário <strong>{usuarioToDelete.nome}</strong> será permanentemente removido do sistema.
                </p>
              </div>

              {deleteError && (
                <div className="modal-error">
                  <span className="error-icon">⚠️</span>
                  {deleteError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🗑️</span>
                      Sim, Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosParceiro;