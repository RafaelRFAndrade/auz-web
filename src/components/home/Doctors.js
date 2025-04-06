import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { medicoService } from '../../services/Medico';
import './Doctors.css';

const Doctors = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('doctors');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    crm: '',
    email: '',
    telefone: '',
    documentoFederal: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
    
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
            navigate('/login');
            return;
        } else {
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

  const fetchDoctors = async () => {
    try {
      const response = await medicoService.getAllMedicos();
      
      console.log('Resposta do serviço de médicos:', response);
      
      if (response && response.listaMedicos && Array.isArray(response.listaMedicos)) {
        const mappedDoctors = response.listaMedicos.map(doc => ({
          id: doc.codigo, 
          name: doc.nome,
          email: doc.email || 'Não informada',
          crm: doc.crm,
          phone: doc.telefone
        }));
        
        setDoctors(mappedDoctors);
      } 
      else if (Array.isArray(response)) {
        const mappedDoctors = response.map(doc => ({
          id: doc.codigo || doc.id,
          name: doc.nome,
          email: doc.email || 'Não informada',
          crm: doc.crm,
          phone: doc.telefone
        }));
        
        setDoctors(mappedDoctors);
      }
      else {
        console.error('Formato de resposta inesperado:', response);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
      if (error.response && error.response.status === 401) {
        usuarioService.logout();
        navigate('/login');
      }
      setDoctors([]);
    }
  };

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
    doctor.crm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewDoctor = () => {
    setFormData({
      nome: '',
      crm: '',
      email: '',
      telefone: '',
      documentoFederal: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const phoneNumber = phone.replace(/[^\d]/g, '');
    return phoneNumber.length >= 10 && phoneNumber.length <= 11;
  };

  const validateCRM = (crm) => {
    const re = /^\d{4,6}[-/][A-Za-z]{2}$/;
    return re.test(String(crm).toUpperCase());
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.crm.trim()) {
      newErrors.crm = 'CRM é obrigatório';
    } else if (!validateCRM(formData.crm)) {
      newErrors.crm = 'CRM inválido. Use o formato XXXXX-UF (ex: 12345-SP)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido. Use o formato (XX) XXXXX-XXXX';
    }
    
    if (!formData.documentoFederal.trim()) {
      newErrors.documentoFederal = 'CPF é obrigatório';
    } else if (!validateCPF(formData.documentoFederal)) {
      newErrors.documentoFederal = 'CPF inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const medicoData = {
        nome: formData.nome,
        crm: formData.crm.toUpperCase().replace('-', '/'), 
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''), 
        documentoFederal: formData.documentoFederal.replace(/\D/g, '')
      };
      
      if (formData.id) {
        await medicoService.updateMedico(formData.id, medicoData);
      } else {
        await medicoService.createMedico(medicoData);
      }
      
      setShowModal(false);
      await fetchDoctors();
      
      setFormData({
        nome: '',
        crm: '',
        email: '',
        telefone: '',
        documentoFederal: '',
      });
      
    } catch (error) {
      console.error('Erro ao cadastrar/atualizar médico:', error);
      
      if (error.response && error.response.data) {
        setErrors({
          ...errors,
          general: error.response.data.message || 'Erro ao processar a solicitação'
        });
      } else {
        setErrors({
          ...errors,
          general: 'Erro ao conectar com o servidor'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const formatPhone = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 2) return phone;
    if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  };

  const handleCPFChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatCPF(rawValue);
    setFormData({
      ...formData,
      documentoFederal: formattedValue
    });
    
    if (errors.documentoFederal) {
      setErrors({
        ...errors,
        documentoFederal: null
      });
    }
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatPhone(rawValue);
    setFormData({
      ...formData,
      telefone: formattedValue
    });
    
    if (errors.telefone) {
      setErrors({
        ...errors,
        telefone: null
      });
    }
  };

  const handleEdit = async (id) => {
    try {
      const medico = await medicoService.getMedicoById(id);
      
      // Formatar CPF e telefone para exibição
      const formattedCPF = formatCPF(medico.documentoFederal || '');
      const formattedPhone = formatPhone(medico.telefone || '');
      
      setFormData({
        nome: medico.nome || '',
        crm: medico.crm || '',
        email: medico.email || '',
        telefone: formattedPhone,
        documentoFederal: formattedCPF,
        id: medico.id 
      });
      
      setErrors({});
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao buscar dados do médico:', error);
    }
  };

  const handleDelete = async (id) => {
    setDoctorToDelete(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      await medicoService.deleteMedico(doctorToDelete);
      await fetchDoctors();
      setShowDeleteModal(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.mensagem || 'Erro ao excluir médico');
      setShowDeleteModal(false);
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
          <span className="menu-item-text">Atendimentos</span>
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
                <th>Email</th>
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
                    <td>{doctor.email}</td>
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

      {/* Modal de Cadastro/Edição de Médico */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? 'Editar Médico' : 'Cadastrar Médico'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="error-message general-error">{errors.general}</div>
                )}
                
                <div className="form-group">
                  <label htmlFor="nome">Nome*</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={errors.nome ? 'input-error' : ''}
                  />
                  {errors.nome && <div className="error-message">{errors.nome}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="crm">CRM*</label>
                  <input
                    type="text"
                    id="crm"
                    name="crm"
                    value={formData.crm}
                    onChange={handleChange}
                    placeholder="12345-UF"
                    className={errors.crm ? 'input-error' : ''}
                  />
                  {errors.crm && <div className="error-message">{errors.crm}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefone">Telefone*</label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className={errors.telefone ? 'input-error' : ''}
                    maxLength={15}
                  />
                  {errors.telefone && <div className="error-message">{errors.telefone}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="documentoFederal">CPF*</label>
                  <input
                    type="text"
                    id="documentoFederal"
                    name="documentoFederal"
                    value={formData.documentoFederal}
                    onChange={handleCPFChange}
                    placeholder="XXX.XXX.XXX-XX"
                    className={errors.documentoFederal ? 'input-error' : ''}
                    maxLength={14}
                  />
                  {errors.documentoFederal && <div className="error-message">{errors.documentoFederal}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={handleCloseModal}>Cancelar</button>
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exclui*/}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este médico?</p>
              <div className="modal-footer">
                <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button className="delete-confirm-button" onClick={confirmDelete}>
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal do Erru */}
      {errorMessage && (
      <div className="modal-overlay">
        <div className="modal-container error-modal">
          <div className="modal-header">
            <h2 className="modal-title">Erro</h2>
            <button className="modal-close" onClick={() => setErrorMessage('')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <p>{errorMessage}</p>
            <div className="modal-footer">
              <button className="confirm-button" onClick={() => setErrorMessage('')}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Doctors;