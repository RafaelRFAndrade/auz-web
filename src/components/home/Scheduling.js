import React, { useState, useEffect } from 'react';
import './Scheduling.css';
import Alert from '../custom/Alert';
import Loading from '../custom/Loading';
import { useNavigate, useParams } from 'react-router-dom';
import agendamentoService from '../../services/Agendamento';

const Scheduling = () => {
  const navigate = useNavigate();
  const { codigoAtendimento } = useParams();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
  const [formData, setFormData] = useState({
    codigoAtendimento: codigoAtendimento || '',
    descricao: '',
    dtAgendamento: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (codigoAtendimento) {
      setFormData(prev => ({ ...prev, codigoAtendimento }));
    }
  }, [codigoAtendimento]);

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigoAtendimento.trim()) {
      newErrors.codigoAtendimento = 'Código do atendimento é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 5) {
      newErrors.descricao = 'Descrição deve ter pelo menos 5 caracteres';
    }

    if (!formData.dtAgendamento) {
      newErrors.dtAgendamento = 'Data do agendamento é obrigatória';
    } else {
      const selectedDate = new Date(formData.dtAgendamento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dtAgendamento = 'Data do agendamento não pode ser anterior a hoje';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para envio conforme esperado pelo backend C#
      console.log('Data do formulário:', formData.dtAgendamento);
      
      // Validar se a data foi preenchida
      if (!formData.dtAgendamento) {
        throw new Error('Data do agendamento é obrigatória');
      }
      
      // O input datetime-local retorna formato YYYY-MM-DDTHH:mm
      // Criar data diretamente do valor do datetime-local
      const selectedDate = new Date(formData.dtAgendamento);
      
      console.log('Data criada:', selectedDate);
      
      // Validar se a data é válida
      if (isNaN(selectedDate.getTime())) {
        console.error('Data inválida:', formData.dtAgendamento);
        throw new Error('Por favor, selecione uma data e hora válidas');
      }
      
      const agendamentoData = {
        CodigoAtendimento: formData.codigoAtendimento, // GUID como string
        Descricao: formData.descricao,
        DtAgendamento: selectedDate.toISOString() // DateTime no formato ISO
      };
      
      // Chamar API para criar agendamento
      await agendamentoService.createAgendamento(agendamentoData);
      
      showAlert('Agendamento cadastrado com sucesso!', 'success');
      
      // Limpar formulário após sucesso
      setFormData({
        codigoAtendimento: codigoAtendimento || '',
        descricao: '',
        dtAgendamento: ''
      });
      
      // Navegar de volta após 2 segundos
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao cadastrar agendamento:', error);
      showAlert('Erro ao cadastrar agendamento. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  return (
    <div className="scheduling-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Loading />
            <p>Cadastrando agendamento...</p>
          </div>
        </div>
      )}
      
      {alert.show && (
        <div className="alert-container">
          <div className={`alert ${alert.type}`}>
            <svg className="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {alert.type === 'success' ? (
                <>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </>
              ) : alert.type === 'error' ? (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </>
              )}
            </svg>
            <div className="alert-content">
              <h4 className="alert-title">
                {alert.type === 'success' ? 'Sucesso!' : alert.type === 'error' ? 'Erro!' : 'Informação'}
              </h4>
              <p className="alert-message">{alert.message}</p>
            </div>
            <button className="alert-close" onClick={() => setAlert({ show: false, message: '', type: '' })}>
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="scheduling-content">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Cadastro de Agendamento</h1>
            <p className="page-subtitle">Agende um novo compromisso para o atendimento</p>
          </div>
        </div>

        <div className="scheduling-form-container">
          <form onSubmit={handleSubmit} className="scheduling-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="codigoAtendimento" className="form-label">
                  Código do Atendimento *
                </label>
                <input
                  type="text"
                  id="codigoAtendimento"
                  name="codigoAtendimento"
                  value={formData.codigoAtendimento}
                  onChange={handleInputChange}
                  className={`form-input ${errors.codigoAtendimento ? 'error' : ''}`}
                  placeholder="Digite o código do atendimento"
                  disabled={!!codigoAtendimento} // Desabilita se veio por parâmetro
                />
                {errors.codigoAtendimento && (
                  <span className="error-message">{errors.codigoAtendimento}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="descricao" className="form-label">
                  Descrição *
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.descricao ? 'error' : ''}`}
                  placeholder="Descreva o agendamento"
                  rows="4"
                />
                {errors.descricao && (
                  <span className="error-message">{errors.descricao}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dtAgendamento" className="form-label">
                  Data do Agendamento *
                </label>
                <input
                  type="datetime-local"
                  id="dtAgendamento"
                  name="dtAgendamento"
                  value={formData.dtAgendamento}
                  onChange={handleInputChange}
                  className={`form-input ${errors.dtAgendamento ? 'error' : ''}`}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.dtAgendamento && (
                  <span className="error-message">{errors.dtAgendamento}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Scheduling;