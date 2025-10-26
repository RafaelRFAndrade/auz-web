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
  const [pagination, setPagination] = useState({
    pagina: 1,
    itensPorPagina: 25,
    totalItens: 0,
    totalPaginas: 0
  });
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

  const fetchPatients = useCallback(async (filtro = '', pagina = 1) => {
    try {
      setIsLoading(true);
      const response = await pacienteService.getAllPacientes(filtro, pagina, pagination.itensPorPagina);
      
      console.log('📋 Response pacientes:', response);
      
      if (response && response.listaPacientes && Array.isArray(response.listaPacientes)) {
        const mapped = response.listaPacientes.map(p => ({
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
        
        // Atualizar informações de paginação
        const totalItens = response.itens || 0;
        const totalPaginas = response.totalPaginas || Math.ceil(totalItens / pagination.itensPorPagina);
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      } 
      else if (Array.isArray(response)) {
        const mapped = response.map(p => ({
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
        
        // Se não há informações de paginação na resposta, usar valores padrão
        const totalItens = response.length === 25 ? 26 : response.length; // Assumir que há mais se temos 25
        const totalPaginas = Math.ceil(totalItens / pagination.itensPorPagina);
        
        setPagination(prev => ({
          ...prev,
          pagina: pagina,
          totalItens: totalItens,
          totalPaginas: totalPaginas
        }));
      }
      else {
        console.error('Formato de resposta inesperado:', response);
        setPatients([]);
        setPagination(prev => ({
          ...prev,
          pagina: 1,
          totalItens: 0,
          totalPaginas: 0
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      if (error.response?.status === 401) {
        usuarioService.logout();
        navigate('/login');
      }
      setPatients([]);
      setPagination(prev => ({
        ...prev,
        pagina: 1,
        totalItens: 0,
        totalPaginas: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, [navigate, pagination.itensPorPagina]);

  // Função de busca com debounce
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchPatients(searchValue, 1); // Reset para primeira página ao buscar
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
    fetchPatients('', 1); // Carrega primeira página de pacientes
  }, [navigate, fetchPatients]);

  // Busca quando o termo de pesquisa muda (apenas se não for a primeira carga)
  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Funções de paginação
  const handlePageChange = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= pagination.totalPaginas) {
      fetchPatients(searchTerm, novaPagina);
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(pagination.pagina - 1);
  const handleNextPage = () => handlePageChange(pagination.pagina + 1);
  const handleLastPage = () => handlePageChange(pagination.totalPaginas);

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
      await fetchPatients(searchTerm, pagination.pagina); // Recarrega com o filtro atual
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
      await fetchPatients(searchTerm, pagination.pagina); // Recarrega com o filtro atual
      setShowDeleteModal(false);
      showAlert('success', 'Sucesso', 'Paciente excluído com sucesso');
    } catch (error) {
      showAlert('error', 'Erro', error.response?.data?.mensagem || 'Erro ao excluir paciente');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="patients-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">Gerencie o cadastro de pacientes</p>
          </div>
          <button className="add-button" onClick={handleNewPatient}>
            <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por nome, CPF ou email..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          {isLoading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>

      {/* Patients List */}
      <div className="patients-section">
        <div className="section-header">
          <h2 className="section-title">Lista de Pacientes</h2>
          <div className="patients-count">
            {pagination.totalItens} paciente{pagination.totalItens !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p className="loading-text">Carregando pacientes...</p>
          </div>
        ) : (
          <div className="patients-list">
            {patients.length > 0 ? (
              patients.map(patient => (
                <div key={patient.id} className="patient-item">
                  <div className="patient-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  
                  <div className="patient-info">
                    <div className="patient-main">
                      <h3 className="patient-name" title={patient.name}>
                        {patient.name}
                      </h3>
                      <div className="patient-cpf" title={patient.documentoFederal}>
                        {patient.documentoFederal}
                      </div>
                    </div>
                    
                    <div className="patient-details">
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span className="detail-label">Email:</span>
                        <span className="detail-value" title={patient.email}>
                          {patient.email}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span className="detail-label">Telefone:</span>
                        <span className="detail-value" title={patient.phone}>
                          {patient.phone}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${patient.situacao.toLowerCase()}`}>
                          {patient.situacao}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="patient-actions">
                    <button 
                      className="action-btn view-btn" 
                      onClick={() => navigate(`/patient-details/${patient.id}`)}
                      title="Ver detalhes"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(patient.id)}
                      title="Editar"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDelete(patient.id)}
                      title="Excluir"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="empty-title">Nenhum paciente encontrado</h3>
                <p className="empty-description">
                  {searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre o primeiro paciente da clínica'}
                </p>
                {!searchTerm && (
                  <button className="add-button" onClick={handleNewPatient}>
                    <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Cadastrar Primeiro Paciente
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && patients.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Página {pagination.pagina} de {pagination.totalPaginas}
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={handleFirstPage}
                disabled={pagination.pagina === 1}
                title="Primeira página"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="11,19 2,12 11,5"></polyline>
                  <polyline points="22,19 13,12 22,5"></polyline>
                </svg>
              </button>
              <button 
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={pagination.pagina === 1}
                title="Página anterior"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.pagina <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.pagina >= pagination.totalPaginas - 2) {
                    pageNum = pagination.totalPaginas - 4 + i;
                  } else {
                    pageNum = pagination.pagina - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-number ${pagination.pagina === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={pagination.pagina === pagination.totalPaginas}
                title="Próxima página"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
              <button 
                className="pagination-btn"
                onClick={handleLastPage}
                disabled={pagination.pagina === pagination.totalPaginas}
                title="Última página"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13,19 22,12 13,5"></polyline>
                  <polyline points="2,19 11,12 2,5"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {formData.id ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome" className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`form-input ${errors.nome ? 'error' : ''}`}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && <span className="error-text">{errors.nome}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="exemplo@email.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="telefone" className="form-label">Telefone *</label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  className={`form-input ${errors.telefone ? 'error' : ''}`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                {errors.telefone && <span className="error-text">{errors.telefone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="documentoFederal" className="form-label">CPF *</label>
                <input
                  type="text"
                  id="documentoFederal"
                  name="documentoFederal"
                  value={formData.documentoFederal}
                  onChange={handleCPFChange}
                  className={`form-input ${errors.documentoFederal ? 'error' : ''}`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.documentoFederal && <span className="error-text">{errors.documentoFederal}</span>}
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2 className="modal-title">Excluir Paciente</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p className="warning-text">
                Tem certeza que deseja excluir permanentemente este paciente?
              </p>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        duration={7000}
      />
    </div>
  );
};

export default Patients;