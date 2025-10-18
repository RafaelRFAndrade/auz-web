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

  getPacienteById: async (codigoPaciente) => {
    try {
      const response = await pacienteClient.get(`/Paciente/${codigoPaciente}`);
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

  updatePacienteDetalhado: async (pacienteData) => {
    try {
      // Mapear estado civil para enum
      const mapearEstadoCivil = (estadoCivil) => {
        switch (estadoCivil) {
          case 'S': return 0; // Solteiro
          case 'C': return 1; // Casado
          case 'D': return 2; // Divorciado
          case 'V': return 3; // Viuvo
          case 'U': return 4; // Separado (União Estável mapeado como Separado)
          default: return null;
        }
      };

      // Converter altura e peso para decimal
      const converterParaDecimal = (valor) => {
        if (!valor || valor === '' || valor === null) return null;
        const num = parseFloat(valor);
        return isNaN(num) ? null : num;
      };

      // Converter data de nascimento
      const converterDataNascimento = (data) => {
        if (!data || data === '' || data === null) return null;
        return new Date(data).toISOString();
      };

      const response = await pacienteClient.put('/Paciente/Detalhado', {
        codigoPaciente: pacienteData.codigo,
        nome: pacienteData.nome,
        documentoFederal: pacienteData.documentoFederal,
        telefone: pacienteData.telefone,
        email: pacienteData.email,
        dataNascimento: converterDataNascimento(pacienteData.dataNascimento),
        altura: converterParaDecimal(pacienteData.altura),
        peso: converterParaDecimal(pacienteData.peso),
        contatoEmergencia: pacienteData.contatoEmergencia || null,
        genero: pacienteData.genero || null,
        estadoCivil: mapearEstadoCivil(pacienteData.estadoCivil),
        cep: pacienteData.cep || null,
        logradouro: pacienteData.logradouro || null,
        numero: pacienteData.numero || null,
        complemento: pacienteData.complemento || null,
        bairro: pacienteData.bairro || null,
        cidade: pacienteData.cidade || null,
        uf: pacienteData.uf || null,
        possuiEspecificacoes: pacienteData.possuiEspecificacoes || false,
        descricaoEspecificacoes: pacienteData.descricaoEspecificacoes || null
      });
      return response.data;
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