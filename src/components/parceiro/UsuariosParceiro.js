import React, { useState, useEffect } from 'react';
import { usuarioService } from '../../services/Usuario';
import './UsuariosParceiro.css';

const UsuariosParceiro = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const registrosPorPagina = 25; // Quantidade máxima de registros por página

  const carregarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usuarioService.obterUsuariosPorParceiro(paginaAtual, registrosPorPagina);
      setUsuarios(response.usuarios || []);
      setTotalRegistros(response.totalRegistros || response.total || 0);
      
      // Calcula o número total de páginas: total de registros ÷ registros por página (arredondado para cima)
      const totalRegistrosResponse = response.totalRegistros || response.total || 0;
      const paginasCalculadas = Math.ceil(totalRegistrosResponse / registrosPorPagina);
      setTotalPaginas(paginasCalculadas);
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
              <button className="btn-primary">
                <span className="btn-icon">👤➕</span>
                Adicionar Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {totalRegistros > 0 && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalRegistros}</div>
                <div className="stat-label">Usuário{totalRegistros !== 1 ? 's' : ''} Total</div>
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
                          className="btn-edit" 
                          title="Editar usuário"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          title="Excluir usuário"
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
                  <button className="btn-primary">
                    <span className="btn-icon">👤➕</span>
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
                <span className="total-items">Total: {totalRegistros} usuários</span>
              </div>
              <div className="pagination">
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className="btn-pagination btn-pagination-nav"
                  title="Página anterior"
                >
                  ⏪
                </button>
                
                <span className="pagination-current">
                  {paginaAtual} de {totalPaginas}
                </span>
                
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className="btn-pagination btn-pagination-nav"
                  title="Próxima página"
                >
                  ⏩
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