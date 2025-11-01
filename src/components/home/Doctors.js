import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { medicoService } from '../../services/Medico';
import './Doctors.css';
import Alert from '../../components/custom/Alert';

const DoctorCard = memo(({ doctor, onView, onEdit, onDelete }) => {
  const safeId = String(doctor?.id || '').trim();
  const safeName = String(doctor?.name || '').trim() || 'Nome não informado';
  const safeEmail = String(doctor?.email || '').trim() || 'Não informada';
  const safeCrm = String(doctor?.crm || '').trim() || 'Não informado';
  const safePhone = String(doctor?.phone || '').trim() || 'Não informado';
  const emailValue = safeEmail && safeEmail !== '' && safeEmail !== 'undefined' && safeEmail !== 'null' 
    ? safeEmail 
    : 'Não informada';
  const phoneValue = safePhone && safePhone !== '' && safePhone !== 'undefined' && safePhone !== 'null'
    ? safePhone
    : 'Não informado';
  
  return (
    <div className="doctor-card">
      <div className="card-header">
        <div className="doctor-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div className="doctor-info">
          <h3 className="doctor-name">{safeName}</h3>
          <p className="doctor-crm">CRM: {safeCrm}</p>
        </div>
        <div className="card-actions">
          <button 
            className="btn-details" 
            onClick={onView}
            title="Ver detalhes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button 
            className="btn-edit" 
            onClick={onEdit}
            title="Editar operador"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            className="btn-delete" 
            onClick={onDelete}
            title="Excluir operador"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="card-content" style={{ position: 'relative', width: '100%', minHeight: '120px' }}>
        <div className="info-row info-row-email" style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          width: '100%',
          minHeight: '48px',
          padding: '12px',
          margin: '0',
          flexShrink: 0,
          order: 1
        }}>
          <svg className="info-icon" style={{ flexShrink: 0, width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span className="info-label" style={{ flexShrink: 0, minWidth: '70px', width: '70px' }}>Email:</span>
          <span className="info-value info-value-email" style={{ 
            flex: '1', 
            minWidth: 0,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            display: 'block',
            position: 'relative'
          }}>{emailValue}</span>
        </div>
        <div className="info-row info-row-phone" style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          width: '100%',
          minHeight: '48px',
          padding: '12px',
          margin: '0',
          flexShrink: 0,
          order: 2
        }}>
          <svg className="info-icon" style={{ flexShrink: 0, width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span className="info-label" style={{ flexShrink: 0, minWidth: '70px', width: '70px' }}>Telefone:</span>
          <span className="info-value info-value-phone" style={{ 
            flex: '1', 
            minWidth: 0,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            display: 'block',
            position: 'relative'
          }}>{phoneValue}</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  const idsEqual = String(prevProps.doctor.id || '') === String(nextProps.doctor.id || '');
  const namesEqual = String(prevProps.doctor.name || '') === String(nextProps.doctor.name || '');
  const emailsEqual = String(prevProps.doctor.email || '') === String(nextProps.doctor.email || '');
  const crmsEqual = String(prevProps.doctor.crm || '') === String(nextProps.doctor.crm || '');
  const phonesEqual = String(prevProps.doctor.phone || '') === String(nextProps.doctor.phone || '');
  
  return idsEqual && namesEqual && emailsEqual && crmsEqual && phonesEqual;
});

DoctorCard.displayName = 'DoctorCard';

const Doctors = () => {
  const [userData, setUserData] = useState({ name: 'Usuário' });
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    pagina: 1,
    itensPorPagina: 12,
    totalItens: 0,
    totalPaginas: 0
  });
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const debounceTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const renderKeyRef = useRef(0);

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

  const normalizeDoctor = (doc) => {
    if (!doc) return null;
    
    const normalized = {
      id: String(doc.codigo || doc.id || ''),
      name: String(doc.nome || ''),
      email: String(doc.email || 'Não informada'),
      crm: String(doc.crm || ''),
      phone: String(doc.telefone || 'Não informado')
    };
    
    if (!normalized.id || normalized.id === 'null' || normalized.id === 'undefined') {
      return null;
    }
    
    return normalized;
  };

  const fetchDoctors = useCallback(async (filtro = '', pagina = 1) => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      const itensPorPagina = 12;
      
      setDoctors([]);
      renderKeyRef.current = renderKeyRef.current + 1;
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (!isMountedRef.current) return;
      
      const response = await medicoService.getAllMedicos(filtro, pagina, itensPorPagina);
      
      if (!isMountedRef.current) return;
      
      let mappedDoctors = [];
      
      if (response && response.listaMedicos && Array.isArray(response.listaMedicos)) {
        mappedDoctors = response.listaMedicos
          .map(normalizeDoctor)
          .filter(doc => doc !== null && doc.id && doc.id !== '');
        
        if (isMountedRef.current && mappedDoctors.length > 0) {
          const freshDoctors = mappedDoctors.map(doc => ({
            id: String(doc.id),
            name: String(doc.name),
            email: String(doc.email),
            crm: String(doc.crm),
            phone: String(doc.phone)
          }));
          setDoctors(freshDoctors);
          
          const totalItens = response.itens || 0;
          const totalPaginas = response.totalPaginas || Math.ceil(totalItens / itensPorPagina);
          
          setPagination(prev => ({
            ...prev,
            pagina: pagina,
            totalItens: totalItens,
            totalPaginas: totalPaginas,
            itensPorPagina: itensPorPagina
          }));
        } else if (isMountedRef.current) {
          setDoctors([]);
        }
      } 
      else if (Array.isArray(response)) {
        mappedDoctors = response
          .map(normalizeDoctor)
          .filter(doc => doc !== null && doc.id && doc.id !== '');
        
        if (isMountedRef.current && mappedDoctors.length > 0) {
          const freshDoctors = mappedDoctors.map(doc => ({
            id: String(doc.id),
            name: String(doc.name),
            email: String(doc.email),
            crm: String(doc.crm),
            phone: String(doc.phone)
          }));
          setDoctors(freshDoctors);
          
          const totalItens = response.length === 25 ? 26 : response.length;
          const totalPaginas = Math.ceil(totalItens / itensPorPagina);
          
          setPagination(prev => ({
            ...prev,
            pagina: pagina,
            totalItens: totalItens,
            totalPaginas: totalPaginas,
            itensPorPagina: itensPorPagina
          }));
        } else if (isMountedRef.current) {
          setDoctors([]);
        }
      }
      else {
        if (isMountedRef.current) {
          setDoctors([]);
          setPagination(prev => ({
            ...prev,
            pagina: 1,
            totalItens: 0,
            totalPaginas: 0,
            itensPorPagina: itensPorPagina
          }));
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      if (error.response && error.response.status === 401) {
        usuarioService.logout();
        navigate('/login');
      }
      setDoctors([]);
      setPagination(prev => ({
        ...prev,
        pagina: 1,
        totalItens: 0,
        totalPaginas: 0
      }));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [navigate]);

  const debouncedSearchFunc = useCallback((searchValue) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchDoctors(searchValue, 1);
      }
    }, 500);
  }, [fetchDoctors]);

  useEffect(() => {
    setDoctors([]);
    setDoctors([]);
    setSearchTerm('');
    setIsSearchExpanded(false);
    setIsLoading(true);
    renderKeyRef.current = renderKeyRef.current + 1;
    setPagination({
      pagina: 1,
      itensPorPagina: 12,
      totalItens: 0,
      totalPaginas: 0
    });
    setFormData({
      nome: '',
      crm: '',
      email: '',
      telefone: '',
      documentoFederal: '',
    });
    setErrors({});
    setShowModal(false);
    setShowDeleteModal(false);
    setDoctorToDelete(null);
    setAlert({
      show: false,
      type: 'info',
      title: '',
      message: ''
    });
    
    isMountedRef.current = true;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    const fetchUserData = async () => {
      try {
        if (!usuarioService.isAuthenticated()) {
            navigate('/login');
            return;
        } else {
          const homeData = await usuarioService.getHome();
          if (isMountedRef.current) {
            setUserData({ name: homeData.nomeUsuario });
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          usuarioService.logout();
        }
      }
    };

    fetchUserData();
    
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setDoctors([]);
        renderKeyRef.current = renderKeyRef.current + 1;
        fetchDoctors('', 1);
      }
    }, 150);

    return () => {
      clearTimeout(loadTimer);
      isMountedRef.current = false;
      setDoctors([]);
      setDoctors([]);
      renderKeyRef.current = 0;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [navigate, fetchDoctors]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (searchTerm !== '') {
      debouncedSearchFunc(searchTerm);
    } else if (searchTerm === '' && isMountedRef.current) {
      fetchDoctors('', 1);
    }
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearchFunc, fetchDoctors]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        const searchInput = document.querySelector('.modern-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      setSearchTerm('');
    }
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim() === '') {
      setIsSearchExpanded(false);
    }
  };

  const handlePageChange = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= pagination.totalPaginas && pagination.totalPaginas > 1) {
      setDoctors([]);
      setIsLoading(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchDoctors(searchTerm, novaPagina);
        }
      }, 10);
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(pagination.pagina - 1);
  const handleNextPage = () => handlePageChange(pagination.pagina + 1);
  const handleLastPage = () => handlePageChange(pagination.totalPaginas);

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
    
    let normalizedValue = String(value || '').trim();
    
    if (name === 'nome' || name === 'crm' || name === 'email' || name === 'telefone' || name === 'documentoFederal') {
      normalizedValue = normalizedValue || '';
    }
    
    setFormData({
      ...formData,
      [name]: normalizedValue
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
      await fetchDoctors(searchTerm, pagination.pagina);
      
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
    
    const normalizedCPF = String(formattedValue || '').trim();
    
    setFormData({
      ...formData,
      documentoFederal: normalizedCPF
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
    
    const normalizedPhone = String(formattedValue || '').trim();
    
    setFormData({
      ...formData,
      telefone: normalizedPhone
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
      
      const formattedCPF = formatCPF(medico.documentoFederal || '');
      const formattedPhone = formatPhone(medico.telefone || '');
      
      setFormData({
        nome: String(medico.nome || '').trim(),
        crm: String(medico.crm || '').trim(),
        email: String(medico.email || '').trim(),
        telefone: String(formattedPhone || '').trim(),
        documentoFederal: String(formattedCPF || '').trim(),
        id: medico.codigo || id
      });
      
      setErrors({});
      setShowModal(true);
    } catch (error) {
    }
  };

  const handleDelete = async (id) => {
    setDoctorToDelete(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      await medicoService.deleteMedico(doctorToDelete);
      await fetchDoctors(searchTerm, pagination.pagina);
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
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="highlight">Operadores</span>
              </h1>
              <p className="welcome-subtitle">Gerencie os operadores da sua clínica</p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleNewDoctor}>
                <span className="btn-icon">👤</span>
                Novo Operador
              </button>
            </div>
          </div>
          
        </div>

        <div className="doctors-section">
          <div className="section-header">
            <div className="section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Operadores Cadastrados
            </div>
            <div className="section-actions">
              <div className="section-count">
                {pagination.totalItens} operador{pagination.totalItens !== 1 ? 'es' : ''}
              </div>
              
              <div className="section-search">
                {!isSearchExpanded ? (
                  <button className="search-toggle-btn" onClick={toggleSearch}>
                    <svg className="search-toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Buscar</span>
                  </button>
                ) : (
                  <div className="search-inline">
                    <div className="search-wrapper">
                      <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text" 
                        className="modern-search-input" 
                        placeholder="Buscar por nome ou CRM..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        onBlur={handleSearchBlur}
                        autoFocus
                      />
                      {isLoading && (
                        <div className="search-loading">
                          <div className="loading-spinner-small"></div>
                        </div>
                      )}
                      <button className="search-close-btn" onClick={toggleSearch}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">Carregando operadores...</div>
            </div>
          ) : (
            <div className="doctors-grid" key={`doctors-grid-${renderKeyRef.current}`}>
              {doctors && Array.isArray(doctors) && doctors.length > 0 ? (
                doctors.map((doctor, index) => {
                  if (!doctor) {
                    return null;
                  }
                  
                  const safeDoctor = {
                    id: String(doctor.id || '').trim(),
                    name: String(doctor.name || '').trim(),
                    email: String(doctor.email || 'Não informada').trim(),
                    crm: String(doctor.crm || '').trim(),
                    phone: String(doctor.phone || 'Não informado').trim()
                  };
                  
                  if (!safeDoctor.id || 
                      safeDoctor.id === '' || 
                      safeDoctor.id === 'null' || 
                      safeDoctor.id === 'undefined' ||
                      safeDoctor.id === 'NaN') {
                    return null;
                  }
                  
                  const cardKey = `doc-${safeDoctor.id}-${renderKeyRef.current}-pg${pagination.pagina}-i${index}`;
                  
                  return (
                    <DoctorCard 
                      key={cardKey}
                      doctor={safeDoctor}
                      onView={() => navigate(`/medico-details/${safeDoctor.id}`)}
                      onEdit={() => handleEdit(safeDoctor.id)}
                      onDelete={() => handleDelete(safeDoctor.id)}
                    />
                  );
                }).filter(Boolean)
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
                    {searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre o primeiro operador da clínica'}
                  </p>
                  {!searchTerm && (
                    <button className="btn-primary" onClick={handleNewDoctor}>
                      <span className="btn-icon">👤</span>
                      Cadastrar Primeiro Operador
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isLoading && doctors.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span className="pagination-text">
                  Página {pagination.pagina} de {pagination.totalPaginas} 
                  ({pagination.totalItens} médico{pagination.totalItens !== 1 ? 's' : ''} total)
                </span>
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  onClick={handleFirstPage}
                  disabled={pagination.pagina === 1 || pagination.totalPaginas <= 1}
                  title="Primeira página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11,17 6,12 11,7"></polyline>
                    <polyline points="18,17 13,12 18,7"></polyline>
                  </svg>
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={pagination.pagina === 1 || pagination.totalPaginas <= 1}
                  title="Página anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  disabled={pagination.pagina === pagination.totalPaginas || pagination.totalPaginas <= 1}
                  title="Próxima página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
                <button 
                  className="pagination-btn"
                  onClick={handleLastPage}
                  disabled={pagination.pagina === pagination.totalPaginas || pagination.totalPaginas <= 1}
                  title="Última página"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13,17 18,12 13,7"></polyline>
                    <polyline points="6,17 11,12 6,7"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {formData.id ? 'Editar Operador' : 'Novo Operador'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                
                <div className="form-group form-group-nome" style={{ 
                  position: 'relative',
                  width: '100%',
                  marginBottom: '24px',
                  display: 'block',
                  order: 0,
                  textAlign: 'left',
                  alignSelf: 'flex-start'
                }}>
                  <label htmlFor="nome" style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%'
                  }}>Nome Completo*</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={String(formData.nome || '').trim()}
                    onChange={handleChange}
                    className={`input-nome-static ${errors.nome ? 'input-error' : ''}`}
                    placeholder="Digite o nome completo"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: `2px solid ${errors.nome ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: '#fff',
                      position: 'relative',
                      display: 'block',
                      minHeight: '52px',
                      boxShadow: errors.nome ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                      textAlign: 'left',
                      marginLeft: '0',
                      marginRight: 'auto',
                      left: '0',
                      right: 'auto'
                    }}
                  />
                  {errors.nome && <div className="error-message" style={{ 
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500',
                    position: 'relative'
                  }}>{errors.nome}</div>}
                </div>
                
                <div className="form-group form-group-crm" style={{ 
                  position: 'relative',
                  width: '100%',
                  marginBottom: '24px',
                  display: 'block',
                  order: 1,
                  textAlign: 'left',
                  alignSelf: 'flex-start'
                }}>
                  <label htmlFor="crm" style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%'
                  }}>CRM*</label>
                  <input
                    type="text"
                    id="crm"
                    name="crm"
                    value={String(formData.crm || '').trim()}
                    onChange={handleChange}
                    placeholder="12345-UF"
                    className={`input-crm-static ${errors.crm ? 'input-error' : ''}`}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: `2px solid ${errors.crm ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: '#fff',
                      position: 'relative',
                      display: 'block',
                      minHeight: '52px',
                      boxShadow: errors.crm ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                      textAlign: 'left',
                      marginLeft: '0',
                      marginRight: 'auto',
                      left: '0',
                      right: 'auto'
                    }}
                  />
                  {errors.crm && <div className="error-message" style={{ 
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500',
                    position: 'relative'
                  }}>{errors.crm}</div>}
                </div>
                
                <div className="form-group form-group-email" style={{ 
                  position: 'relative',
                  width: '100%',
                  marginBottom: '24px',
                  display: 'block',
                  order: 2,
                  textAlign: 'left',
                  alignSelf: 'flex-start'
                }}>
                  <label htmlFor="email" style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%'
                  }}>Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={String(formData.email || '').trim()}
                    onChange={handleChange}
                    className={`input-email-static ${errors.email ? 'input-error' : ''}`}
                    placeholder="operador@clinica.com"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: '#fff',
                      position: 'relative',
                      display: 'block',
                      minHeight: '52px',
                      boxShadow: errors.email ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                      textAlign: 'left',
                      marginLeft: '0',
                      marginRight: 'auto',
                      left: '0',
                      right: 'auto'
                    }}
                  />
                  {errors.email && <div className="error-message" style={{ 
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500',
                    position: 'relative'
                  }}>{errors.email}</div>}
                </div>
                
                <div className="form-group form-group-phone" style={{ 
                  position: 'relative',
                  width: '100%',
                  marginBottom: '24px',
                  display: 'block',
                  order: 3,
                  textAlign: 'left',
                  alignSelf: 'flex-start'
                }}>
                  <label htmlFor="telefone" style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%'
                  }}>Telefone*</label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={String(formData.telefone || '').trim()}
                    onChange={handlePhoneChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className={`input-phone-static ${errors.telefone ? 'input-error' : ''}`}
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: `2px solid ${errors.telefone ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: '#fff',
                      position: 'relative',
                      display: 'block',
                      minHeight: '52px',
                      boxShadow: errors.telefone ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                      textAlign: 'left',
                      marginLeft: '0',
                      marginRight: 'auto',
                      left: '0',
                      right: 'auto'
                    }}
                  />
                  {errors.telefone && <div className="error-message" style={{ 
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500',
                    position: 'relative'
                  }}>{errors.telefone}</div>}
                </div>
                
                <div className="form-group form-group-cpf" style={{ 
                  position: 'relative',
                  width: '100%',
                  marginBottom: '24px',
                  display: 'block',
                  order: 4,
                  textAlign: 'left',
                  alignSelf: 'flex-start'
                }}>
                  <label htmlFor="documentoFederal" style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.95rem',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%'
                  }}>CPF*</label>
                  <input
                    type="text"
                    id="documentoFederal"
                    name="documentoFederal"
                    value={String(formData.documentoFederal || '').trim()}
                    onChange={handleCPFChange}
                    placeholder="XXX.XXX.XXX-XX"
                    className={`input-cpf-static ${errors.documentoFederal ? 'input-error' : ''}`}
                    maxLength={14}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: `2px solid ${errors.documentoFederal ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: '#fff',
                      position: 'relative',
                      display: 'block',
                      minHeight: '52px',
                      boxShadow: errors.documentoFederal ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
                      textAlign: 'left',
                      marginLeft: '0',
                      marginRight: 'auto',
                      left: '0',
                      right: 'auto'
                    }}
                  />
                  {errors.documentoFederal && <div className="error-message" style={{ 
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '6px',
                    fontWeight: '500',
                    position: 'relative'
                  }}>{errors.documentoFederal}</div>}
                </div>
                
                <div className="modal-footer" style={{ 
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  paddingTop: '16px',
                  paddingBottom: '0',
                  paddingLeft: '0',
                  paddingRight: '0',
                  marginTop: '8px',
                  marginBottom: '0',
                  marginLeft: '0',
                  marginRight: '0',
                  order: 999,
                  flexShrink: 0,
                  alignSelf: 'center',
                  boxSizing: 'border-box'
                }}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    <span className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </span>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    <span className="btn-icon">
                      {isSubmitting ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17,21 17,13 7,13 7,21"></polyline>
                          <polyline points="7,3 7,8 15,8"></polyline>
                        </svg>
                      )}
                    </span>
                    {isSubmitting ? 'Salvando...' : 'Salvar Operador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    {showDeleteModal && (
      <div className="modal-overlay">
        <div className="modal-popup delete-modal">
          <div className="modal-popup-header">
            <h3>Excluir Operador</h3>
            <button 
              className="btn-close"
              onClick={() => setShowDeleteModal(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="modal-popup-body">
            <div className="warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <p>Tem certeza que deseja excluir permanentemente este operador?</p>
            <p className="warning-text">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="modal-popup-footer">
            <button 
              className="btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
              Cancelar
            </button>
            <button 
              className="btn-danger"
              onClick={confirmDelete}
            >
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
              </span>
              Excluir Operador
            </button>
          </div>
        </div>
      </div>
    )}

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


export default Doctors;