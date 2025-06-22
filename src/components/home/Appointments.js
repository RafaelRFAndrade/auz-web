import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../../services/Usuario';
import { atendimentoService } from '../../services/Atendimento';
import { medicoService } from '../../services/Medico';
import { pacienteService } from '../../services/Paciente';
import Alert from '../../components/custom/Alert';
import './Appointments.css';
import logo from '../../logo.png';

const Appointments = () => {
  const navigate = useNavigate();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    id: null,
    pacienteId: '',
    dataHora: '',
    descricao: '',
  });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };
  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  useEffect(() => {
    if (!usuarioService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadDoctors();
    loadPatients();
  }, []);

  const loadDoctors = async () => {
    const data = await medicoService.getAllMedicos();
    setDoctors(data);
  };

  const loadPatients = async () => {
    const data = await pacienteService.getAllPacientes();
    setPatients(data);
  };

  const loadAppointments = async (doctorId) => {
    try {
      const data = await atendimentoService.getByDoctor(doctorId);
      setAppointments(data);
    } catch (error) {
      showAlert('error', 'Erro', 'Erro ao buscar atendimentos');
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(false);
    loadAppointments(doctor.id);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredAppointments = appointments.filter(a =>
    a.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNew = () => {
    setAppointmentForm({ id: null, pacienteId: '', dataHora: '', descricao: '' });
    setShowAppointmentModal(true);
  };

  const handleEdit = (appt) => {
    setAppointmentForm({
      id: appt.id,
      pacienteId: appt.pacienteId,
      dataHora: appt.dataHora,
      descricao: appt.descricao,
    });
    setShowAppointmentModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await atendimentoService.delete(id);
      showAlert('success', 'Sucesso', 'Atendimento cancelado com sucesso');
      loadAppointments(selectedDoctor.id);
    } catch (error) {
      showAlert('error', 'Erro', 'Erro ao cancelar atendimento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...appointmentForm,
      medicoId: selectedDoctor.id,
    };

    try {
      if (appointmentForm.id) {
        await atendimentoService.update(data);
        showAlert('success', 'Sucesso', 'Atendimento atualizado');
      } else {
        await atendimentoService.create(data);
        showAlert('success', 'Sucesso', 'Atendimento cadastrado');
      }
      setShowAppointmentModal(false);
      loadAppointments(selectedDoctor.id);
    } catch (error) {
      showAlert('error', 'Erro', 'Erro ao salvar atendimento');
    }
  };

  return (
    <div className="appointments-container">
      {/* Sidebar padrão igual ao patients */}
      <div className="main-content">
        <div className="page-header">
          <h2>Atendimentos - Dr(a). {selectedDoctor?.nome}</h2>
          <button className="add-button" onClick={handleNew}>Novo Atendimento</button>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar por paciente..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <table className="appointments-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Data e Hora</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(a => (
                <tr key={a.id}>
                  <td>{a.pacienteNome}</td>
                  <td>{new Date(a.dataHora).toLocaleString()}</td>
                  <td>{a.descricao}</td>
                  <td>
                    <button onClick={() => handleEdit(a)}>Editar</button>
                    <button onClick={() => handleDelete(a.id)}>Cancelar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">Nenhum atendimento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Selecionar Médico */}
      {showDoctorModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Selecione um Médico</h2>
            <ul className="doctor-list">
              {doctors.map(d => (
                <li key={d.id} onClick={() => handleDoctorSelect(d)}>
                  {d.nome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal Cadastro/Editar Atendimento */}
      {showAppointmentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>{appointmentForm.id ? 'Editar Atendimento' : 'Novo Atendimento'}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Paciente</label>
                <select 
                  value={appointmentForm.pacienteId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, pacienteId: e.target.value })}
                  required
                >
                  <option value="">Selecione</option>
                  {patients.map(p => (
                    <option key={p.codigo} value={p.codigo}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Data e Hora</label>
                <input 
                  type="datetime-local"
                  value={appointmentForm.dataHora}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, dataHora: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Descrição</label>
                <textarea 
                  value={appointmentForm.descricao}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAppointmentModal(false)}>Cancelar</button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        duration={5000}
      />
    </div>
  );
};

export default Appointments;
