import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { agendamentoService } from '../../services/Agendamento';
import { documentoService } from '../../services/Documento';
import Loading from '../custom/Loading';
import './AgendamentoDetalhes.css';

const AgendamentoDetalhes = () => {
  const { codigoAgendamento } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dadosEditaveis, setDadosEditaveis] = useState({});
  
  // Estados para documentos
  const [documentos, setDocumentos] = useState([]);
  const [documentosLoading, setDocumentosLoading] = useState(false);
  const [documentosError, setDocumentosError] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const itensPorPagina = 5;
  
  // Estados para upload
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (codigoAgendamento) {
      carregarDetalhes();
    } else {
      setError('Código do agendamento não fornecido');
      setLoading(false);
    }
  }, [codigoAgendamento]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agendamentoService.getDetalhes(codigoAgendamento);
      setAgendamento(response);
      
      // Carregar documentos após carregar o agendamento
      if (response && response.codigo) {
        carregarDocumentos(response.codigo);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do agendamento:', error);
      setError('Erro ao carregar detalhes do agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const carregarDocumentos = async (codigoEntidade, pagina = 1) => {
    try {
      setDocumentosLoading(true);
      setDocumentosError(null);
      const response = await documentoService.buscarDocumentos(codigoEntidade, pagina, itensPorPagina);
      setDocumentos(response.documentos || []);
      setTotalPaginas(response.totalPaginas || 0);
      setTotalItens(response.itens || 0);
      setPaginaAtual(pagina);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setDocumentosError('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setDocumentosLoading(false);
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
      0: { texto: 'Ativo', classe: 'ativo', cor: '#10b981' },
      1: { texto: 'Desativo', classe: 'desativo', cor: '#6b7280' },
      2: { texto: 'Confirmado', classe: 'confirmado', cor: '#3b82f6' },
      3: { texto: 'Cancelado', classe: 'cancelado', cor: '#ef4444' }
    };
    return situacoes[situacao] || { texto: 'Desconhecido', classe: 'desconhecido', cor: '#6b7280' };
  };

  const formatarPrioridade = (prioridade) => {
    const prioridades = {
      1: { texto: 'Rotina', classe: 'rotina', cor: '#10b981' },
      2: { texto: 'Normal', classe: 'normal', cor: '#3b82f6' },
      3: { texto: 'Urgente', classe: 'urgente', cor: '#ef4444' }
    };
    return prioridades[prioridade] || { texto: 'Não informado', classe: 'nao-informado', cor: '#6b7280' };
  };

  const voltarParaOperacional = () => {
    // Volta para a página operacional específica do médico
    if (dadosOriginais?.codigoMedico) {
      navigate(`/operacional/${dadosOriginais.codigoMedico}`, {
        state: {
          nomeMedico: dadosOriginais.nomeMedico,
          codigoMedicoUsuarioOperacional: dadosOriginais.codigoMedico
        }
      });
    } else if (location.state?.codigoMedico) {
      // Usa o código do médico do state da navegação
      navigate(`/operacional/${location.state.codigoMedico}`, {
        state: {
          nomeMedico: location.state.nomeMedico,
          codigoMedicoUsuarioOperacional: location.state.codigoMedico
        }
      });
    } else {
      // Se não tiver dados, volta para o menu operacional
      navigate('/operacional');
    }
  };

  const iniciarEdicao = () => {
    setDadosEditaveis({
      codigo: agendamento.codigo,
      dtAgendamento: agendamento.dtAgendamento,
      situacao: agendamento.situacao,
      descricao: agendamento.descricao || '',
      observacao: agendamento.observacao || '',
      dtConfirmacao: agendamento.dtConfirmacao || '',
      motivoCancelamento: agendamento.motivoCancelamento || '',
      prioridade: agendamento.prioridade || ''
    });
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setEditando(false);
    setDadosEditaveis({});
  };

  const salvarAlteracoes = async () => {
    try {
      setSalvando(true);
      await agendamentoService.atualizar(dadosEditaveis);
      setAgendamento({ ...agendamento, ...dadosEditaveis });
      setEditando(false);
      setDadosEditaveis({});
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setError('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleInputChange = (campo, valor) => {
    setDadosEditaveis(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const navegarPagina = (novaPagina) => {
    if (agendamento && agendamento.codigo) {
      carregarDocumentos(agendamento.codigo, novaPagina);
    }
  };

  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatarTipoArquivo = (tipoConteudo) => {
    if (tipoConteudo.startsWith('image/')) return '🖼️ Imagem';
    if (tipoConteudo.startsWith('application/pdf')) return '📄 PDF';
    if (tipoConteudo.startsWith('text/')) return '📝 Texto';
    if (tipoConteudo.includes('word')) return '📄 Word';
    if (tipoConteudo.includes('excel') || tipoConteudo.includes('spreadsheet')) return '📊 Excel';
    return '📄 Documento';
  };

  const downloadDocumento = async (codigoDocumento, nomeArquivo) => {
    try {
      const response = await documentoService.downloadDocumento(codigoDocumento);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      setDocumentosError('Erro ao fazer download do documento.');
    }
  };

  const handleFileSelect = (event) => {
    const arquivo = event.target.files[0];
    if (arquivo) {
      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (arquivo.size > maxSize) {
        setUploadError('O arquivo deve ter no máximo 10MB.');
        return;
      }
      
      // Validar tipo de arquivo
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(arquivo.type)) {
        setUploadError('Tipo de arquivo não permitido. Use: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX ou TXT.');
        return;
      }
      
      setArquivoSelecionado(arquivo);
      setUploadError(null);
    }
  };

  const uploadDocumento = async () => {
    if (!arquivoSelecionado || !agendamento?.codigo) {
      setUploadError('Selecione um arquivo válido.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      
      await documentoService.uploadDocumento(agendamento.codigo, arquivoSelecionado);
      
      // Recarregar lista de documentos
      await carregarDocumentos(agendamento.codigo, paginaAtual);
      
      // Limpar estado
      setArquivoSelecionado(null);
      setMostrarUpload(false);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadError('Erro ao fazer upload do documento. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const cancelarUpload = () => {
    setArquivoSelecionado(null);
    setMostrarUpload(false);
    setUploadError(null);
  };

  if (loading) {
    return (
      <div className="appointment-details">
        <div className="loading-state">
          <Loading text="Carregando detalhes do agendamento..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-details">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Erro ao carregar agendamento</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={carregarDetalhes}>
              Tentar novamente
            </button>
            <button className="btn btn-secondary" onClick={voltarParaOperacional}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="appointment-details">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>Agendamento não encontrado</h2>
          <p>O agendamento solicitado não foi encontrado.</p>
          <button className="btn btn-primary" onClick={voltarParaOperacional}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const situacao = formatarSituacao(agendamento.situacao);

  return (
    <div className="appointment-details">
      {/* Header */}
      <header className="appointment-header">
        <div className="header-content">
          <button 
            className="btn-back"
            onClick={voltarParaOperacional}
            title="Voltar para operacional"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>
          
          <div className="header-info">
            <h1>Detalhes do Agendamento</h1>
            <p>Informações completas do agendamento selecionado</p>
          </div>
          
          <div className="header-actions">
            {!editando ? (
              <button 
                className="btn btn-outline"
                onClick={iniciarEdicao}
                title="Editar agendamento"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn btn-primary"
                  onClick={salvarAlteracoes}
                  disabled={salvando}
                  title="Salvar alterações"
                >
                  {salvando ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                      </svg>
                      Salvar
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                  disabled={salvando}
                  title="Cancelar edição"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="appointment-content">
        {/* Main Info Card */}
        <div className="info-card main-card">
          <div className="card-header">
            <div className="card-title">
              <h2>Agendamento #{agendamento.id}</h2>
              <div className={`status-badge status-${situacao.classe}`}>
                {situacao.texto}
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="info-grid">
              <div className="info-field">
                <label>Data do Agendamento</label>
                {editando ? (
                  <input
                    type="datetime-local"
                    value={dadosEditaveis.dtAgendamento ? new Date(dadosEditaveis.dtAgendamento).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('dtAgendamento', e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <div className="info-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatarData(agendamento.dtAgendamento)}
                  </div>
                )}
              </div>
              
              <div className="info-field">
                <label>Situação</label>
                {editando ? (
                  <select
                    value={dadosEditaveis.situacao || ''}
                    onChange={(e) => handleInputChange('situacao', parseInt(e.target.value))}
                    className="form-select"
                  >
                    <option value="0">Ativo</option>
                    <option value="1">Desativo</option>
                    <option value="2">Confirmado</option>
                    <option value="3">Cancelado</option>
                  </select>
                ) : (
                  <div className="info-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                    {agendamento.situacao !== null ? formatarSituacao(agendamento.situacao).texto : 'Não informado'}
                  </div>
                )}
              </div>
              
              <div className="info-field">
                <label>Prioridade</label>
                {editando ? (
                  <select
                    value={dadosEditaveis.prioridade || ''}
                    onChange={(e) => handleInputChange('prioridade', parseInt(e.target.value) || '')}
                    className="form-select"
                  >
                    <option value="">Selecione a prioridade</option>
                    <option value="1">Rotina</option>
                    <option value="2">Normal</option>
                    <option value="3">Urgente</option>
                  </select>
                ) : (
                  <div className="info-value">
                    {agendamento.prioridade ? (
                      <span className={`priority-badge priority-${formatarPrioridade(agendamento.prioridade).classe}`}>
                        {formatarPrioridade(agendamento.prioridade).texto}
                      </span>
                    ) : (
                      <span className="text-muted">Não informado</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="info-field full-width">
                <label>Descrição</label>
                {editando ? (
                  <textarea
                    value={dadosEditaveis.descricao || ''}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    className="form-textarea"
                    maxLength="155"
                    placeholder="Descrição do agendamento (máx. 155 caracteres)"
                  />
                ) : (
                  <div className="info-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    {agendamento.descricao || 'Não informado'}
                  </div>
                )}
              </div>
              
              <div className="info-field full-width">
                <label>Observação</label>
                {editando ? (
                  <textarea
                    value={dadosEditaveis.observacao || ''}
                    onChange={(e) => handleInputChange('observacao', e.target.value)}
                    className="form-textarea"
                    maxLength="255"
                    placeholder="Observações do agendamento (máx. 255 caracteres)"
                  />
                ) : (
                  <div className="info-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    {agendamento.observacao || 'Não informado'}
                  </div>
                )}
              </div>
              
              {(editando ? dadosEditaveis.situacao === 3 : agendamento.situacao === 3) && (
                <div className="info-field full-width">
                  <label>Motivo do Cancelamento</label>
                  {editando ? (
                    <textarea
                      value={dadosEditaveis.motivoCancelamento || ''}
                      onChange={(e) => handleInputChange('motivoCancelamento', e.target.value)}
                      className="form-textarea"
                      placeholder="Motivo do cancelamento"
                    />
                  ) : (
                    <div className="info-value">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      {agendamento.motivoCancelamento || 'Não informado'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>Informações de Data</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-field">
                <label>Data de Criação</label>
                <div className="info-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatarData(agendamento.dtInclusao)}
                </div>
              </div>
              
              <div className="info-field">
                <label>Última Atualização</label>
                <div className="info-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  {agendamento.dtSituacao ? formatarData(agendamento.dtSituacao) : 'Não informado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="info-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Documentos</h3>
              {totalItens > 0 && (
                <span className="documents-count">
                  {totalItens} documento{totalItens !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setMostrarUpload(!mostrarUpload)}
              title="Adicionar documento"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              {mostrarUpload ? 'Cancelar' : 'Adicionar'}
            </button>
          </div>
          
          <div className="card-body">
            {/* Upload Interface */}
            {mostrarUpload && (
              <div className="upload-section">
                <div className="upload-header">
                  <h4>Adicionar Documento</h4>
                  <p>Selecione um arquivo para enviar (máx. 10MB)</p>
                </div>
                
                <div className="upload-form">
                  <div className="file-upload">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-label">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Escolher Arquivo
                    </label>
                  </div>
                  
                  {arquivoSelecionado && (
                    <div className="selected-file">
                      <div className="file-info">
                        <div className="file-icon">
                          {formatarTipoArquivo(arquivoSelecionado.type)}
                        </div>
                        <div className="file-details">
                          <span className="file-name">{arquivoSelecionado.name}</span>
                          <span className="file-size">{formatarTamanho(arquivoSelecionado.size)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="upload-error">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      {uploadError}
                    </div>
                  )}
                  
                  <div className="upload-actions">
                    <button
                      className="btn btn-primary"
                      onClick={uploadDocumento}
                      disabled={!arquivoSelecionado || uploading}
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Enviar Documento
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={cancelarUpload}
                      disabled={uploading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents List */}
            {documentosLoading ? (
              <div className="documents-loading">
                <Loading text="Carregando documentos..." />
              </div>
            ) : documentosError ? (
              <div className="documents-error">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p>{documentosError}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => agendamento && carregarDocumentos(agendamento.codigo, paginaAtual)}
                >
                  Tentar novamente
                </button>
              </div>
            ) : documentos.length === 0 ? (
              <div className="documents-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              <>
                <div className="documents-list">
                  {documentos.map((documento) => (
                    <div key={documento.codigo} className="document-item">
                      <div className="document-icon">
                        {formatarTipoArquivo(documento.tipoConteudo)}
                      </div>
                      <div className="document-info">
                        <h4 className="document-name" title={documento.nomeArquivo}>
                          {documento.nomeArquivo}
                        </h4>
                        <div className="document-meta">
                          <span className="document-type">
                            {formatarTipoArquivo(documento.tipoConteudo)}
                          </span>
                          <span className="document-size">
                            {formatarTamanho(documento.tamanhoBytes)}
                          </span>
                          <span className="document-date">
                            {formatarData(documento.dataUpload)}
                          </span>
                        </div>
                      </div>
                      <div className="document-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => downloadDocumento(documento.codigo, documento.nomeArquivo)}
                          title="Download do documento"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPaginas > 1 && (
                  <div className="pagination">
                    <div className="pagination-info">
                      Página {paginaAtual} de {totalPaginas}
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navegarPagina(paginaAtual - 1)}
                        disabled={paginaAtual <= 1 || documentosLoading}
                        title="Página anterior"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"/>
                        </svg>
                        Anterior
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                          let numeroPagina;
                          if (totalPaginas <= 5) {
                            numeroPagina = i + 1;
                          } else if (paginaAtual <= 3) {
                            numeroPagina = i + 1;
                          } else if (paginaAtual >= totalPaginas - 2) {
                            numeroPagina = totalPaginas - 4 + i;
                          } else {
                            numeroPagina = paginaAtual - 2 + i;
                          }
                          
                          return (
                            <button
                              key={numeroPagina}
                              className={`pagination-number ${paginaAtual === numeroPagina ? 'active' : ''}`}
                              onClick={() => navegarPagina(numeroPagina)}
                              disabled={documentosLoading}
                            >
                              {numeroPagina}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navegarPagina(paginaAtual + 1)}
                        disabled={paginaAtual >= totalPaginas || documentosLoading}
                        title="Próxima página"
                      >
                        Próxima
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoDetalhes;
