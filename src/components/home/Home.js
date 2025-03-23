import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const homeData = await usuarioService.getHome(); 
        setUserData({ name: homeData.nomeUsuario }); 
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    usuarioService.logout();
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