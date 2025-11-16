import axios from 'axios';

const API_BASE_URL = 'http://189.126.105.186:8080';

const usuarioClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

usuarioClient.interceptors.request.use(
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
usuarioClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
          delete usuarioClient.defaults.headers.common['Authorization'];
          
          // Redireciona para login se não estiver já na página de login
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
      // Erro de rede
      console.error('Erro de conexão:', 'Verifique sua conexão com a internet');
    } else {
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const usuarioService = {
  obterUsuariosPorParceiro: async (pagina = 1, itens = 25, filtro = '') => {
    try {
      const response = await usuarioClient.get('/Usuario/ObterUsuariosPorParceiro', {
        params: {
          pagina,
          itens,
          filtro
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (email, senha) => {
    try {
      const response = await usuarioClient.post('/Usuario/Login', { email, senha });
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        usuarioClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    delete usuarioClient.defaults.headers.common['Authorization'];
  },

  register: async (nome, email, senha, nomeParceiro, tipoPermissao = 0) => {
    try {
      const response = await usuarioClient.post('/Usuario', { nome, email, senha, nomeParceiro, tipoPermissao });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cadastrarUsuarioPorParceiro: async (nome, email, senha, tipoPermissao) => {
    try {
      const response = await usuarioClient.post('/Usuario/UsuarioPorParceiro', {
        nome,
        email,
        senha,
        tipoPermissao
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  atualizarUsuario: async (codigo, situacao, nome, email, senha, tipoPermissao) => {
    try {
      const response = await usuarioClient.patch('/Usuario', {
        codigo,
        situacao,
        nome,
        email,
        senha,
        tipoPermissao
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  excluirUsuario: async (codigoUsuario) => {
    try {
      const response = await usuarioClient.delete('/Usuario', {
        data: {
          codigoUsuario
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  obterParceiro: async () => {
    try {
      const response = await usuarioClient.get('/Parceiro');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  atualizarParceiro: async (codigo, nome, razaoSocial, cnpj, cep, logradouro, numero, complemento, bairro, cidade, uf, telefone, email) => {
    try {
      const response = await usuarioClient.patch('/Parceiro', {
        codigo,
        nome,
        razaoSocial,
        cnpj,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        telefone,
        email
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
  
    if (!token) return false;
  
    try {
      // Decodifica o payload do JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verifica se o token expirou
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        // Token expirado, remove do localStorage
        localStorage.removeItem('authToken');
        delete usuarioClient.defaults.headers.common['Authorization'];
        return false;
      }
      
      return true;
    } catch (error) {
      // Token inválido, remove do localStorage
      console.error('Token inválido:', error);
      localStorage.removeItem('authToken');
      delete usuarioClient.defaults.headers.common['Authorization'];
      return false;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await usuarioClient.get('/Usuario/Current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getHome: async () => {
    try {
      const response = await usuarioClient.get('/Usuario/Home');
      return response.data; 
    } catch (error) {
      throw error;
    }
  },

  getUserId: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verifica se o token expirou
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('authToken');
        delete usuarioClient.defaults.headers.common['Authorization'];
        return null;
      }
      
      return payload.userId || payload.sub || payload.id;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      localStorage.removeItem('authToken');
      delete usuarioClient.defaults.headers.common['Authorization'];
      return null;
    }
  },

  // Método para verificar se o token está próximo do vencimento
  isTokenExpiringSoon: (minutesThreshold = process.env.REACT_APP_TOKEN_EXPIRY_WARNING_MINUTES || 5) => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      const thresholdInSeconds = minutesThreshold * 60;
      
      return timeUntilExpiry <= thresholdInSeconds && timeUntilExpiry > 0;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return false;
    }
  },

  // Método para obter informações do token
  getTokenInfo: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        userId: payload.userId || payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role || payload.Role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], // Múltiplas possibilidades
        parceiroId: payload.ParceiroId, // ParceiroId claim do backend
        exp: payload.exp,
        iat: payload.iat,
        isExpired: payload.exp ? Math.floor(Date.now() / 1000) >= payload.exp : false
      };
    } catch (error) {
      console.error('Erro ao obter informações do token:', error);
      return null;
    }
  },

  relacionarUsuario: async (codigoMedico) => {
    try {
      const response = await usuarioClient.post('/Usuario/Relacionar', {
        codigoMedico: codigoMedico
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default usuarioClient;
