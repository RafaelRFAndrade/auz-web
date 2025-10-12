import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

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
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
        params: {
          filtro: filtro,
          pagina: pagina,
          itensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateMedico: async (id, medicoData) => {
    try {
      await medicoClient.put(`/Medico`, { 
        Codigo: id,
        Nome: medicoData.nome,
        CRM: medicoData.crm,
        Email: medicoData.email,
        Telefone: medicoData.telefone,
        DocumentoFederal: medicoData.documentoFederal
      });
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
  },

  getMedicoByCpf: async (cpf) => {
    try {
      const response = await medicoClient.get(`/Medico/BuscarPorCpf/${cpf}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buscarDocumentosMedico: async (documento) => {
    try {
      const response = await medicoClient.get(`/Medico/BuscarDocumentos/${documento}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMedicoDetalhado: async (codigoMedico) => {
    try {
      const response = await medicoClient.get('/Medico/Detalhado', {
        params: {
          codigoMedico: codigoMedico
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateMedicoCompleto: async (medicoData) => {
    try {
      const response = await medicoClient.put('/Medico/Completo', {
        codigo: medicoData.codigo,
        nome: medicoData.nome,
        crm: medicoData.crm,
        email: medicoData.email,
        telefone: medicoData.telefone,
        documentoFederal: medicoData.documentoFederal,
        especialidade: medicoData.especialidade,
        diasAtendimento: medicoData.diasAtendimento,
        tipoContrato: medicoData.tipoContrato,
        valorConsulta: medicoData.valorConsulta
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFotoPerfil: async (codigoEntidade, file) => {
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('CodigoEntidade', codigoEntidade);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/Medico/FotoDePerfil`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();

    } catch (error) {
      throw error;
    }
  },


  getFotoPerfil: async (codigoOperador) => {
    try {
      const response = await medicoClient.get('/Medico/FotoDePerfil', {
        params: {
          codigoOperador: codigoOperador
        },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

export default medicoClient;