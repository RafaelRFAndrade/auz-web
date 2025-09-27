import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const pacienteClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

pacienteClient.interceptors.request.use(
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

export const pacienteService = {
  createPaciente: async (pacienteData) => {
    try {
      const response = await pacienteClient.post('/Paciente', {
        nome: pacienteData.nome,
        email: pacienteData.email,
        telefone: pacienteData.telefone,
        documentoFederal: pacienteData.documentoFederal
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllPacientes: async (filtro = '', pagina = 0, itensPorPagina = 100) => {
    try {
      const response = await pacienteClient.get('/Paciente/Listar', {
        data: {
          filtro: filtro,
          pagina: pagina,
          itensPorPagina: itensPorPagina
        }
      });
      return response.data.listaPacientes || [];
    } catch (error) {
      throw error;
    }
  },

  getPacienteById: async (id) => {
    try {
      const response = await pacienteClient.get(`/Paciente/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePaciente: async (pacienteData) => {
  try {
    await pacienteClient.put(`/Paciente`, { 
      codigoPaciente: pacienteData.codigoPaciente,
      nome: pacienteData.nome,
      email: pacienteData.email,
      telefone: pacienteData.telefone,
      documentoFederal: pacienteData.documentoFederal
    });
  } catch (error) {
    throw error;
  }
 },

  getPacienteByCpf: async (cpf) => {
    try {
      const response = await pacienteClient.get(`/Paciente/BuscarPorCpf/${cpf}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buscarDocumentosPaciente: async (documento) => {
    try {
      const response = await pacienteClient.get(`/Paciente/BuscarDocumentos/${documento}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default pacienteClient;