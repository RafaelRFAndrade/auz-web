import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        // irmao aqui a gente pode adicionar uma chamada para obter dados do usuário se precisar
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          authService.logout();
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ 
      color: 'white', 
      backgroundColor: '#121212', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <h1>Página Inicial</h1>
      <p>Bem-vindo à sua conta, {userData.name}</p>
      
      <button 
        onClick={handleLogout}
        style={{
          backgroundColor: '#474747',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Sair
      </button>
    </div>
  );
};

export default Home;