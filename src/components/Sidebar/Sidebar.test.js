import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import usuarioService from '../../services/Usuario';

// Mock do serviço de usuário
jest.mock('../../services/Usuario');

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

    expect(screen.getByText(/auz hospital/i)).toBeInTheDocument();
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

    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveStyle('width: 60px');
  });

  test('expands sidebar on hover', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    fireEvent.mouseEnter(sidebar);
    
    expect(sidebar).toHaveStyle('width: 250px');
  });

  test('collapses sidebar on mouse leave', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    fireEvent.mouseEnter(sidebar);
    fireEvent.mouseLeave(sidebar);
    
    expect(sidebar).toHaveStyle('width: 60px');
  });

  test('handles keyboard navigation with Enter key', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    fireEvent.keyDown(sidebar, { key: 'Enter', code: 'Enter' });
    
    expect(sidebar).toHaveStyle('width: 250px');
  });

  test('handles keyboard navigation with Space key', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    fireEvent.keyDown(sidebar, { key: ' ', code: 'Space' });
    
    expect(sidebar).toHaveStyle('width: 250px');
  });

  test('logout button calls logout service and navigates to login', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const logoutButton = screen.getByText(/sair/i);
    fireEvent.click(logoutButton);

    expect(usuarioService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigation links have correct aria-current for active page', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  test('navigation links are keyboard accessible', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    const doctorsLink = screen.getByRole('menuitem', { name: /médicos/i });
    const patientsLink = screen.getByRole('menuitem', { name: /pacientes/i });
    const appointmentsLink = screen.getByRole('menuitem', { name: /atendimentos/i });

    expect(homeLink).toHaveAttribute('tabIndex', '0');
    expect(doctorsLink).toHaveAttribute('tabIndex', '0');
    expect(patientsLink).toHaveAttribute('tabIndex', '0');
    expect(appointmentsLink).toHaveAttribute('tabIndex', '0');
  });

  test('has proper ARIA attributes for accessibility', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    const nav = screen.getByRole('navigation', { name: /menu principal/i });
    const header = screen.getByRole('banner');

    expect(sidebar).toHaveAttribute('aria-label', 'Barra lateral de navegação');
    expect(nav).toHaveAttribute('aria-labelledby', 'sidebar-title');
    expect(header).toBeInTheDocument();
  });

  test('hospital logo has proper accessibility attributes', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const logo = screen.getByRole('img', { name: /ícone do hospital/i });
    expect(logo).toHaveAttribute('aria-label', 'Ícone do hospital');
    expect(logo).toHaveAttribute('role', 'img');
  });

  test('focuses on first menu item when sidebar receives focus', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    const sidebar = screen.getByRole('navigation');
    fireEvent.focus(sidebar);

    const homeLink = screen.getByRole('menuitem', { name: /início/i });
    expect(homeLink).toHaveFocus();
  });
});