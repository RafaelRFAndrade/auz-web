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
  
  // Estados para carrossel de agendamentos
  const [currentAgendamentoPage, setCurrentAgendamentoPage] = useState(1);
  const [totalAgendamentoPages, setTotalAgendamentoPages] = useState(1);
  const [isTransitioningAgendamentos, setIsTransitioningAgendamentos] = useState(false);
  const [agendamentoAnimation, setAgendamentoAnimation] = useState('');
  
  // Estados para carrossel de pacientes
  const [currentPacientePage, setCurrentPacientePage] = useState(1);
  const [totalPacientePages, setTotalPacientePages] = useState(1);
  const [isTransitioningPacientes, setIsTransitioningPacientes] = useState(false);
  const [pacienteAnimation, setPacienteAnimation] = useState('');

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

  const carregarAgendamentos = async (codigo, page = 1) => {
    try {
      setLoadingAgendamentos(true);
      setErrorAgendamentos(null);
      const response = await operacionalService.obterAgendamentosOperacionais(codigo, page, 4);
      setAgendamentos(response.agendamentoOperacionais || []);
      setTotalAgendamentoPages(response.totalPaginas || 1);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setErrorAgendamentos('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  const carregarPacientes = async (codigo, page = 1) => {
    try {
      setLoadingPacientes(true);
      setErrorPacientes(null);
      const response = await operacionalService.obterPacientesOperacionais(codigo, page, 4);
      setPacientes(response.listaPacientes || []);
      setTotalPacientePages(response.totalPaginas || 1);
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

  // Funções de navegação para agendamentos
  const nextAgendamento = async () => {
    if (currentAgendamentoPage < totalAgendamentoPages && !isTransitioningAgendamentos) {
      setIsTransitioningAgendamentos(true);
      setAgendamentoAnimation('fade-out');
      
      setTimeout(async () => {
        const nextPage = currentAgendamentoPage + 1;
        setCurrentAgendamentoPage(nextPage);
        await carregarAgendamentos(codigoMedicoUsuarioOperacional || codigoMedico, nextPage);
        
        setTimeout(() => {
          setAgendamentoAnimation('fade-in');
          setTimeout(() => {
            setAgendamentoAnimation('');
            setIsTransitioningAgendamentos(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  const prevAgendamento = async () => {
    if (currentAgendamentoPage > 1 && !isTransitioningAgendamentos) {
      setIsTransitioningAgendamentos(true);
      setAgendamentoAnimation('fade-out');
      
      setTimeout(async () => {
        const prevPage = currentAgendamentoPage - 1;
        setCurrentAgendamentoPage(prevPage);
        await carregarAgendamentos(codigoMedicoUsuarioOperacional || codigoMedico, prevPage);
        
        setTimeout(() => {
          setAgendamentoAnimation('fade-in');
          setTimeout(() => {
            setAgendamentoAnimation('');
            setIsTransitioningAgendamentos(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  // Funções de navegação para pacientes
  const nextPaciente = async () => {
    if (currentPacientePage < totalPacientePages && !isTransitioningPacientes) {
      setIsTransitioningPacientes(true);
      setPacienteAnimation('fade-out');
      
      setTimeout(async () => {
        const nextPage = currentPacientePage + 1;
        setCurrentPacientePage(nextPage);
        await carregarPacientes(codigoMedicoUsuarioOperacional || codigoMedico, nextPage);
        
        setTimeout(() => {
          setPacienteAnimation('fade-in');
          setTimeout(() => {
            setPacienteAnimation('');
            setIsTransitioningPacientes(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  const prevPaciente = async () => {
    if (currentPacientePage > 1 && !isTransitioningPacientes) {
      setIsTransitioningPacientes(true);
      setPacienteAnimation('fade-out');
      
      setTimeout(async () => {
        const prevPage = currentPacientePage - 1;
        setCurrentPacientePage(prevPage);
        await carregarPacientes(codigoMedicoUsuarioOperacional || codigoMedico, prevPage);
        
        setTimeout(() => {
          setPacienteAnimation('fade-in');
          setTimeout(() => {
            setPacienteAnimation('');
            setIsTransitioningPacientes(false);
          }, 200);
        }, 50);
      }, 150);
    }
  };

  const voltarParaMenu = () => {
    navigate('/operacional');
  };

  const verDetalhesAgendamento = (agendamento) => {
    const codigo = agendamento.codigoAgendamento || agendamento.codigo;
    
    const stateData = {
      agendamento: agendamento,
      nomeMedico: nomeMedico,
      codigoMedico: codigoMedicoUsuarioOperacional || codigoMedico
    };
    
    navigate(`/agendamento/${codigo}`, {
      state: stateData
    });
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
            <div className="section-controls">
              <span className="section-count">{agendamentos.length} agendamentos</span>
              {totalAgendamentoPages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevAgendamento}
                    disabled={currentAgendamentoPage === 1 || isTransitioningAgendamentos}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <span className="nav-indicator">
                    {currentAgendamentoPage} / {totalAgendamentoPages}
                  </span>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextAgendamento}
                    disabled={currentAgendamentoPage === totalAgendamentoPages || isTransitioningAgendamentos}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="horizontal-carousel">
            {loadingAgendamentos ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Carregando agendamentos...</span>
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
            ) : agendamentos.length > 0 ? (
              <div className={`cards-container ${agendamentoAnimation}`}>
                {agendamentos.map((agendamento) => (
                  <div 
                    key={agendamento.codigoAgendamento || agendamento.codigo} 
                    className="agendamento-card clickable-card"
                    onClick={() => verDetalhesAgendamento(agendamento)}
                    title="Clique para ver detalhes"
                  >
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
                        <span className="click-hint">👆 Clique para ver detalhes</span>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="empty-container">
                <div className="empty-icon">📅</div>
                <p>Nenhum agendamento encontrado</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção de Pacientes */}
        <section className="pacientes-section">
          <div className="section-header">
            <h2>👥 Pacientes</h2>
            <div className="section-controls">
              <span className="section-count">{pacientes.length} pacientes</span>
              {totalPacientePages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevPaciente}
                    disabled={currentPacientePage === 1 || isTransitioningPacientes}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <span className="nav-indicator">
                    {currentPacientePage} / {totalPacientePages}
                  </span>
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextPaciente}
                    disabled={currentPacientePage === totalPacientePages || isTransitioningPacientes}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="horizontal-carousel">
            {loadingPacientes ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Carregando pacientes...</span>
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
            ) : pacientes.length > 0 ? (
              <div className={`cards-container ${pacienteAnimation}`}>
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-container">
                <div className="empty-icon">👥</div>
                <p>Nenhum paciente encontrado</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Operacional;
