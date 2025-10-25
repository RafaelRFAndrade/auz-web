import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const operacionalClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

operacionalClient.interceptors.request.use(
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

// Interceptor de resposta para tratamento global de erros
operacionalClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          localStorage.removeItem('authToken');
          delete operacionalClient.defaults.headers.common['Authorization'];
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Acesso negado:', response.data?.message || 'Sem permissão para acessar este recurso');
          break;
        case 404:
          console.error('Recurso não encontrado:', response.data?.message || 'Endpoint não encontrado');
          break;
        case 422:
          console.error('Dados inválidos:', response.data?.message || 'Verifique os dados enviados');
          break;
        case 500:
          console.error('Erro interno do servidor:', response.data?.message || 'Tente novamente mais tarde');
          break;
        default:
          console.error(`Erro ${response.status}:`, response.data?.message || 'Erro desconhecido');
      }
    } else if (error.request) {
      console.error('Erro de conexão:', 'Verifique sua conexão com a internet');
    } else {
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const operacionalService = {
  // Buscar relacionamentos do usuário
  obterRelacionamentos: async (pagina = 1, itensPorPagina = 10) => {
    try {
      const response = await operacionalClient.get('/Usuario/Relacionamentos', {
        params: {
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar agendamentos operacionais
  obterAgendamentosOperacionais: async (codigoMedicoUsuarioOperacional, pagina = 1, itensPorPagina = 5) => {
    try {
      const response = await operacionalClient.get('/Agendamento/Operacional', {
        params: {
          CodigoMedicoUsuarioOperacional: codigoMedicoUsuarioOperacional,
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar pacientes operacionais
  obterPacientesOperacionais: async (codigoMedicoUsuarioOperacional, pagina = 1, itensPorPagina = 10) => {
    try {
      const response = await operacionalClient.get('/Paciente/Operacional', {
        params: {
          CodigoMedicoUsuarioOperacional: codigoMedicoUsuarioOperacional,
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default operacionalClient;
