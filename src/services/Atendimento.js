import axios from 'axios';
import { data } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/';

const atendimentoClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

atendimentoClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const atendimentoService = {
  createPaciente: async (atendimentoData) => {
    try {
      const response = await atendimentoClient.post('/Atendimento', {
        nome: atendimentoData.nome,
        email: atendimentoData.email,
        telefone: atendimentoData.telefone,
        documentoFederal: atendimentoData.documentoFederal
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default atendimentoClient;