import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor criado pra gente  adicionar o token em todas as requisições(tenho que testar ainda)
apiClient.interceptors.request.use(
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
export const authService = {
  login: async (email, senha) => {
    try {
      const response = await apiClient.post('/Usuario/Login', { email, senha });
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  register: async (nome, email, senha, tipoPermissao = 0) => {
    try {
      const response = await apiClient.post('/Usuario', { nome, email, senha, tipoPermissao });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('authToken') !== null;
  }
};
export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/Usuario/Current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // a gente pode colocar mais metodos relacionados ao usuario se precisar aqui
};

export default apiClient;