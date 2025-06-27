import axios from 'axios';
import { data } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/';

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


// services/Atendimento.js
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
};
export default atendimentoClient;