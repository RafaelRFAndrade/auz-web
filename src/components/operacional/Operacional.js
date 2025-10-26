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
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `${dataFormatada} ${horaFormatada}`;
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
      {/* Header fixo e consistente */}
      <header className="operacional-header-fixed">
        <div className="header-container">
          <button 
            className="btn-voltar"
            onClick={voltarParaMenu}
            title="Voltar para menu operacional"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
            Voltar
          </button>
          
          <div className="header-main">
            <div className="medico-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20,21v-2a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="medico-info">
              <h1 className="medico-nome">Olá, {nomeMedico || 'Médico'}</h1>
              <p className="medico-descricao">Gerencie agendamentos e pacientes do relacionamento</p>
            </div>
          </div>
        </div>
      </header>

      <div className="operacional-content">
        {/* Seção de Agendamentos */}
        <section className="agendamentos-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="title-content">
                <h2>Agendamentos Recentes</h2>
                <p>Visualize e gerencie os próximos compromissos</p>
              </div>
            </div>
            <div className="section-controls">
              <div className="section-stats">
                <span className="stat-number">{agendamentos.length}</span>
                <span className="stat-label">Agendamentos</span>
              </div>
              {totalAgendamentoPages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevAgendamento}
                    disabled={currentAgendamentoPage === 1 || isTransitioningAgendamentos}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"/>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cards-section">
            {loadingAgendamentos ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h3>Carregando agendamentos...</h3>
                <p>Aguarde enquanto buscamos seus dados</p>
              </div>
            ) : errorAgendamentos ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>Erro ao carregar agendamentos</h3>
                <p>{errorAgendamentos}</p>
                <button 
                  className="retry-button"
                  onClick={() => carregarAgendamentos(codigoMedicoUsuarioOperacional || codigoMedico)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4a9,9,0,0,1-14.85,3.36L23,14"/>
                  </svg>
                  Tentar novamente
                </button>
              </div>
            ) : agendamentos.length > 0 ? (
              <div className="agendamentos-grid-fixed">
                {agendamentos.map((agendamento, index) => (
                  <div 
                    key={agendamento.codigoAgendamento || agendamento.codigo} 
                    className="agendamento-card-fixed"
                    onClick={() => verDetalhesAgendamento(agendamento)}
                    title="Clique para ver detalhes"
                  >
                    <div className="card-header-fixed">
                      <div className="patient-avatar-fixed">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div className="patient-info-fixed">
                        <div className="patient-name-fixed">{agendamento.nomePaciente}</div>
                        <div className="appointment-type-fixed">{agendamento.nomeAtendimento || 'Atendimento'}</div>
                      </div>
                      <div className="date-badge-fixed">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{formatarData(agendamento.dataAgendamento)}</span>
                      </div>
                    </div>
                    <div className="card-footer-fixed">
                      <button className="view-details-btn-fixed">
                        Ver detalhes
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3>Nenhum agendamento encontrado</h3>
                <p>Não há agendamentos para exibir no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção de Pacientes */}
        <section className="pacientes-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17,21v-2a4,4,0,0,0-4-4H5a4,4,0,0,0-4,4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23,21v-2a4,4,0,0,0-3-3.87"/>
                  <path d="M16,3.13a4,4,0,0,1,0,7.75"/>
                </svg>
              </div>
              <div className="title-content">
                <h2>Pacientes</h2>
                <p>Gerencie informações dos pacientes do relacionamento</p>
              </div>
            </div>
            <div className="section-controls">
              <div className="section-stats">
                <span className="stat-number">{pacientes.length}</span>
                <span className="stat-label">Pacientes</span>
              </div>
              {totalPacientePages > 1 && (
                <div className="navigation-controls">
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevPaciente}
                    disabled={currentPacientePage === 1 || isTransitioningPacientes}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"/>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cards-section">
            {loadingPacientes ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h3>Carregando pacientes...</h3>
                <p>Aguarde enquanto buscamos seus dados</p>
              </div>
            ) : errorPacientes ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>Erro ao carregar pacientes</h3>
                <p>{errorPacientes}</p>
                <button 
                  className="retry-button"
                  onClick={() => carregarPacientes(codigoMedicoUsuarioOperacional || codigoMedico)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4a9,9,0,0,1-14.85,3.36L23,14"/>
                  </svg>
                  Tentar novamente
                </button>
              </div>
            ) : pacientes.length > 0 ? (
              <div className={`cards-grid ${pacienteAnimation}`}>
                {pacientes.map((paciente, index) => {
                  const situacao = formatarSituacao(paciente.situacao);
                  return (
                    <div 
                      key={`${paciente.codigo}-${index}`} 
                      className="paciente-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="card-glow"></div>
                      <div className="card-content">
                        <div className="card-header">
                          <div className="paciente-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20,21v-2a4,4,0,0,0-4-4H8a4,4,0,0,0-4,4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <div className="card-info">
                            <h3>{paciente.nome}</h3>
                            <p className="documento">CPF: {paciente.documentoFederal}</p>
                          </div>
                          <div className={`status-badge ${situacao.classe}`}>
                            <div className="status-dot"></div>
                            {situacao.texto}
                          </div>
                        </div>
                        
                        <div className="card-details">
                          <div className="detail-row">
                            <div className="detail-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4,4h16c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V6C2,4.9,2.9,4,4,4z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            </div>
                            <div className="detail-content">
                              <span className="detail-label">Email</span>
                              <span className="detail-value">{paciente.email}</span>
                            </div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22,16.92v3a2,2,0,0,1-2.18,2,19.79,19.79,0,0,1-8.63-3.07A19.5,19.5,0,0,1,5.64,8.5,19.79,19.79,0,0,1,2.5,4.18,2,2,0,0,1,4.5,2H7.5a2,2,0,0,1,2,1.72,12.84,12.84,0,0,0,.7,2.81,2,2,0,0,1-.45,2.11L8.09,9.91a16,16,0,0,0,6,6l1.27-1.27a2,2,0,0,1,2.11-.45,12.84,12.84,0,0,0,2.81.7A2,2,0,0,1,22,16.92Z"/>
                              </svg>
                            </div>
                            <div className="detail-content">
                              <span className="detail-label">Telefone</span>
                              <span className="detail-value">{paciente.telefone}</span>
                            </div>
                          </div>
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
                              <span className="detail-label">Inclusão</span>
                              <span className="detail-value">
                                {new Date(paciente.dtInclusao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17,21v-2a4,4,0,0,0-4-4H5a4,4,0,0,0-4,4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23,21v-2a4,4,0,0,0-3-3.87"/>
                    <path d="M16,3.13a4,4,0,0,1,0,7.75"/>
                  </svg>
                </div>
                <h3>Nenhum paciente encontrado</h3>
                <p>Não há pacientes para exibir no momento</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Operacional;
