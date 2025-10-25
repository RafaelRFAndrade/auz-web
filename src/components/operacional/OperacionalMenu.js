import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { operacionalService } from '../../services/Operacional';
import Loading from '../custom/Loading';
import './OperacionalMenu.css';

const OperacionalMenu = () => {
  const [relacionamentos, setRelacionamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) {
    return (
      <div className="operacional-menu-container">
        <Loading text="Carregando relacionamentos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="operacional-menu-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erro ao carregar relacionamentos</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={carregarRelacionamentos}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (relacionamentos.length === 0) {
    return (
      <div className="operacional-menu-container">
        <div className="empty-container">
          <div className="empty-icon">👨‍⚕️</div>
          <h2>Nenhum relacionamento encontrado</h2>
          <p>Você não possui relacionamentos médicos cadastrados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="operacional-menu-container">
      <div className="menu-header">
        <h1>Menu Operacional</h1>
        <p>Selecione o relacionamento médico que deseja operar</p>
      </div>

      <div className="relacionamentos-grid">
        {relacionamentos.map((relacionamento) => (
          <div
            key={relacionamento.codigo}
            className="relacionamento-card"
            onClick={() => selecionarRelacionamento(relacionamento.codigo, relacionamento.nomeMedico)}
          >
            <div className="card-header">
              <div className="medico-icon">👨‍⚕️</div>
              <div className="card-info">
                <h3>{relacionamento.nomeMedico}</h3>
                <p className="codigo">Código: {relacionamento.codigo}</p>
              </div>
            </div>
            
            <div className="card-details">
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status ${relacionamento.ativo ? 'ativo' : 'inativo'}`}>
                  {relacionamento.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="label">Criado em:</span>
                <span className="value">
                  {new Date(relacionamento.dataCriacao).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {relacionamento.ultimaAtualizacao && (
                <div className="detail-item">
                  <span className="label">Última atualização:</span>
                  <span className="value">
                    {new Date(relacionamento.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="card-action">
              <button className="select-button">
                Operar Relacionamento
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="menu-footer">
        <p>Total de relacionamentos: {relacionamentos.length}</p>
      </div>
    </div>
  );
};

export default OperacionalMenu;
