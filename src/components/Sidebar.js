import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usuarioService } from '../services/Usuario';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [userPermission, setUserPermission] = useState(null);
  const sidebarRef = useRef(null);
  const menuItemsRef = useRef([]);

  // Função para verificar permissão do usuário
  const checkUserPermission = () => {
    try {
      const tokenInfo = usuarioService.getTokenInfo();
      
      if (tokenInfo) {
        const role = tokenInfo.role || tokenInfo.Role;
        
        if (role) {
          const isAdmin = role === "Admin";
          setUserPermission(isAdmin ? 0 : 1);
          return isAdmin;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  };

  useEffect(() => {
    checkUserPermission();
  }, []);

  // Ícones SVG modernos
  const icons = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    operational: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    doctors: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    patients: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    appointments: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    calendar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="16" r="1"/>
        <circle cx="8" cy="16" r="1"/>
        <circle cx="16" cy="16" r="1"/>
      </svg>
    ),
    partner: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    logout: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    )
  };

  // Menu base com todos os itens
  const allMenuItems = [
    { path: '/home', icon: icons.home, label: 'Início' },
    { path: '/operacional', icon: icons.operational, label: 'Operacional' },
    { path: '/doctors', icon: icons.doctors, label: 'Médicos' },
    { path: '/patients', icon: icons.patients, label: 'Pacientes' },
    { path: '/appointments', icon: icons.appointments, label: 'Atendimentos' },
    { path: '/agenda', icon: icons.calendar, label: 'Agenda' },
    { path: '/parceiro/usuarios', icon: icons.partner, label: 'Parceiro', requiresAdmin: true }
  ];

  // Filtrar menu baseado na permissão do usuário
  const menuItems = allMenuItems.filter(item => {
    if (item.requiresAdmin) {
      return userPermission === 0;
    }
    return true;
  });

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    usuarioService.logout();
    window.location.href = '/login';
  };

  // Navegação por teclado
  const handleKeyDown = (event) => {
    const { key } = event;
    const totalItems = menuItems.length + 1;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(totalItems - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < menuItems.length) {
          window.location.href = menuItems[focusedIndex].path;
        } else if (focusedIndex === menuItems.length) {
          handleLogout();
        }
        break;
      default:
        break;
    }
  };

  // Foco automático no item ativo
  useEffect(() => {
    const activeIndex = menuItems.findIndex(item => isActive(item.path));
    if (activeIndex !== -1) {
      setFocusedIndex(activeIndex);
    }
  }, [location.pathname]);

  // Gerenciar foco dos elementos
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Notificar o layout principal sobre mudanças na sidebar
  useEffect(() => {
    const event = new CustomEvent('sidebarToggle', {
      detail: { isExpanded }
    });
    window.dispatchEvent(event);
  }, [isExpanded]);

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}
      role="navigation"
      aria-label="Menu principal de navegação"
      aria-expanded={isExpanded}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          {isExpanded && (
            <span className="sidebar__logo-text">
              Sistema Médico
            </span>
          )}
        </div>
      </header>

      <nav className="sidebar__nav" role="navigation" aria-labelledby="sidebar-title">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          const isFocused = focusedIndex === index;

          return (
            <Link
              key={item.path}
              ref={(el) => (menuItemsRef.current[index] = el)}
              to={item.path}
              className={`sidebar__nav-item ${active ? 'sidebar__nav-item--active' : ''} ${isFocused ? 'sidebar__nav-item--focused' : ''}`}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
              aria-label={`${item.label}${active ? ' (página atual)' : ''}`}
              tabIndex={isFocused ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
            >
              <span className="sidebar__nav-icon">
                {item.icon}
              </span>
              {isExpanded && (
                <span className="sidebar__nav-label">
                  {item.label}
                </span>
              )}
              {active && <div className="sidebar__nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      <footer className="sidebar__footer">
        <button
          ref={(el) => (menuItemsRef.current[menuItems.length] = el)}
          onClick={handleLogout}
          className={`sidebar__logout-btn ${focusedIndex === menuItems.length ? 'sidebar__logout-btn--focused' : ''}`}
          aria-label="Sair do sistema"
          tabIndex={focusedIndex === menuItems.length ? 0 : -1}
          onFocus={() => setFocusedIndex(menuItems.length)}
        >
          <span className="sidebar__logout-icon">
            {icons.logout}
          </span>
          {isExpanded && (
            <span className="sidebar__logout-label">
              Sair
            </span>
          )}
        </button>
      </footer>
    </aside>
  );
};

export default Sidebar;