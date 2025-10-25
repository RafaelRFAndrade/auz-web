import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { operacionalService } from '../../services/Operacional';
import Loading from '../custom/Loading';
import './Operacional.css';

const Operacional = () => {
  const { codigoMedico } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [errorAgendamentos, setErrorAgendamentos] = useState(null);
  const [errorPacientes, setErrorPacientes] = useState(null);
  const [nomeMedico, setNomeMedico] = useState('');
  const [codigoMedicoUsuarioOperacional, setCodigoMedicoUsuarioOperacional] = useState('');

  useEffect(() => {
    // Obter dados do state da navegação
    if (location.state) {
      setNomeMedico(location.state.nomeMedico || '');
      setCodigoMedicoUsuarioOperacional(location.state.codigoMedicoUsuarioOperacional || codigoMedico);
    } else {
      setCodigoMedicoUsuarioOperacional(codigoMedico);
    }

    if (codigoMedico || codigoMedicoUsuarioOperacional) {
      carregarDados();
    }
  }, [codigoMedico, location.state]);

  const carregarDados = async () => {
    const codigo = codigoMedicoUsuarioOperacional || codigoMedico;
    if (!codigo) return;

    // Carregar agendamentos e pacientes em paralelo
    Promise.all([
      carregarAgendamentos(codigo),
      carregarPacientes(codigo)
    ]);
  };

  const carregarAgendamentos = async (codigo) => {
    try {
      setLoadingAgendamentos(true);
      setErrorAgendamentos(null);
      const response = await operacionalService.obterAgendamentosOperacionais(codigo, 1, 5);
      setAgendamentos(response.agendamentoOperacionais || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setErrorAgendamentos('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  const carregarPacientes = async (codigo) => {
    try {
      setLoadingPacientes(true);
      setErrorPacientes(null);
      const response = await operacionalService.obterPacientesOperacionais(codigo, 1, 10);
      setPacientes(response.listaPacientes || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setErrorPacientes('Erro ao carregar pacientes. Tente novamente.');
    } finally {
      setLoadingPacientes(false);
    }
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dataString;
    }
  };

  const formatarSituacao = (situacao) => {
    const situacoes = {
      0: { texto: 'Ativo', classe: 'ativo' },
      1: { texto: 'Inativo', classe: 'inativo' },
      2: { texto: 'Suspenso', classe: 'suspenso' }
    };
    return situacoes[situacao] || { texto: 'Desconhecido', classe: 'desconhecido' };
  };

  const voltarParaMenu = () => {
    navigate('/operacional');
  };

  return (
    <div className="operacional-container">
      <div className="operacional-header">
        <button 
          className="back-button"
          onClick={voltarParaMenu}
          title="Voltar para menu operacional"
        >
          ← Voltar
        </button>
        <div className="header-info">
          <h1>Operacional - {nomeMedico || 'Médico'}</h1>
          <p>Agendamentos e pacientes do relacionamento selecionado</p>
        </div>
      </div>

      <div className="operacional-content">
        {/* Seção de Agendamentos */}
        <section className="agendamentos-section">
          <div className="section-header">
            <h2>📅 Agendamentos Recentes</h2>
            <span className="section-badge">{agendamentos.length} agendamentos</span>
          </div>

          {loadingAgendamentos ? (
            <div className="loading-container">
              <Loading text="Carregando agendamentos..." />
            </div>
          ) : errorAgendamentos ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{errorAgendamentos}</p>
              <button 
                className="retry-button"
                onClick={() => carregarAgendamentos(codigoMedicoUsuarioOperacional || codigoMedico)}
              >
                Tentar novamente
              </button>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">📅</div>
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="agendamentos-grid">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.codigoAgendamento} className="agendamento-card">
                  <div className="card-header">
                    <div className="paciente-info">
                      <h3>{agendamento.nomePaciente}</h3>
                      <p className="atendimento">{agendamento.nomeAtendimento}</p>
                    </div>
                    <div className="data-info">
                      <span className="data">{formatarData(agendamento.dataAgendamento)}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="codigo">Código: {agendamento.codigoAgendamento}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção de Pacientes */}
        <section className="pacientes-section">
          <div className="section-header">
            <h2>👥 Pacientes</h2>
            <span className="section-badge">{pacientes.length} pacientes</span>
          </div>

          {loadingPacientes ? (
            <div className="loading-container">
              <Loading text="Carregando pacientes..." />
            </div>
          ) : errorPacientes ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{errorPacientes}</p>
              <button 
                className="retry-button"
                onClick={() => carregarPacientes(codigoMedicoUsuarioOperacional || codigoMedico)}
              >
                Tentar novamente
              </button>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">👥</div>
              <p>Nenhum paciente encontrado</p>
            </div>
          ) : (
            <div className="pacientes-grid">
              {pacientes.map((paciente, index) => {
                const situacao = formatarSituacao(paciente.situacao);
                return (
                  <div key={`${paciente.codigo}-${index}`} className="paciente-card">
                    <div className="card-header">
                      <div className="paciente-info">
                        <h3>{paciente.nome}</h3>
                        <p className="documento">CPF: {paciente.documentoFederal}</p>
                      </div>
                      <div className="situacao-info">
                        <span className={`situacao ${situacao.classe}`}>
                          {situacao.texto}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-row">
                        <span className="label">📧 Email:</span>
                        <span className="value">{paciente.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📞 Telefone:</span>
                        <span className="value">{paciente.telefone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📅 Inclusão:</span>
                        <span className="value">
                          {new Date(paciente.dtInclusao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="codigo">Código: {paciente.codigo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Operacional;
