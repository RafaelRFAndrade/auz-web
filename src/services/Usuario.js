import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

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

export const usuarioService = {
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

  register: async (nome, email, senha, tipoPermissao = 0) => {
    try {
      const response = await usuarioClient.post('/Usuario', { nome, email, senha, tipoPermissao });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('authToken') !== null;
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
      return payload.userId; 
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
};

export default usuarioClient;
