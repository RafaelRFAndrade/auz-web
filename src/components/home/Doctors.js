import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import './Doctors.css';

const Doctors = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('doctors');
  const navigate = useNavigate();

  const mockDoctors = [
    { id: 1, name: 'Dr. João Silva', specialty: 'Cardiologia', crm: '12345-SC', phone: '(11) 98765-4321' },
    { id: 2, name: 'Dra. Maria Oliveira', specialty: 'Pediatria', crm: '54321-SP', phone: '(11) 91234-5678' },
    { id: 3, name: 'Dr. Carlos Santos', specialty: 'Ortopedia', crm: '67890-BA', phone: '(11) 92345-6789' },
    { id: 4, name: 'Dra. Emmanuel Arrombus', specialty: 'Psicologia', crm: '09876-RS', phone: '(11) 93456-7890' },
    { id: 5, name: 'Dr. Pedro Almeida', specialty: 'Dermatologia', crm: '34567-RJ', phone: '(11) 94567-8901' },
  ];

  useEffect(() => {
    setDoctors(mockDoctors);
    
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          // Apenas para desenvolvimento, não redireciona se não estiver autenticado
          // Em prod precismoas descomentar estas linhas
          // navigate('/login');
          // return;
        } else {
          // Se estiver autenticado, busca os dados do usuário
          const homeData = await usuarioService.getHome();
          setUserData({ name: homeData.nomeUsuario });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          usuarioService.logout();
          // navigate('/login'); // Comentado para teste mock
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/login');
  };

  const getFirstLetters = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    
    if (page === 'home') {
      navigate('/');
    } else if (page === 'doctors') {
      navigate('/doctors');
    } else if (page === 'patients') {
      navigate('/patients');
    } else if (page === 'requests') {
      navigate('/requests');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.crm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewDoctor = () => {
    console.log('Cadastrar novo médico');
  };

  const handleEdit = (id) => {
    console.log('Editar médico', id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este médico?')) {
      console.log('Excluir médico', id);
      setDoctors(doctors.filter(doctor => doctor.id !== id));
    }
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo-sidebar">
          <img src="/logo.svg" alt="AUZ" />
        </div>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="menu-item-text">Início</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'doctors' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('doctors'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
            <path d="M8 3v4"></path>
            <path d="M16 3v4"></path>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
          <span className="menu-item-text">Médicos</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'patients' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('patients'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="menu-item-text">Pacientes</span>
        </a>
        
        <a 
          href="#" 
          className={`menu-item ${activePage === 'requests' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('requests'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="menu-item-text">Solicitações</span>
        </a>
        
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {getFirstLetters(userData.name)}
            </div>
            <div className="user-name">{userData.name}</div>
          </div>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            title="Sair">
            Sair
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">
            <svg className="page-title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
              <path d="M8 3v4"></path>
              <path d="M16 3v4"></path>
              <path d="M12 11v6"></path>
              <path d="M9 14h6"></path>
            </svg>
            Médicos
          </div>
          <button className="add-button" onClick={handleNewDoctor}>
            <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Cadastrar Médico
          </button>
        </div>
        
        <div className="search-container">
          <div className="search-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar médicos..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="doctors-grid">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especialidade</th>
                <th>CRM</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.crm}</td>
                    <td>{doctor.phone}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-button edit-button" 
                        onClick={() => handleEdit(doctor.id)}
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-button delete-button" 
                        onClick={() => handleDelete(doctor.id)}
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">Nenhum médico encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Doctors;