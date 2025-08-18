import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usuarioService } from '../services/Usuario';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const sidebarRef = useRef(null);
  const menuItemsRef = useRef([]);

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

  // Navegação por teclado
  const handleKeyDown = (event) => {
    const { key } = event;
    const totalItems = menuItems.length + 1; // +1 para o botão de logout

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
          // Navegar para o item do menu
          window.location.href = menuItems[focusedIndex].path;
        } else if (focusedIndex === menuItems.length) {
          // Executar logout
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

  return (
    <aside
      ref={sidebarRef}
      role="navigation"
      aria-label="Menu principal de navegação"
      aria-expanded={isExpanded}
      style={{
        ...styles.sidebar,
        width: isExpanded ? '260px' : '70px'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header 
        style={{ ...styles.header, justifyContent: isExpanded ? 'flex-start' : 'center' }}
        role="banner"
      >
        {isExpanded && (
          <h1 style={styles.title} id="sidebar-title">
            Sistema Médico
          </h1>
        )}
        {!isExpanded && (
          <span 
            style={{ fontSize: 24 }} 
            aria-label="Sistema Médico"
            role="img"
          >
            🏥
          </span>
        )}
      </header>

      <nav 
        style={styles.nav}
        role="navigation"
        aria-labelledby="sidebar-title"
      >
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          const isFocused = focusedIndex === index;

          return (
            <Link
              key={item.path}
              ref={(el) => (menuItemsRef.current[index] = el)}
              to={item.path}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
              aria-label={`${item.label}${active ? ' (página atual)' : ''}`}
              tabIndex={isFocused ? 0 : -1}
              style={{
                ...styles.navItem,
                ...(active ? styles.activeItem : {}),
                ...(isFocused ? styles.focusedItem : {}),
                justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
              onFocus={() => setFocusedIndex(index)}
            >
              <span 
                style={styles.icon}
                aria-hidden="true"
                role="img"
                aria-label={item.label}
              >
                {item.icon}
              </span>
              {isExpanded && (
                <span style={styles.label}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <footer style={styles.footer}>
        <button
          ref={(el) => (menuItemsRef.current[menuItems.length] = el)}
          onClick={handleLogout}
          aria-label="Sair do sistema"
          tabIndex={focusedIndex === menuItems.length ? 0 : -1}
          style={{
            ...styles.logoutBtn,
            ...(focusedIndex === menuItems.length ? styles.focusedItem : {}),
            justifyContent: isExpanded ? 'flex-start' : 'center'
          }}
          onFocus={() => setFocusedIndex(menuItems.length)}
        >
          <span 
            style={styles.icon}
            aria-hidden="true"
            role="img"
            aria-label="Sair"
          >
            🚪
          </span>
          {isExpanded && (
            <span style={styles.label}>
              Sair
            </span>
          )}
        </button>
      </footer>
    </aside>
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
  focusedItem: {
    outline: '2px solid #2563eb',
    outlineOffset: '2px',
    backgroundColor: '#f3f4f6'
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
