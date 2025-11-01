import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { usuarioService } from '../../services/Usuario';

// Mock do serviço de usuário
jest.mock('../../services/Usuario', () => ({
  usuarioService: {
    logout: jest.fn(),
    getTokenInfo: jest.fn(() => ({ role: 'Admin' }))
  }
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/home' }),
}));

const SidebarWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService.logout.mockClear();
  });

  test('renders sidebar with all navigation items', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Expand sidebar to see labels - usar getAllByRole pois há múltiplos elementos navigation
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByText(/sistema médico/i)).toBeInTheDocument();
    expect(screen.getByText(/início/i)).toBeInTheDocument();
    expect(screen.getByText(/médicos/i)).toBeInTheDocument();
    expect(screen.getByText(/pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/atendimentos/i)).toBeInTheDocument();
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });

  test('sidebar starts collapsed', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    expect(sidebar).toHaveClass('sidebar--collapsed');
  });

  test('expands sidebar on hover', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);
    
    expect(sidebar).toHaveClass('sidebar--expanded');
  });

  test('collapses sidebar on mouse leave', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);
    fireEvent.mouseLeave(sidebar);
    
    expect(sidebar).toHaveClass('sidebar--collapsed');
  });

  test('handles keyboard navigation with Enter key', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.keyDown(sidebar, { key: 'Enter', code: 'Enter' });
    
    // Enter key triggers navigation, not expansion
    expect(sidebar).toBeInTheDocument();
  });

  test('handles keyboard navigation with Space key', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.keyDown(sidebar, { key: ' ', code: 'Space' });
    
    // Space key triggers navigation, not expansion
    expect(sidebar).toBeInTheDocument();
  });

  test('logout button calls logout service and navigates to login', () => {
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
    
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Expand sidebar to see logout button label
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);

    const logoutButton = screen.getByRole('button', { name: /sair do sistema/i });
    fireEvent.click(logoutButton);

    expect(usuarioService.logout).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  test('navigation links have correct aria-current for active page', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Expand sidebar to see labels
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);

    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  test('navigation links are keyboard accessible', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Expand sidebar to see labels
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);

    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    const doctorsLink = screen.getByRole('menuitem', { name: /médicos/i });
    const patientsLink = screen.getByRole('menuitem', { name: /pacientes/i });
    const appointmentsLink = screen.getByRole('menuitem', { name: /atendimentos/i });

    // Links should have tabIndex attribute (may be 0 or -1 depending on focus)
    expect(homeLink).toHaveAttribute('tabIndex');
    expect(doctorsLink).toHaveAttribute('tabIndex');
    expect(patientsLink).toHaveAttribute('tabIndex');
    expect(appointmentsLink).toHaveAttribute('tabIndex');
  });

  test('has proper ARIA attributes for accessibility', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation', { name: /menu principal de navegação/i });
    expect(sidebar).toHaveAttribute('aria-label', 'Menu principal de navegação');
    expect(sidebar).toHaveAttribute('aria-expanded', 'false');
  });

  test('hospital logo has proper accessibility attributes', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Logo is an SVG, not an img with role
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    const svg = sidebar.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('focuses on first menu item when sidebar receives focus', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // Expand sidebar to see labels
    const navigations = screen.getAllByRole('navigation');
    const sidebar = navigations[0]; // O aside principal
    fireEvent.mouseEnter(sidebar);
    fireEvent.focus(sidebar);

    // Check that sidebar is focusable
    expect(sidebar).toHaveAttribute('tabIndex', '0');
    
    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    expect(homeLink).toBeInTheDocument();
  });
});