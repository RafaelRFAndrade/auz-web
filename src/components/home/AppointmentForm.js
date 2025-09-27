import React, { useState, useEffect } from 'react';
import { medicoService } from '../../services/Medico';
import { pacienteService } from '../../services/Paciente';
import { atendimentoService } from '../../services/Atendimento';
import Loading from '../custom/Loading';
import './AppointmentForm.css';

const AppointmentForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    documentoFederalMedico: '',
    documentoFederalPaciente: ''
  });

  const [medicoData, setMedicoData] = useState(null);
  const [medicoSuggestions, setMedicoSuggestions] = useState([]);
  const [showMedicoSuggestions, setShowMedicoSuggestions] = useState(false);
  const [pacienteData, setPacienteData] = useState(null);
  const [pacienteSuggestions, setPacienteSuggestions] = useState([]);
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  const [createNewPatient, setCreateNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  const [loading, setLoading] = useState({
    medico: false,
    paciente: false,
    submit: false
  });

  const [errors, setErrors] = useState({});
  const [searchTimeouts, setSearchTimeouts] = useState({
    medico: null,
    paciente: null
  });

  // Função para buscar sugestões de médicos
  const searchMedicoSuggestions = async (documento) => {
    if (!documento || documento.length < 3) {
      setMedicoSuggestions([]);
      setShowMedicoSuggestions(false);
      return;
    }

    setLoading(prev => ({ ...prev, medico: true }));
    try {
      const response = await medicoService.buscarDocumentosMedico(documento);
      setMedicoSuggestions(response || []);
      setShowMedicoSuggestions(true);
      setErrors(prev => ({ ...prev, medico: null }));
    } catch (error) {
      setMedicoSuggestions([]);
      setShowMedicoSuggestions(false);
      setErrors(prev => ({ ...prev, medico: 'Erro ao buscar médicos' }));
    } finally {
      setLoading(prev => ({ ...prev, medico: false }));
    }
  };

  // Função para selecionar um médico das sugestões
  const selectMedico = (medico) => {
    setMedicoData(medico);
    setFormData(prev => ({ ...prev, documentoFederalMedico: medico.documentoFederal }));
    setMedicoSuggestions([]);
    setShowMedicoSuggestions(false);
    setErrors(prev => ({ ...prev, medico: null }));
  };

  // Função para buscar sugestões de pacientes
  const searchPacienteSuggestions = async (documento) => {
    if (!documento || documento.length < 3) {
      setPacienteSuggestions([]);
      setShowPacienteSuggestions(false);
      return;
    }

    setLoading(prev => ({ ...prev, paciente: true }));
    try {
      const response = await pacienteService.buscarDocumentosPaciente(documento);
      setPacienteSuggestions(response || []);
      setShowPacienteSuggestions(true);
      setErrors(prev => ({ ...prev, paciente: null }));
    } catch (error) {
      setPacienteSuggestions([]);
      setShowPacienteSuggestions(false);
      setErrors(prev => ({ ...prev, paciente: 'Erro ao buscar pacientes' }));
    } finally {
      setLoading(prev => ({ ...prev, paciente: false }));
    }
  };

  // Função para selecionar um paciente das sugestões
  const selectPaciente = (paciente) => {
    setPacienteData(paciente);
    setFormData(prev => ({ ...prev, documentoFederalPaciente: paciente.documentoFederal }));
    setPacienteSuggestions([]);
    setShowPacienteSuggestions(false);
    setCreateNewPatient(false);
    setErrors(prev => ({ ...prev, paciente: null }));
  };

  // Debounce para as buscas
  const handleMedicoSearch = (documento) => {
    setFormData(prev => ({ ...prev, documentoFederalMedico: documento }));
    
    if (searchTimeouts.medico) {
      clearTimeout(searchTimeouts.medico);
    }

    const timeout = setTimeout(() => {
      searchMedicoSuggestions(documento);
    }, 500);

    setSearchTimeouts(prev => ({ ...prev, medico: timeout }));
  };

  const handlePacienteSearch = (documento) => {
    setFormData(prev => ({ ...prev, documentoFederalPaciente: documento }));
    
    if (searchTimeouts.paciente) {
      clearTimeout(searchTimeouts.paciente);
    }

    const timeout = setTimeout(() => {
      searchPacienteSuggestions(documento);
    }, 500);

    setSearchTimeouts(prev => ({ ...prev, paciente: timeout }));
  };

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para validar CPF
  const validateCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  // Função para submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    const newErrors = {};
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (!formData.documentoFederalMedico || !validateCPF(formData.documentoFederalMedico)) {
      newErrors.medico = 'CPF do médico é obrigatório e deve ser válido';
    }
    
    if (!medicoData) {
      newErrors.medico = 'Médico não encontrado';
    }
    
    if (!formData.documentoFederalPaciente || !validateCPF(formData.documentoFederalPaciente)) {
      newErrors.paciente = 'CPF do paciente é obrigatório e deve ser válido';
    }
    
    if (!pacienteData && !createNewPatient) {
      newErrors.paciente = 'Paciente não encontrado. Ative a opção para criar novo paciente.';
    }
    
    if (createNewPatient) {
      if (!newPatientData.nome.trim()) {
        newErrors.patientName = 'Nome do paciente é obrigatório';
      }
      if (!newPatientData.email.trim() || !/\S+@\S+\.\S+/.test(newPatientData.email)) {
        newErrors.patientEmail = 'Email válido é obrigatório';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(prev => ({ ...prev, submit: true }));
    
    try {
      const appointmentData = {
        Descricao: formData.descricao,
        DocumentoFederalMedico: formData.documentoFederalMedico.replace(/\D/g, ''),
        DocumentoFederalPaciente: formData.documentoFederalPaciente.replace(/\D/g, ''),
        CadastrarPaciente: false,
        NovoPaciente: createNewPatient ? {
          Nome: newPatientData.nome,
          Email: newPatientData.email,
          Telefone: newPatientData.telefone
        } : null
      };
      
      await atendimentoService.createAtendimento(appointmentData);
      onSuccess('Atendimento cadastrado com sucesso!');
      onClose();
    } catch (error) {
      setErrors({ submit: 'Erro ao cadastrar atendimento. Tente novamente.' });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Cleanup dos timeouts
  useEffect(() => {
    return () => {
      Object.values(searchTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <div className="appointment-form-overlay">
      <div className="appointment-form-container">
        <div className="appointment-form-header">
          <h2>Cadastrar Novo Atendimento</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="appointment-form">
          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="descricao">Descrição do Atendimento *</label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o atendimento..."
              rows={3}
              className={errors.descricao ? 'error' : ''}
            />
            {errors.descricao && <span className="error-message">{errors.descricao}</span>}
          </div>

          {/* CPF do Médico */}
          <div className="form-group">
            <label htmlFor="cpfMedico">CPF do Médico *</label>
            <div className="search-input-container">
              <input
                id="cpfMedico"
                type="text"
                value={formatCPF(formData.documentoFederalMedico)}
                onChange={(e) => handleMedicoSearch(e.target.value.replace(/\D/g, ''))}
                onFocus={() => {
                  if (medicoSuggestions.length > 0) {
                    setShowMedicoSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay para permitir clique nas sugestões
                  setTimeout(() => setShowMedicoSuggestions(false), 300);
                }}
                placeholder="Digite o CPF ou nome do médico..."
                maxLength={14}
                className={errors.medico ? 'error' : ''}
              />
              {loading.medico && <Loading size="small" />}
              
              {/* Dropdown de sugestões */}
              {showMedicoSuggestions && medicoSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {medicoSuggestions.map((medico, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectMedico(medico)}
                    >
                      <div className="suggestion-name">{medico.nome}</div>
                      <div className="suggestion-details">
                        CPF: {formatCPF(medico.documentoFederal)} | Email: {medico.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.medico && <span className="error-message">{errors.medico}</span>}
            
            
            {medicoData && (
              <div className="search-result">
                <div className="result-header">✓ Médico selecionado:</div>
                <div className="result-info">
                  <strong>{medicoData.nome}</strong><br />
                  CPF: {formatCPF(medicoData.documentoFederal)}<br />
                  Email: {medicoData.email}
                </div>
              </div>
            )}
          </div>

          {/* CPF do Paciente */}
          <div className="form-group">
            <label htmlFor="cpfPaciente">CPF do Paciente *</label>
            <div className="search-input-container">
              <input
                id="cpfPaciente"
                type="text"
                value={formatCPF(formData.documentoFederalPaciente)}
                onChange={(e) => handlePacienteSearch(e.target.value.replace(/\D/g, ''))}
                onFocus={() => {
                  if (pacienteSuggestions.length > 0) {
                    setShowPacienteSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay para permitir clique nas sugestões
                  setTimeout(() => setShowPacienteSuggestions(false), 300);
                }}
                placeholder="Digite o CPF ou nome do paciente..."
                maxLength={14}
                className={errors.paciente ? 'error' : ''}
              />
              {loading.paciente && <Loading size="small" />}
              
              {/* Dropdown de sugestões */}
              {showPacienteSuggestions && pacienteSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {pacienteSuggestions.map((paciente, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectPaciente(paciente)}
                    >
                      <div className="suggestion-name">{paciente.nome}</div>
                      <div className="suggestion-details">
                        CPF: {formatCPF(paciente.documentoFederal)} | Email: {paciente.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.paciente && <span className="error-message">{errors.paciente}</span>}
            
            
            {pacienteData && (
              <div className="search-result">
                <div className="result-header">✓ Paciente selecionado:</div>
                <div className="result-info">
                  <strong>{pacienteData.nome}</strong><br />
                  CPF: {formatCPF(pacienteData.documentoFederal)}<br />
                  Email: {pacienteData.email}
                </div>
              </div>
            )}
            
            {!pacienteData && formData.documentoFederalPaciente.length >= 11 && !loading.paciente && (
              <div className="create-patient-toggle">
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={createNewPatient}
                    onChange={(e) => setCreateNewPatient(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Criar novo paciente</span>
                </label>
              </div>
            )}
          </div>

          {/* Dados do Novo Paciente */}
          {createNewPatient && (
            <div className="new-patient-section">
              <h3>Dados do Novo Paciente</h3>
              
              <div className="form-group">
                <label htmlFor="patientName">Nome Completo *</label>
                <input
                  id="patientName"
                  type="text"
                  value={newPatientData.nome}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo do paciente"
                  className={errors.patientName ? 'error' : ''}
                />
                {errors.patientName && <span className="error-message">{errors.patientName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="patientEmail">Email *</label>
                <input
                  id="patientEmail"
                  type="email"
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className={errors.patientEmail ? 'error' : ''}
                />
                {errors.patientEmail && <span className="error-message">{errors.patientEmail}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="patientPhone">Telefone</label>
                <input
                  id="patientPhone"
                  type="tel"
                  value={newPatientData.telefone}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading.submit}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading.submit}
            >
              {loading.submit ? (
                <>
                  <Loading size="small" color="white" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Atendimento'
              )}
            </button>
          </div>
          
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;