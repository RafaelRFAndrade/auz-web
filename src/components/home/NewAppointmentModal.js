import React, { useState } from 'react';
import { atendimentoService } from '../../services/Atendimento';
import './NewAppointmentModal.css';

const NewAppointmentModal = ({ date, onClose, onSuccess }) => {
  const [descricao, setDescricao] = useState('');
  const [cpfMedico, setCpfMedico] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('pt-BR') : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!descricao.trim() || !cpfMedico.trim() || !cpfPaciente.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      await atendimentoService.createAtendimento({
        Descricao: descricao,
        DocumentoFederalMedico: cpfMedico.replace(/\D/g, ''),
        DocumentoFederalPaciente: cpfPaciente.replace(/\D/g, ''),
        Data: date,
      });
      if (onSuccess) onSuccess('Atendimento cadastrado com sucesso!');
      if (onClose) onClose();
    } catch (err) {
      setError('Erro ao cadastrar atendimento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'appointment-form-overlay') {
      onClose();
    }
  };

  return (
    <div className="appointment-form-overlay" onClick={handleOverlayClick}>
      <div className="appointment-form-container">
        <div className="appointment-form-header">
          <h2>Novo Agendamento</h2>
          <button className="close-button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Data do Agendamento</label>
            <input type="text" value={formatDate(date)} disabled />
          </div>
          <div className="form-group">
            <label>Descrição *</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} placeholder="Descreva o atendimento..." />
          </div>
          <div className="form-group">
            <label>CPF do Médico *</label>
            <input type="text" value={cpfMedico} onChange={e => setCpfMedico(e.target.value)} placeholder="000.000.000-00" maxLength={14} />
          </div>
          <div className="form-group">
            <label>CPF do Paciente *</label>
            <input type="text" value={cpfPaciente} onChange={e => setCpfPaciente(e.target.value)} placeholder="000.000.000-00" maxLength={14} />
          </div>
          {error && <span className="error-message">{error}</span>}
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Salvando...' : 'Cadastrar'}</button>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;