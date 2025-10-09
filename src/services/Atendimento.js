import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const atendimentoClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json' // igual ao medicoClient
  }
});

atendimentoClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Evita setar Content-Type em GET
    if (config.method.toLowerCase() === 'get') {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export const atendimentoService = {
  // Método para listar atendimentos do médico (usando o endpoint correto)
  getAtendimentos: async (pagina = 1, itensPorPagina = 25, filtro = '') => {
    try {
      const response = await atendimentoClient.get('/Atendimento/Listar', {
        params: {
          Filtro: filtro,
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro na requisição:', error.response?.data || error.message);
      throw error;
    }
  },

  // Criar novo atendimento
  createAtendimento: async (atendimentoData) => {
    try {
      const response = await atendimentoClient.post('/Atendimento/Cadastrar', atendimentoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar atendimento:', error.response?.data || error.message);
      throw error;
    }
  },

  // Buscar atendimento por ID
  getAtendimentoById: async (id) => {
    try {
      const response = await atendimentoClient.get(`/Atendimento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimento:', error.response?.data || error.message);
      throw error;
    }
  },

  // Buscar detalhes completos do atendimento (com documentos e agendamentos)
  getAtendimentoDetails: async (codigo) => {
    try {
      const response = await atendimentoClient.get('/Atendimento', {
        params: {
          codigo: codigo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do atendimento:', error.response?.data || error.message);
      throw error;
    }
  },

  // Atualizar atendimento
  updateAtendimento: async (id, atendimentoData) => {
    try {
      const response = await atendimentoClient.put(`/Atendimento/${id}`, atendimentoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error.response?.data || error.message);
      throw error;
    }
  },

  // Deletar atendimento
  deleteAtendimento: async (id) => {
    try {
      const response = await atendimentoClient.delete(`/Atendimento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar atendimento:', error.response?.data || error.message);
      throw error;
    }
  },

  // Download de documento
  downloadDocumento: async (codigoDocumento) => {
    try {
      const response = await atendimentoClient.get('/Atendimento/Documento', {
        params: {
          codigoDocumento: codigoDocumento
        },
        responseType: 'blob' 
      });
      return response;
    } catch (error) {
      console.error('Erro ao baixar documento:', error.response?.data || error.message);
      throw error;
    }
  }
};
export default atendimentoClient;