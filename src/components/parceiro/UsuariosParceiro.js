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
      <h1>Usuários do Parceiro</h1>
      
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="tabela-usuarios">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo de Permissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.tipoPermissao}</td>
                    <td className="acoes">
                      <button className="btn-editar" title="Editar usuário">✏️</button>
                      <button className="btn-excluir" title="Excluir usuário">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paginacao">
            <button 
              onClick={handlePaginaAnterior} 
              disabled={paginaAtual === 1}
              className="btn-paginacao"
            >
              ← Anterior
            </button>
            <span className="info-paginacao">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button 
              onClick={handleProximaPagina} 
              disabled={paginaAtual === totalPaginas}
              className="btn-paginacao"
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsuariosParceiro;