import React, { useState, useEffect } from 'react';
import { usuarioService } from '../../services/Usuario';
import './UsuariosParceiro.css';

const UsuariosParceiro = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usuarioService.obterUsuariosPorParceiro(paginaAtual, 25);
      setUsuarios(response.usuarios);
      setTotalPaginas(response.totalPaginas);
    } catch (err) {
      setError('Erro ao carregar usuários. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [paginaAtual]);

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
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
                <span className="highlight">Usuários do Parceiro</span> 👥
              </h1>
              <p className="welcome-subtitle">
                Gerencie os usuários associados ao parceiro
              </p>
            </div>
            <div className="header-actions">
              <button className="modern-add-button">
                <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Adicionar Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {usuarios.length > 0 && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{usuarios.length}</div>
                <div className="stat-label">Usuário{usuarios.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            {totalPaginas > 1 && (
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{totalPaginas}</div>
                  <div className="stat-label">Página{totalPaginas !== 1 ? 's' : ''}</div>
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

          {loading ? (
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
                          className="action-btn edit-btn" 
                          title="Editar usuário"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          title="Excluir usuário"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
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
                  <button className="empty-action">
                    Adicionar Primeiro Usuário
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {usuarios.length > 0 && totalPaginas > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span>Mostrando página {paginaAtual} de {totalPaginas}</span>
              </div>
              <div className="pagination">
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className="pagination-btn pagination-nav"
                  title="Página anterior"
                >
                  ‹
                </button>
                
                <span className="pagination-current">
                  {paginaAtual} de {totalPaginas}
                </span>
                
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className="pagination-btn pagination-nav"
                  title="Próxima página"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosParceiro;