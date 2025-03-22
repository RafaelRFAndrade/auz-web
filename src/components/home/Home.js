import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    
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