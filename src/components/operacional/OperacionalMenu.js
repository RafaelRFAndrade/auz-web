import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { operacionalService } from '../../services/Operacional';
import Loading from '../custom/Loading';
import './OperacionalMenu.css';

const OperacionalMenu = () => {
  const [relacionamentos, setRelacionamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    carregarRelacionamentos();
  }, []);

  const carregarRelacionamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await operacionalService.obterRelacionamentos(1, 10);
      setRelacionamentos(response.medicoUsuario || []);
    } catch (error) {
      console.error('Erro ao carregar relacionamentos:', error);
      setError('Erro ao carregar relacionamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selecionarRelacionamento = (codigo, nomeMedico) => {
    navigate(`/operacional/${codigo}`, { 
      state: { 
        nomeMedico,
        codigoMedicoUsuarioOperacional: codigo 
      }
    });
  };

  const filteredRelacionamentos = relacionamentos.filter(rel => {
    const matchesSearch = rel.nomeMedico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && rel.ativo) || 
      (filterStatus === 'inactive' && !rel.ativo);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="operacional-menu-container">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h3>Carregando relacionamentos...</h3>
            <p>Aguarde enquanto buscamos seus dados</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="operacional-menu-container">
        <div className="error-state">
          <div className="error-content">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2>Ops! Algo deu errado</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={carregarRelacionamentos}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4a9,9,0,0,1-14.85,3.36L23,14"/>
              </svg>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (relacionamentos.length === 0) {
    return (
      <div className="operacional-menu-container">
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20,21v-2a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M16,3.13a4,4,0,0,1,0,7.75"/>
                <path d="M6,21v-2a4,4,0,0,1,4-4h.5"/>
              </svg>
            </div>
            <h2>Nenhum relacionamento encontrado</h2>
            <p>Você não possui relacionamentos médicos cadastrados no momento.</p>
            <button 
              className="refresh-button"
              onClick={carregarRelacionamentos}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4a9,9,0,0,1-14.85,3.36L23,14"/>
              </svg>
              Atualizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="operacional-menu-container">
      {/* Header com gradiente moderno */}
      <div className="menu-header">
        <div className="header-background">
          <div className="header-content">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12,2L2,7l10,5,10-5L12,2z"/>
                <path d="M2,17l10,5,10-5"/>
                <path d="M2,12l10,5,10-5"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>Menu Operacional</h1>
              <p>Gerencie seus relacionamentos médicos de forma eficiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21,21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos ({relacionamentos.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Ativos ({relacionamentos.filter(r => r.ativo).length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Inativos ({relacionamentos.filter(r => !r.ativo).length})
          </button>
        </div>
      </div>

      {/* Grid de relacionamentos */}
      <div className="relacionamentos-grid">
        {filteredRelacionamentos.map((relacionamento, index) => (
          <div
            key={relacionamento.codigo}
            className="relacionamento-card"
            onClick={() => selecionarRelacionamento(relacionamento.codigo, relacionamento.nomeMedico)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="card-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <div className="medico-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20,21v-2a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="card-info">
                  <h3>{relacionamento.nomeMedico}</h3>
                  <div className={`status-badge ${relacionamento.ativo ? 'active' : 'inactive'}`}>
                    <div className="status-dot"></div>
                    {relacionamento.ativo ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-row">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Criado em</span>
                    <span className="detail-value">
                      {new Date(relacionamento.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {relacionamento.ultimaAtualizacao && (
                  <div className="detail-row">
                    <div className="detail-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12,1v6m0,6v6m11-7h-6m-6,0H1"/>
                      </svg>
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Última atualização</span>
                      <span className="detail-value">
                        {new Date(relacionamento.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-action">
                <button className="select-button">
                  <span>Operar Relacionamento</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer com estatísticas */}
      <div className="menu-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-number">{relacionamentos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{relacionamentos.filter(r => r.ativo).length}</span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredRelacionamentos.length}</span>
            <span className="stat-label">Filtrados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperacionalMenu;
