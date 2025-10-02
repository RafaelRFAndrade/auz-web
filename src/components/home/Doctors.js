import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { medicoService } from '../../services/Medico';
import './Doctors.css';
import Alert from '../../components/custom/Alert';

const Doctors = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message) => {
    setAlert({
      show: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      show: false
    }));
  };

  // Debounce para busca
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const fetchDoctors = useCallback(async (filtro = '') => {
    try {
      setIsLoading(true);
      const response = await medicoService.getAllMedicos(filtro, 0, 100);
      
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
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Função de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchDoctors(searchValue);
    }, 500),
    [fetchDoctors]
  );

  useEffect(() => {
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
        }
      }
    };

    fetchUserData();
    fetchDoctors(); // Carrega todos os médicos inicialmente
  }, [navigate, fetchDoctors]);

  // Busca quando o termo de pesquisa muda
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

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
      await fetchDoctors(searchTerm); // Recarrega com o filtro atual
      
      setFormData({
        nome: '',
        crm: '',
        email: '',
        telefone: '',
        documentoFederal: '',
      });
      
        showAlert(
          'success', 
          'Médico Salvo', 
          formData.id ? 'Médico atualizado com sucesso!' : 'Médico cadastrado com sucesso!'
        );

    } catch (error) {
      console.error('Erro ao cadastrar/atualizar médico:', error);
      
      showAlert(
        'error',
        'Erro ao Salvar',
        error.response?.data?.message || 'Erro ao processar a solicitação'
      );
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
        id: medico.codigo 
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
      await fetchDoctors(searchTerm); // Recarrega com o filtro atual
      setShowDeleteModal(false);
      showAlert('success', 'Sucesso', 'Médico excluído com sucesso!');
    } catch (error) {
      showAlert(
        'error', 
        'Ocorreu um Erro', 
        error.response?.data?.mensagem || 'Erro ao excluir médico'
      );
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="doctors-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Operadores</span> 
              </h1>
              <p className="welcome-subtitle">
                Gerencie o cadastro de operadores da clínica
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleNewDoctor}>
                <span className="btn-icon">➕</span>
                Cadastrar Operador
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Buscar operadores por nome ou CRM..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              {isLoading && (
                <div className="search-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="doctors-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                <path d="M8 3v4"></path>
                <path d="M16 3v4"></path>
                <path d="M12 11v6"></path>
                <path d="M9 14h6"></path>
              </svg>
              Lista de Operadores
            </div>
            <div className="section-count">
              {doctors.length} médico{doctors.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando operadores...</div>
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.length > 0 ? (
                doctors.map(doctor => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="card-header">
                      <div className="doctor-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="doctor-info">
                        <h3 className="doctor-name">{doctor.name}</h3>
                        <p className="doctor-crm">CRM: {doctor.crm}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEdit(doctor.id)}
                          title="Editar operador"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(doctor.id)}
                          title="Excluir operador"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span className="info-label">Email:</span>
                        <span className="info-value">{doctor.email}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span className="info-label">Telefone:</span>
                        <span className="info-value">{doctor.phone}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="empty-title">Nenhum operador encontrado</h3>
                  <p className="empty-description">
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre o primeiro médico da clínica'}
                  </p>
                  {!searchTerm && (
                    <button className="btn-primary" onClick={handleNewDoctor}>
                      <span className="btn-icon">➕</span>
                      Cadastrar Primeiro Operador
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Médico */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? 'Editar Médico' : 'Cadastrar Médico'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
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
                
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    <span className="btn-icon">✕</span>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    <span className="btn-icon">{isSubmitting ? '⏳' : '💾'}</span>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

       {/* Modal de Confirmação de Exclusão */}
    {showDeleteModal && (
      <div className="modal-overlay">
        <div className="modal-popup delete-modal">
          <div className="modal-popup-header">
            <h3>Excluir Médico</h3>
            <button 
              className="btn-close"
              onClick={() => setShowDeleteModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="modal-popup-body">
            <div className="warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <p>Tem certeza que deseja excluir permanentemente este operador?</p>
          </div>
          <div className="modal-popup-footer">
            <button 
              className="btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              <span className="btn-icon">✕</span>
              Cancelar
            </button>
            <button 
              className="btn-danger"
              onClick={confirmDelete}
            >
              <span className="btn-icon">🗑️</span>
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}

       {/* alerta de Erro */}
       <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        duration={7000} // 7 segundos
      />
  </div>
  );
};             


export default Doctors;