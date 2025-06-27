// src/pages/Atendimentos.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import './Appointments.css';
import Alert from '../../components/custom/Alert';
import logo from '../../logo.png';

const Atendimentos = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [atendimentos, setAtendimentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        const homeData = await usuarioService.getHome();
        setUserData({ name: homeData.nomeUsuario });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };
    fetchUserData();
    fetchAtendimentos(1);
  }, [navigate]);

  const fetchAtendimentos = async (pagina) => {
    try {
      setIsLoading(true);
  
      let response = await atendimentoService.getAtendimentos(pagina, 25);
  
      setAtendimentos(response.Atendimentos || []);
      setTotalPaginas(response.TotalPaginas || 1);
      setTotalItens(response.Itens || 0);
      setPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      showAlert('error', 'Erro', JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (novaPagina) => {
    if (novaPagina !== paginaAtual && novaPagina >= 1 && novaPagina <= totalPaginas) {
      fetchAtendimentos(novaPagina);
    }
  };

  const getFirstLetters = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
  };

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/login');
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return '---';
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Calcular o range de botões a serem exibidos
    let startPage = Math.max(1, paginaAtual - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPaginas, startPage + maxVisibleButtons - 1);
    
    // Ajustar o início se necessário
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Botão "Primeira página"
    if (startPage > 1) {
      buttons.push(
        <button key="first" onClick={() => handlePageChange(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Botões do range atual
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${paginaAtual === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Botão "Última página"
    if (endPage < totalPaginas) {
      if (endPage < totalPaginas - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      buttons.push(
        <button key="last" onClick={() => handlePageChange(totalPaginas)} className="pagination-btn">
          {totalPaginas}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo-sidebar">
          <img src={logo} alt="AUZ" className="logo-img" />
        </div>

        <a href="#" className={`menu-item`} onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}>
          <span className="menu-item-text">Início</span>
        </a>

        <a href="#" className={`menu-item`} onClick={(e) => { e.preventDefault(); handleNavigation('patients'); }}>
          <span className="menu-item-text">Pacientes</span>
        </a>

        <a href="#" className={`menu-item active`} onClick={(e) => { e.preventDefault(); handleNavigation('atendimentos'); }}>
          <span className="menu-item-text">Atendimentos</span>
        </a>

        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">{getFirstLetters(userData.name)}</div>
            <div className="user-name">{userData.name}</div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Sair">Sair</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Atendimentos</div>
          {totalItens > 0 && (
            <div className="page-subtitle">
              Total de {totalItens} atendimento{totalItens !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Carregando...</div>
          </div>
        ) : (
          <div className="patients-grid">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Data Inclusão</th>
                  <th>Data Situação</th>
                </tr>
              </thead>
              <tbody>
                {atendimentos.length > 0 ? (
                  atendimentos.map(item => (
                    <tr key={item.CodigoAtendimento}>
                      <td className="description-cell">{item.Descricao}</td>
                      <td className="patient-name">{item.NomePaciente}</td>
                      <td className="doctor-name">{item.NomeMedico}</td>
                      <td>{formatDate(item.DtInclusao)}</td>
                      <td>{formatDate(item.DtSituacao)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      Nenhum atendimento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Página {paginaAtual} de {totalPaginas}
                </div>
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="pagination-btn pagination-nav"
                  >
                    ← Anterior
                  </button>
                  
                  {renderPaginationButtons()}
                  
                  <button
                    onClick={() => handlePageChange(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="pagination-btn pagination-nav"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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

export default Atendimentos;