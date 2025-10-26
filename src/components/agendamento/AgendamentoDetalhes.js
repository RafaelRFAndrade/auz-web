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
      <div className="agendamento-detalhes-container">
        <div className="loading-container">
          <Loading text="Carregando detalhes do agendamento..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agendamento-detalhes-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erro ao carregar agendamento</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={carregarDetalhes}>
            Tentar novamente
          </button>
          <button className="back-button" onClick={voltarParaOperacional}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="agendamento-detalhes-container">
        <div className="empty-container">
          <div className="empty-icon">📅</div>
          <h2>Agendamento não encontrado</h2>
          <p>O agendamento solicitado não foi encontrado.</p>
          <button className="back-button" onClick={voltarParaOperacional}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const situacao = formatarSituacao(agendamento.situacao);


  return (
    <div className="agendamento-detalhes-container">
      <div className="agendamento-header">
        <button 
          className="back-button"
          onClick={voltarParaOperacional}
          title="Voltar para operacional"
        >
          ← Voltar
        </button>
        <div className="header-info">
          <h1>📅 Detalhes do Agendamento</h1>
          <p>Informações completas do agendamento selecionado</p>
        </div>
        {!editando ? (
          <button 
            className="edit-button"
            onClick={iniciarEdicao}
            title="Editar agendamento"
          >
            ✏️ Editar
          </button>
        ) : (
          <div className="edit-controls">
            <button 
              className="save-button"
              onClick={salvarAlteracoes}
              disabled={salvando}
              title="Salvar alterações"
            >
              {salvando ? '💾 Salvando...' : '💾 Salvar'}
            </button>
            <button 
              className="cancel-button"
              onClick={cancelarEdicao}
              disabled={salvando}
              title="Cancelar edição"
            >
              ❌ Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="agendamento-content">
        {/* Card Principal */}
        <div className="agendamento-card principal">
          <div className="card-header">
            <div className="header-left">
              <h2>Agendamento #{agendamento.id}</h2>
            </div>
            <div className="header-right">
              <div 
                className={`status-badge ${situacao.classe}`}
                style={{ backgroundColor: situacao.cor }}
              >
                {situacao.texto}
              </div>
            </div>
          </div>

          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">📅 Data do Agendamento:</span>
                {editando ? (
                  <input
                    type="datetime-local"
                    value={dadosEditaveis.dtAgendamento ? new Date(dadosEditaveis.dtAgendamento).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('dtAgendamento', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{formatarData(agendamento.dtAgendamento)}</span>
                )}
              </div>
              
              <div className="info-item full-width">
                <span className="label">📝 Descrição:</span>
                {editando ? (
                  <textarea
                    value={dadosEditaveis.descricao || ''}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    className="edit-textarea"
                    maxLength="155"
                    placeholder="Descrição do agendamento (máx. 155 caracteres)"
                  />
                ) : (
                  <span className="value">{agendamento.descricao || 'Não informado'}</span>
                )}
              </div>
              
              
              <div className="info-item">
                <span className="label">📊 Situação:</span>
                {editando ? (
                  <select
                    value={dadosEditaveis.situacao || ''}
                    onChange={(e) => handleInputChange('situacao', parseInt(e.target.value))}
                    className="edit-select"
                  >
                    <option value="0">Ativo</option>
                    <option value="1">Desativo</option>
                    <option value="2">Confirmado</option>
                    <option value="3">Cancelado</option>
                  </select>
                ) : (
                  <span className="value">{agendamento.situacao !== null ? formatarSituacao(agendamento.situacao).texto : 'Não informado'}</span>
                )}
              </div>
              
              <div className="info-item full-width">
                <span className="label">📝 Observação:</span>
                {editando ? (
                  <textarea
                    value={dadosEditaveis.observacao || ''}
                    onChange={(e) => handleInputChange('observacao', e.target.value)}
                    className="edit-textarea"
                    maxLength="255"
                    placeholder="Observações do agendamento (máx. 255 caracteres)"
                  />
                ) : (
                  <span className="value">{agendamento.observacao || 'Não informado'}</span>
                )}
              </div>
              
              {(editando ? dadosEditaveis.situacao === 3 : agendamento.situacao === 3) && (
                <div className="info-item full-width">
                  <span className="label">❌ Motivo do Cancelamento:</span>
                  {editando ? (
                    <textarea
                      value={dadosEditaveis.motivoCancelamento || ''}
                      onChange={(e) => handleInputChange('motivoCancelamento', e.target.value)}
                      className="edit-textarea"
                      placeholder="Motivo do cancelamento"
                    />
                  ) : (
                    <span className="value">{agendamento.motivoCancelamento || 'Não informado'}</span>
                  )}
                </div>
              )}
              
              <div className="info-item">
                <span className="label">⚡ Prioridade:</span>
                {editando ? (
                  <select
                    value={dadosEditaveis.prioridade || ''}
                    onChange={(e) => handleInputChange('prioridade', parseInt(e.target.value) || '')}
                    className="edit-select"
                  >
                    <option value="">Selecione a prioridade</option>
                    <option value="1">Rotina</option>
                    <option value="2">Normal</option>
                    <option value="3">Urgente</option>
                  </select>
                ) : (
                  <span className="value">
                    {agendamento.prioridade ? (
                      <span 
                        className={`prioridade-badge ${formatarPrioridade(agendamento.prioridade).classe}`}
                        style={{ backgroundColor: formatarPrioridade(agendamento.prioridade).cor }}
                      >
                        {formatarPrioridade(agendamento.prioridade).texto}
                      </span>
                    ) : (
                      'Não informado'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card de Datas Adicionais */}
        <div className="agendamento-card">
          <div className="card-header">
            <h3>📅 Informações de Data</h3>
          </div>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">📅 Data de Criação:</span>
                <span className="value">{formatarData(agendamento.dtInclusao)}</span>
              </div>
              
              <div className="info-item">
                <span className="label">🔄 Data da Última Atualização:</span>
                <span className="value">{agendamento.dtSituacao ? formatarData(agendamento.dtSituacao) : 'Não informado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Documentos */}
        <div className="agendamento-card">
          <div className="card-header">
            <h3>📁 Documentos</h3>
            <div className="documentos-info">
              {totalItens > 0 && (
                <span className="documentos-count">
                  {totalItens} documento{totalItens !== 1 ? 's' : ''}
                </span>
              )}
              <button
                className="upload-button"
                onClick={() => setMostrarUpload(!mostrarUpload)}
                title="Adicionar documento"
              >
                📤 {mostrarUpload ? 'Cancelar' : 'Adicionar'}
              </button>
            </div>
          </div>
          <div className="card-content">
            {/* Interface de Upload */}
            {mostrarUpload && (
              <div className="upload-section">
                <div className="upload-header">
                  <h4>📤 Adicionar Documento</h4>
                  <p>Selecione um arquivo para enviar (máx. 10MB)</p>
                </div>
                
                <div className="upload-form">
                  <div className="file-input-container">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-input-label">
                      📁 Escolher Arquivo
                    </label>
                  </div>
                  
                  {arquivoSelecionado && (
                    <div className="selected-file">
                      <div className="file-info">
                        <span className="file-icon">
                          {formatarTipoArquivo(arquivoSelecionado.type)}
                        </span>
                        <div className="file-details">
                          <span className="file-name">{arquivoSelecionado.name}</span>
                          <span className="file-size">{formatarTamanho(arquivoSelecionado.size)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="upload-error">
                      <span className="error-icon">⚠️</span>
                      <span>{uploadError}</span>
                    </div>
                  )}
                  
                  <div className="upload-actions">
                    <button
                      className="upload-submit-button"
                      onClick={uploadDocumento}
                      disabled={!arquivoSelecionado || uploading}
                    >
                      {uploading ? '📤 Enviando...' : '📤 Enviar Documento'}
                    </button>
                    <button
                      className="upload-cancel-button"
                      onClick={cancelarUpload}
                      disabled={uploading}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {documentosLoading ? (
              <div className="documentos-loading">
                <Loading text="Carregando documentos..." />
              </div>
            ) : documentosError ? (
              <div className="documentos-error">
                <div className="error-icon">⚠️</div>
                <p>{documentosError}</p>
                <button 
                  className="retry-button"
                  onClick={() => agendamento && carregarDocumentos(agendamento.codigo, paginaAtual)}
                >
                  Tentar novamente
                </button>
              </div>
            ) : documentos.length === 0 ? (
              <div className="documentos-empty">
                <div className="empty-icon">📁</div>
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              <>
                <div className="documentos-carousel">
                  {documentos.map((documento) => (
                    <div key={documento.codigo} className="documento-item">
                      <div className="documento-icon">
                        {formatarTipoArquivo(documento.tipoConteudo)}
                      </div>
                      <div className="documento-info">
                        <h4 className="documento-nome" title={documento.nomeArquivo}>
                          {documento.nomeArquivo}
                        </h4>
                        <div className="documento-detalhes">
                          <span className="documento-tipo">
                            {formatarTipoArquivo(documento.tipoConteudo)}
                          </span>
                          <span className="documento-tamanho">
                            {formatarTamanho(documento.tamanhoBytes)}
                          </span>
                          <span className="documento-data">
                            {formatarData(documento.dataUpload)}
                          </span>
                        </div>
                      </div>
                      <div className="documento-actions">
                        <button
                          className="download-button"
                          onClick={() => downloadDocumento(documento.codigo, documento.nomeArquivo)}
                          title="Download do documento"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="documentos-pagination">
                    <div className="pagination-info">
                      Página {paginaAtual} de {totalPaginas}
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-button"
                        onClick={() => navegarPagina(paginaAtual - 1)}
                        disabled={paginaAtual <= 1 || documentosLoading}
                        title="Página anterior"
                      >
                        ← Anterior
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
                        className="pagination-button"
                        onClick={() => navegarPagina(paginaAtual + 1)}
                        disabled={paginaAtual >= totalPaginas || documentosLoading}
                        title="Próxima página"
                      >
                        Próxima →
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
