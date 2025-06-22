import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usuarioService } from '../services/Usuario';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Início' },
    { path: '/doctors', icon: '👨‍⚕️', label: 'Médicos' },
    { path: '/patients', icon: '👥', label: 'Pacientes' },
    { path: '/appointments', icon: '📅', label: 'Atendimentos' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    usuarioService.logout();
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isExpanded ? '260px' : '70px'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div style={{ ...styles.header, justifyContent: isExpanded ? 'flex-start' : 'center' }}>
        {isExpanded && <h2 style={styles.title}>Sistema Médico</h2>}
        {!isExpanded && <span style={{ fontSize: 24 }}>🏥</span>}
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(active ? styles.activeItem : {}),
                justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              {isExpanded && <span style={styles.label}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            justifyContent: isExpanded ? 'flex-start' : 'center'
          }}
        >
          <span style={styles.icon}>🚪</span>
          {isExpanded && <span style={styles.label}>Sair</span>}
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    backgroundColor: '#ffffff',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    transition: 'width 0.2s ease'
  },
  header: {
    padding: '24px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  activeItem: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    borderRight: '4px solid #2563eb'
  },
  icon: {
    marginRight: '12px',
    fontSize: '18px'
  },
  label: {
    fontSize: '14px'
  },
  footer: {
    padding: '20px 12px',
    borderTop: '1px solid #e5e7eb'
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default Sidebar;
