import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const agendamentoClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

agendamentoClient.interceptors.request.use(
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

export const agendamentoService = {
  // Criar novo agendamento
  createAgendamento: async (agendamentoData) => {
    try {
      const response = await agendamentoClient.post('/Agendamento', agendamentoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Buscar agendamentos por atendimento
  getAgendamentosByAtendimento: async (codigoAtendimento) => {
    try {
      const response = await agendamentoClient.get(`/agendamentos/atendimento/${codigoAtendimento}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamento por ID
  getAgendamentoById: async (id) => {
    try {
      const response = await agendamentoClient.get(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      throw error;
    }
  },

  // Atualizar agendamento
  updateAgendamento: async (id, agendamentoData) => {
    try {
      const response = await agendamentoClient.put(`/agendamentos/${id}`, agendamentoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  },

  // Deletar agendamento
  deleteAgendamento: async (id) => {
    try {
      const response = await agendamentoClient.delete(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      throw error;
    }
  },

  // Buscar todos os agendamentos com paginação
  getAgendamentos: async (page = 1, size = 25, search = '') => {
    try {
      const params = {
        page: page - 1, // Backend usa índice baseado em 0
        size,
        ...(search && { search })
      };
      
      const response = await agendamentoClient.get('/agendamentos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  },

  // Buscar todos os agendamentos para o calendário
  getAllAgendamentos: async () => {
    try {
      const response = await agendamentoClient.get('/Agendamento');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamentos por mês e ano
  getAgendamentosByMonth: async (mes, ano) => {
    try {
      const response = await agendamentoClient.get('/Agendamento', {
        params: {
          Mes: mes,
          Ano: ano
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos por mês:', error);
      throw error;
    }
  },

  // Buscar agendamentos para a home com paginação
  getHome: async (pagina = 1, itensPorPagina = 5) => {
    try {
      const response = await agendamentoClient.get('/Agendamento/Home', {
        params: {
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos da home:', error);
      throw error;
    }
  }
};

export default agendamentoService;