import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { pacienteService } from '../../services/Paciente';
import './Patients.css';
import Alert from '../../components/custom/Alert';
import logo from '../../logo.png'; 

const Patients = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('patients');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    documentoFederal: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  useEffect(() => {
    fetchPatients();
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        const homeData = await usuarioService.getHome();
        setUserData({ name: homeData.nomeUsuario });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };
    fetchUserData();
  }, [navigate]);

const fetchPatients = async () => {
  try {
    const response = await pacienteService.getAllPacientes();
    const mapped = (response?.listaPacientes || response || []).map(p => ({
      id: p.codigo,
      name: p.nome,
      email: p.email || 'Não informado',
      phone: p.telefone ? formatPhone(p.telefone) : 'Não informado',
      documentoFederal: p.documentoFederal ? formatCPF(p.documentoFederal) : 'Não informado',
      situacao: p.situacao === 0 ? 'Ativo' : 'Desativo',
      dtInclusao: p.dtInclusao ? new Date(p.dtInclusao).toLocaleDateString() : '',
      dtSituacao: p.dtSituacao ? new Date(p.dtSituacao).toLocaleDateString() : '',
    }));
    setPatients(mapped);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    if (error.response?.status === 401) {
      usuarioService.logout();
      navigate('/login');
    }
    setPatients([]);
  }
};


  const handleNavigation = (page) => {
    setActivePage(page);
    navigate(`/${page}`);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPatient = () => {
    setFormData({ nome: '', email: '', telefone: '', documentoFederal: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === parseInt(cpf.substring(10, 11));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
  const validatePhone = (phone) => {
    const p = phone.replace(/[^\d]/g, '');
    return p.length >= 10 && p.length <= 11;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    else if (!validatePhone(formData.telefone)) newErrors.telefone = 'Telefone inválido';
    if (!formData.documentoFederal.trim()) newErrors.documentoFederal = 'CPF é obrigatório';
    else if (!validateCPF(formData.documentoFederal)) newErrors.documentoFederal = 'CPF inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (v) => {
    const cpf = v.replace(/\D/g, '');
    return cpf.length <= 3 ? cpf :
      cpf.length <= 6 ? `${cpf.slice(0, 3)}.${cpf.slice(3)}` :
      cpf.length <= 9 ? `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}` :
      `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const formatPhone = (v) => {
    const p = v.replace(/\D/g, '');
    return p.length <= 2 ? p :
      p.length <= 7 ? `(${p.slice(0, 2)}) ${p.slice(2)}` :
      `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}`;
  };

  const handleCPFChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, documentoFederal: formatCPF(raw) });
    if (errors.documentoFederal) setErrors({ ...errors, documentoFederal: null });
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, telefone: formatPhone(raw) });
    if (errors.telefone) setErrors({ ...errors, telefone: null });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsSubmitting(true);

  const data = {
        nome: formData.nome,
        documentoFederal: formData.documentoFederal.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email
    };

    try {
        console.log(FormData)
        if (formData.id) {
        await pacienteService.updatePaciente({
            codigoPaciente: formData.id,
            ...data
        });
        } else {
        await pacienteService.createPaciente(data);
        }

        setShowModal(false);
        await fetchPatients();
        showAlert('success', 'Sucesso', formData.id ? 'Paciente atualizado com sucesso' : 'Paciente cadastrado com sucesso');
    } catch (error) {
        showAlert('error', 'Erro', error.response?.data?.mensagem || 'Erro ao processar');
    } finally {
        setIsSubmitting(false);
    }
 };


  const handleEdit = async (id) => {
  try {
    const paciente = await pacienteService.getPacienteById(id);
    setFormData({
      nome: paciente.nome || '',
      email: paciente.email || '',
      telefone: formatPhone(paciente.telefone || ''),
      documentoFederal: formatCPF(paciente.documentoFederal || ''),
      id: paciente.codigo
    });
    setErrors({});
    setShowModal(true);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
  }
};


  const handleDelete = (id) => {
    setPatientToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await pacienteService.deletePaciente(patientToDelete);
      await fetchPatients();
      setShowDeleteModal(false);
      showAlert('success', 'Sucesso', 'Paciente excluído com sucesso');
    } catch (error) {
      showAlert('error', 'Erro', error.response?.data?.mensagem || 'Erro ao excluir paciente');
      setShowDeleteModal(false);
    }
  };

  const getFirstLetters = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
  };

  const handleLogout = () => {
    usuarioService.logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo-sidebar">
          <img src={logo} alt="AUZ" className="logo-img" />
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
          className={`menu-item ${activePage === 'patients' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); handleNavigation('patients'); }}
        >
          <svg className="menu-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
            <path d="M8 3v4"></path>
            <path d="M16 3v4"></path>
            <path d="M12 11v6"></path>
            <path d="M9 14h6"></path>
          </svg>
          <span className="menu-item-text">Pacientes</span>
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
          <div className="page-title-section">
            <div className="page-title">
              <svg className="page-title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                <path d="M8 3v4"></path>
                <path d="M16 3v4"></path>
                <path d="M12 11v6"></path>
                <path d="M9 14h6"></path>
              </svg>
              Pacientes
            </div>
            <button className="add-button" onClick={handleNewPatient}>
              <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Cadastrar Paciente
            </button>
          </div>
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
              placeholder="Buscar pacientes..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="patients-grid">
          <table className="patients-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Situação</th>
                    <th>Dt. Inclusão</th>
                    <th>Dt. Situação</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                    <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.documentoFederal}</td>
                        <td>{patient.phone}</td>
                        <td>{patient.situacao}</td>
                        <td>{patient.dtInclusao}</td>
                        <td>{patient.dtSituacao}</td>
                        <td className="actions-cell">
                        <button 
                            className="action-button edit-button" 
                            onClick={() => handleEdit(patient.id)}
                            title="Editar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button 
                            className="action-button delete-button" 
                            onClick={() => handleDelete(patient.id)}
                            title="Excluir">
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
                    <td colSpan="8" className="no-data">Nenhum paciente encontrado</td>
                    </tr>
                )}
                </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Paciente */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? 'Editar Paciente' : 'Cadastrar Paciente'}</h2>
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

       {/* Modal de Confirmação de Exclusão */}
    {showDeleteModal && (
      <div className="modal-overlay">
        <div className="modal-popup delete-modal">
          <div className="modal-popup-header">
            <h3>Excluir Paciente</h3>
            <button 
              className="modal-popup-close"
              onClick={() => setShowDeleteModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-popup-body">
            <div className="warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <p>Tem certeza que deseja excluir permanentemente este paciente?</p>
          </div>
          <div className="modal-popup-footer">
            <button 
              className="modal-popup-btn secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="modal-popup-btn danger"
              onClick={confirmDelete}
            >
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

export default Patients;
