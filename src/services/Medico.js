import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const medicoClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

medicoClient.interceptors.request.use(
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

export const medicoService = {
  createMedico: async (medicoData) => {
    try {
      const response = await medicoClient.post('/Medico', {
        nome: medicoData.nome,
        crm: medicoData.crm,
        email: medicoData.email,
        telefone: medicoData.telefone,
        documentoFederal: medicoData.documentoFederal
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllMedicos: async (filtro = '', pagina = 0, itensPorPagina = 100) => {
    try {
      const response = await medicoClient.get('/Medico/Listar', {
        data: {
          filtro: filtro,
          pagina: pagina,
          itensPorPagina: itensPorPagina
        }
      });
      return response.data.listaMedicos || [];
    } catch (error) {
      throw error;
    }
  },

  updateMedico: async (id, medicoData) => {
    try {
      const response = await medicoClient.put(`/Medico/${id}`, {
        nome: medicoData.nome,
        crm: medicoData.crm,
        email: medicoData.email,
        telefone: medicoData.telefone,
        documentoFederal: medicoData.documentoFederal
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMedico: async (id) => {
    try {
      await medicoClient.delete(`/Medico`, {
        data: {  
          CodigoMedico: id
        },
        headers: {
          'Content-Type': 'application/json' 
        }
      });
    } catch (error) {
      throw error;
    }
  },

  getMedicoById: async (id) => {
    try {
      const response = await medicoClient.get(`/Medico/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default medicoClient;