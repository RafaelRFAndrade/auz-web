import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { pacienteService } from '../../services/Paciente';
import './Patients.css';
import Alert from '../../components/custom/Alert';

const Patients = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    documentoFederal: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Debounce para busca
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const fetchPatients = useCallback(async (filtro = '') => {
    try {
      setIsLoading(true);
      const response = await pacienteService.getAllPacientes(filtro, 0, 100);
      
      console.log('Resposta do serviço de pacientes:', response);
      
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
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Função de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchPatients(searchValue);
    }, 500),
    [fetchPatients]
  );

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
        console.error('Erro ao buscar usuário:', error);
        if (error.response?.status === 401) {
          usuarioService.logout();
          navigate('/login');
        }
      }
    };

    fetchUserData();
    fetchPatients(); // Carrega todos os pacientes inicialmente
  }, [navigate, fetchPatients]);

  // Busca quando o termo de pesquisa muda
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

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
      if (formData.id) {
        await pacienteService.updatePaciente({
          codigoPaciente: formData.id,
          ...data
        });
      } else {
        await pacienteService.createPaciente(data);
      }

      setShowModal(false);
      await fetchPatients(searchTerm); // Recarrega com o filtro atual
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
      await fetchPatients(searchTerm); // Recarrega com o filtro atual
      setShowDeleteModal(false);
      showAlert('success', 'Sucesso', 'Paciente excluído com sucesso');
    } catch (error) {
      showAlert('error', 'Erro', error.response?.data?.mensagem || 'Erro ao excluir paciente');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="patients-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Pacientes</span> 👥
              </h1>
              <p className="welcome-subtitle">
                Gerencie o cadastro de pacientes da clínica
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleNewPatient}>
                <span className="btn-icon">👤➕</span>
                Cadastrar Paciente
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
                placeholder="Buscar pacientes por nome..." 
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

        {/* Patients Grid */}
        <div className="patients-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Lista de Pacientes
            </div>
            <div className="section-count">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando pacientes...</div>
            </div>
          ) : (
            <div className="patients-grid">
              {patients.length > 0 ? (
                patients.map(patient => (
                  <div key={patient.id} className="patient-card">
                    <div className="card-header">
                      <div className="patient-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="patient-info">
                        <h3 className="patient-name">{patient.name}</h3>
                        <p className="patient-cpf">CPF: {patient.documentoFederal}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEdit(patient.id)}
                          title="Editar paciente"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(patient.id)}
                          title="Excluir paciente"
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
                        <span className="info-value">{patient.email}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span className="info-label">Telefone:</span>
                        <span className="info-value">{patient.phone}</span>
                      </div>
                      <div className="info-row">
                        <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="info-label">Situação:</span>
                        <span className="info-value">{patient.situacao}</span>
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
                  <h3 className="empty-title">Nenhum paciente encontrado</h3>
                  <p className="empty-description">
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre o primeiro paciente da clínica'}
                  </p>
                  {!searchTerm && (
                    <button className="btn-primary" onClick={handleNewPatient}>
                      <span className="btn-icon">👤➕</span>
                      Cadastrar Primeiro Paciente
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Paciente */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? 'Editar Paciente' : 'Cadastrar Paciente'}</h2>
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
            <h3>Excluir Paciente</h3>
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
            <p>Tem certeza que deseja excluir permanentemente este paciente?</p>
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

export default Patients;